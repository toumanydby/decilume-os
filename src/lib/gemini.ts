import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!genAI) {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables.");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export const FALLBACK_GEMINI_MODELS = Array.from(
  new Set(
    [
      process.env.GEMINI_MODEL,
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-2.5-flash-lite",
    ].filter((m): m is string => Boolean(m))
  )
);

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);

export function getErrorStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  const match = err instanceof Error ? err.message.match(/\[(\d{3})[^\]]*\]/) : null;
  return match ? Number(match[1]) : undefined;
}

export function isTransientGeminiError(err: unknown): boolean {
  const status = getErrorStatus(err);
  return status !== undefined && TRANSIENT_STATUSES.has(status);
}
