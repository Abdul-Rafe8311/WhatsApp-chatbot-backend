"""Salon knowledge base and environment configuration.

Everything the bot is allowed to say about the salon lives here. The LLM adapter
injects this into the system prompt and is told never to invent anything outside it.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Final

from dotenv import load_dotenv

load_dotenv()

BASE_DIR: Final[Path] = Path(__file__).resolve().parent.parent


def _resolve_data_dir() -> Path:
    """Pick a writable directory for the Excel store.

    Serverless hosts (Vercel, Lambda) mount the deployment read-only and only
    give you /tmp, so a bare mkdir here would raise at import time and take the
    whole app down. /tmp is ephemeral — the Google Sheet mirror is the durable
    copy when running on one of these hosts.
    """
    override = os.getenv("DATA_DIR", "").strip()
    candidates = [Path(override)] if override else []
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        candidates.append(Path("/tmp/glowdesk-data"))
    else:
        candidates.append(BASE_DIR / "data")
    candidates.append(Path("/tmp/glowdesk-data"))

    for candidate in candidates:
        try:
            candidate.mkdir(parents=True, exist_ok=True)
            return candidate
        except OSError:
            continue
    return candidates[-1]


DATA_DIR: Final[Path] = _resolve_data_dir()

BOOKINGS_XLSX: Final[Path] = DATA_DIR / "bookings.xlsx"
BOOKINGS_CSV_FALLBACK: Final[Path] = DATA_DIR / "bookings_fallback.csv"


# Canonical booking columns, shared by the Excel writer and the Google Sheet mirror.
BOOKING_HEADERS: Final[list[str]] = [
    "Booking ID",
    "Received At",
    "Customer Name",
    "WhatsApp Number",
    "Service",
    "Requested Date",
    "Requested Time",
    "Status",
    "Notes",
]
BOOKING_STATUSES: Final[list[str]] = ["Pending", "Confirmed", "Cancelled"]


# --------------------------------------------------------------------------- #
# Salon knowledge base
# --------------------------------------------------------------------------- #
# The catalogue used to live here as a hardcoded tuple. It drifted from the
# website — GlowDesk's haircuts and facials in Lahore against Sonia's bridal
# work in Sargodha — so a bride asking about her barat was quoted Party Makeup.
#
# It now lives in one place: frontend/src/config/salon.ts, published as
# /api/services.json and read by app.adapters.catalogue. Nothing about the
# salon's services, prices, address or hours belongs in this file any more.
#
# SALON_NAME stays because it is also the API title and the /health payload,
# and it must resolve before any network call has happened.

SALON_NAME: Final[str] = os.getenv("SALON_NAME") or "Sonia's Makeup Salon"

# Where the published contract lives. Empty disables refreshing, leaving the
# bundled snapshot — which is what runs in tests and offline.
SERVICES_JSON_URL: Final[str] = os.getenv("SERVICES_JSON_URL", "").strip()
CATALOGUE_TTL_SECONDS: Final[int] = int(os.getenv("CATALOGUE_TTL_SECONDS") or 900)
CATALOGUE_TIMEOUT_SECONDS: Final[float] = float(
    os.getenv("CATALOGUE_TIMEOUT_SECONDS") or 4
)


# --------------------------------------------------------------------------- #
# Environment
# --------------------------------------------------------------------------- #
WHATSAPP_TOKEN: Final[str] = os.getenv("WHATSAPP_TOKEN", "").strip()
WHATSAPP_PHONE_NUMBER_ID: Final[str] = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "").strip()
WHATSAPP_APP_SECRET: Final[str] = os.getenv("WHATSAPP_APP_SECRET", "").strip()
WHATSAPP_VERIFY_TOKEN: Final[str] = os.getenv("WHATSAPP_VERIFY_TOKEN", "").strip() or "glowdesk-verify"
WHATSAPP_API_VERSION: Final[str] = os.getenv("WHATSAPP_API_VERSION", "").strip() or "v21.0"

LLM_PROVIDER: Final[str] = os.getenv("LLM_PROVIDER", "mock").strip().lower() or "mock"
LLM_API_KEY: Final[str] = os.getenv("LLM_API_KEY", "").strip()
LLM_MODEL: Final[str] = os.getenv("LLM_MODEL", "").strip()

GOOGLE_SHEETS_CREDENTIALS_FILE: Final[str] = os.getenv("GOOGLE_SHEETS_CREDENTIALS_FILE", "").strip()
GOOGLE_SHEET_ID: Final[str] = os.getenv("GOOGLE_SHEET_ID", "").strip()
GOOGLE_SHEET_TAB: Final[str] = os.getenv("GOOGLE_SHEET_TAB", "").strip() or "Bookings"

# Browser origins allowed to call /api/*. The widget is served from the public
# site, which is a different origin to this API, so it needs real CORS rather
# than the previous allow-everything.
#
# CORS_ALLOW_ORIGINS is a comma-separated list and replaces the defaults when
# set. The regex is separate because Vercel gives every preview deployment its
# own hostname, and those cannot be enumerated ahead of time.
_DEFAULT_CORS_ORIGINS: Final[tuple[str, ...]] = (
    "http://localhost:3000",
    "http://127.0.0.1:3000",
)


def _split_origins(raw: str) -> list[str]:
    return [part.strip().rstrip("/") for part in raw.split(",") if part.strip()]


CORS_ALLOW_ORIGINS: Final[list[str]] = (
    _split_origins(os.getenv("CORS_ALLOW_ORIGINS", ""))
    or list(_DEFAULT_CORS_ORIGINS)
)

# Any *.vercel.app host: the production frontend plus its preview deployments.
# Override with CORS_ALLOW_ORIGIN_REGEX once the site has its own domain.
CORS_ALLOW_ORIGIN_REGEX: Final[str] = (
    os.getenv("CORS_ALLOW_ORIGIN_REGEX", "").strip()
    or r"https://[a-z0-9-]+\.vercel\.app"
)

SESSION_TTL_SECONDS: Final[int] = int(os.getenv("SESSION_TTL_SECONDS") or 3600)
DEDUPE_TTL_SECONDS: Final[int] = int(os.getenv("DEDUPE_TTL_SECONDS") or 600)


def whatsapp_configured() -> bool:
    return bool(WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID)


def sheets_configured() -> bool:
    return bool(GOOGLE_SHEETS_CREDENTIALS_FILE and GOOGLE_SHEET_ID)
