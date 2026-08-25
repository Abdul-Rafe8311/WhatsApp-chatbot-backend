"""The conversation engine — the single brain behind both front doors.

`handle()` is channel-agnostic: it never learns whether a message arrived from the
website widget or from Meta's Cloud API. Adding a third channel means calling this
function; no conversation logic changes.
"""

from __future__ import annotations

import logging
import time
import uuid
from dataclasses import dataclass, field
from threading import Lock
from typing import Any

from app import config
from app.adapters import llm
from app.core import bookings

log = logging.getLogger(__name__)

SLOT_ORDER = llm.SLOT_ORDER
MAX_HISTORY_MESSAGES = 24


# --------------------------------------------------------------------------- #
# TTL caches
# --------------------------------------------------------------------------- #
class TTLCache:
    """Tiny thread-safe set with expiry, used to dedupe WhatsApp message ids."""

    def __init__(self, ttl_seconds: int) -> None:
        self._ttl = ttl_seconds
        self._items: dict[str, float] = {}
        self._lock = Lock()

    def _purge(self, now: float) -> None:
        expired = [k for k, ts in self._items.items() if now - ts > self._ttl]
        for key in expired:
            self._items.pop(key, None)

    def seen(self, key: str) -> bool:
        """Return True if `key` was already recorded; otherwise record it."""
        if not key:
            return False
        now = time.time()
        with self._lock:
            self._purge(now)
            if key in self._items:
                return True
            self._items[key] = now
            return False


_dedupe = TTLCache(config.DEDUPE_TTL_SECONDS)


def already_processed(message_id: str) -> bool:
    """Meta retries a webhook until it gets a 200 — the same wamid can arrive 3x."""
    return _dedupe.seen(message_id)


# --------------------------------------------------------------------------- #
# Sessions (in-memory — see README "known limits")
# --------------------------------------------------------------------------- #
@dataclass
class Session:
    session_id: str
    history: list[dict[str, str]] = field(default_factory=list)
    slots: dict[str, str] = field(default_factory=dict)
    awaiting: str | None = None
    booking_mode: bool = False
    booking_id: str | None = None
    customer_number: str = ""
    urdu: bool = False
    updated_at: float = field(default_factory=time.time)


_sessions: dict[str, Session] = {}
_sessions_lock = Lock()


def _expire_sessions(now: float) -> None:
    stale = [sid for sid, s in _sessions.items() if now - s.updated_at > config.SESSION_TTL_SECONDS]
    for sid in stale:
        _sessions.pop(sid, None)


def get_session(session_id: str | None) -> Session:
    now = time.time()
    with _sessions_lock:
        _expire_sessions(now)
        sid = session_id or f"web-{uuid.uuid4().hex[:12]}"
        session = _sessions.get(sid)
        if session is None:
            session = Session(session_id=sid)
            _sessions[sid] = session
        session.updated_at = now
        return session


def reset_session(session_id: str | None) -> bool:
    if not session_id:
        return False
    with _sessions_lock:
        return _sessions.pop(session_id, None) is not None


def session_count() -> int:
    return len(_sessions)


# --------------------------------------------------------------------------- #
# Engine
# --------------------------------------------------------------------------- #
@dataclass
class EngineReply:
    session_id: str
    reply: str
    intent: str
    slots: dict[str, str]
    booking_id: str | None = None

    def as_dict(self) -> dict[str, Any]:
        return {
            "session_id": self.session_id,
            "reply": self.reply,
            "intent": self.intent,
            "slots": self.slots,
            "booking_id": self.booking_id,
        }


def _clean_slots(proposed: dict[str, str], current: dict[str, str]) -> dict[str, str]:
    """Merge model-proposed slots into the session, rejecting junk.

    A `service` value only survives if it maps to a real catalogue entry — that is
    what stops "I want to book" from being stored as the service name.
    """
    merged = dict(current)
    for key in SLOT_ORDER:
        value = (proposed.get(key) or "").strip()
        if not value:
            continue
        if key == "service":
            matched = config.find_service(value)
            if not matched:
                log.info("Rejecting unrecognised service slot %r", value)
                continue
            merged["service"] = matched
        else:
            merged[key] = value[:80]
    return merged


def _next_missing(slots: dict[str, str]) -> str | None:
    for key in SLOT_ORDER:
        if not slots.get(key):
            return key
    return None


async def handle(
    message: str,
    session_id: str | None = None,
    *,
    channel: str = "website",
    customer_number: str = "",
    profile_name: str = "",
) -> EngineReply:
    """Process one inbound customer message from any channel."""
    session = get_session(session_id)
    if customer_number:
        session.customer_number = customer_number

    text = (message or "").strip()
    session.history.append({"role": "user", "content": text})
    session.history = session.history[-MAX_HISTORY_MESSAGES:]

    if llm.is_urdu(text):
        session.urdu = True  # sticky: keep answering in the customer's language

    known_slots: dict[str, Any] = dict(session.slots)
    known_slots["_awaiting"] = session.awaiting or ""
    known_slots["_booking_mode"] = session.booking_mode
    known_slots["_urdu"] = session.urdu

    result = await llm.complete(session.history, known_slots)

    session.slots = _clean_slots(result.slots, session.slots)
    if result.intent == "booking" or session.slots:
        session.booking_mode = True

    reply = result.reply
    turn_slots = dict(session.slots)
    missing = _next_missing(session.slots)
    booking_id_for_turn = session.booking_id

    if session.booking_mode and missing is None:
        booking_id = bookings.save_booking(
            customer_name=session.slots.get("customer_name", "") or profile_name or "Guest",
            whatsapp_number=session.customer_number or ("web widget" if channel == "website" else ""),
            service=session.slots.get("service", ""),
            date=session.slots.get("date", ""),
            time=session.slots.get("time", ""),
            channel=channel,
        )
        session.booking_id = booking_id
        booking_id_for_turn = booking_id
        session.awaiting = None
        # Clear the slots so the same customer can start a second booking later.
        session.slots = {}
        session.booking_mode = False
        urdu = session.urdu
        suffix = (
            f" Aap ka booking reference {booking_id} hai."
            if urdu
            else f" Your booking reference is {booking_id}."
        )
        reply = f"{reply}{suffix}"
    elif session.booking_mode and missing is not None:
        session.awaiting = missing
    else:
        session.awaiting = None

    session.history.append({"role": "assistant", "content": reply})
    session.history = session.history[-MAX_HISTORY_MESSAGES:]
    session.updated_at = time.time()

    return EngineReply(
        session_id=session.session_id,
        reply=reply,
        intent=result.intent,
        slots=turn_slots,
        booking_id=booking_id_for_turn,
    )
