"""Vercel entrypoint.

Vercel's Python runtime scans a fixed set of paths for an ASGI app; a root-level
main.py is one of them. It deliberately does NOT live under api/, because that
directory has filesystem-routing meaning and the app already serves /api/*.

The real app lives in app/main.py — this only re-exports it and makes sure the
repo root is importable, since the runtime may load this module by file path
rather than as part of the package.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.main import app  # noqa: E402

__all__ = ["app"]
