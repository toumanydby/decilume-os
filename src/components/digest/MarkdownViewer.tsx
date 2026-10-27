"use client";

import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  Sparkles,
  Target,
  Tag,
  Copy,
  Check,
  FileCode,
  FileText,
  ChevronRight,
  Bookmark,
  Layers,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

/**
 * Summaries often arrive with LaTex delimiters escaped for Markdown
 * (for example, `\\$Q\\$`).  Markdown intentionally treats those dollar signs
 * as literal text, so normalize well-formed pairs for the rich preview only.
 * Code fences and inline code stay byte-for-byte intact.
 */
function normalizeMathDelimiters(markdown: string) {
  const normalizeText = (text: string) =>
    text
      // LaTex display delimiters: \[ ... \] → $$ ... $$
      .replace(/\\\[([\s\S]*?)\\\]/g, (_match, formula: string) => `$$${formula}$$`)
      // Escaped Markdown display delimiters: \$\$ ... \$\$ → $$ ... $$
      .replace(/\\\$\\\$([\s\S]*?)\\\$\\\$/g, (_match, formula: string) => `$$${formula}$$`)
      // LaTex inline delimiters: \( ... \) → $ ... $
      .replace(/\\\(([^\n]+?)\\\)/g, (_match, formula: string) => `$${formula}$`)
      // Escaped Markdown inline delimiters: \$ ... \$ → $ ... $
      .replace(/\\\$([^$\n]+?)\\\$/g, (_match, formula: string) => `$${formula}$`);

  return markdown
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g)
    .map((segment) => {
      const isFencedCode = segment.startsWith("```") || segment.startsWith("~~~");
      if (isFencedCode) return segment;

      return segment
        .split(/(`+[^`]*`+)/g)
        .map((part) => (part.startsWith("`") ? part : normalizeText(part)))
        .join("");
    })
    .join("");
}

export function MarkdownViewer({
  content,
  className,
  isStreaming = false,
}: MarkdownViewerProps) {
  const [viewMode, setViewMode] = useState<"rich" | "raw">("rich");
  const [copied, setCopied] = useState(false);
  const previewContent = useMemo(() => normalizeMathDelimiters(content), [content]);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header View Switcher (only when not streaming) */}
      {!isStreaming && (
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50 text-xs">
            <button
              onClick={() => setViewMode("rich")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all",
                viewMode === "rich"
                  ? "bg-card text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Executive Briefing</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all",
                viewMode === "raw"
                  ? "bg-card text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileCode className="w-3.5 h-3.5 text-zinc-400" />
              <span>Raw Markdown</span>
            </button>
          </div>

          <button
            onClick={handleCopyRaw}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
            title="Copy Markdown Source"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Source</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Raw Markdown View */}
      {viewMode === "raw" ? (
        <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-4 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
          {content}
        </div>
      ) : (
        /* Rich Executive View */
        <div className="markdown-preview space-y-6 text-foreground font-sans">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pb-2 border-b border-border/60">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground pt-4 pb-2 border-b border-border/40 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-indigo-400" />
                  <span>{children}</span>
                </h2>
              ),
              h3: ({ children }) => {
                const titleStr = String(children);
                const isBriefing =
                  titleStr.toLowerCase().includes("executive") ||
                  titleStr.toLowerCase().includes("briefing");
                const isTakeaways =
                  titleStr.toLowerCase().includes("takeaway") ||
                  titleStr.toLowerCase().includes("strategic");
                const isTags =
                  titleStr.toLowerCase().includes("tag") ||
                  titleStr.toLowerCase().includes("categor");

                const sectionId = titleStr.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

                return (
                  <div id={sectionId} className="scroll-mt-24 pt-8 pb-3 first:pt-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "inline-flex items-center gap-2 rounded-md border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]",
                        isBriefing &&
                          "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-sm shadow-indigo-500/5",
                        isTakeaways &&
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5",
                        isTags &&
                          "bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-sm shadow-violet-500/5",
                        !isBriefing &&
                          !isTakeaways &&
                          !isTags &&
                          "bg-muted text-foreground border-border"
                      )}
                    >
                          {isBriefing && <Sparkles className="w-3.5 h-3.5" />}
                          {isTakeaways && <Target className="w-3.5 h-3.5" />}
                          {isTags && <Tag className="w-3.5 h-3.5" />}
                          {!isBriefing && !isTakeaways && !isTags && <ListChecks className="w-3.5 h-3.5" />}
                          <span>Briefing section</span>
                        </div>
                      <div className="h-px flex-1 bg-border/60" />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground sm:text-xl">{children}</h3>
                  </div>
                );
              },
              p: ({ children }) => (
                <p className="mb-5 text-[15px] font-normal leading-7 text-foreground/90 sm:text-base sm:leading-7">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="my-4 space-y-2.5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="space-y-2.5 my-3 list-decimal list-inside">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-3 text-sm leading-6 text-foreground/90 transition-all hover:border-indigo-500/30 hover:bg-card">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-indigo-500/20 bg-indigo-500/10 transition-colors group-hover:bg-indigo-500/20">
                    <ChevronRight className="w-3 h-3 text-indigo-400" />
                  </div>
                  <div className="flex-1">{children}</div>
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground tracking-tight underline-offset-2 decoration-indigo-500/30">
                  {children}
                </strong>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-r-xl p-4 my-3 text-xs sm:text-sm italic text-foreground/90">
                  {children}
                </blockquote>
              ),
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match && !String(children).includes("\n");

                if (isInline) {
                  return (
                    <code
                      className="px-2 py-0.5 rounded-md font-mono text-[11px] sm:text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium inline-block mx-0.5"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="rounded-xl border border-border bg-zinc-950/90 p-4 my-3 overflow-x-auto">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                      <span>{match ? match[1] : "code"}</span>
                      <Layers className="w-3 h-3" />
                    </div>
                    <code className="font-mono text-xs text-zinc-200 leading-relaxed" {...props}>
                      {children}
                    </code>
                  </div>
                );
              },
              table: ({ children }) => (
                <div className="rounded-xl border border-border overflow-hidden my-4 shadow-sm">
                  <table className="w-full text-xs text-left">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-muted/70 text-foreground font-semibold border-b border-border">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-border/60 bg-card/40">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
              ),
              th: ({ children }) => <th className="p-3 font-semibold">{children}</th>,
              td: ({ children }) => <td className="p-3 text-foreground/80">{children}</td>,
            }}
          >
            {previewContent}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
