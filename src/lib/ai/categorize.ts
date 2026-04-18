import { CATEGORY_KEYWORDS } from "./dictionaries";
import { withClaude } from "./claude";

export function categorizeHeuristic(text: string): { category: string; confidence: number } {
  const t = text.toLowerCase();
  const scores = Object.entries(CATEGORY_KEYWORDS).map(([cat, kws]) => {
    const hits = kws.filter((k) => t.includes(k)).length;
    return [cat, hits / Math.max(kws.length, 1)] as const;
  });
  scores.sort((a, b) => b[1] - a[1]);
  const [best, score] = scores[0];
  if (score === 0) return { category: "Other", confidence: 0 };
  return { category: best, confidence: Math.min(1, score * 3) };
}

export async function categorize(title: string, description: string): Promise<{ category: string; confidence: number }> {
  const text = `${title} ${description}`;
  const fallback = () => categorizeHeuristic(text);

  const result = await withClaude(
    `Classify this help request into exactly one category. Categories: Programming, Design, Academic, Career, Business, Data, Language, Other.\n\nTitle: ${title}\nDescription: ${description}\n\nRespond with JSON only: {"category": "...", "confidence": 0.0-1.0}`,
    fallback
  );

  if (typeof result === "string") {
    try {
      const parsed = JSON.parse(result.match(/\{.*\}/s)?.[0] ?? "{}");
      if (parsed.category) return { category: parsed.category, confidence: parsed.confidence ?? 0.8 };
    } catch { /* fall through */ }
  }

  return fallback();
}
