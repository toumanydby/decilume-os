# AGENTS.md — Decilume OS Operating Directives

> **Ground truth & operational guidelines for AI agents working in this repository.**

---

## 1. System Identity & Stack
- **Project:** Decilume OS — Personal Executive Command Center (Digest Engine + Decision Lab).
- **Runtime & Package Manager:** **Bun 1.3+** only. Never run `npm` or `yarn` (preserve `bun.lock`).
- **Framework:** Next.js 15.1 App Router + React 19 + TypeScript strict mode.
- **Styling & UI:** Tailwind CSS 3.4 + `next-themes` (dark mode default) + `lucide-react` icons.
- **Storage:** Local-first on Zustand + `localStorage`. Zero server database required.

---

## 2. Non-Negotiable Guardrails
1. **Secrets Security:** `GEMINI_API_KEY` is server-only. Never expose via `NEXT_PUBLIC_` or commit to git.
2. **Deterministic Verification:** Before concluding any turn or submitting changes, you must run and pass:
   ```bash
   bunx tsc --noEmit && bun run build
   ```
3. **No Unrequested Dependencies:** Do not install heavy component libraries or alternate UI suites.
4. **Git Operations:** Never execute `git push` unless explicitly instructed by the user.

---

## 3. Architecture Overview

```text
src/
├── app/
│   ├── api/scrape/route.ts      # Cheerio HTML parser with SSRF DNS validation
│   ├── api/summarize/route.ts   # Gemini streaming SSE with resilient cascade
│   └── page.tsx                 # Command center shell (Digest / Decision / History tabs)
├── components/
│   ├── decision/                # MCDA sliders, Recharts radar polygon, winner banner
│   ├── digest/                  # URL/Text intake, modern executive markdown viewer
│   └── layout/                  # Header (JSON Import/Export), Sidebar, ThemeToggle
├── lib/
│   ├── decision-analysis.ts     # Pure math: weights, max/min, gating, sensitivity
│   ├── gemini.ts                # Gemini client & verified active model cascade
│   ├── scraper.ts               # Clean HTML parser + anti-bot WAF detection
│   └── store.ts                 # Zustand store (persisted in localStorage)
└── types/                       # Decision & Digest TypeScript models
```

---

## 4. Hard-Won Production "Gotchas" (Do Not Re-Break)

1. **Docker Compose Env Variable Shadowing:**
   - `${GEMINI_API_KEY}` in `docker-compose.yml` `environment:` block overrides `.env.local` with an empty string if undefined in `.env`.
   - Always load env files via `env_file:` directly (`.env` and `.env.local`).
2. **Gemini Upstream Model Cascade:**
   - Google frequently deprecates models (`gemini-2.0-flash` is 404) or throws regional `503` spikes.
   - Always route requests through the verified cascade in `src/lib/gemini.ts`:
     `gemini-3.6-flash` (primary) $\rightarrow$ `gemini-3.1-flash-lite` (fallback) $\rightarrow$ `gemini-3.5-flash`.
   - Fatal errors (`401`/`403`) must fail immediately; only transient errors (`429`/`503`) trigger backoff.
3. **Anti-Bot WAF Interception (AWS WAF / Cloudflare):**
   - Sites like IEEE Xplore return HTTP `202 Accepted` with an anti-bot challenge and 0 bytes of HTML.
   - `scraper.ts` must detect WAF headers (`x-amzn-waf-action`, `cf-mitigated`) and route users to **Raw Text** mode instead of sending empty text to Gemini.
4. **SSRF Defense in `/api/scrape`:**
   - Pre-resolve DNS via `node:dns/promises`. Reject private, loopback, link-local, and cloud metadata (`169.254.169.254`) ranges. Follow maximum 3 redirect hops manually.

---

## 5. Verified Command Runbook

```bash
# Install dependencies
bun install

# Local development server
bun run dev

# Full production build check
bun run build

# TypeScript strict typecheck
bunx tsc --noEmit

# Production Docker run
docker compose up --build -d

# Check health endpoint
curl http://127.0.0.1:3000/api/health
```

---

## 6. Current Roadmap Priorities
- [ ] Connect Digest Engine directly to Decision Lab (auto-extract MCDA criteria from text).
- [ ] Multi-source comparative synthesis (3+ articles simultaneously).
- [ ] Client-side Wasm vector embeddings for offline semantic search.
