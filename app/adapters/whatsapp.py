"""Meta WhatsApp Cloud API adapter: outbound send + inbound payload parsing.

With no `WHATSAPP_TOKEN` configured, `send_text` logs `[MOCK SEND]` instead of
calling Meta, so the whole flow is testable offline.
"""

from __future__ import annotations

import hashlib
import hmac
import logging
from dataclasses import dataclass
from typing import Any

import httpx

from app import config

log = logging.getLogger(__name__)

GRAPH_URL = "https://graph.facebook.com/{version}/{phone_number_id}/messages"

# Message types we cannot read. The bot politely asks for text instead.
_UNSUPPORTED_HINT = (
    "Sorry, I can only read text messages. Could you type your question instead?"
)


@dataclass
class IncomingMessage:
    message_id: str
    from_number: str
    text: str
    msg_type: str
    profile_name: str = ""

    @property
    def is_text(self) -> bool:
        return self.msg_type == "text" and bool(self.text.strip())


async def send_text(to: str, body: str) -> dict[str, Any]:
    """Send a WhatsApp text message, or log it when credentials are missing."""
    body = (body or "").strip()[:4096]
    if not config.whatsapp_configured():
        log.info("[MOCK SEND] to=%s | %s", to, body)
        return {"mock": True, "to": to, "body": body}

    url = GRAPH_URL.format(
        version=config.WHATSAPP_API_VERSION,
        phone_number_id=config.WHATSAPP_PHONE_NUMBER_ID,
    )
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {"preview_url": False, "body": body},
    }
    headers = {"Authorization": f"Bearer {config.WHATSAPP_TOKEN}"}
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload, headers=headers)
        if response.status_code >= 400:
            log.error("WhatsApp send failed %s: %s", response.status_code, response.text)
            return {"error": response.text, "status_code": response.status_code}
        return response.json()
    except httpx.HTTPError as exc:
        log.error("WhatsApp send transport error: %s", exc)
        return {"error": str(exc)}


def parse_incoming(payload: dict[str, Any]) -> list[IncomingMessage]:
    """Extract user messages from a webhook payload.

    Returns an empty list for delivery/read status callbacks (payloads carrying
    `statuses` and no `messages`) so the bot never replies to its own receipts.
    Non-text messages come back with `is_text` False rather than raising.
    """
    messages: list[IncomingMessage] = []
    if not isinstance(payload, dict):
        return messages

    for entry in payload.get("entry") or []:
        if not isinstance(entry, dict):
            continue
        for change in entry.get("changes") or []:
            if not isinstance(change, dict):
                continue
            value = change.get("value")
            if not isinstance(value, dict):
                continue

            raw_messages = value.get("messages")
            if not raw_messages:
                if value.get("statuses"):
                    log.info("Ignoring status callback (%d statuses)", len(value["statuses"]))
                continue

            contacts = value.get("contacts") or []
            profile_name = ""
            if contacts and isinstance(contacts[0], dict):
                profile_name = (contacts[0].get("profile") or {}).get("name", "") or ""

            for msg in raw_messages:
                if not isinstance(msg, dict):
                    continue
                msg_type = msg.get("type") or "unknown"
                text = ""
                if msg_type == "text":
                    text = ((msg.get("text") or {}).get("body") or "").strip()
                elif msg_type == "button":
                    text = ((msg.get("button") or {}).get("text") or "").strip()
                elif msg_type == "interactive":
                    interactive = msg.get("interactive") or {}
                    node = interactive.get("button_reply") or interactive.get("list_reply") or {}
                    text = (node.get("title") or "").strip()
                    if text:
                        msg_type = "text"
                messages.append(
                    IncomingMessage(
                        message_id=str(msg.get("id") or ""),
                        from_number=str(msg.get("from") or ""),
                        text=text,
                        msg_type=msg_type,
                        profile_name=profile_name,
                    )
                )
    return messages


def unsupported_reply(msg: IncomingMessage) -> str:
    return _UNSUPPORTED_HINT


def verify_signature(raw_body: bytes, signature_header: str | None) -> bool:
    """Validate Meta's `x-hub-signature-256`. Skipped when APP_SECRET is unset."""
    if not config.WHATSAPP_APP_SECRET:
        return True
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    expected = hmac.new(
        config.WHATSAPP_APP_SECRET.encode("utf-8"), raw_body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header.split("=", 1)[1].strip())
