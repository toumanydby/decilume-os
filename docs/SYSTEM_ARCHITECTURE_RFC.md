# System Architecture RFC: Decilume OS (MVP)

**Document Status:** APPROVED & FINALIZED  
**Author:** Senior System Architect  
**Project Name:** **Decilume OS** (*Deci* [Decision] + *Lume* [Lumen / Light / Illuminate])  
**Target Environment:** WSL2 Ubuntu 24.04 (`/home/sogekihei/projects/decilume-os`)  
**Execution Phase:** Scaffolding & Milestone 1 Execution  

---

## 1. System Overview & Core Philosophy

**Decilume OS** is a high-performance personal command center engineered to eliminate cognitive friction:
1. **Digest Engine:** Automated article ingestion via URL or raw text $\rightarrow$ high-density executive briefings via Google Gemini 2.0 Flash streaming.
2. **Decision Lab:** Quantitative multi-criteria decision analysis $\rightarrow$ real-time vector scoring and interactive radar visualization.

![Architecture Diagram](mermaid-diagram.svg)
---

## 2. Finalized Architectural Stack

| Layer | Decision | Architectural Details & Rationale |
| :--- | :--- | :--- |
| **Project & Branding** | **Decilume OS** | *Deci* (Decision) + *Lume* (Illuminate). Evocative, professional, and unique. |
| **Dev Environment** | **WSL2 (Ubuntu 24.04)** | Working directory: `/home/sogekihei/projects/decilume-os`. Verified native Bun 1.3.13, Node v22.19, Docker 29.9. |
| **Package Engine** | **Bun (v1.3+)** | Sub-3s package installations, native TypeScript execution, microsecond cold-starts. |
| **Container & Runtime** | **Docker & Docker Compose** | Multi-stage Dockerfile (`oven/bun:alpine`), `docker-compose.yml` with host volume mounts for hot reloading. |
| **Frontend Framework** | **Next.js 15 (App Router)** | TypeScript 5 (Strict), React Server & Client Components, Server-Sent Events (SSE) streaming. |
| **Styling & Theming** | **Tailwind CSS + next-themes** | Dark Mode by default, interactive Dark/Light/System toggle, Linear/Vercel slate-zinc aesthetic. |
| **Data Visualization** | **Recharts** | Declarative SVG Radar and Bar charts for multi-criteria trade-offs. |
| **Ingestion Pipeline** | **Server-side URL Scraper** | Server route (`/api/scrape`) with custom user-agent, HTML boilerplate stripping, and Cheerio DOM extraction. Graceful fallback to raw text paste. |
| **AI Model & Provider** | **Google Gemini 2.0 Flash** | Sub-350ms Time-to-First-Token (TTFT), 150-200 tokens/sec throughput, generous context window. |
| **Persistence Layer** | **Local-First (Zustand)** | Zero-database setup, zero latency, schema versioning, full JSON backup/restore. |
| **Deployment Strategy** | **Dual Deployment** | 1. **Vercel** (Zero-maintenance cloud hosting via Git push).<br>2. **Docker Container** (Self-hostable anywhere via `docker compose up`). |

---

## 3. Directory Structure Blueprint

```text
decilume-os/
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── README.md
├── package.json
├── bun.lock
├── tsconfig.json
├── tailwind.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # ThemeProvider (next-themes) + Fonts
│   │   ├── page.tsx                    # Main Dashboard Shell (Tabs: Digest / Decision)
│   │   ├── api/
│   │   │   ├── scrape/route.ts         # URL article extraction endpoint
│   │   │   └── summarize/route.ts      # Gemini streaming summarizer endpoint
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── digest/
│   │   │   ├── UrlInputBar.tsx
│   │   │   ├── DigestCard.tsx
│   │   │   └── DigestHistory.tsx
│   │   ├── decision/
│   │   │   ├── CriteriaEditor.tsx
│   │   │   ├── OptionScoreSlider.tsx
│   │   │   ├── DecisionRadarChart.tsx
│   │   │   └── WinnerBanner.tsx
│   │   └── ui/                         # Buttons, inputs, modals, cards
│   ├── lib/
│   │   ├── scraper.ts                  # Readability & HTML extraction logic
│   │   ├── gemini.ts                   # Google Generative AI client setup
│   │   └── store.ts                    # Zustand local-first storage
│   └── types/
│       ├── digest.ts
│       └── decision.ts
```

---

## 4. Execution Roadmap

- [x] **Milestone 1:** Project Scaffolding & Container Setup in WSL2 (`decilume-os`, Bun 1.3, Next.js 15, Tailwind, `next-themes`, Dockerfile, docker-compose).
- [ ] **Milestone 2:** Decision Lab Core (Zustand state store, criteria slider matrix, Recharts radar integration).
- [ ] **Milestone 3:** Scraper & Gemini Engine (Scraping route with Cheerio, Gemini streaming summary route, digest UI).
- [ ] **Milestone 4:** Dashboard Shell & Local Persistence (Tabs integration, theme switcher, JSON export/import).
- [ ] **Milestone 5:** Deployment Verification (Docker container build test + Vercel deployment readiness).
