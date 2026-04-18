import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type SB = SupabaseClient<Database>;

export async function getCategoryTrends(sb: SB, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await sb
    .from("requests")
    .select("category")
    .gte("created_at", since)
    .not("category", "is", null);

  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const { category } of data) {
    if (category) counts[category] = (counts[category] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));
}

export async function getSkillGaps(sb: SB) {
  const { data: openRequests } = await sb
    .from("requests")
    .select("tags")
    .eq("status", "open");

  if (!openRequests) return [];

  const tagDemand: Record<string, number> = {};
  for (const { tags } of openRequests) {
    for (const tag of tags ?? []) {
      tagDemand[tag] = (tagDemand[tag] ?? 0) + 1;
    }
  }

  const { data: helpers } = await sb
    .from("user_skills")
    .select("skill_id, skills(name)")
    .eq("can_help", true);

  const helperCounts: Record<string, number> = {};
  for (const h of helpers ?? []) {
    const name = (h as { skills: { name: string } | null }).skills?.name;
    if (name) helperCounts[name] = (helperCounts[name] ?? 0) + 1;
  }

  return Object.entries(tagDemand)
    .map(([tag, demand]) => ({ tag, demand, helpers: helperCounts[tag] ?? 0 }))
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 5);
}

export async function getUrgencyStats(sb: SB) {
  const { data } = await sb.from("requests").select("urgency").eq("status", "open");
  if (!data) return { critical: 0, high: 0, medium: 0, low: 0 };
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const { urgency } of data) {
    if (urgency in counts) counts[urgency as keyof typeof counts]++;
  }
  return counts;
}

export async function getSuggestedRequestsForUser(sb: SB, userId: string) {
  const { data: userSkillRows } = await sb
    .from("user_skills")
    .select("skills(name)")
    .eq("user_id", userId)
    .eq("can_help", true);

  const userSkills = (userSkillRows ?? [])
    .map((r) => (r as { skills: { name: string } | null }).skills?.name)
    .filter(Boolean) as string[];

  if (userSkills.length === 0) {
    const { data } = await sb.from("requests").select("*").eq("status", "open").limit(5);
    return data ?? [];
  }

  const { data } = await sb
    .from("requests")
    .select("*")
    .eq("status", "open")
    .overlaps("tags", userSkills)
    .neq("author_id", userId)
    .limit(5);

  return data ?? [];
}

export async function getUserActivitySummary(sb: SB, userId: string) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: events } = await sb
    .from("trust_events")
    .select("event_type, delta")
    .eq("user_id", userId)
    .gte("created_at", since);

  const totalDelta = (events ?? []).reduce((sum, e) => sum + e.delta, 0);
  const helps = (events ?? []).filter((e) => e.event_type === "request_solved_as_helper").length;

  return { trustGain: totalDelta, helpsGiven: helps };
}

export async function getMentorPoolCount(sb: SB) {
  const { count } = await sb
    .from("user_skills")
    .select("*", { count: "exact", head: true })
    .eq("can_help", true);
  return count ?? 0;
}
