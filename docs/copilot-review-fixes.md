# Security & correctness fixes (for Copilot)

This file lists the code-review findings to fix on this branch. Work through them in
order (highest severity first). Each item says what's wrong, where it is, and what
counts as "done". Delete this file in the final commit once every item is resolved.

## Ground rules

- Stack: Next.js 15 App Router, React 19, TypeScript, Tailwind, `lucide-react` icons,
  `@google/generative-ai`, Bun (`bun.lock`). Keep these. Don't add a new UI library.
- Don't commit secrets. `GEMINI_API_KEY` is read only on the server via `process.env`.
  Never prefix it with `NEXT_PUBLIC_`.
- Keep the existing user-facing behavior (paste URL or text, get a streamed briefing)
  unless an item explicitly changes it.
- Run `bun run build` and `bunx tsc --noEmit` before finishing; both must pass.

---

## Critical

### 1. Server-side request forgery (SSRF) in the scraper

**Where:** `src/app/api/scrape/route.ts`, `src/lib/scraper.ts` (`scrapeUrl`).

**Problem:** Any URL that parses with `new URL()` is fetched, including `localhost`,
private network IPs (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local
`169.254.0.0/16` (cloud metadata endpoint `169.254.169.254`), IPv6 loopback/ULA, and
non-HTTP schemes. Redirects are followed automatically, so a public URL can redirect
into an internal address. The extracted text is returned to the caller, so this lets
anyone read internal resources through the server.

**Fix:**
- Allow only `http:` and `https:`. Allow only ports 80/443 (or omitted port).
- Reject hostnames `localhost`, `*.localhost`, `*.internal`, `*.local`, and raw IPs in
  private/reserved ranges.
- Resolve the hostname with `node:dns/promises` (`lookup(host, { all: true })`) and
  reject if **any** resolved address is loopback, private, link-local, CGNAT
  (`100.64.0.0/10`), unspecified (`0.0.0.0`, `::`), multicast, IPv6 ULA (`fc00::/7`),
  IPv6 link-local (`fe80::/10`), or IPv4-mapped IPv6 of any of those.
- Use `redirect: "manual"` and follow at most 3 redirects yourself, re-running the full
  validation on every `Location` hop.
- Enforce a fetch timeout (e.g. `AbortSignal.timeout(10_000)`) and a max response size
  (e.g. 2 MB, by reading the body stream and aborting past the limit). Only accept
  `text/html` / `application/xhtml+xml` / `text/plain` content types.
- Make sure the route uses the Node.js runtime (`export const runtime = "nodejs"`) so
  `node:dns` is available.

**Done when:** `http://localhost:3000`, `http://127.0.0.1`, `http://169.254.169.254/`,
`http://[::1]/`, `file:///etc/passwd`, and a public URL that 302-redirects to
`http://127.0.0.1` are all rejected with a 400 and a generic message, while normal
public article URLs still work.

---

## High

### 2. Public API routes with no auth or rate limit

**Where:** `src/app/api/summarize/route.ts`, `src/app/api/scrape/route.ts`.

**Problem:** Anyone on the internet can call both routes. `/api/summarize` spends the
project's Gemini quota, and the retry cascade means one request can make up to 10
Gemini calls (5 models x 2 attempts).

**Fix:**
- Add per-IP rate limiting to both routes (e.g. 10 requests/min for summarize, 20/min
  for scrape). Upstash Redis + `@upstash/ratelimit` is the preferred approach on
  Vercel. If no Redis is available, implement a small in-memory limiter and leave a
  clear `TODO` noting it is per-instance only. Return `429` with a `Retry-After` header.
- Validate request bodies with explicit limits: `text` must be a string, max ~100k
  characters; `title` and `url` optional strings with sane max lengths. Return `400` on
  invalid input. Wrap `req.json()` in try/catch so malformed JSON returns `400`, not `500`.
- Cap the total number of Gemini attempts per request (e.g. 4) regardless of how many
  models are configured.

**Done when:** a burst of requests from one IP gets `429`s, oversized/malformed bodies
get `400`s, and normal single use is unaffected.

### 3. Auth/config errors trigger the full model fallback cascade

**Where:** `src/lib/gemini.ts` (`isTransientGeminiError`, `getErrorStatus`),
retry loop in `src/app/api/summarize/route.ts`.

**Problem:** A `401`/`403` (invalid or restricted API key; the current key in the
project environment returns `403 PERMISSION_DENIED`) or a `400` is treated as "try the
next model". The request walks every model, then surfaces Google's raw error text.

**Fix:**
- Classify errors into three groups: `transient` (429, 500, 502, 503, 504) -> retry /
  fall back; `model-unavailable` (404) -> skip to next model without retry;
  `fatal` (400, 401, 403, anything else) -> stop immediately.
- On `401`/`403`, return a `502` with a stable message such as
  `"The Gemini API key was rejected. Check GEMINI_API_KEY in the project environment variables."`
  and log the real error server-side only.
- Prefer reading `status` from the SDK error object (`GoogleGenerativeAIFetchError`
  exposes `.status`) before falling back to regex-parsing `err.message`.

**Done when:** an invalid key fails after exactly one Gemini call with the friendly
message above.

### 4. Misleading "high demand" message and unverified default model IDs

**Where:** `src/lib/gemini.ts` (`FALLBACK_GEMINI_MODELS`, `GEMINI_MODEL`),
`src/app/api/summarize/route.ts` (`sawOnlyTransientErrors`).

**Problem:** A `404` (model doesn't exist) is counted as transient, so if every model
404s the user is told Gemini is busy. The defaults include `gemini-3.5-flash` and
`gemini-3.8-flash`, which have not been verified to exist. `GEMINI_MODEL` is exported
but unused, and its default differs from the fallback list.

**Fix:**
- Only show the "high demand" 503 when at least one attempt failed with a real
  transient status. If every model 404s, return a `500` with
  `"No configured Gemini model is available. Check GEMINI_MODEL."`.
- Replace the default model list with model IDs confirmed in Google's current Gemini
  API docs (https://ai.google.dev/gemini-api/docs/models). Keep the
  `process.env.GEMINI_MODEL` override as the first entry.
- Remove the unused `GEMINI_MODEL` export (or actually use it as the single source of
  the primary model).

---

## Medium

### 5. Mid-stream failures and empty responses

**Where:** streaming section of `src/app/api/summarize/route.ts`; consumer in
`src/components/digest/UrlInputBar.tsx`.

**Problem:** If Gemini errors after streaming starts, the client gets an opaque failure
and the partial briefing is discarded. If Gemini returns no text (e.g. safety block),
an empty briefing is saved to the store.

**Fix:**
- In the `ReadableStream`, catch errors and close the stream with a recognizable
  trailing marker (or use `controller.error` and handle it on the client) so the UI can
  show "The briefing was interrupted" and keep the partial text.
- On the client, if the final text is empty or whitespace, don't save a session; show
  "Gemini returned an empty response. Try again or shorten the source."

### 6. Client assumes every error response is JSON

**Where:** `src/components/digest/UrlInputBar.tsx` (lines ~74 and ~103, `await res.json()`
on non-OK responses).

**Fix:** Add a small helper that reads `res.text()`, tries `JSON.parse`, and falls back
to a status-based message (e.g. `"Request failed (504)."`). Use it for both the scrape
and summarize calls.

### 7. Raw server error messages leak to the browser

**Where:** `src/app/api/scrape/route.ts` (~line 26), `src/app/api/summarize/route.ts`
(~line 134), both return `error.message`.

**Fix:** Return fixed, user-safe messages from route handlers. Log the full error with
`console.error` server-side.

### 8. Imported workspace JSON isn't validated

**Where:** `importStateJson` in `src/lib/store.ts` (~line 281).

**Problem:** Any object with a `sessions` array is accepted, so a malformed or crafted
file can crash rendering or inject unexpected fields.

**Fix:** Validate with `zod` (add it if missing): each session's fields must have the
expected types, string lengths are capped, and any `url` field must use `http:`/`https:`.
Reject the whole import with a clear error if validation fails. Cap file size (e.g. 5 MB).

---

## Low / UX

- **Inaccurate privacy copy:** `src/components/digest/UrlInputBar.tsx` (~line 233) says
  "Your sources stay in this local workspace." Content is sent to the server and to
  Google Gemini. Replace with accurate copy, e.g. "Sources are processed by Google Gemini
  to create your briefing."
- **Wrong setup hint:** the missing-key message in `src/app/api/summarize/route.ts`
  (~line 29) mentions `.env.local`. Change it to point to the project's environment
  variables (Vercel project settings / v0 Vars panel).
- **No retry affordance:** after a 503, show a "Try again" button that resubmits the
  same input, and respect the `Retry-After` header (disable the button with a short
  countdown).
- **No security headers:** add an `async headers()` block to `next.config.ts` with
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Strict-Transport-Security: max-age=63072000`, `X-Frame-Options: SAMEORIGIN`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and a
  `Content-Security-Policy-Report-Only` starter policy
  (`default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; connect-src 'self'`).
- **Over-broad image allowlist:** `next.config.ts` `images.remotePatterns` allows
  `hostname: "**"`. Restrict to the hosts actually used, or remove it if `next/image`
  isn't used with remote sources.
- **IME Enter handling:** in the URL/text input's Enter-to-submit handler, return early
  when `e.nativeEvent.isComposing || e.keyCode === 229` so CJK users don't submit while
  composing.

---

## Out of scope for this PR

- Replacing the Gemini API key. The project owner will rotate `GEMINI_API_KEY`
  separately; item 3 only makes the failure clear.
- Adding user accounts. Rate limiting (item 2) is the required protection for now.
