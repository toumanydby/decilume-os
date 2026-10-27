"use client";

import { useState } from "react";
import { Sparkles, Link as LinkIcon, FileText, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { DigestItem } from "@/types/digest";

export function UrlInputBar() {
  const [mode, setMode] = useState<"url" | "text">("url");
  const [inputVal, setInputVal] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamOutput, setStreamOutput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addDigest = useAppStore((s) => s.addDigest);

  const handleProcess = async () => {
    if (!inputVal.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setStreamOutput("");

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
      }

      // Stream summary with Gemini
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
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/30">
          <button
            onClick={() => setMode("url")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === "url"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Article URL</span>
          </button>
          <button
            onClick={() => setMode("text")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === "text"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Raw Text</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>Gemini 2.0 Flash Active</span>
        </div>
      </div>

      {/* Input container */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
        {mode === "text" && (
          <input
            type="text"
            placeholder="Document or Briefing Title (Optional)..."
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            className="w-full bg-muted/40 border border-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
          />
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          {mode === "url" ? (
            <input
              type="url"
              placeholder="Paste article URL (e.g. https://openai.com/index/...)"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleProcess()}
              className="flex-1 bg-muted/30 border border-border rounded-lg px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground"
            />
          ) : (
            <textarea
              rows={4}
              placeholder="Paste raw notes, research papers, or transcript..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-muted/30 border border-border rounded-lg p-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-foreground resize-none"
            />
          )}

          <Button
            onClick={handleProcess}
            disabled={loading || !inputVal.trim()}
            className="shrink-0 self-end sm:self-auto gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Synthesize</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-70" />
              </>
            )}
          </Button>
        </div>

        {errorMsg && (
          <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Live streaming preview while processing */}
      {loading && streamOutput && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-2 animate-pulse">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Streaming Synthesis...</span>
          </div>
          <div className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
            {streamOutput}
          </div>
        </div>
      )}
    </div>
  );
}

