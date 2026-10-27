"use client";

import { DigestItem } from "@/types/digest";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownViewer } from "./MarkdownViewer";
import { getDigestInsights } from "@/lib/digest-content";
import {
  ExternalLink,
  Copy,
  Check,
  Clock,
  Trash2,
  Download,
  Calendar,
  FileText,
  Globe,
  Sparkles,
  ChevronRight,
  ListChecks,
  MoreHorizontal,
  Quote,
} from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/lib/store";

interface DigestCardProps {
  digest: DigestItem;
}

export function DigestCard({ digest }: DigestCardProps) {
  const [copied, setCopied] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const removeDigest = useAppStore((s) => s.removeDigest);
  const insights = getDigestInsights(digest);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `# ${digest.title}\nSource: ${digest.sourceUrl || "Direct Input"}\n\n${digest.summary}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const frontmatter = `---
title: "${digest.title.replace(/"/g, '\\"')}"
source: "${digest.sourceUrl || "Direct Input"}"
date: "${digest.createdAt}"
reading_time: "${digest.readingTimeMinutes} min"
word_count: ${digest.wordCount}
generated_by: "Decilume OS Executive Intelligence Engine"
---

`;
    const fullContent = frontmatter + digest.summary;
    const blob = new Blob([fullContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeTitle = digest.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);
    a.href = url;
    a.download = `briefing-${safeTitle || "document"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formattedDate = new Date(digest.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-card/90 shadow-sm hover:border-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/5 transition-all overflow-visible">
      {/* Top Banner / Accent strip */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600" />

      <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 sm:p-7 pb-5 border-b border-border/60">
        <div className="space-y-3 max-w-3xl">
          {/* Metadata Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {digest.sourceDomain ? (
              <Badge
                variant="outline"
                className="font-mono text-[10px] flex items-center gap-1 bg-muted/40 text-muted-foreground"
              >
                <Globe className="w-3 h-3 text-indigo-400" />
                <span>{digest.sourceDomain}</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="font-mono text-[10px] flex items-center gap-1 bg-muted/40 text-muted-foreground"
              >
                <FileText className="w-3 h-3 text-indigo-400" />
                <span>Direct Input</span>
              </Badge>
            )}

            <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-md border border-border/40">
              <Clock className="w-3 h-3 text-amber-400" />
              {digest.readingTimeMinutes} min read ({digest.wordCount.toLocaleString()} words)
            </span>

            <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-md border border-border/40">
              <Calendar className="w-3 h-3 text-emerald-400" />
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-[-0.025em] text-foreground leading-tight">
            {digest.title}
          </CardTitle>

          {insights.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {insights.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-indigo-500/20 bg-indigo-500/5 px-2 py-0.5 text-[10px] font-mono text-indigo-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Primary action + compact document menu */}
        <div className="relative flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
          {digest.sourceUrl && (
            <a
              href={digest.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent hover:border-indigo-500/30 transition-all"
              title="Open source URL"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => setActionsOpen((isOpen) => !isOpen)}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent hover:border-indigo-500/30 transition-all"
            title="Briefing actions"
            aria-label="Briefing actions"
            aria-expanded={actionsOpen}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {actionsOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl shadow-black/20">
              <button
                onClick={() => {
                  handleDownloadMd();
                  setActionsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5 text-indigo-400" />
                Export Markdown
              </button>
              <button
                onClick={() => {
                  handleCopy();
                  setActionsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy briefing"}
              </button>
              <div className="my-1 border-t border-border/70" />
              <button
                onClick={() => {
                  if (confirm(`Delete briefing "${digest.title}"?`)) removeDigest(digest.id);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete briefing
              </button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-7 pt-6">
        {(insights.thesis || insights.takeaways.length > 0) && (
          <section id="briefing-overview" className="scroll-mt-8 mx-auto mb-8 max-w-4xl overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-card to-cyan-500/5">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              {insights.thesis && (
                <div className="p-5 sm:p-6 lg:border-r lg:border-border/70">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-indigo-300">
                    <Quote className="h-3.5 w-3.5" />
                    The thesis
                  </div>
                  <p className="text-sm leading-7 text-foreground/90 sm:text-[15px]">{insights.thesis}</p>
                </div>
              )}
              {insights.takeaways.length > 0 && (
                <div className="border-t border-border/70 p-5 sm:p-6 lg:border-t-0">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    <ListChecks className="h-3.5 w-3.5" />
                    Key takeaways
                  </div>
                  <ul className="space-y-2.5">
                    {insights.takeaways.slice(0, 3).map((takeaway, index) => (
                      <li key={takeaway} className="flex gap-2.5 text-xs leading-5 text-foreground/85">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10 font-mono text-[10px] text-emerald-300">
                          0{index + 1}
                        </span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="mx-auto max-w-4xl">
          <MarkdownViewer content={digest.summary} />
        </div>
      </CardContent>
    </Card>
  );
}
