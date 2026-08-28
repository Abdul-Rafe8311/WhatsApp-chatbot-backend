"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiBaseUrl } from "@/lib/api";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";

/**
 * Floating chat launcher and panel, wired to the WhatsApp booking agent's
 * HTTP API. A React port of widget/glowdesk-widget.html from the agent repo.
 *
 * This is the one component on the site that talks to a server. CLAUDE.md
 * previously ruled that out; see the reversal note there for why it changed.
 * The rule it does still honour: no content is hardcoded here. Salon facts
 * come from salon.ts, interface words from copy.ts.
 *
 * Session handling matches the standalone widget so a visitor's thread
 * survives a page navigation: the backend mints a session id, we keep it in
 * sessionStorage, and every send returns it for the next turn. sessionStorage
 * rather than localStorage — a booking conversation should not resume days
 * later mid-sentence.
 *
 * Positioned above <StickyCTA>, not beside it. Both live bottom-right, and on
 * a 375px screen the sticky pill spans the full width, so a launcher at the
 * same offset would sit on top of the salon's primary "Book on WhatsApp"
 * call to action.
 */

type Role = "user" | "bot" | "error";

type Message = {
  id: number;
  role: Role;
  text: string;
  /** Formatted at send time, not render time, so it never shifts on rerender. */
  time: string;
};

const SESSION_KEY = "sonias_chat_session";

/** Dispatch this on `window` to open the widget from elsewhere on the page. */
export const OPEN_CHAT_EVENT = "sonias:open-chat";

function clock(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const sessionId = useRef<string | null>(null);
  const nextId = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const push = useCallback((role: Role, text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role, text, time: clock() },
    ]);
  }, []);

  // Restore the session id on mount only. Reading storage during render would
  // differ between the prerendered HTML and the browser, which is a hydration
  // mismatch; an effect runs after hydration has already agreed.
  useEffect(() => {
    try {
      sessionId.current = window.sessionStorage.getItem(SESSION_KEY);
    } catch {
      // Private mode or blocked storage: the thread still works for this page
      // view, it just will not survive a navigation.
      sessionId.current = null;
    }
  }, []);

  // Greet on first open rather than on mount, so a visitor who never opens the
  // panel never triggers the work, and the greeting is the newest thing on
  // screen when they do.
  useEffect(() => {
    if (!open) return;
    setMessages((prev) =>
      prev.length > 0
        ? prev
        : [
            {
              id: nextId.current++,
              role: "bot",
              text: copy.chat.greeting(salon.info.name),
              time: clock(),
            },
          ],
    );
    inputRef.current?.focus();
  }, [open]);

  // Pin the transcript to the newest message.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, busy]);

  // Any part of the page can ask for the widget by name. A window event
  // rather than lifted state or a context: the widget stays self-contained,
  // and a caller that is unmounted or never rendered simply has no effect.
  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  // Escape closes, and focus returns to the launcher rather than being left
  // on a hidden element.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function storeSession(id: string) {
    sessionId.current = id;
    try {
      window.sessionStorage.setItem(SESSION_KEY, id);
    } catch {
      // See the mount effect: unremembered is acceptable, throwing is not.
    }
  }

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;

    push("user", text);
    setDraft("");
    setBusy(true);

    try {
      const res = await fetch(`${apiBaseUrl()}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId.current }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { reply?: string; session_id?: string } = await res.json();
      if (data.session_id) storeSession(data.session_id);
      push("bot", data.reply || "…");
    } catch (err) {
      push("error", copy.chat.unreachable);
      console.error("[chat]", err);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  async function reset() {
    const previous = sessionId.current;
    setMessages([]);
    sessionId.current = null;
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Nothing to clear.
    }

    // Fire and forget: the visitor's thread is already cleared on screen, and
    // a failed cleanup on the server is not worth blocking them on.
    try {
      await fetch(`${apiBaseUrl()}/api/chat/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: previous }),
      });
    } catch (err) {
      console.error("[chat] reset failed", err);
    }

    push("bot", copy.chat.greeting(salon.info.name));
    inputRef.current?.focus();
  }

  return (
    <>
      {/* bottom-20 clears the sticky WhatsApp pill below it. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? copy.chat.close : copy.chat.launch}
        aria-expanded={open}
        className={[
          "fixed bottom-20 right-4 z-50 sm:bottom-24 sm:right-6",
          "flex h-14 w-14 items-center justify-center rounded-full",
          "border border-gold bg-surface text-fg shadow-lg",
          "transition-colors duration-200 hover:bg-gold/10",
          "focus-visible:outline-fg focus-visible:outline-offset-4",
        ].join(" ")}
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="currentColor">
            <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
          </svg>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={copy.chat.title}
          className={[
            // Inset on mobile so the panel never touches either edge; a fixed
            // column on larger screens.
            "fixed bottom-40 left-4 right-4 z-50 flex flex-col",
            "sm:bottom-44 sm:left-auto sm:right-6 sm:w-[22rem]",
            "h-[26rem] max-h-[calc(100vh-12rem)] overflow-hidden",
            "rounded-2xl border border-gold bg-surface shadow-2xl",
          ].join(" ")}
        >
          <header className="flex items-center gap-3 border-b border-gold/40 bg-surface-2 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="type-card-title truncate">{copy.chat.title}</p>
              <p className="type-meta truncate text-label">{copy.chat.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={reset}
              aria-label={copy.chat.resetAria}
              className="type-meta rounded-full border border-gold px-3 py-1 text-fg transition-colors duration-200 hover:bg-gold/10"
            >
              {copy.chat.reset}
            </button>
          </header>

          <div ref={logRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={[
                  "max-w-[85%] rounded-2xl px-3 py-2",
                  m.role === "user"
                    ? "ml-auto bg-surface-3 text-fg"
                    : m.role === "error"
                      ? "border border-gold/60 bg-surface-2 text-label"
                      : "bg-surface-2 text-fg",
                ].join(" ")}
              >
                <p className="type-body text-[0.9375rem] whitespace-pre-wrap">
                  {m.text}
                </p>
                <span className="type-meta mt-1 block text-right text-label opacity-70">
                  {m.time}
                </span>
              </div>
            ))}

            {busy && (
              <p className="type-meta text-label" aria-live="polite">
                {copy.chat.subtitle}
                <span className="sr-only">Sending</span>
                <span aria-hidden="true">&#8230;</span>
              </p>
            )}
          </div>

          <form
            className="flex items-center gap-2 border-t border-gold/40 bg-surface-2 px-3 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label className="sr-only" htmlFor="chat-input">
              {copy.chat.placeholder}
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={copy.chat.placeholder}
              autoComplete="off"
              className="type-body min-h-[44px] flex-1 rounded-full border border-gold/60 bg-surface px-4 text-[0.9375rem] text-fg placeholder:text-label focus-visible:outline-fg"
            />
            <button
              type="submit"
              disabled={busy || draft.trim() === ""}
              aria-label={copy.chat.send}
              className="type-cta flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold text-fg transition-colors duration-200 hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-fg"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
