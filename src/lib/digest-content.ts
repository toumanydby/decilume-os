import type { DigestItem } from "@/types/digest";

export interface DigestInsights {
  thesis?: string;
  takeaways: string[];
  tags: string[];
}

function sectionContent(markdown: string, title: string) {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(
    `^#{1,6}\\s+${escapedTitle}\\s*$([\\s\\S]*?)(?=^#{1,6}\\s+|$)`,
    "im"
  ).exec(markdown);

  return match?.[1]?.trim() ?? "";
}

export function plainText(markdown: string) {
  return markdown
    .replace(/!?(?:\[([^\]]*)\])\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getDigestInsights(digest: DigestItem): DigestInsights {
  const executiveBriefing = sectionContent(digest.summary, "Executive Briefing");
  const thesis = executiveBriefing
    .split(/\n\s*\n/)
    .map((paragraph) => plainText(paragraph))
    .find((paragraph) => paragraph.length > 40);

  const takeawaysSection = sectionContent(digest.summary, "Strategic Takeaways");
  const takeaways = Array.from(takeawaysSection.matchAll(/^\s*[-*+]\s+(?:\[[ xX]\]\s+)?(.+?)\s*$/gm))
    .map((match) => plainText(match[1]))
    .filter(Boolean)
    .slice(0, 4);

  const categorySection = sectionContent(digest.summary, "Categorization & Tags");
  const generatedTags = Array.from(categorySection.matchAll(/`\[?([^\]`]+)\]?`|#([\w-]+)/g))
    .map((match) => (match[1] || match[2]).trim())
    .filter(Boolean)
    .slice(0, 5);

  return {
    thesis,
    takeaways: digest.keyTakeaways.length ? digest.keyTakeaways : takeaways,
    tags: digest.tags.length ? digest.tags : generatedTags,
  };
}
