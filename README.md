<div align="center">

# ⚡ Decilume OS
### The High-Performance Personal Executive Command Center

*Deci* (Decision) + *Lume* (Illuminate / Light) — Shedding light on complex decisions and dense technical knowledge.

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3+-fbf0df?style=flat-square&logo=bun)](https://bun.sh/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-4285f4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-Multi--Stage-2496ed?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

</div>

---

## 📌 1. What Is Decilume OS?

**Decilume OS** is an executive command center engineered to eliminate cognitive friction. It pairs automated web article extraction and real-time LLM intelligence streaming with quantitative, multi-criteria mathematical decision modeling and interactive trade-off visualizations.

It runs **local-first** on Zustand + `localStorage` — delivering instant 0ms state updates, zero cloud database costs, and complete privacy.

---

## 🎯 2. Who It's For

- **Software Architects & Tech Leads:** Evaluate competing architectural strategies (e.g., In-House vs. SaaS vs. Open Source) using weighted mathematical matrices rather than subjective debates.
- **Engineering Managers & Directors:** Digest dense whitepapers, RFCs, and vendor proposals into structured executive briefings in seconds.
- **Product Leaders & Founders:** Prioritize features and initiatives against weighted constraints (velocity, capital cost, risk) with visual sensitivity analysis.
- **Knowledge Workers & Researchers:** Keep a locally persisted, searchable vault of technical digests with one-click export to Obsidian or Notion.

---

## 🚀 3. What It Does (Core Capabilities)

```
   ┌────────────────────────────────────────────────────────┐
   │                      DECILUME OS                       │
   ├──────────────────────────┬─────────────────────────────┤
   │      DIGEST ENGINE       │        DECISION LAB         │
   │  • URL & Raw Text Intake │  • Multi-Criteria Matrix    │
   │  • Cheerio HTML Scraper  │  • Weighted Vector Scoring  │
   │  • WAF Challenge Guard   │  • Gating Disqualifications │
   │  • Gemini Stream (SSE)   │  • Recharts Radar Polygons  │
   │  • Executive MD + KaTeX  │  • Sensitivity Analysis     │
   └──────────────────────────┴─────────────────────────────┘
                              │
                  LOCAL-FIRST PERSISTENCE
           (Zustand + LocalStorage + JSON Backup)
```

### 📰 Subsystem A: The Digest Engine
- **Multimodal Ingestion:** Ingest public articles via URL (with boilerplate stripping and word/time estimation) or paste raw text, meeting transcripts, and abstracts.
- **Anti-Bot / WAF Awareness:** Detects Cloudflare and AWS WAF challenges (e.g., HTTP 202) and offers a 1-click fallback to Raw Text mode instead of throwing opaque errors.
- **Live Streaming Synthesis:** Streams structured summaries via Google Gemini models over Server-Sent Events (SSE).
- **Executive Markdown Renderer:**
  - Converts section headers into glowing executive badges (*Executive Briefing*, *Strategic Takeaways*, *Tags*).
  - Transforms bullet points into interactive chevron callout cards.
  - Native LaTeX mathematical typesetting via KaTeX ($E = mc^2$).
  - Dual view toggle (Executive View ↔ Raw Markdown) + one-click `.md` export with YAML frontmatter.
- **Local History Archive:** Locally persisted archive with reading times, domain tags, search, and bulk deletion.

### 🧭 Subsystem B: The Decision Lab
- **Weighted Multi-Criteria Analysis (MCDA):** Assign weights ($1\times - 10\times$) and directional goals (*Maximize* vs. *Minimize* for cost/risk).
- **Hard Gating Constraints:** Set mandatory score minimums; failing options are automatically disqualified with an audit trail.
- **Real-Time Vector Scoring:** Calculates normalized scores ($0.0\% - 100.0\%$) and rank orders competing options.
- **Close-Call Warnings & Decisive Dimensions:** Flags close margins ($\le 2\%$) and highlights which criteria determined the winning option.
- **Mathematical Sensitivity Analysis:** Calculates the exact weight change required on any dimension to flip the outcome.
- **Interactive SVG Radar:** Multi-dimensional polygon trade-off chart rendered with Recharts.
- **Session Management:** Create, rename, switch, and safely delete multiple decision matrices with confirmation guards.

---

## 🛠 4. Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15.1 (App Router)** | React 19, Server Components, standalone container output |
| **Runtime & Bundler** | **Bun 1.3+** | Sub-second package resolution (464ms) & native TypeScript execution |
| **Styling & Theme** | **Tailwind CSS + `next-themes`** | Linear/Vercel slate-zinc dark aesthetic with live theme toggle |
| **Visualization** | **Recharts 2.15** | Declarative SVG Radar & bar charts |
| **AI Intelligence** | **Google Gemini API** | Multi-model fallback cascade (`gemini-3.6-flash`, `gemini-3.1-flash-lite`) |
| **Web Ingestion** | **Cheerio 1.0** | Server-side DOM extraction without headless browser overhead |
| **State & Storage** | **Zustand 5.0** | Local-first browser storage (`localStorage`) + JSON export/import |
| **Container** | **Docker (Multi-Stage Alpine)** | Minimal standalone image run as non-root user (`nextjs:nodejs`) |

---

## 💻 5. How to Run

### Prerequisites
- Node.js 20+ or [Bun 1.3+](https://bun.sh/)
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))
- Docker (optional)

### Quick Start (Local Development)
```bash
# 1. Clone repository
git clone https://github.com/toumanydby/decilume-os.git && cd decilume-os

# 2. Configure environment
cp .env.example .env.local
# Add your GEMINI_API_KEY inside .env.local

# 3. Install dependencies & run
bun install
bun run dev
```
Open **[http://localhost:3000](http://localhost:3000)**.

### Production Docker
```bash
# Build and run the optimized Alpine container
docker compose up --build -d

# Verify container health
curl http://127.0.0.1:3000/api/health
```

### Cloud Deployment (Vercel)
Push to GitHub and import into Vercel. Add `GEMINI_API_KEY` (and optionally `GEMINI_MODEL=gemini-3.6-flash`) in **Project Settings $\rightarrow$ Environment Variables**. Merges to `main` deploy automatically via GitHub Actions CI.

---

## 🧠 6. How I Built Decilume OS With AI (The Co-Engineering Report)

> *Because there is no separate report, this section documents the engineering journey, architectural decisions, and production debugging conducted in collaboration with AI.*

### A. Spec-Driven Architecture (RFC First)
Before writing application code, we authored a formal **System Architecture RFC** (`SYSTEM_ARCHITECTURE_RFC.md`) defining data models (`DigestItem`, `DecisionSession`, `Criterion`), state transitions, and milestone checklists. This eliminated architectural drift and allowed the AI to act as an aligned systems architect.

### B. Bun Sub-Second Assembly
Using native Bun 1.3 in WSL2, project dependencies (Next.js 15, React 19, Recharts, Zustand, Tailwind) installed in **464ms**. The multi-stage Docker build was optimized with `.dockerignore` and standalone output, shrinking build contexts from 750MB to 154kB.

### C. Real-World Production Debugging Stories

1. **Docker Compose Environment Shadowing:**  
   *Symptom:* `WARN: GEMINI_API_KEY is not set`, wiping the key inside the container despite `.env.local` existing.  
   *Root Cause:* Docker Compose YAML interpolation defaulted undefined `${GEMINI_API_KEY}` to empty string, overriding container `env_file:`.  
   *Resolution:* Removed redundant YAML interpolation lines, synchronized `.env`, and loaded environment files directly via `env_file:`.

2. **Upstream Gemini Deprecation & 503 Traffic Spikes:**  
   *Symptom:* Upstream deprecation of `gemini-2.0-flash` (404) followed by regional 503 capacity spikes across `gemini-3.5-flash` and `gemini-3.8-flash`.  
   *Autonomous AI Probing:* Instead of guessing, we used a Bun script to test every active Gemini model directly against Google's API, discovering that `gemini-3.6-flash` and `gemini-3.1-flash-lite` were available and responsive (`200 OK`).  
   *Architecture Fix:* Built an **Intelligent Multi-Model Fallback Cascade** (`gemini-3.6-flash` $\rightarrow$ `gemini-3.1-flash-lite` $\rightarrow$ `gemini-3.5-flash`) with jittered exponential backoff for transient errors and immediate fail-fast for authentication errors (401/403).

3. **Anti-Bot WAF Interception (IEEE Paper Ingestion):**  
   *Symptom:* Ingesting IEEE papers returned `"Text content is required for summarization"`.  
   *Root Cause:* IEEE's AWS WAF returned HTTP `202 Accepted` with an anti-bot challenge and 0 bytes of HTML. The scraper passed the 2xx check but returned empty text.  
   *Resolution:* Added WAF header detection (`x-amzn-waf-action`, `cf-mitigated`) and automatic UI routing with a prominent **[Switch to Raw Text]** action.

4. **Security Hardening (SSRF Defense):**  
   *Resolution:* Protected `/api/scrape` with pre-flight DNS hostname resolution, rejecting private network ranges (`10.0.0.0/8`, `192.168.0.0/16`), loopback, and cloud metadata endpoints (`169.254.169.254`), with strict redirect limits and security headers.

5. **Executive Markdown Experience:**  
   *Resolution:* Transformed plain markdown summaries into executive dossiers using AST component rewriting in `react-markdown` — auto-generating glowing badges, chevron callout rows, KaTeX math rendering, and `.md` file downloads with YAML frontmatter.

---

## 🔮 7. The Future of Decilume OS (Roadmap)

Where Decilume OS is heading next:

- **🤖 Automated MCDA Matrix Extraction:** Connect the two engines directly — allow the Digest Engine to extract candidate architectural options, trade-offs, and proposed criteria from whitepapers and populate a Decision Lab matrix in one click.
- **📑 Multi-Document Comparative Synthesis:** Ingest 3+ articles or RFCs simultaneously to generate a synthesized comparative briefing highlighting contradictions, consensus, and trade-offs.
- **🧠 Zero-Cloud Semantic Search (Wasm Vector DB):** Run local embeddings in-browser (via Transformers.js + DuckDB Wasm) to search historical briefings offline with 100% data sovereignty.
- **📄 Native PDF & arXiv Ingestion:** Direct parsing of academic whitepapers and technical PDFs with automatic math and diagram recognition.
- **🔗 Stateless Team Sharing:** Share decision matrices via URL fragment compression (`#matrix=...`), allowing colleagues to inspect, duplicate, and adjust sliders without needing accounts or a central database.

---

## 📄 8. License

Open-source software licensed under the **[MIT License](LICENSE)**.

<div align="center">
<b>Decilume OS</b> — <i>Illuminating choices, eliminating friction.</i>
</div>
