import { NextRequest } from "next/server";
import {
  getGeminiClient,
  FALLBACK_GEMINI_MODELS,
  getErrorStatus,
  isTransientGeminiError,
} from "@/lib/gemini";

const MAX_ATTEMPTS_PER_MODEL = 2;
const BASE_BACKOFF_MS = 600;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const { text, title, url } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Text content is required for summarization." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured. Please add your key to .env.local to enable Gemini summaries.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are the executive intelligence analyst for Decilume OS.
Produce a structured, high-density executive briefing from the following material.

Article/Document Title: ${title || "Untitled"}
Source URL: ${url || "Direct Input"}

Raw Text:
"""
${text.slice(0, 30000)}
"""

Please format your response clearly in Markdown with these specific sections:
### Executive Briefing
(A dense 2-3 paragraph synthesis focusing on core theses, implications, and high-value insights. Avoid fluff.)

### Strategic Takeaways
- [Actionable or key takeaway 1]
- [Actionable or key takeaway 2]
- [Actionable or key takeaway 3]
- [Actionable or key takeaway 4]

### Categorization & Tags
\`[Tag1]\` \`[Tag2]\` \`[Tag3]\` \`[Tag4]\`
`;

    const genAI = getGeminiClient();

    // Transient overloads (429/5xx) get a couple of backoff retries per model before
    // falling through; non-transient errors (e.g. 404 unknown model) skip immediately.
    let result: Awaited<ReturnType<ReturnType<typeof genAI.getGenerativeModel>["generateContentStream"]>> | null = null;
    let successfulModel = "";
    let lastError: unknown = null;
    let sawOnlyTransientErrors = true;

    outer: for (const modelName of FALLBACK_GEMINI_MODELS) {
      const model = genAI.getGenerativeModel({ model: modelName });
      for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt++) {
        try {
          result = await model.generateContentStream(prompt);
          successfulModel = modelName;
          break outer;
        } catch (err) {
          lastError = err;
          const transient = isTransientGeminiError(err);
          console.warn(
            `[Decilume OS] Model ${modelName} attempt ${attempt + 1} failed (${getErrorStatus(err) ?? "unknown"}).`
          );
          if (!transient) {
            if (getErrorStatus(err) !== 404) sawOnlyTransientErrors = false;
            break;
          }
          if (attempt < MAX_ATTEMPTS_PER_MODEL - 1) {
            await sleep(BASE_BACKOFF_MS * 2 ** attempt + Math.random() * 250);
          }
        }
      }
    }

    if (!result) {
      if (sawOnlyTransientErrors) {
        return new Response(
          JSON.stringify({
            error:
              "Gemini is experiencing high demand right now. Please wait a few seconds and try again.",
          }),
          { status: 503, headers: { "Content-Type": "application/json", "Retry-After": "10" } }
        );
      }
      throw lastError instanceof Error ? lastError : new Error("All candidate Gemini models were unavailable.");
    }
    const activeResult = result;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of activeResult.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (err: any) {
          console.error("Stream processing error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Decilume-Model": successfulModel,
      },
    });
  } catch (error: any) {
    console.error("Summarization error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate briefing." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

