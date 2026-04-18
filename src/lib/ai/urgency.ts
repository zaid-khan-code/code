import { URGENCY_KEYWORDS } from "./dictionaries";
import { withClaude } from "./claude";

export function detectUrgencyHeuristic(text: string): { urgency: "low" | "medium" | "high" | "critical"; score: number } {
  const t = text.toLowerCase();
  for (const level of ["critical", "high", "medium", "low"] as const) {
    if (URGENCY_KEYWORDS[level].some((k) => t.includes(k))) {
      const score = level === "critical" ? 0.95 : level === "high" ? 0.75 : level === "medium" ? 0.5 : 0.2;
      return { urgency: level, score };
    }
  }
  return { urgency: "medium", score: 0.5 };
}

export async function detectUrgency(text: string): Promise<{ urgency: "low" | "medium" | "high" | "critical"; score: number }> {
  const fallback = () => detectUrgencyHeuristic(text);

  const result = await withClaude(
    `Detect urgency level of this help request. Levels: low, medium, high, critical.\ncritical = deadline today/hours, high = deadline tomorrow/very soon, medium = this week, low = no rush.\n\nText: ${text}\n\nRespond with JSON only: {"urgency": "...", "score": 0.0-1.0}`,
    fallback
  );

  if (typeof result === "string") {
    try {
      const parsed = JSON.parse(result.match(/\{.*\}/s)?.[0] ?? "{}");
      if (["low","medium","high","critical"].includes(parsed.urgency)) {
        return { urgency: parsed.urgency, score: parsed.score ?? 0.7 };
      }
    } catch { /* fall through */ }
  }

  return fallback();
}
