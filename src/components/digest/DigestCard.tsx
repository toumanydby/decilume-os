"use client";

import { DigestItem } from "@/types/digest";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Check, Clock, Trash2 } from "lucide-react";
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
      `# ${digest.title}\nSource: ${digest.sourceUrl || "Direct Text"}\n\n${digest.summary}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border/80 hover:border-border transition-colors">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="space-y-1.5 max-w-[80%]">
          <div className="flex items-center gap-2 flex-wrap">
            {digest.sourceDomain && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {digest.sourceDomain}
              </Badge>
            )}
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
              <Clock className="w-3 h-3" />
              {digest.readingTimeMinutes} min read ({digest.wordCount.toLocaleString()} words)
            </span>
          </div>

          <CardTitle className="text-base sm:text-lg font-semibold tracking-tight text-foreground leading-snug">
            {digest.title}
          </CardTitle>
        </div>

        <div className="flex items-center gap-1.5">
          {digest.sourceUrl && (
            <a
              href={digest.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Open source URL"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Copy briefing to clipboard"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => removeDigest(digest.id)}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-rose-500 hover:bg-accent transition-colors"
            title="Delete briefing"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">
          {digest.summary}
        </div>
      </CardContent>
    </Card>
  );
}

