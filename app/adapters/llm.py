"""LLM adapter: one async entry point, three interchangeable backends.

    await complete(history, known_slots) -> LLMResult

`LLM_PROVIDER` picks the backend: ``mock`` (default, offline, deterministic),
``anthropic`` or ``openai``. The engine never learns which one ran.

`known_slots` carries the four booking slots plus two underscore-prefixed hints
from the engine (`_awaiting`, `_booking_mode`) so the backend knows which slot the
previous bot turn asked for. Underscore keys are stripped before they reach a real
model prompt; they only shape the instruction line.
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from typing import Any, Literal

from app import config

log = logging.getLogger(__name__)

Intent = Literal["info", "booking", "cancel", "other"]
SLOT_ORDER: tuple[str, ...] = ("service", "date", "time", "customer_name")

SLOT_QUESTION_EN = {
    "service": "Which service would you like to book?",
    "date": "What date would you like to come in?",
    "time": "What time suits you?",
    "customer_name": "And your name, please?",
}
SLOT_QUESTION_UR = {
    "service": "Aap kaunsi service book karwana chahengi?",
    "date": "Kis date par aana chahengi?",
    "time": "Kis time par aana pasand karengi?",
    "customer_name": "Aap ka naam bata dijiye?",
}


@dataclass
class LLMResult:
    reply: str
    intent: Intent = "other"
    slots: dict[str, str] = field(default_factory=dict)
    booking_complete: bool = False

    def as_dict(self) -> dict[str, Any]:
        return {
            "reply": self.reply,
            "intent": self.intent,
            "slots": self.slots,
            "booking_complete": self.booking_complete,
        }


# --------------------------------------------------------------------------- #
# System prompt
# --------------------------------------------------------------------------- #
SYSTEM_PROMPT_TEMPLATE = """\
You are the WhatsApp receptionist for {salon}. You answer customers and take bookings.

SALON KNOWLEDGE BASE — this is the ONLY source of truth. Never invent a price, a
service, a timing or availability that is not written here:
{kb}

RULES
- Reply in the customer's language. If they write Roman Urdu, reply in Roman Urdu.
- Under 40 words. No markdown, no bullet points, no asterisks — this is WhatsApp.
- Ask ONE question at a time. Never ask for two booking details in one message.
- Never invent prices, discounts, staff names or availability.
- If asked something outside the knowledge base, say you will have the salon confirm.

BOOKING
Collect exactly four slots, strictly in this order: service, date, time, customer_name.
Ask only for the next missing one. A message like "I want to book" or "book karwana hai"
is an INTENT, not data — never store it as the service name. But "book a facial" does
fill service = Facial.
Known slots so far: {slots}
{awaiting_line}

OUTPUT
Reply with a single JSON object and nothing else:
{{"reply": str, "intent": "info|booking|cancel|other",
  "slots": {{"service": str, "date": str, "time": str, "customer_name": str}},
  "booking_complete": bool}}
Include in "slots" every value you know, echoing the known ones back. Set
"booking_complete" true only when all four slots are filled.
"""


def build_system_prompt(known_slots: dict[str, str]) -> str:
    public = {k: v for k, v in known_slots.items() if not k.startswith("_") and v}
    awaiting = known_slots.get("_awaiting") or ""
    awaiting_line = (
        f"Your previous message asked the customer for: {awaiting}. "
        f"Treat their reply as the value for that slot."
        if awaiting
        else "You have not asked for a booking detail yet."
    )
    return SYSTEM_PROMPT_TEMPLATE.format(
        salon=config.SALON_NAME,
        kb=config.KNOWLEDGE_BASE,
        slots=json.dumps(public) if public else "none",
        awaiting_line=awaiting_line,
    )


# --------------------------------------------------------------------------- #
# Defensive JSON parsing
# --------------------------------------------------------------------------- #
_FENCE_RE = re.compile(r"^\s*```(?:json)?\s*|\s*```\s*$", re.IGNORECASE)
_OBJECT_RE = re.compile(r"\{.*\}", re.DOTALL)
_VALID_INTENTS = {"info", "booking", "cancel", "other"}


def parse_llm_json(raw: str, fallback_slots: dict[str, str] | None = None) -> LLMResult:
    """Turn whatever the model produced into an LLMResult. Never raises."""
    fallback_slots = {k: v for k, v in (fallback_slots or {}).items() if not k.startswith("_")}
    text = (raw or "").strip()
    if not text:
        return LLMResult(reply="Sorry, could you say that again?", slots=dict(fallback_slots))

    stripped = _FENCE_RE.sub("", text).strip()
    candidates = [stripped]
    match = _OBJECT_RE.search(stripped)
    if match:
        candidates.append(match.group(0))

    for candidate in candidates:
        try:
            data = json.loads(candidate)
        except (json.JSONDecodeError, ValueError):
            continue
        if not isinstance(data, dict):
            continue
        reply = data.get("reply")
        if not isinstance(reply, str) or not reply.strip():
            continue
        intent = data.get("intent")
        if intent not in _VALID_INTENTS:
            intent = "other"
        raw_slots = data.get("slots")
        slots = dict(fallback_slots)
        if isinstance(raw_slots, dict):
            for key in SLOT_ORDER:
                value = raw_slots.get(key)
                if isinstance(value, str) and value.strip():
                    slots[key] = value.strip()
        return LLMResult(
            reply=reply.strip(),
            intent=intent,  # type: ignore[arg-type]
            slots=slots,
            booking_complete=bool(data.get("booking_complete")),
        )

    # Fail soft: the model spoke prose. Use it as the reply rather than crashing.
    log.warning("LLM returned non-JSON, falling back to plain text (%d chars)", len(text))
    plain = _OBJECT_RE.sub("", stripped).strip() or stripped
    return LLMResult(reply=plain[:600], slots=dict(fallback_slots))


# --------------------------------------------------------------------------- #
# Mock backend — keyword driven, offline, deterministic
# --------------------------------------------------------------------------- #
_URDU_MARKERS = (
    "kitna", "kitne", "kitni", "kya", "hai", "hain", "karna", "karwana", "karwani",
    "chahiye", "chahye", "kahan", "kidhar", "kab", "kaise", "batao", "bata", "mujhe",
    "mera", "meri", "aap", "acha", "theek", "thik", "shukriya", "salam", "assalam",
    "nahi", "haan", "jee", "waqt", "paisay", "rate kya", "khula", "band",
    "kal", "aaj", "parso", "baje", "subah", "shaam", "raat", "dopahar", "zaroor",
)
_BOOKING_WORDS = (
    "book", "booking", "appointment", "reserve", "slot", "schedule",
    "karwana", "karwani", "karana", "krwana", "krna hai", "appoint",
)
_PRICE_WORDS = ("price", "cost", "charge", "rate", "fee", "how much", "kitna", "kitne", "kitni", "paisay")
_TIME_WORDS = ("timing", "timings", "hours", "open", "close", "khula", "band", "waqt", "kab tak", "kab khul")
_PLACE_WORDS = ("location", "address", "where", "kahan", "kidhar", "pata", "map", "reach")
_PARK_WORDS = ("parking", "park", "car")
_PAY_WORDS = ("payment", "pay ", "card", "cash", "jazzcash", "easypaisa", "online transfer", "paisay kaise")
_SERVICE_LIST_WORDS = ("services", "service list", "what do you offer", "menu", "kya kya", "list")
_GREET_WORDS = ("hi", "hello", "hey", "salam", "assalam", "aoa", "asalam", "good morning", "good evening")
_CANCEL_WORDS = ("cancel", "reschedule", "postpone", "cancel karna")
_QUESTION_WORDS = _PRICE_WORDS + _TIME_WORDS + _PLACE_WORDS + _PARK_WORDS + _PAY_WORDS


_URDU_RE = re.compile(
    r"\b(?:" + "|".join(re.escape(m) for m in _URDU_MARKERS) + r")\b", re.IGNORECASE
)


def _is_urdu(text: str) -> bool:
    """Whole-word match only — substring matching turns "hair" into Roman Urdu."""
    return bool(_URDU_RE.search(text or ""))


def is_urdu(text: str) -> bool:
    """Public alias: does this message look like Roman Urdu?"""
    return _is_urdu(text)


def _has(text: str, words: tuple[str, ...]) -> bool:
    low = text.lower()
    return any(w in low for w in words)


def _has_word(text: str, words: tuple[str, ...]) -> bool:
    """Substring match is too loose for short tokens like "hi"."""
    low = f" {re.sub(r'[^a-z0-9 ]+', ' ', text.lower())} "
    return any(f" {w} " in low for w in words)


def _next_missing(slots: dict[str, str]) -> str | None:
    for key in SLOT_ORDER:
        if not slots.get(key):
            return key
    return None


def _ask(slot: str, urdu: bool, prefix: str = "") -> str:
    question = (SLOT_QUESTION_UR if urdu else SLOT_QUESTION_EN)[slot]
    return f"{prefix} {question}".strip()


def _clean_name(text: str) -> str:
    cleaned = re.sub(
        r"^(my name is|mera naam|naam|this is|i am|i'm|it's|its)\b[:,\s]*",
        "",
        text.strip(),
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(r"\b(hai|hy|he)\s*$", "", cleaned, flags=re.IGNORECASE).strip(" .,!")
    return (cleaned or text.strip())[:60].title()


def _info_answer(text: str, urdu: bool) -> str | None:
    """Answer a knowledge-base question, or None if it is not one."""
    named = config.find_service(text)
    if _has(text, _PRICE_WORDS):
        svc = config.service_by_name(named or "")
        if svc:
            return (
                f"{svc.name} ki price PKR {svc.price_pkr:,} hai, tuqreeban {svc.duration_min} minute lagte hain."
                if urdu
                else f"{svc.name} is PKR {svc.price_pkr:,} and takes about {svc.duration_min} minutes."
            )
        sample = ", ".join(f"{s.name} PKR {s.price_pkr:,}" for s in config.SERVICES[:4])
        return (
            f"Rates: {sample}. Kis service ka rate chahiye?"
            if urdu
            else f"Our rates: {sample}. Which service did you mean?"
        )
    if _has(text, _TIME_WORDS):
        return (
            "Hum Monday se Saturday 11:00 AM se 9:00 PM tak khule hain. Sunday band."
            if urdu
            else config.SALON_HOURS
        )
    if _has(text, _PLACE_WORDS):
        return (
            f"Hamara pata: {config.SALON_ADDRESS}."
            if urdu
            else f"We are at {config.SALON_ADDRESS}."
        )
    if _has(text, _PARK_WORDS):
        return (
            "Ji haan, customers ke liye free basement parking available hai."
            if urdu
            else config.SALON_PARKING
        )
    if _has(text, _PAY_WORDS):
        return (
            "Aap cash, card, ya JazzCash/Easypaisa se pay kar sakti hain."
            if urdu
            else config.SALON_PAYMENT
        )
    if _has(text, _SERVICE_LIST_WORDS):
        names = ", ".join(config.service_names()[:6])
        return (
            f"Hum {names} waghera karte hain. Kis ka rate chahiye?"
            if urdu
            else f"We offer {names} and more. Which one interests you?"
        )
    if named:
        svc = config.service_by_name(named)
        assert svc is not None
        return (
            f"{svc.name} PKR {svc.price_pkr:,} ka hai, {svc.duration_min} minute lagte hain. Book karun?"
            if urdu
            else f"{svc.name} is PKR {svc.price_pkr:,}, about {svc.duration_min} minutes. Shall I book it?"
        )
    return None


async def _mock_complete(history: list[dict[str, str]], known_slots: dict[str, str]) -> LLMResult:
    user_msgs = [m for m in history if m.get("role") == "user"]
    text = (user_msgs[-1]["content"] if user_msgs else "").strip()
    # Language is sticky: once a customer writes Roman Urdu we keep replying in it,
    # even when their next answer ("4pm", "Sara") carries no language markers.
    urdu = bool(known_slots.get("_urdu")) or _is_urdu(text)
    slots: dict[str, str] = {
        k: v for k, v in known_slots.items() if k in SLOT_ORDER and v
    }
    awaiting = known_slots.get("_awaiting") or ""
    booking_mode = bool(known_slots.get("_booking_mode")) or bool(slots)

    if _has(text, _CANCEL_WORDS) and not awaiting:
        reply = (
            f"Cancel ya reschedule ke liye {config.SALON_PHONE} par call kar lijiye."
            if urdu
            else f"For cancellations please call us at {config.SALON_PHONE}."
        )
        return LLMResult(reply=reply, intent="cancel", slots=slots)

    # The previous bot turn asked for a specific slot: this message is the answer,
    # unless the customer changed the subject to ask a question.
    if awaiting and text:
        asked_question = _has(text, _QUESTION_WORDS) and awaiting != "service"
        if asked_question:
            answer = _info_answer(text, urdu)
            if answer:
                return LLMResult(
                    reply=f"{answer} {(SLOT_QUESTION_UR if urdu else SLOT_QUESTION_EN)[awaiting]}",
                    intent="booking",
                    slots=slots,
                )
        else:
            if awaiting == "service":
                matched = config.find_service(text)
                if matched:
                    slots["service"] = matched
                else:
                    names = ", ".join(config.service_names()[:6])
                    return LLMResult(
                        reply=(
                            f"Ye service samajh nahi aayi. Hum ye karte hain: {names}. Kaunsi chahiye?"
                            if urdu
                            else f"I did not catch that service. We offer: {names}. Which one?"
                        ),
                        intent="booking",
                        slots=slots,
                    )
            elif awaiting == "customer_name":
                slots["customer_name"] = _clean_name(text)
            else:
                slots[awaiting] = text.strip()[:60]

            missing = _next_missing(slots)
            if missing:
                return LLMResult(reply=_ask(missing, urdu), intent="booking", slots=slots)
            reply = (
                f"Shukriya {slots['customer_name']}! {slots['service']} {slots['date']} {slots['time']} par confirm kar diya."
                if urdu
                else f"Thank you {slots['customer_name']}! {slots['service']} on {slots['date']} at {slots['time']} is confirmed."
            )
            return LLMResult(reply=reply, intent="booking", slots=slots, booking_complete=True)

    wants_booking = _has(text, _BOOKING_WORDS)
    if wants_booking or booking_mode:
        named = config.find_service(text)
        # "I want to book" is intent only — a service name is filled only when one is
        # actually mentioned in the message.
        if named and not slots.get("service"):
            slots["service"] = named
        missing = _next_missing(slots)
        if missing:
            prefix = ""
            if wants_booking and not slots:
                prefix = "Zaroor!" if urdu else "Of course!"
            elif named and missing != "service":
                svc = config.service_by_name(named)
                if svc:
                    prefix = (
                        f"{svc.name} PKR {svc.price_pkr:,}."
                        if not urdu
                        else f"{svc.name} PKR {svc.price_pkr:,} ka hai."
                    )
            return LLMResult(reply=_ask(missing, urdu, prefix), intent="booking", slots=slots)
        reply = (
            f"Shukriya {slots['customer_name']}! Booking confirm hai."
            if urdu
            else f"Thank you {slots['customer_name']}! Your booking is confirmed."
        )
        return LLMResult(reply=reply, intent="booking", slots=slots, booking_complete=True)

    answer = _info_answer(text, urdu)
    if answer:
        return LLMResult(reply=answer, intent="info", slots=slots)

    if _has_word(text, _GREET_WORDS) or not text:
        reply = (
            f"Assalam o alaikum! {config.SALON_NAME} me khush amdeed. Kya services ya booking me madad karun?"
            if urdu
            else f"Hello! Welcome to {config.SALON_NAME}. Would you like our services, prices or a booking?"
        )
        return LLMResult(reply=reply, intent="other", slots=slots)

    reply = (
        "Main services, rates, timing, location ya booking me madad kar sakti hun. Kya chahiye?"
        if urdu
        else "I can help with services, prices, timings, location or a booking. What would you like?"
    )
    return LLMResult(reply=reply, intent="other", slots=slots)


# --------------------------------------------------------------------------- #
# Anthropic backend
# --------------------------------------------------------------------------- #
async def _anthropic_complete(history: list[dict[str, str]], known_slots: dict[str, str]) -> LLMResult:
    from anthropic import AsyncAnthropic  # imported lazily: optional dependency

    client = AsyncAnthropic(api_key=config.LLM_API_KEY or None)
    model = config.LLM_MODEL or "claude-sonnet-4-5"
    messages = [
        {"role": m["role"], "content": m["content"]}
        for m in history
        if m.get("role") in ("user", "assistant") and m.get("content")
    ]
    response = await client.messages.create(
        model=model,
        max_tokens=400,
        system=build_system_prompt(known_slots),
        messages=messages,
    )
    raw = "".join(block.text for block in response.content if getattr(block, "type", "") == "text")
    return parse_llm_json(raw, known_slots)


# --------------------------------------------------------------------------- #
# OpenAI backend
# --------------------------------------------------------------------------- #
async def _openai_complete(history: list[dict[str, str]], known_slots: dict[str, str]) -> LLMResult:
    from openai import AsyncOpenAI  # imported lazily: optional dependency

    client = AsyncOpenAI(api_key=config.LLM_API_KEY or None)
    model = config.LLM_MODEL or "gpt-4o-mini"
    messages: list[dict[str, str]] = [{"role": "system", "content": build_system_prompt(known_slots)}]
    messages += [
        {"role": m["role"], "content": m["content"]}
        for m in history
        if m.get("role") in ("user", "assistant") and m.get("content")
    ]
    response = await client.chat.completions.create(
        model=model,
        max_tokens=400,
        messages=messages,  # type: ignore[arg-type]
        response_format={"type": "json_object"},
    )
    raw = response.choices[0].message.content or ""
    return parse_llm_json(raw, known_slots)


_BACKENDS = {
    "mock": _mock_complete,
    "anthropic": _anthropic_complete,
    "openai": _openai_complete,
}


async def complete(history: list[dict[str, str]], known_slots: dict[str, str]) -> LLMResult:
    """Single entry point used by the engine. Falls back to the mock on any failure."""
    backend = _BACKENDS.get(config.LLM_PROVIDER, _mock_complete)
    try:
        return await backend(history, known_slots)
    except Exception:  # noqa: BLE001 - a dead LLM must never take the bot down
        log.exception("LLM provider %r failed, falling back to mock", config.LLM_PROVIDER)
        try:
            return await _mock_complete(history, known_slots)
        except Exception:  # noqa: BLE001
            log.exception("Mock fallback failed")
            return LLMResult(reply="Sorry, I had a technical issue. Please try again.")
