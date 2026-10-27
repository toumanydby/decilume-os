# Decilume OS

> **High-Performance Executive Command Center**  
> *Deci* (Decision) + *Lume* (Illuminate / Light)

Decilume OS eliminates cognitive friction through two high-throughput subsystems:
1. **Digest Engine:** Automated article ingestion via URL or raw text $\rightarrow$ high-density executive briefings via Google Gemini 2.0 Flash streaming.
2. **Decision Lab:** Quantitative multi-criteria decision analysis $\rightarrow$ real-time vector scoring and interactive radar visualization.

---

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router, Server-Sent Events)
- **Runtime & Package Manager:** [Bun](https://bun.sh/) 1.3+
- **Styling:** Tailwind CSS + `next-themes` (Dark Mode by default, slate/zinc aesthetic)
- **Data Visualization:** Recharts (Radar & Bar charts)
- **AI Engine:** Google Gemini 2.0 Flash (`@google/genai`)
- **Web Ingestion:** Cheerio server-side scraping pipeline
- **State Management:** Zustand (Local-first persistence)
- **Deployment:** Docker & Docker Compose (`oven/bun:alpine`), Vercel-ready

---

## 🚀 Quick Start

### 1. Prerequisites
- WSL2 Ubuntu 24.04 or Linux / macOS
- [Bun](https://bun.sh/) v1.3+ installed
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### 2. Installation & Setup
```bash
# Clone and enter directory
cd /home/sogekihei/projects/decilume-os

# Copy environment variables
cp .env.example .env.local

# Add your Gemini API Key in .env.local:
# GEMINI_API_KEY=your_key_here

# Install dependencies with Bun
bun install
```

### 3. Running in Development
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

### Run Production Container
```bash
docker compose up --build -d
```

### Run Hot-Reloading Dev Container
```bash
docker compose --profile dev up
```

---

## 📂 Project Architecture

```text
decilume-os/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scrape/route.ts      # Cheerio article scraper
│   │   │   ├── summarize/route.ts   # Gemini 2.0 Flash SSE streaming
│   │   │   └── health/route.ts      # Container healthcheck
│   │   ├── globals.css              # Dark/light theme design tokens
│   │   ├── layout.tsx               # ThemeProvider & shell
│   │   └── page.tsx                 # Command center tab views
│   ├── components/
│   │   ├── layout/                  # Header, Sidebar, ThemeToggle
│   │   ├── digest/                  # UrlInputBar, DigestCard, DigestHistory
│   │   ├── decision/                # CriteriaEditor, OptionScoreSlider, DecisionRadarChart
│   │   └── ui/                      # Atoms (Buttons, Cards, Inputs, Modals)
│   ├── lib/
│   │   ├── gemini.ts                # Google GenAI client
│   │   ├── scraper.ts               # Clean HTML parser
│   │   └── store.ts                 # Zustand local-first store
│   └── types/
│       ├── digest.ts                # Digest data models
│       └── decision.ts              # MCDA criteria & option models
├── Dockerfile                       # Multi-stage Bun Alpine build
└── docker-compose.yml               # Container deployment spec
```

---

## 📄 License
MIT
