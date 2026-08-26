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
@dataclass(frozen=True)
class Service:
    name: str
    price_pkr: int
    duration_min: int
    aliases: tuple[str, ...] = field(default_factory=tuple)


SERVICES: Final[tuple[Service, ...]] = (
    Service("Haircut", 1500, 45, ("haircut", "hair cut", "cut", "baal", "baal katwana", "hair")),
    Service("Hair Color", 6000, 120, ("color", "colour", "hair color", "hair colour", "dye", "rang")),
    Service("Blow Dry", 2000, 40, ("blow dry", "blowdry", "blow-dry", "styling")),
    Service("Facial", 3500, 60, ("facial", "face", "clean up", "cleanup", "chehra")),
    Service("Manicure", 2500, 45, ("manicure", "mani", "nails", "nakhun")),
    Service("Pedicure", 3000, 60, ("pedicure", "pedi", "feet", "paon")),
    Service("Threading", 500, 15, ("threading", "thread", "eyebrows", "brows", "abru")),
    Service("Waxing", 4000, 60, ("waxing", "wax")),
    Service("Bridal Makeup", 35000, 180, ("bridal", "bridal makeup", "dulhan", "shadi", "wedding")),
    Service("Party Makeup", 12000, 90, ("party makeup", "party", "makeup", "make up", "mekap")),
    Service("Hair Spa", 4500, 75, ("hair spa", "spa", "treatment", "keratin")),
)

SALON_NAME: Final[str] = os.getenv("SALON_NAME") or "Sonia's Makeup Salon"
SALON_ADDRESS: Final[str] = (
    os.getenv("SALON_ADDRESS")
    or "Shop 12, Ground Floor, Gulberg Galleria, Main Boulevard, Gulberg III, Lahore"
)
SALON_PHONE: Final[str] = os.getenv("SALON_PHONE") or "+92 300 1234567"
SALON_HOURS: Final[str] = "Monday to Saturday 11:00 AM - 9:00 PM. Sunday closed."
SALON_PAYMENT: Final[str] = "Cash, debit/credit card, and JazzCash or Easypaisa transfer."
SALON_PARKING: Final[str] = "Free covered basement parking for customers, entrance from Main Boulevard."
SALON_EXTRAS: Final[str] = (
    "Walk-ins welcome but appointments get priority. Ladies only. "
    "Bridal bookings need 50% advance."
)


def services_block() -> str:
    """Human-readable price list used inside the system prompt."""
    return "\n".join(
        f"- {s.name}: PKR {s.price_pkr:,} ({s.duration_min} min)" for s in SERVICES
    )


def service_names() -> list[str]:
    return [s.name for s in SERVICES]


def find_service(text: str) -> str | None:
    """Match free text against the service catalogue. Longest alias wins."""
    low = text.lower()
    best: tuple[int, str] | None = None
    for svc in SERVICES:
        for alias in (svc.name.lower(), *svc.aliases):
            if alias in low and (best is None or len(alias) > best[0]):
                best = (len(alias), svc.name)
    return best[1] if best else None


def service_by_name(name: str) -> Service | None:
    for svc in SERVICES:
        if svc.name.lower() == (name or "").lower():
            return svc
    return None


KNOWLEDGE_BASE: Final[str] = f"""\
Salon name: {SALON_NAME}
Address: {SALON_ADDRESS}
Phone: {SALON_PHONE}
Opening hours: {SALON_HOURS}
Payment methods: {SALON_PAYMENT}
Parking: {SALON_PARKING}
Other: {SALON_EXTRAS}

Services and prices (PKR):
{services_block()}
"""


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
