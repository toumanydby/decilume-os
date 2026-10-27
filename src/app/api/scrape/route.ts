import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "A valid URL string is required." }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

    const result = await scrapeUrl(url);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to extract content from the provided URL.",
      },
      { status: 500 }
    );
  }
}

