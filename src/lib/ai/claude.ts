import { GoogleGenerativeAI } from "@google/generative-ai";

const enabled =
  typeof process !== "undefined" &&
  process.env.GEMINI_API_KEY;

let client: GoogleGenerativeAI | null = null;

async function getClient() {
  if (!enabled) return null;
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return client;
}

export async function withClaude<T>(prompt: string, fallback: () => T): Promise<T | string> {
  const c = await getClient();
  if (!c) return fallback();
  try {
    const model = c.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch {
    return fallback();
  }
}
