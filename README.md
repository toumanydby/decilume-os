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

> **Decilume OS is a personal executive command center that turns dense web articles into sharp executive briefings and calculates quantitative, weighted decision matrices to help leaders and students make confident choices in minutes.**

---

## 1. What It Is

### The Problem
Technical professionals, students, and engineering leaders are bombarded with dense documentation, research whitepapers, and opinion pieces. Skimming leads to missed structural details, while reading everything causes cognitive burnout. Worse, when it is time to make a decision (e.g., choosing an architecture, prioritizing features, or picking a career path), teams default to protracted Slack debates or subjective "gut feelings" because they lack an objective, mathematical trade-off model.

### Who It's For
- **Software Architects & Tech Leads:** Evaluating competing tech stacks (e.g., In-House vs. SaaS vs. Open Source) with weighted criteria and radar visualizations.
- **Engineering Managers & Directors:** Digesting technical RFCs, vendor proposals, and industry news into structured executive dossiers.
- **Students & Graduates:** Navigating high-stakes crossroads (e.g., Big Tech vs. Early-Stage Startup vs. Master's/PhD) with objective trade-off analysis.
- **Product Leaders & Founders:** Weighing initiatives against capital cost, velocity, and downside risk with sensitivity checks.

### The Minimum Moment of Value
Paste a technical URL or raw notes into the **Digest Engine**, watch a high-density executive briefing stream in under 5 seconds with strategic takeaways and tags, then hop into the **Decision Lab** to watch an interactive SVG radar chart immediately rank competing choices with clear mathematical justification.

---

## 2. Features

### User Stories
1. **As a researcher or student**, I want to paste an article URL or raw text so that I get a live-streamed, structured executive summary with key takeaways and tags without reading through fluff.
2. **As an architect**, I want to define weighted criteria ($1\times - 10\times$), directional goals (*Maximize* vs. *Minimize*), and hard gating constraints so that I can objectively score competing options.
3. **As a decision-maker**, I want to see an interactive multi-dimensional radar chart, winner spread, and sensitivity analysis so that I know exactly which criteria would flip the winning choice.
4. **As a privacy-conscious user**, I want all my data persisted locally in my browser with one-click JSON export/import and `.md` file download so that my decisions never depend on a cloud database.

### What's in the MVP
- **Digest Engine:**
  - Server-side scraping (Cheerio) with SSRF defenses and AWS WAF/Cloudflare challenge detection.
  - Streaming LLM summaries over Server-Sent Events (SSE) via Google Gemini.
  - Executive Markdown Viewer: GFM tables, KaTeX math formulas ($E = mc^2$), glow section badges, interactive chevron callout cards, and YAML-frontmattered `.md` file export.
  - Local history vault storing previous briefings with reading times and domain badges.
- **Decision Lab:**
  - Multi-Criteria Decision Analysis (MCDA) matrix with custom weights and maximize/minimize directions.
  - Hard gating thresholds that audit and disqualify non-viable options.
  - Real-time vector scoring ($0.0\% - 100.0\%$), close-call detection ($\le 2\%$), and decisive dimension attribution.
  - Mathematical sensitivity analysis (exact weight delta required to flip the outcome).
  - Declarative SVG Radar & bar charts powered by Recharts.
- **Infrastructure & Storage:**
  - Local-first architecture using Zustand + `localStorage`.
  - Multi-stage Docker container (`oven/bun:1-alpine`) with standalone output and healthcheck probe.
  - Pre-configured VS Code `.devcontainer.json`.

### What Stays in the Backlog
- **Automated Matrix Extraction:** One-click button in the Digest Card that prompts Gemini to extract candidate options and criteria directly into the Decision Lab.
- **Multi-Source Comparative Digest:** Ingesting 3+ URLs simultaneously to cross-examine consensus and trade-offs.
- **Client-Side Semantic Search:** In-browser WebAssembly vector database (Transformers.js + DuckDB Wasm) to query archived briefings offline.
- **Stateless URL Sharing:** Compressing decision matrices into URL hash fragments (`#matrix=...`) for zero-login colleague reviews.

---

## 3. How to Run It

### Requirements
- Node.js 20+ or [Bun 1.3+](https://bun.sh/) (recommended)
- Docker & Docker Compose (optional, for containers)
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### Environment Variables (`.env.example`)
Create a `.env.local` or `.env` file at the root:
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Override the primary model (default: gemini-3.6-flash)
GEMINI_MODEL=gemini-3.6-flash

# Server settings
PORT=3000
NODE_ENV=development
```

### Local Development (Native Bun)
```bash
# 1. Clone repository
git clone https://github.com/toumanydby/decilume-os.git && cd decilume-os

# 2. Configure environment
cp .env.example .env.local
# Add your GEMINI_API_KEY in .env.local

# 3. Install dependencies & launch
bun install
bun run dev
```
Open **[http://localhost:3000](http://localhost:3000)**.

### Run with Docker
```bash
# Production container (standalone Alpine build)
docker compose up --build -d

# Verify health
curl http://127.0.0.1:3000/api/health

# Hot-reloading development container
docker compose --profile dev up
```

### Run Tests & Verification Checks
```bash
# TypeScript strict typecheck
bunx tsc --noEmit

# Next.js production build verification
bun run build

# Validate decision analysis math against sample data
bun -e '
import { getDecisionAnalysis } from "./src/lib/decision-analysis.ts";
import sample from "./public/student-postgrad-decision.json";
const res = getDecisionAnalysis(sample.sessions[0]);
console.log("Winner:", res.winner?.option.name, "| Score:", res.winner?.percentageScore + "%");
'
```

### Deployment URL
- **Production URL:** [Decilume-OS](https://decilumeos-dv43xoeve-tdcorp.vercel.app/)
- **Local:** [http://localhost:3000](http://localhost:3000)

---

## 4. How It Was Built with AI

### The Cycle with the Agent
The project followed an **architect-driven, spec-first human-AI cycle**:
1. **RFC & Directives (`AGENTS.md`):** We created `AGENTS.md` to establish non-negotiable operational ground rules (Bun only, server-only keys, strict verification commands, no unrequested dependencies).
2. **Autonomous Probing:** When external APIs failed, the agent wrote diagnostic micro-scripts to inspect raw HTTP headers and probe live endpoints instead of guessing.
3. **Continuous Verification:** Every milestone was validated with `bun run build` and `bunx tsc --noEmit` before moving forward.

### A Real Prompt from Development (Early Architecture & Scaffolding)
> *"Let's initialize our project based on our approved System Architecture RFC:*
> *- Stack: Next.js 15 App Router, React 19, TypeScript strict, Bun 1.3, Tailwind CSS with dark mode default.*
> *- Digest Engine: Server-side URL extraction via Cheerio + streaming executive briefing with Gemini via SSE.*
> *- Decision Lab: Multi-criteria vector scoring with weights (1-10), maximize/minimize directions, gating thresholds, and Recharts SVG radar.*
> *- Persistence & Infra: Local-first Zustand with zero cloud DB latency, plus a multi-stage Alpine Dockerfile and docker-compose with dev hot-reloading.*
> *Scaffold the architecture, setup the types, and verify the production build cleanly."*
> 
> *AI Agent Execution:* The agent translated the RFC into code across a single verified workflow:
> 1. Configured Next.js standalone bundling (`next.config.ts`) and TypeScript strict path aliases (`@/*`).
> 2. Created the multi-stage Alpine `Dockerfile` and `docker-compose.yml` with health check probes.
> 3. Implemented the mathematical MCDA vector engine (`decision-analysis.ts`) and local-first Zustand store (`store.ts`).
> 4. Built the scraping pipeline with Cheerio and streaming Route Handlers (`/api/summarize`, `/api/scrape`).
> 5. Executed `bun install` (181 dependencies in 464ms) and validated the production build with `bun run build`.

### What Went Well
- **Bun + Next.js 15 Velocity:** Dependency installation took **464ms**. Next.js standalone output kept container builds under 200MB.
- **Mathematical Modeling:** Pure functional decision math (`decision-analysis.ts`) worked cleanly on the first pass, handling weighted vector scores, gate exclusions, and sensitivity deltas.
- **Executive UI Polish:** React-Markdown AST rewriting allowed converting raw Markdown headings into styled glow badges and list items into interactive chevron cards.

### What Was Hard
- **Docker Compose YAML Shadowing:** Docker Compose defaulted `${GEMINI_API_KEY}` in the `environment:` section to empty strings because it only read `.env`, wiping out `.env.local`. Fixed by removing interpolation and mounting files directly via `env_file:`.
- **Upstream Gemini Deprecations & 503 Spikes:** Google deprecated `gemini-2.0-flash` (404) and throttled `gemini-3.8-flash` (503). An autonomous script probed active endpoints in real-time, uncovering that `gemini-3.6-flash` and `gemini-3.1-flash-lite` were available. We engineered a multi-model fallback cascade with exponential backoff.
- **Anti-Bot WAF Interception:** Ingesting academic papers from IEEE Xplore returned HTTP `202 Accepted` with 0-byte HTML due to AWS WAF. Fixed by detecting WAF headers (`x-amzn-waf-action`) and providing a 1-click fallback to Raw Text mode.

---

## 5. Status and Next Steps

### How Far We Got
The core MVP is **100% complete, containerized, and deployed**. Both core engines (Digest Engine and Decision Lab) are fully operational and share a local-first Zustand store.

### What Works
- [x] Server-side article extraction with SSRF defenses and anti-bot challenge detection.
- [x] Streaming executive briefings via Google Gemini multi-model fallback cascade.
- [x] Executive Markdown viewer with KaTeX math and frontmattered `.md` file export.
- [x] Multi-criteria decision matrix with weights ($1\times - 10\times$), max/min directions, and gating thresholds.
- [x] Interactive SVG Radar trade-off visualization (Recharts).
- [x] Winner recommendation banner with point spread, close-call warnings, and sensitivity analysis.
- [x] Local-first persistence in `localStorage` + JSON workspace export/import.
- [x] Multi-stage Docker container, `.devcontainer.json`, and `AGENTS.md`.

### What Doesn't (Known Limitations)
- Client-side single-page applications heavily gated behind complex JavaScript hydration cannot be fully scraped via Cheerio (users must copy-paste into **Raw Text** mode).
- The Digest Engine and Decision Lab operate as separate tabs; converting a synthesized briefing into a decision matrix currently requires manual input.

### The Natural Next Step
Build the **Digest $\rightarrow$ Decision Lab Bridge**: add an **"Auto-Generate Decision Matrix"** button to the Digest Card. This will prompt Gemini to parse candidate options and evaluation criteria directly from the synthesized whitepaper and automatically open them in the Decision Lab.

---

## 📄 8. License

Open-source software licensed under the MIT © [toumanydby](https://github.com/toumanydby).

<div align="center">
<b>Decilume OS</b> — <i>Illuminating choices, eliminating friction.</i>
</div>
