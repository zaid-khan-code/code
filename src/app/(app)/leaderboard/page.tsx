import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
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
  // eslint-disable-next-line react-hooks/purity
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, username, full_name, avatar_url, location, trust_score")
    .eq("onboarded", true)
    .order("trust_score", { ascending: false })
    .limit(50);

  const profileRows = profiles ?? [];
  const profileIds = profileRows.map((profile) => profile.id);

  const [{ data: helperRows }, { data: weeklyEvents }] = await Promise.all([
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
  ]);

  const contributions = new Map<string, number>();
  for (const row of helperRows ?? []) {
    contributions.set(row.helper_id, (contributions.get(row.helper_id) ?? 0) + 1);
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
            "rounded-full px-4 py-2 text-sm font-medium no-underline",
            tab === "all" ? "bg-[#EEF4EF] text-[#111111]" : "bg-white text-[#6B6B6B]",
          ].join(" ")}
        >
          All time
        </Link>
        <Link
          href="/leaderboard?tab=weekly"
          className={[
            "rounded-full px-4 py-2 text-sm font-medium no-underline",
            tab === "weekly" ? "bg-[#EEF4EF] text-[#111111]" : "bg-white text-[#6B6B6B]",
          ].join(" ")}
        >
          This week
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px]">
        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
            Top Helpers
          </p>
          <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#111111]">
            Rankings
          </h2>

          <div className="mt-6 space-y-4">
            {rows.slice(0, 10).map((row, index) => (
              <Link
                key={row.id}
                href={`/profile/${row.username ?? row.id}`}
                className="flex items-center gap-4 rounded-[18px] border border-[#F0EBE3] p-4 no-underline transition-transform hover:-translate-y-0.5"
              >
                <Avatar name={row.full_name ?? row.username ?? "User"} src={row.avatar_url} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111111]">
                    #{index + 1} {row.full_name ?? row.username ?? "Community helper"}
                  </p>
                  <p className="truncate text-xs text-[#6B6B6B]">
                    {row.location || "Community"} · {row.contributions} contributions
                  </p>
                </div>
                <p className="text-sm font-bold text-[#111111]">{row.trust_score}%</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
            Badge System
          </p>
          <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#111111]">
            Trust and achievement
          </h2>

          <div className="mt-6 space-y-5">
            {rows.slice(0, 3).map((row) => {
              const width = Math.max(12, Math.min(100, row.trust_score));

              return (
                <div key={row.id} className="rounded-[18px] border border-[#F0EBE3] p-4">
                  <p className="text-sm font-semibold text-[#111111]">
                    {row.full_name ?? row.username ?? "Community helper"}
                  </p>
                  <p className="mt-1 text-xs text-[#6B6B6B]">
                    Trust {row.trust_score}% · {row.contributions} total contributions
                  </p>
                  <div className="mt-4 h-2.5 rounded-full bg-[#E9E4DD]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#F2B648] via-[#98A944] to-[#0C9F88]"
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
