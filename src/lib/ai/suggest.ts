import { SKILL_INTEREST_MAP, RESPONSE_TEMPLATES } from "./dictionaries";
import { CATEGORY_KEYWORDS } from "./dictionaries";
import { withClaude } from "./claude";

export async function suggestSkills(bio: string, interestNames: string[]): Promise<string[]> {
  const bioLower = bio.toLowerCase();
  const interestStr = interestNames.join(" ").toLowerCase();

  const fallback = () => {
    const scores: Record<string, number> = {};
    for (const [skill, interests] of Object.entries(SKILL_INTEREST_MAP)) {
      let score = 0;
      if (bioLower.includes(skill.toLowerCase())) score += 3;
      for (const interest of interests) {
        if (interestStr.includes(interest.toLowerCase())) score += 1;
      }
      if (score > 0) scores[skill] = score;
    }
    return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s);
  };

  const result = await withClaude(
    `Based on this bio and interests, suggest 5 relevant skills.\n\nBio: ${bio}\nInterests: ${interestNames.join(", ")}\n\nRespond with JSON only: {"skills": ["...", "..."]}`,
    fallback
  );

  if (typeof result === "string") {
    try {
      const parsed = JSON.parse(result.match(/\{.*\}/s)?.[0] ?? "{}");
      if (Array.isArray(parsed.skills)) return parsed.skills.slice(0, 5);
    } catch { /* fall through */ }
  }

  return fallback();
}

export async function suggestInterests(skillNames: string[]): Promise<string[]> {
  const suggested = new Set<string>();
  for (const skill of skillNames) {
    const interests = SKILL_INTEREST_MAP[skill] ?? [];
    for (const interest of interests) suggested.add(interest);
  }
  return Array.from(suggested).slice(0, 5);
}

export async function suggestResponse(requestText: string): Promise<string[]> {
  const textLower = requestText.toLowerCase();

  const fallback = () => {
    const categoryScores = Object.entries(CATEGORY_KEYWORDS).map(([cat, kws]) => ({
      cat,
      hits: kws.filter((k) => textLower.includes(k)).length,
    }));
    const topCat = categoryScores.sort((a, b) => b.hits - a.hits)[0]?.cat ?? "Other";

    if (topCat === "Programming") {
      return [RESPONSE_TEMPLATES[3], RESPONSE_TEMPLATES[0], RESPONSE_TEMPLATES[4]];
    }
    return RESPONSE_TEMPLATES.slice(0, 3);
  };

  const result = await withClaude(
    `Generate 3 short, helpful response templates for someone offering to help with this request. Each template should be 1-2 sentences. Vary the tone.\n\nRequest: ${requestText}\n\nRespond with JSON only: {"templates": ["...", "...", "..."]}`,
    fallback
  );

  if (typeof result === "string") {
    try {
      const parsed = JSON.parse(result.match(/\{.*\}/s)?.[0] ?? "{}");
      if (Array.isArray(parsed.templates)) return parsed.templates.slice(0, 3);
    } catch { /* fall through */ }
  }

  return fallback();
}
