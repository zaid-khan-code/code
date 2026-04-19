import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { daysAgoISOString } from "@/lib/format";
import HeroBanner from "@/components/ui/HeroBanner";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";

type SearchParams = Promise<{ tab?: string }>;

type LeaderboardRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  trust_score: number;
  contributions: number;
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireOnboarded();
  const params = await searchParams;
  const admin = createAdminClient();
  const tab = params.tab === "weekly" ? "weekly" : "all";
  const weekAgo = daysAgoISOString(7);

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, username, full_name, avatar_url, location, trust_score")
    .eq("onboarded", true)
    .order("trust_score", { ascending: false })
    .limit(50);

  const profileRows = profiles ?? [];
  const profileIds = profileRows.map((profile) => profile.id);
  const top3Ids = profileRows.slice(0, 3).map((profile) => profile.id);

  const [{ data: helperRows }, { data: weeklyEvents }, { data: badgeRows }, { data: skillRows }] = await Promise.all([
    profileIds.length > 0
      ? admin.from("request_helpers").select("helper_id").in("helper_id", profileIds)
      : Promise.resolve({ data: [] as never[] }),
    profileIds.length > 0
      ? admin
          .from("trust_events")
          .select("user_id, delta, created_at")
          .in("user_id", profileIds)
          .gte("created_at", weekAgo)
      : Promise.resolve({ data: [] as never[] }),
    top3Ids.length > 0
      ? admin.from("user_badges").select("user_id, badges(name)").in("user_id", top3Ids)
      : Promise.resolve({ data: [] as never[] }),
    profileIds.length > 0
      ? admin.from("user_skills").select("user_id, skills(name)").in("user_id", profileIds).eq("can_help", true)
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const contributions = new Map<string, number>();
  for (const row of helperRows ?? []) {
    contributions.set(row.helper_id, (contributions.get(row.helper_id) ?? 0) + 1);
  }

  const badgeNamesMap = new Map<string, string[]>();
  for (const row of badgeRows ?? []) {
    const badgeName = (row.badges as { name: string } | null)?.name;
    if (!badgeName) continue;
    const existing = badgeNamesMap.get(row.user_id) ?? [];
    existing.push(badgeName);
    badgeNamesMap.set(row.user_id, existing);
  }

  const skillNamesMap = new Map<string, string[]>();
  for (const row of skillRows ?? []) {
    const skillName = (row.skills as { name: string } | null)?.name;
    if (!skillName) continue;
    const existing = skillNamesMap.get(row.user_id) ?? [];
    existing.push(skillName);
    skillNamesMap.set(row.user_id, existing);
  }

  const weeklyTrust = new Map<string, number>();
  for (const row of weeklyEvents ?? []) {
    weeklyTrust.set(row.user_id, (weeklyTrust.get(row.user_id) ?? 0) + row.delta);
  }

  const rows: LeaderboardRow[] = profileRows.map((profile) => ({
    ...profile,
    trust_score: tab === "weekly" ? weeklyTrust.get(profile.id) ?? 0 : profile.trust_score,
    contributions: contributions.get(profile.id) ?? 0,
  }));

  rows.sort((a, b) => b.trust_score - a.trust_score || b.contributions - a.contributions);

  return (
    <div className="space-y-6">
      <HeroBanner
        label="Leaderboard"
        title="Recognize the people who keep the community moving."
        subtitle="Trust score, contribution count, and visible progress create momentum for reliable helpers."
      />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/leaderboard?tab=all"
          className={[
            "rounded-full px-4 py-2 text-sm font-medium no-underline transition-colors",
            tab === "all"
              ? "bg-[#d7e6e0] text-[#1b1c1a]"
              : "border border-[#d7e6e0] bg-white text-[#54615d] hover:border-[#006c49]",
          ].join(" ")}
        >
          All time
        </Link>
        <Link
          href="/leaderboard?tab=weekly"
          className={[
            "rounded-full px-4 py-2 text-sm font-medium no-underline transition-colors",
            tab === "weekly"
              ? "bg-[#d7e6e0] text-[#1b1c1a]"
              : "border border-[#d7e6e0] bg-white text-[#54615d] hover:border-[#006c49]",
          ].join(" ")}
        >
          This week
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px]">
        <Card className="rounded-[24px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6c7a71]">Top Helpers</p>
          <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#1b1c1a]">
            Rankings
          </h2>

          <div className="mt-6 space-y-3">
            {rows.slice(0, 10).map((row, index) => (
              <Link
                key={row.id}
                href={`/profile/${row.username ?? row.id}`}
                className="flex items-center gap-4 rounded-[18px] border border-[#efeeea] p-4 no-underline transition-all hover:-translate-y-0.5 hover:border-[#006c49]"
              >
                <Avatar name={row.full_name ?? row.username ?? "User"} src={row.avatar_url} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1b1c1a]">
                    #{index + 1} {row.full_name ?? row.username ?? "Community helper"}
                  </p>
                  <p className="truncate text-xs text-[#54615d]">
                    {skillNamesMap.get(row.id)?.slice(0, 3).join(", ") || row.location || "Community"} &middot; {row.contributions} contributions
                  </p>
                </div>
                <p className="text-sm font-bold text-[#006c49]">{row.trust_score}%</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="rounded-[24px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6c7a71]">Badge System</p>
          <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#1b1c1a]">
            Trust and achievement
          </h2>

          <div className="mt-6 space-y-4">
            {rows.slice(0, 3).map((row) => {
              const width = Math.max(12, Math.min(100, row.trust_score));

              return (
                <div key={row.id} className="rounded-[18px] border border-[#efeeea] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#1b1c1a]">
                      {row.full_name ?? row.username ?? "Community helper"}
                    </p>
                    <span className="text-xs font-bold text-[#006c49]">{row.trust_score}%</span>
                  </div>
                  <p className="mt-1 text-xs text-[#54615d]">
                    {badgeNamesMap.get(row.id)?.join(" / ") || `${row.contributions} contributions`}
                  </p>
                  <div className="mt-4 h-2 rounded-full bg-[#E9E4DD]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#F2B648] via-[#98A944] to-[#006c49]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
