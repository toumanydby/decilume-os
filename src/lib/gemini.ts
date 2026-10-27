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

export const FALLBACK_GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-3.8-flash",
  "gemini-flash-latest",
].filter((m): m is string => Boolean(m));

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";


