import { NextRequest } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";

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
          error: "GEMINI_API_KEY is not configured. Please add your key to .env.local to enable Gemini 2.0 Flash summaries.",
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
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const result = await model.generateContentStream(prompt);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (err: any) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
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

