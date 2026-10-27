"use client";

import { DigestItem } from "@/types/digest";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownViewer } from "./MarkdownViewer";
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
} from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/lib/store";

interface DigestCardProps {
  digest: DigestItem;
}

export function DigestCard({ digest }: DigestCardProps) {
  const [copied, setCopied] = useState(false);
  const removeDigest = useAppStore((s) => s.removeDigest);

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
    <Card className="rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-card/90 shadow-sm hover:border-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/5 transition-all overflow-hidden">
      {/* Top Banner / Accent strip */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600" />

      <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 sm:p-6 pb-4 border-b border-border/60">
        <div className="space-y-2.5 max-w-2xl">
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
          <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug">
            {digest.title}
          </CardTitle>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
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
            onClick={handleDownloadMd}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-accent hover:border-indigo-500/30 transition-all"
            title="Download formatted .md file"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-medium">Export .md</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-accent hover:border-indigo-500/30 transition-all"
            title="Copy briefing"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (confirm(`Delete briefing "${digest.title}"?`)) {
                removeDigest(digest.id);
              }
            }}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
            title="Delete briefing"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-5">
        <MarkdownViewer content={digest.summary} />
      </CardContent>
    </Card>
  );
}
