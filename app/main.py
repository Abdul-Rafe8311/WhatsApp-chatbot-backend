"""FastAPI routes — the two front doors onto one engine."""

from __future__ import annotations

import logging

from fastapi import BackgroundTasks, FastAPI, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from pydantic import BaseModel, Field

from app import config
from app.adapters import whatsapp
from app.core import bookings, engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s | %(message)s",
)
log = logging.getLogger("glowdesk")

app = FastAPI(
    title=f"{config.SALON_NAME} chatbot backend",
    description="One conversation engine, two front doors: website widget and WhatsApp Cloud API.",
    version="1.0.0",
)

# The site is served from a different origin to this API. Named origins cover
# local dev and any explicit CORS_ALLOW_ORIGINS entries; the regex covers the
# deployed frontend and its per-commit Vercel preview hostnames.
#
# allow_credentials stays False: the widget authenticates nothing and sends no
# cookies, and leaving it False is what lets the origin list stay permissive
# without handing any site the ability to make credentialed calls.
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ALLOW_ORIGINS,
    allow_origin_regex=config.CORS_ALLOW_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    message: str = Field(default="", max_length=2000)
    session_id: str | None = None


class ResetRequest(BaseModel):
    session_id: str | None = None


@app.get("/health")
async def health() -> dict[str, object]:
    return {
        "status": "ok",
        "salon": config.SALON_NAME,
        "llm_provider": config.LLM_PROVIDER,
        "whatsapp_configured": config.whatsapp_configured(),
        "sheets_configured": config.sheets_configured(),
        "active_sessions": engine.session_count(),
    }


# --------------------------------------------------------------------------- #
# Front door 1: website widget
# --------------------------------------------------------------------------- #
@app.post("/api/chat")
async def api_chat(payload: ChatRequest) -> dict[str, object]:
    result = await engine.handle(
        payload.message,
        payload.session_id,
        channel="website",
    )
    return result.as_dict()


@app.post("/api/chat/reset")
async def api_chat_reset(payload: ResetRequest) -> dict[str, object]:
    cleared = engine.reset_session(payload.session_id)
    return {"status": "reset", "cleared": cleared, "session_id": payload.session_id}


# --------------------------------------------------------------------------- #
# Front door 2: Meta WhatsApp Cloud API
# --------------------------------------------------------------------------- #
@app.get("/webhook/whatsapp")
async def whatsapp_verify(request: Request) -> Response:
    """Meta's verification handshake — the challenge must come back as plain text."""
    params = request.query_params
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge", "")
    if mode == "subscribe" and token == config.WHATSAPP_VERIFY_TOKEN:
        log.info("WhatsApp webhook verified")
        return PlainTextResponse(content=challenge, status_code=200)
    log.warning("WhatsApp webhook verification failed (mode=%s)", mode)
    return PlainTextResponse(content="Forbidden", status_code=403)


async def _process_whatsapp_message(msg: whatsapp.IncomingMessage) -> None:
    """Runs in a BackgroundTask so the webhook itself always answers instantly."""
    try:
        if not msg.is_text:
            await whatsapp.send_text(msg.from_number, whatsapp.unsupported_reply(msg))
            return
        result = await engine.handle(
            msg.text,
            session_id=f"wa-{msg.from_number}",
            channel="whatsapp",
            customer_number=msg.from_number,
            profile_name=msg.profile_name,
        )
        await whatsapp.send_text(msg.from_number, result.reply)
    except Exception:  # noqa: BLE001 - a background crash must not be silent
        log.exception("Failed processing WhatsApp message %s", msg.message_id)


@app.post("/webhook/whatsapp")
async def whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_hub_signature_256: str | None = Header(default=None),
) -> JSONResponse:
    """Acknowledge in well under Meta's ~5s budget, then work in the background."""
    raw_body = await request.body()
    if not whatsapp.verify_signature(raw_body, x_hub_signature_256):
        log.warning("Rejected webhook with bad x-hub-signature-256")
        return JSONResponse({"status": "invalid signature"}, status_code=403)

    try:
        payload = await request.json()
    except Exception:  # noqa: BLE001 - malformed body: ack anyway, Meta must not retry
        log.warning("Webhook body was not valid JSON")
        return JSONResponse({"status": "received"}, status_code=200)

    for msg in whatsapp.parse_incoming(payload):
        if engine.already_processed(msg.message_id):
            log.info("Duplicate webhook delivery ignored: %s", msg.message_id)
            continue
        background_tasks.add_task(_process_whatsapp_message, msg)

    return JSONResponse({"status": "received"}, status_code=200)


# --------------------------------------------------------------------------- #
# Bookings
# --------------------------------------------------------------------------- #
@app.get("/api/bookings")
async def api_bookings() -> dict[str, object]:
    rows = bookings.list_bookings()
    return {"count": len(rows), "bookings": rows}


@app.get("/api/bookings/download")
async def api_bookings_download() -> Response:
    if not config.BOOKINGS_XLSX.exists():
        return JSONResponse({"error": "No bookings yet"}, status_code=404)
    return FileResponse(
        path=config.BOOKINGS_XLSX,
        filename="bookings.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
