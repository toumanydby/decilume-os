"use client";

import { useState } from "react";
import {
  Sparkles,
  Link as LinkIcon,
  FileText,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Circle,
  Globe2,
  ScanSearch,
  WandSparkles,
  Clock3,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { DigestItem } from "@/types/digest";
import { MarkdownViewer } from "./MarkdownViewer";

export function UrlInputBar() {
  const [mode, setMode] = useState<"url" | "text">("url");
  const [inputVal, setInputVal] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamOutput, setStreamOutput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "extracting" | "analyzing" | "briefing">("idle");

  const { addDigest, digests } = useAppStore();

  const sourcePreview = (() => {
    if (mode !== "url" || !inputVal.trim()) return null;
    try {
      const url = new URL(inputVal.trim());
      return { host: url.hostname.replace(/^www\./, ""), valid: true };
    } catch {
      return { host: "Enter a complete URL", valid: false };
    }
  })();

  const recentSources = Array.from(
    new Map(
      digests
        .filter((digest) => digest.sourceUrl)
        .map((digest) => [digest.sourceUrl as string, { url: digest.sourceUrl as string, title: digest.title }])
    ).values()
  ).slice(0, 3);

  const handleProcess = async () => {
    if (!inputVal.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setStreamOutput("");
    setStage(mode === "url" ? "extracting" : "analyzing");

    try {
      let title = manualTitle.trim() || "Untitled Document";
      let content = inputVal;
      let sourceUrl: string | undefined = undefined;
      let sourceDomain: string | undefined = undefined;

      if (mode === "url") {
        sourceUrl = inputVal.trim();
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: sourceUrl }),
        });

        if (!scrapeRes.ok) {
          const errData = await scrapeRes.json();
          throw new Error(errData.error || "Failed to extract article content.");
        }

        const scraped = await scrapeRes.json();
        title = scraped.title || title;
        content = scraped.content;
        sourceDomain = scraped.domain;

        if (!content || content.trim().length < 50) {
          throw new Error(
            `No readable text could be extracted from ${sourceDomain || "this URL"}. The website may be protected by an anti-bot firewall (like IEEE / Cloudflare) or require client-side JavaScript. Please switch to 'Raw Text' mode and paste the text directly.`
          );
        }
      }

      // Stream summary with Gemini
      setStage("analyzing");
      const sumRes = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          title,
          url: sourceUrl,
        }),
      });

      if (!sumRes.ok) {
        const errJson = await sumRes.json();
        throw new Error(errJson.error || "Failed to generate briefing.");
      }

      const reader = sumRes.body?.getReader();
      const decoder = new TextDecoder();
      let fullSummary = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullSummary += chunk;
          setStreamOutput((prev) => prev + chunk);
          setStage("briefing");
        }
      }

      // Parse tags and takeaways if available
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const readingTimeMinutes = Math.max(1, Math.round(wordCount / 220));

      const newDigest: DigestItem = {
        id: `digest-${Date.now()}`,
        title,
        sourceUrl,
        sourceDomain,
        rawContent: content,
        summary: fullSummary,
        keyTakeaways: [],
        tags: [],
        wordCount,
        readingTimeMinutes,
        createdAt: new Date().toISOString(),
      };

      addDigest(newDigest);
      setInputVal("");
      setManualTitle("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setStage("idle");
    }
  };

  const stageIndex = stage === "extracting" ? 0 : stage === "analyzing" ? 1 : stage === "briefing" ? 2 : -1;
  const stages = [
    { label: "Extract", detail: "Capture source", icon: ScanSearch },
    { label: "Analyze", detail: "Find signal", icon: WandSparkles },
    { label: "Brief", detail: "Shape insight", icon: Sparkles },
  ];

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-indigo-500/5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Research intake
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">Turn a source into a decision-ready briefing.</h2>
          </div>
          <div className="inline-flex self-start rounded-lg border border-border bg-muted/30 p-1 sm:self-auto">
            <button
              onClick={() => setMode("url")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${mode === "url" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              Article URL
            </button>
            <button
              onClick={() => setMode("text")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${mode === "text" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <FileText className="h-3.5 w-3.5" />
              Paste text
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {mode === "text" && (
            <input
              type="text"
              placeholder="Give this briefing a title (optional)"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              className="mb-3 w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
            />
          )}

          {mode === "url" ? (
            <div className="relative">
              <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
              <input
                type="url"
                placeholder="Paste an article, paper, or report URL"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && sourcePreview?.valid && handleProcess()}
                className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-11 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
              />
              {inputVal && (
                <button onClick={() => setInputVal("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Clear source URL">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            <textarea
              rows={6}
              placeholder="Paste notes, a paper excerpt, a transcript, or raw research…"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-muted/30 p-3.5 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
            />
          )}

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-h-6 items-center gap-2 text-xs text-muted-foreground">
              {mode === "url" && sourcePreview ? (
                sourcePreview.valid ? <><CheckCircle2 className="h-4 w-4 text-emerald-400" /><span>Ready to extract from <strong className="font-medium text-foreground">{sourcePreview.host}</strong></span></> : <><Circle className="h-3 w-3 text-amber-400" /><span>{sourcePreview.host}</span></>
              ) : mode === "text" && inputVal.trim() ? (
                <><CheckCircle2 className="h-4 w-4 text-emerald-400" /><span>{inputVal.trim().split(/\s+/).length.toLocaleString()} words ready to analyze</span></>
              ) : (
                <><Circle className="h-3 w-3 text-muted-foreground" /><span>Your sources stay in this local workspace.</span></>
              )}
            </div>
            <Button onClick={handleProcess} disabled={loading || !inputVal.trim() || (mode === "url" && !sourcePreview?.valid)} className="gap-2 px-4">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin text-indigo-200" /><span>{stage === "extracting" ? "Extracting" : stage === "analyzing" ? "Analyzing" : "Writing brief"}</span></> : <><Sparkles className="h-4 w-4 text-indigo-200" /><span>Create briefing</span><ArrowRight className="h-3.5 w-3.5 opacity-70" /></>}
            </Button>
          </div>
        </div>

        <div className="grid border-t border-border/70 sm:grid-cols-3">
          {stages.map((item, index) => {
            const Icon = item.icon;
            const isActive = loading && index === stageIndex;
            const isDone = loading && index < stageIndex;
            return (
              <div key={item.label} className={`flex items-center gap-3 border-border/70 px-5 py-3.5 sm:border-r sm:last:border-r-0 ${isActive ? "bg-indigo-500/8" : ""}`}>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${isActive ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-300" : isDone ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-border bg-muted/40 text-muted-foreground"}`}>
                  {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className={`h-3.5 w-3.5 ${isActive ? "animate-pulse" : ""}`} />}
                </div>
                <div><p className="text-xs font-medium text-foreground">{item.label}</p><p className="text-[10px] text-muted-foreground">{item.detail}</p></div>
              </div>
            );
          })}
        </div>
      </section>

      {recentSources.length > 0 && !loading && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="mr-1 flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> Recent sources</span>
          {recentSources.map((source) => (
            <button key={source.url} onClick={() => { setMode("url"); setInputVal(source.url); }} className="max-w-52 truncate rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-indigo-500/30 hover:text-foreground" title={source.title}>
              {source.title}
            </button>
          ))}
        </div>
      )}

      {errorMsg && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5">
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
            {mode === "url" && (
              <button
                type="button"
                onClick={() => {
                  setMode("text");
                  setErrorMsg(null);
                  setInputVal("");
                }}
                className="shrink-0 px-3 py-1.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium transition-colors text-xs flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Switch to Raw Text</span>
              </button>
            )}
          </div>
      )}

      {/* Live streaming preview while processing */}
      {loading && streamOutput && (
        <div className="rounded-2xl border border-indigo-500/30 bg-card p-5 sm:p-6 space-y-4 shadow-lg shadow-indigo-500/5 relative overflow-hidden">
          <div className="h-0.5 w-full bg-indigo-500/20 absolute top-0 left-0 overflow-hidden">
            <div className="h-full w-1/3 bg-indigo-500 rounded-full animate-pulse" />
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span>Live Executive Streaming Synthesis</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              Real-time Token Feed
            </span>
          </div>

          <MarkdownViewer content={streamOutput} isStreaming={true} />
        </div>
      )}
    </div>
  );
}
