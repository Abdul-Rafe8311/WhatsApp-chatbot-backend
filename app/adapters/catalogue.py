"""The salon catalogue, read from the website's /api/services.json contract.

The agent used to keep its own hardcoded copy of the services, prices, address
and hours. It drifted: the site sold mehndi, nikah, barat and walima in
Sargodha while the agent quoted haircuts and facials in Lahore, so a bride
asking about her barat was answered with a Party Makeup price.

There is now one source. generate-api.mjs writes services.json from
frontend/src/config/salon.ts at build time and this module reads it, so the
agent cannot disagree with the site about what the salon sells.

Two rules from the contract are load-bearing here and are enforced in code
rather than left to the prompt:

  * `priceEstimated` is read per service, not assumed. Sonia has confirmed the
    current rates, so they are quoted as firm figures; if any single service is
    ever set back to true, only that quote softens to "around X, and I can
    confirm". The flag drives the wording — nothing here hardcodes either.
  * `hours.verified === false` means nobody has confirmed the schedule. The
    agent says so instead of inventing opening times. That is still the case:
    every day in the contract is null.

A null anywhere means UNKNOWN — not zero, not free, not closed.
"""

from __future__ import annotations

import json
import logging
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Final

import httpx

from app import config

log = logging.getLogger(__name__)

# Shipped with the agent so a cold start, a failed fetch, or a site that has
# not been deployed yet still leaves it able to answer. Refreshed from the live
# contract whenever that is reachable.
SNAPSHOT_PATH: Final[Path] = Path(__file__).resolve().parent.parent / "catalogue_snapshot.json"


@dataclass(frozen=True)
class Service:
    id: str
    name: str
    category: str
    description: str
    price_min: int | None
    price_max: int | None
    price_note: str
    currency: str
    price_estimated: bool
    duration_minutes: int | None

    @property
    def has_price(self) -> bool:
        return self.price_min is not None


@dataclass(frozen=True)
class Catalogue:
    name: str
    owner: str
    tagline: str
    city: str
    address: str
    email: str
    instagram: str
    facebook: str
    services: tuple[Service, ...]
    hours_verified: bool
    prices_are_estimates: bool
    fetched_at: float
    source: str


# --------------------------------------------------------------------------- #
# Aliases
# --------------------------------------------------------------------------- #
# Language knowledge, not salon data, so it stays with the agent rather than in
# the contract: the site has no reason to carry the Urdu for "bride". Keyed by
# service id so a rename on the site cannot silently orphan them.
_ALIASES: Final[dict[str, tuple[str, ...]]] = {
    "mehndi": ("mehndi", "mayun", "mehendi", "henna day"),
    "nikah": ("nikah", "nikkah"),
    "barat": ("barat", "baraat", "shadi", "wedding day"),
    "walima": ("walima", "valima", "reception"),
    "engagement": ("engagement", "mangni"),
    "party-makeup": ("party", "party makeup", "guest makeup", "function"),
    "balayage": ("balayage", "balyage", "hand painted colour", "hand painted color"),
    "highlights": ("highlights", "high lights", "foils"),
    "haircut": ("haircut", "hair cut", "cut", "blow dry", "blowdry", "styling", "baal"),
    "hair-treatment": ("hair treatment", "keratin", "protein treatment"),
    "facial": ("facial", "clean up", "cleanup", "chehra"),
    "threading": ("threading", "thread", "eyebrows", "brows", "abru"),
    "waxing": ("waxing", "wax"),
}

# "Bridal" is a category, not a service. Asking about it should list the days
# rather than match one arbitrarily.
BRIDAL_WORDS: Final[tuple[str, ...]] = ("bridal", "dulhan", "bride", "wedding")


# --------------------------------------------------------------------------- #
# Loading
# --------------------------------------------------------------------------- #
_lock = threading.Lock()
_cache: Catalogue | None = None


def _parse(payload: dict[str, Any], source: str) -> Catalogue:
    salon = payload.get("salon") or {}
    socials = salon.get("socials") or {}
    hours = payload.get("hours") or {}
    contract = payload.get("contract") or {}

    services = tuple(
        Service(
            id=str(s.get("id") or ""),
            name=str(s.get("name") or ""),
            category=str(s.get("category") or ""),
            description=str(s.get("description") or ""),
            price_min=s.get("priceMin"),
            price_max=s.get("priceMax"),
            price_note=str(s.get("priceNote") or "On request"),
            currency=str(s.get("priceCurrency") or "PKR"),
            # Absent flag is treated as an estimate: quoting a firm price we
            # were never promised is the worse failure.
            price_estimated=bool(s.get("priceEstimated", True)),
            duration_minutes=s.get("durationMinutes"),
        )
        for s in payload.get("services") or []
    )

    return Catalogue(
        name=str(salon.get("name") or "the salon"),
        owner=str(salon.get("owner") or ""),
        tagline=str(salon.get("tagline") or ""),
        city=str(salon.get("city") or ""),
        address=str(salon.get("address") or ""),
        email=str(salon.get("email") or ""),
        instagram=str(socials.get("instagram") or ""),
        facebook=str(socials.get("facebook") or ""),
        services=services,
        hours_verified=bool(hours.get("verified", False)),
        prices_are_estimates=bool(contract.get("pricesAreEstimates", True)),
        fetched_at=time.time(),
        source=source,
    )


def _load_snapshot() -> Catalogue:
    with SNAPSHOT_PATH.open(encoding="utf-8") as handle:
        return _parse(json.load(handle), source="snapshot")


def get() -> Catalogue:
    """The current catalogue. Never blocks on the network."""
    global _cache
    with _lock:
        if _cache is None:
            _cache = _load_snapshot()
        return _cache


async def refresh_if_stale() -> None:
    """Pull the live contract if the cache has aged past its TTL.

    Failure is not an error: the snapshot is a complete catalogue, so a site
    that is down or not yet deployed costs freshness, never availability.
    """
    if not config.SERVICES_JSON_URL:
        return

    current = get()
    if current.source == "live" and time.time() - current.fetched_at < config.CATALOGUE_TTL_SECONDS:
        return

    global _cache
    try:
        async with httpx.AsyncClient(timeout=config.CATALOGUE_TIMEOUT_SECONDS) as client:
            res = await client.get(config.SERVICES_JSON_URL)
            res.raise_for_status()
            fresh = _parse(res.json(), source="live")
    except Exception as exc:  # noqa: BLE001 - any failure keeps the snapshot
        log.warning("catalogue refresh failed, keeping %s: %s", current.source, exc)
        return

    if not fresh.services:
        log.warning("catalogue refresh returned no services, keeping %s", current.source)
        return

    with _lock:
        _cache = fresh
    log.info("catalogue refreshed from %s (%d services)", config.SERVICES_JSON_URL, len(fresh.services))


# --------------------------------------------------------------------------- #
# Lookups
# --------------------------------------------------------------------------- #
def find_service(text: str) -> Service | None:
    """Match free text against the catalogue. Longest alias wins."""
    low = (text or "").lower()
    best: tuple[int, Service] | None = None
    for svc in get().services:
        candidates = (svc.name.lower(), svc.id.replace("-", " "), *_ALIASES.get(svc.id, ()))
        for alias in candidates:
            if alias and alias in low and (best is None or len(alias) > best[0]):
                best = (len(alias), svc)
    return best[1] if best else None


def service_by_name(name: str) -> Service | None:
    low = (name or "").lower()
    for svc in get().services:
        if svc.name.lower() == low or svc.id == low:
            return svc
    return None


def service_names(limit: int | None = None) -> list[str]:
    names = [s.name for s in get().services]
    return names[:limit] if limit else names


def bridal_service_names() -> list[str]:
    return [s.name for s in get().services if s.category == "Bridal"]


# --------------------------------------------------------------------------- #
# Rendering prices
# --------------------------------------------------------------------------- #
def price_phrase(svc: Service, urdu: bool = False) -> str:
    """The price, worded according to the service's own priceEstimated flag.

    Confirmed rates are stated plainly. An estimate is hedged and offered for
    confirmation, because quoting an unconfirmed figure as fact would be
    inventing a price on the salon's behalf.
    """
    if not svc.has_price:
        return (
            f"{svc.name} ki price abhi confirm nahi hai. Main aap ke liye pata kar sakti hun."
            if urdu
            else f"I do not have a confirmed price for {svc.name}. I can find out for you."
        )

    if svc.price_max is not None and svc.price_max != svc.price_min:
        span = f"{svc.currency} {svc.price_min:,}–{svc.price_max:,}"
    else:
        span = f"{svc.currency} {svc.price_min:,}"

    if svc.price_estimated:
        if urdu:
            return (
                f"{svc.name} tuqreeban {span} ka hota hai — ye andaza hai, "
                f"final rate confirm kar ke bata sakti hun."
            )
        return (
            f"{svc.name} is usually around {span} — that is a guide rather than "
            f"a quote, and I can confirm the exact price for you."
        )

    if urdu:
        return f"{svc.name} {span} ka hai."
    return f"{svc.name} is {span}."


def price_list_phrase(urdu: bool = False, limit: int = 4) -> str:
    """A short sample of rates, hedged only if any of them is still an estimate."""
    priced = [s for s in get().services if s.has_price][:limit]
    if not priced:
        return (
            "Abhi rates confirm nahi hain. Main pata kar ke bata sakti hun."
            if urdu
            else "I do not have confirmed rates yet. I can find out for you."
        )
    parts = []
    for s in priced:
        if s.price_max is not None and s.price_max != s.price_min:
            parts.append(f"{s.name} {s.currency} {s.price_min:,}–{s.price_max:,}")
        else:
            parts.append(f"{s.name} {s.currency} {s.price_min:,}")
    joined = ", ".join(parts)
    hedged = any(s.price_estimated for s in priced)
    if urdu:
        tail = " Ye andaazan hain, confirm kar sakti hun." if hedged else ""
        return f"Rates: {joined}.{tail} Kis service ka rate chahiye?"
    tail = " Those are estimates rather than quotes." if hedged else ""
    return f"Our rates: {joined}.{tail} Which service did you mean?"


def hours_phrase(urdu: bool = False) -> str:
    """Opening times, or an honest admission that they are unconfirmed."""
    cat = get()
    if not cat.hours_verified:
        return (
            "Timings abhi confirm nahi hain. Main check kar ke bata sakti hun — "
            "ya aap WhatsApp par pooch sakti hain."
            if urdu
            else "I do not have confirmed opening times yet. I can check and get "
            "back to you, or you can ask us directly on WhatsApp."
        )
    return (
        "Timings ke liye WhatsApp par pooch lein."
        if urdu
        else "Please ask us on WhatsApp for our opening times."
    )


def address_phrase(urdu: bool = False) -> str:
    cat = get()
    if not cat.address:
        return (
            f"Hum {cat.city} me hain." if urdu else f"We are in {cat.city}."
        )
    return f"Hamara pata: {cat.address}." if urdu else f"We are at {cat.address}."


def knowledge_base() -> str:
    """The block injected into the LLM system prompt.

    Carries the uncertainty with the facts. A prompt that lists prices without
    saying they are estimates invites the model to quote them as rates.
    """
    cat = get()
    lines = [
        f"Salon name: {cat.name}",
        f"Owner: {cat.owner}" if cat.owner else "",
        f"City: {cat.city}",
        f"Address: {cat.address}" if cat.address else "",
        f"Email: {cat.email}" if cat.email else "",
        f"Instagram: {cat.instagram}" if cat.instagram else "",
        "",
        "Opening hours: NOT CONFIRMED. Never state opening times. Offer to check."
        if not cat.hours_verified
        else "Opening hours: ask on WhatsApp.",
        "",
        "Phone number: NOT CONFIRMED. Never give out a phone number.",
        "Payment methods, parking and deposit terms: NOT CONFIRMED. Never state them.",
        "",
        "Services and rates. These are the salon's own confirmed prices and may",
        "be stated plainly. Any line marked ESTIMATE is not confirmed: quote it",
        "as approximate and offer to confirm. Never invent a price for a service",
        "marked 'not confirmed'.",
    ]
    for svc in cat.services:
        suffix = " (ESTIMATE - hedge this one)" if svc.price_estimated else ""
        if svc.has_price and svc.price_max is not None and svc.price_max != svc.price_min:
            price = f"{svc.currency} {svc.price_min:,}–{svc.price_max:,}{suffix}"
        elif svc.has_price:
            price = f"{svc.currency} {svc.price_min:,}{suffix}"
        else:
            price = f"{svc.price_note} (not confirmed)"
        lines.append(f"- {svc.name} [{svc.category}]: {price}. {svc.description}")

    return "\n".join(line for line in lines if line != "" or True)
