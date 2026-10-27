export interface DigestItem {
  id: string;
  title: string;
  sourceUrl?: string;
  sourceDomain?: string;
  rawContent: string;
  summary: string;
  keyTakeaways: string[];
  tags: string[];
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: string;
}

export type DigestStatus = "idle" | "scraping" | "summarizing" | "completed" | "error";

export interface ScrapeResult {
  url: string;
  title: string;
  domain: string;
  content: string;
  wordCount: number;
}
