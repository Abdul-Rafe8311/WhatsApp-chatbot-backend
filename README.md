# GlowDesk — Salon WhatsApp Chatbot Backend

A FastAPI backend for a salon assistant that answers questions about services, prices,
timings, location, parking and payment, and takes bookings into an Excel sheet.

**One conversation engine, two front doors.**

```
website widget  ──POST /api/chat──────────────┐
                                              ├─> engine.handle() ─> data/bookings.xlsx
Meta Cloud API  ──POST /webhook/whatsapp──────┘                            │
                                                                           └─> Google Sheet
                                                                               (mirror)
```

`app/core/engine.py` never learns which channel a message came from. When the real
WhatsApp credentials arrive, nothing in the conversation logic changes — you only fill
in `.env`.

It runs **today with zero API keys**: the LLM defaults to an offline keyword backend and
the WhatsApp sender logs `[MOCK SEND]` instead of calling Meta.

---

## Layout

```
app/config.py             salon knowledge base + all env vars
app/adapters/llm.py       mock | anthropic | openai behind one async complete()
app/adapters/whatsapp.py  Cloud API send_text() + parse_incoming() + HMAC check
app/adapters/sheets.py    Google Sheets mirror the salon owner reads on her phone
app/core/engine.py        sessions, slot filling, dedupe
app/core/bookings.py      Excel writer (atomic, locked, CSV fallback)
app/main.py               routes
widget/glowdesk-widget.html  drop-in demo widget, no build step
```

---

## Run it

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt          # anthropic/openai lines are optional
cp .env.example .env                     # every value may stay blank
uvicorn app.main:app --reload --port 8000
```

Open <http://127.0.0.1:8000/docs> for the interactive API, or just:

```bash
curl http://127.0.0.1:8000/health
# {"status":"ok","salon":"GlowDesk Beauty Salon","llm_provider":"mock","whatsapp_configured":false,...}
```

For the widget, open `widget/glowdesk-widget.html` in a browser. To embed it in the demo
site, copy everything between the `widget: copy from here` / `copy to here` comments and
change the single `API_BASE` constant at the top of the script.

---

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET  | `/health` | provider, WhatsApp + Sheets status, salon name |
| POST | `/api/chat` | `{message, session_id?}` → `{session_id, reply, intent, slots, booking_id}` |
| POST | `/api/chat/reset` | drop a session's history and slots |
| GET  | `/webhook/whatsapp` | Meta verification handshake (echoes `hub.challenge` as plain text) |
| POST | `/webhook/whatsapp` | inbound messages; always acks `{"status":"received"}` immediately |
| GET  | `/api/bookings` | read the sheet back as JSON |
| GET  | `/api/bookings/download` | download `bookings.xlsx` |

`session_id` is optional — the server generates one and returns it; the widget keeps it
in `sessionStorage`. WhatsApp sessions are keyed `wa-<phone number>`.

---

## Testing without WhatsApp

Everything below runs with no credentials at all.

**A booking, one slot at a time**

```bash
curl -s -X POST localhost:8000/api/chat -H 'Content-Type: application/json' \
  -d '{"message":"I want to book"}'
# -> "Of course! Which service would you like to book?"   slots: {}

curl -s -X POST localhost:8000/api/chat -H 'Content-Type: application/json' \
  -d '{"message":"facial","session_id":"<id from above>"}'
# then: "tomorrow" -> "4pm" -> "Ayesha Khan"
# -> "...confirmed. Your booking reference is BK-0001."
```

Check the result with `curl localhost:8000/api/bookings`.

**Service on the first turn**

```bash
curl -s -X POST localhost:8000/api/chat -H 'Content-Type: application/json' \
  -d '{"message":"book a facial"}'          # slots: {"service":"Facial"}
```

**Roman Urdu** — `kitna charge hai facial ka`, `timing kya hai`, `book karwana hai` all
work, and the reply language sticks for the rest of the conversation.

**Simulate a WhatsApp webhook**

```bash
curl -s -X POST localhost:8000/webhook/whatsapp -H 'Content-Type: application/json' -d '{
  "object":"whatsapp_business_account",
  "entry":[{"id":"1","changes":[{"field":"messages","value":{
    "messaging_product":"whatsapp",
    "contacts":[{"profile":{"name":"Sara"},"wa_id":"923009998877"}],
    "messages":[{"from":"923009998877","id":"wamid.TEST1","timestamp":"1716200000",
                 "type":"text","text":{"body":"kitna charge hai facial ka"}}]}}]}]}'
```

The reply appears in the server log as `[MOCK SEND] to=923009998877 | ...`.
Post the exact same payload three times and only **one** `[MOCK SEND]` appears — the
other two log `Duplicate webhook delivery ignored`.

**Verification handshake**

```bash
curl -i "localhost:8000/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=glowdesk-verify&hub.challenge=1234567890"
# 200, content-type: text/plain, body: 1234567890   (JSON here fails Meta's check)
```


---

## Google Sheets mirror

The salon owner does not download spreadsheets — she opens a bookmarked Google Sheet on
her phone. Every booking is appended there, with a **Status** dropdown
(Pending / Confirmed / Cancelled) so she updates a booking by tapping, not typing.

**Excel is the source of truth; the Sheet is a mirror.** `save_booking()` writes
`data/bookings.xlsx` first — that is local and always succeeds — and only then pushes to
Google, on a daemon thread so the customer's confirmation never waits on a 1-3 second API
call. If Google is down, the credentials expired, or the network blips, the append is
logged and swallowed: the booking is already safe and the customer has already been
confirmed. A display layer must never be able to take down the booking flow.

With no credentials set it logs `[MOCK SHEETS] would append row: [...]` and returns False,
exactly like `[MOCK SEND]` on the WhatsApp side.

### Setting it up

1. In Google Cloud Console: create a project, enable the **Google Sheets API**, then
   *IAM & Admin → Service Accounts → Create*. Add a **JSON key** and download it.
2. Put the file somewhere gitignored, e.g. `credentials/service-account.json`.
3. Create the Google Sheet, and **share it with the service account's email**
   (`something@your-project.iam.gserviceaccount.com`) as an **Editor**. Without this share
   the API returns 403 — it is the step everyone forgets.
4. Copy the sheet id out of the URL: `docs.google.com/spreadsheets/d/<THIS PART>/edit`.
5. `.env`

   ```dotenv
   GOOGLE_SHEETS_CREDENTIALS_FILE=credentials/service-account.json
   GOOGLE_SHEET_ID=1AbC...
   GOOGLE_SHEET_TAB=Bookings
   ```

   Restart and confirm `"sheets_configured": true` on `/health`. The first booking writes
   and formats the header row, freezes it, sets column widths and applies the Status
   dropdown.

> **Whose Google account?** Create the sheet under the **client's** (or the agency's)
> account and share it with the service account — not under a developer's personal
> account, or the salon loses access to its own customer data when the engagement ends.

---

## Switching on a real LLM

```dotenv
LLM_PROVIDER=anthropic       # or openai
LLM_API_KEY=sk-...
LLM_MODEL=claude-sonnet-4-5  # or gpt-4o-mini
```

The system prompt injects the knowledge base from `app/config.py` and instructs the model
to reply in the customer's language, stay under 40 words, use no markdown, ask one
question at a time, and never invent prices or availability. The model must answer with a
single JSON object; the parser strips ``` fences, regexes out the first `{...}`, and falls
back to treating the text as a plain reply — a malformed response never crashes a turn, and
a provider outage silently falls back to the mock backend.

Every service value the model proposes is checked against the catalogue in
`app/config.py` before it is stored, so the bot cannot invent a service.

---

## Going live on WhatsApp

1. **Meta app** — create a Business app at <https://developers.facebook.com>, add the
   *WhatsApp* product. From *API Setup* copy the **temporary access token** and the
   **Phone number ID**; from *App settings → Basic* copy the **App secret**.
2. **`.env`**

   ```dotenv
   WHATSAPP_TOKEN=EAAG...
   WHATSAPP_PHONE_NUMBER_ID=123456789012345
   WHATSAPP_APP_SECRET=abc123...
   WHATSAPP_VERIFY_TOKEN=any-string-you-choose
   ```

   Restart uvicorn and confirm `"whatsapp_configured": true` on `/health`.
3. **Expose the port** — `ngrok http 8000`, copy the `https://….ngrok-free.app` URL.
4. **Webhook** — *WhatsApp → Configuration → Edit*:
   - Callback URL: `https://….ngrok-free.app/webhook/whatsapp`
   - Verify token: exactly your `WHATSAPP_VERIFY_TOKEN`
   - Click *Verify and save* (Meta GETs the URL and expects the raw challenge back), then
     **Subscribe** to the `messages` field.
5. **Test** — add your own number as a recipient in *API Setup*, message the test number
   from WhatsApp. Note the ngrok URL changes on every restart; update it in the dashboard.
6. **Production** — swap the temporary token for a permanent System User token, host
   behind real TLS, and keep `WHATSAPP_APP_SECRET` set so signatures are verified.

---

## The bugs this handles on purpose

- **Meta retries webhooks** when it does not get a 200 within ~5s, and an LLM call is
  slower than that. The route acks `{"status":"received"}` immediately and does the work in
  a `BackgroundTask`. Retries are additionally deduped on the WhatsApp `message_id` (wamid)
  through a TTL cache, so the customer gets one reply, not three.
- **Delivery statuses hit the same URL.** Payloads with `statuses` and no `messages` are
  ignored — otherwise the bot answers its own read receipts, forever.
- **"I want to book" is intent, not data.** It never becomes the service name, but
  "book a facial" does fill `service=Facial`. The engine tracks which slot the previous bot
  turn asked for, and validates every service value against the catalogue.
- **openpyxl rewrites the whole file on save.** Writes take a `threading.Lock`, save to
  `.tmp.xlsx`, then `os.replace()` — verified with 12 concurrent bookings producing 12
  distinct rows.
- **The owner has the xlsx open in Excel** → `os.replace` raises `OSError`. Caught, and the
  row is appended to `data/bookings_fallback.csv` instead. `GET /api/bookings` reads both.
- **Non-text messages** (image, audio, location, stickers) do not crash the parser; the bot
  replies asking for text.
- **Google Sheets is a mirror, not a dependency.** The append runs off-thread after the
  Excel write and every failure is caught, so an API outage costs a row in the mirror, not
  a customer's appointment.

---

## Excel format

`data/bookings.xlsx`, sheet `Bookings`:

| Booking ID | Received At | Customer Name | WhatsApp Number | Service | Requested Date | Requested Time | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BK-0001 | 2026-08-25 18:33:04 | Sara Ahmed | 923009998877 | Threading | kal | 5 baje | Pending | via whatsapp |

Arial throughout, dark-blue (`#1F3864`) header row in bold white, frozen header, sized
columns. `Status` defaults to `Pending`; `Notes` records the channel.

`data/` is gitignored — it holds real customer names and phone numbers.

---

## Known limits

- **Sessions are in memory.** A restart drops every in-flight conversation, and running
  uvicorn with more than one worker breaks slot filling entirely, because turn 2 can land
  on a worker that never saw turn 1. Move `_sessions` and the dedupe cache to Redis before
  scaling past a single process.
- **No availability check.** The bot writes whatever date and time the customer says. Two
  customers can book the same slot, and nothing validates that the date is in the future or
  that the salon is even open then. Every row lands as `Pending` for a human to confirm.
- **Dates and times are stored as free text** ("kal", "4pm"), not parsed into datetimes.
  Fine for a human reading the sheet, not fine for automated reminders.
- **CORS is `*`.** Convenient for the demo site; restrict `allow_origins` to the salon's
  domain before production.
- **The WhatsApp 24-hour window.** Meta only allows free-form outbound messages within 24
  hours of the customer's last message. Outside that window — booking reminders, "your
  appointment is tomorrow" — you must send a pre-approved **message template**, which
  `send_text()` does not do. Add a `send_template()` call for that.
- **Excel is not a database.** Fine for one salon and a demo; concurrent access is handled
  but the whole file is rewritten on every booking, so it degrades once the sheet is large.
- **The Sheets mirror can drift.** If Google is unreachable the row exists only in
  `data/bookings.xlsx` and is never retried — there is no backfill job. Compare the sheet
  against `GET /api/bookings` if a booking is missing.
- **No auth on `/api/bookings`.** Anyone who can reach the server can read customer names
  and phone numbers. Put it behind a token before it is public.
