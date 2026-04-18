import { withClaude } from "./claude";

export function suggestTagsHeuristic(text: string, skillNames: string[]): string[] {
  const t = text.toLowerCase();
  return skillNames
    .map((s) => ({ s, hit: t.includes(s.toLowerCase()) }))
    .filter((x) => x.hit)
    .slice(0, 5)
    .map((x) => x.s);
}

export async function suggestTags(text: string, skillNames: string[]): Promise<string[]> {
  const fallback = () => suggestTagsHeuristic(text, skillNames);

  const result = await withClaude(
    `Suggest up to 5 relevant tags for this help request from the available skills list.\n\nRequest: ${text}\n\nAvailable skills: ${skillNames.join(", ")}\n\nRespond with JSON only: {"tags": ["...", "..."]}`,
    fallback
  );

  if (typeof result === "string") {
    try {
      const parsed = JSON.parse(result.match(/\{.*\}/s)?.[0] ?? "{}");
      if (Array.isArray(parsed.tags)) return parsed.tags.slice(0, 5);
    } catch { /* fall through */ }
  }

  return fallback();
}
