import * as cheerio from "cheerio";
import { ScrapeResult } from "@/types/digest";

export async function scrapeUrl(targetUrl: string): Promise<ScrapeResult> {
  const parsedUrl = new URL(targetUrl);
  const domain = parsedUrl.hostname.replace(/^www\./, "");

  const response = await fetch(targetUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (DecilumeOS/1.0)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(10000), // 10s timeout
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Strip non-content elements
  $(
    "script, style, noscript, nav, footer, header, svg, iframe, form, button, [role='navigation'], [role='banner'], [aria-hidden='true']"
  ).remove();

  // Try extracting the title
  let title =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("h1").first().text().trim() ||
    $("title").text().trim() ||
    parsedUrl.pathname.split("/").filter(Boolean).pop() ||
    "Untitled Document";

  title = title.replace(/\s+/g, " ").trim();

  // Find the primary text container
  let content = "";
  const articleEl = $("article, main, [role='main'], .post-content, .article-body, #content");

  if (articleEl.length > 0) {
    content = articleEl.text();
  } else {
    // Fallback: collect paragraphs
    const paragraphs: string[] = [];
    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 30) {
        paragraphs.push(text);
      }
    });
    content = paragraphs.join("\n\n");
  }

  // Fallback to body text if still empty
  if (!content || content.length < 100) {
    content = $("body").text();
  }

  // Clean extra whitespace
  content = content
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    url: targetUrl,
    title,
    domain,
    content,
    wordCount,
  };
}
