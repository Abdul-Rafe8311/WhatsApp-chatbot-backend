"""Google Sheets mirror of the bookings file.

The salon owner is not going to download an .xlsx — she opens a bookmarked Google
Sheet on her phone. This adapter appends each booking to that sheet.

**The Sheet is a mirror, never the source of truth.** `data/bookings.xlsx` is written
first and always; if Google is down, the token expired or the network blipped, the
booking is already safe on disk and the customer has already been confirmed. Every
function here returns a bool and swallows its own errors.

With `GOOGLE_SHEETS_CREDENTIALS_FILE` or `GOOGLE_SHEET_ID` unset it logs `[MOCK SHEETS]`
and returns False — the same offline pattern as the WhatsApp and LLM adapters.
"""

from __future__ import annotations

import logging
import threading
from pathlib import Path
from typing import Any

from app import config

log = logging.getLogger(__name__)

HEADERS: list[str] = config.BOOKING_HEADERS
STATUSES: list[str] = config.BOOKING_STATUSES

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]

HEADER_FORMAT: dict[str, Any] = {
    "backgroundColor": {"red": 0.122, "green": 0.220, "blue": 0.392},  # #1F3864
    "horizontalAlignment": "CENTER",
    "textFormat": {
        "foregroundColor": {"red": 1, "green": 1, "blue": 1},
        "fontFamily": "Arial",
        "bold": True,
        "fontSize": 11,
    },
}
COLUMN_WIDTHS = [90, 150, 170, 150, 130, 130, 120, 110, 200]

_worksheet: Any | None = None
_client_lock = threading.Lock()


def is_configured() -> bool:
    return config.sheets_configured()


def _open_worksheet() -> Any | None:
    """Open (and cache) the target worksheet. Returns None if anything is missing."""
    global _worksheet
    if _worksheet is not None:
        return _worksheet

    with _client_lock:
        if _worksheet is not None:
            return _worksheet

        credentials_path = Path(config.GOOGLE_SHEETS_CREDENTIALS_FILE)
        if not credentials_path.exists():
            log.error("Google service-account file not found: %s", credentials_path)
            return None

        import gspread  # imported lazily: optional dependency
        from google.oauth2.service_account import Credentials

        credentials = Credentials.from_service_account_file(str(credentials_path), scopes=SCOPES)
        client = gspread.authorize(credentials)
        spreadsheet = client.open_by_key(config.GOOGLE_SHEET_ID)
        try:
            worksheet = spreadsheet.worksheet(config.GOOGLE_SHEET_TAB)
        except Exception:  # noqa: BLE001 - WorksheetNotFound, without importing the class
            worksheet = spreadsheet.add_worksheet(
                title=config.GOOGLE_SHEET_TAB, rows=1000, cols=len(HEADERS)
            )
        _ensure_header(worksheet)
        _worksheet = worksheet
        return _worksheet


def _ensure_header(worksheet: Any) -> None:
    """Write and format the header row the first time we touch a blank sheet."""
    try:
        first_row = worksheet.row_values(1)
    except Exception:  # noqa: BLE001
        log.exception("Could not read the sheet's first row")
        return

    last_col = chr(ord("A") + len(HEADERS) - 1)
    if [c.strip() for c in first_row][: len(HEADERS)] != HEADERS:
        worksheet.update(values=[HEADERS], range_name=f"A1:{last_col}1")
        log.info("Wrote header row to Google Sheet")

    try:
        worksheet.format(f"A1:{last_col}1", HEADER_FORMAT)
        worksheet.freeze(rows=1)
        _set_column_widths(worksheet)
    except Exception:  # noqa: BLE001 - cosmetic only, never worth failing a booking
        log.warning("Could not format the Google Sheet header", exc_info=True)

    _ensure_status_dropdown(worksheet)


def _set_column_widths(worksheet: Any) -> None:
    requests = [
        {
            "updateDimensionProperties": {
                "range": {
                    "sheetId": worksheet.id,
                    "dimension": "COLUMNS",
                    "startIndex": idx,
                    "endIndex": idx + 1,
                },
                "properties": {"pixelSize": width},
                "fields": "pixelSize",
            }
        }
        for idx, width in enumerate(COLUMN_WIDTHS)
    ]
    worksheet.spreadsheet.batch_update({"requests": requests})


def _ensure_status_dropdown(worksheet: Any) -> None:
    """Status column becomes a tap-to-choose dropdown, so the owner never types."""
    status_col = HEADERS.index("Status")
    request = {
        "setDataValidation": {
            "range": {
                "sheetId": worksheet.id,
                "startRowIndex": 1,
                "endRowIndex": 5000,
                "startColumnIndex": status_col,
                "endColumnIndex": status_col + 1,
            },
            "rule": {
                "condition": {
                    "type": "ONE_OF_LIST",
                    "values": [{"userEnteredValue": s} for s in STATUSES],
                },
                "showCustomUi": True,
                "strict": False,
            },
        }
    }
    try:
        worksheet.spreadsheet.batch_update({"requests": [request]})
        log.info("Status dropdown (%s) applied to the Google Sheet", " / ".join(STATUSES))
    except Exception:  # noqa: BLE001
        log.warning("Could not apply the Status dropdown", exc_info=True)


def append_booking(booking: dict[str, Any]) -> bool:
    """Append one booking row to the Google Sheet. Returns True only on success.

    Never raises: the caller has already persisted the booking locally.
    """
    row = [str(booking.get(header, "") or "") for header in HEADERS]

    if not is_configured():
        log.info("[MOCK SHEETS] would append row: %s", row)
        return False

    try:
        worksheet = _open_worksheet()
        if worksheet is None:
            return False
        worksheet.append_row(row, value_input_option="USER_ENTERED")
        log.info("Booking %s mirrored to Google Sheet", row[0] or "?")
        return True
    except Exception:  # noqa: BLE001 - a display-layer failure must never cost a booking
        log.exception("Google Sheets append failed for booking %s", row[0] or "?")
        global _worksheet
        _worksheet = None  # force a fresh client next time (expired token, etc.)
        return False


def append_booking_async(booking: dict[str, Any]) -> threading.Thread:
    """Fire the append on a daemon thread — the Sheets API takes 1-3s and the
    customer must not wait for it to get their confirmation."""
    thread = threading.Thread(
        target=append_booking,
        args=(booking,),
        name=f"sheets-{booking.get('Booking ID', '')}",
        daemon=True,
    )
    thread.start()
    return thread
