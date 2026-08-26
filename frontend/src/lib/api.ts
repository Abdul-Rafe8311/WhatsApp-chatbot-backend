/**
 * Where the booking agent's API lives.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_API_URL, inlined at build time by Next. This is a static
 *      export, so there is no server to read env at runtime — the value is
 *      baked into the bundle and changing it needs a rebuild, not a restart.
 *   2. The local backend, when the page itself is served from localhost, so
 *      `npm run dev` talks to `uvicorn` on :8000 with nothing configured.
 *   3. The deployed backend.
 *
 * Mirrors the precedence in widget/glowdesk-widget.html in the agent repo, so
 * the standalone widget and this component cannot drift to different hosts.
 */
const LOCAL_API = "http://127.0.0.1:8000";
const DEPLOYED_API = "https://whats-app-chatbot-backend.vercel.app";

export function apiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (
    typeof window !== "undefined" &&
    /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
  ) {
    return LOCAL_API;
  }

  return DEPLOYED_API;
}
