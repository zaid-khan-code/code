import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCategoryTrends, getSkillGaps } from "@/lib/ai/insights";
import { daysAgoISOString } from "@/lib/format";
import Card from "@/components/ui/Card";
import Stat from "@/components/ui/Stat";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const sb = createAdminClient();

  const thirtyDaysAgo = daysAgoISOString(30);
  const sevenDaysAgo = daysAgoISOString(7);

  const [
    trends,
    gaps,
    { count: totalRequests },
    { count: solvedRequests },
    { count: totalUsers },
    { data: signupsRaw },
    { data: firstHelperRaw },
  ] = await Promise.all([
    getCategoryTrends(sb),
    getSkillGaps(sb),
    sb.from("requests").select("id", { count: "exact", head: true }),
    sb.from("requests").select("id", { count: "exact", head: true }).eq("status", "solved"),
    sb.from("profiles").select("id", { count: "exact", head: true }),
    sb.from("profiles").select("created_at").gte("created_at", thirtyDaysAgo).order("created_at"),
    sb.from("request_helpers")
      .select("request_id, created_at")
      .gte("created_at", sevenDaysAgo)
      .order("created_at"),
  ]);

  const solveRate = totalRequests
    ? Math.round(((solvedRequests ?? 0) / totalRequests) * 100)
    : 0;

  const signupsByDay: Record<string, number> = {};
  for (const { created_at } of signupsRaw ?? []) {
    const day = created_at.slice(0, 10);
    signupsByDay[day] = (signupsByDay[day] ?? 0) + 1;
  }
  const signupEntries = Object.entries(signupsByDay).sort(([a], [b]) => a.localeCompare(b));
  const maxSignups = Math.max(...signupEntries.map(([, v]) => v), 1);

  const firstHelperByRequest: Record<string, string> = {};
  for (const r of firstHelperRaw ?? []) {
    if (!firstHelperByRequest[r.request_id]) {
      firstHelperByRequest[r.request_id] = r.created_at;
    }
  }
  const { data: requestDates } = await sb
    .from("requests")
    .select("id, created_at")
    .in("id", Object.keys(firstHelperByRequest));
  let avgFirstHelper: number | null = null;
  if (requestDates && requestDates.length > 0) {
    const total = requestDates.reduce((sum, r) => {
      const diff =
        (new Date(firstHelperByRequest[r.id]).getTime() - new Date(r.created_at).getTime()) /
        3600000;
      return sum + diff;
    }, 0);
    avgFirstHelper = total / requestDates.length;
  }

  const maxTrendCount = Math.max(...trends.map((t) => t.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6c7a71]">Admin</p>
        <h1 className="text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#1b1c1a]">Analytics</h1>
        <p className="mt-2 text-sm text-[#54615d]">Platform health and trends</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Total users" value={totalUsers ?? 0} />
        <Stat label="Total requests" value={totalRequests ?? 0} />
        <Stat label="Solve rate" value={`${solveRate}%`} />
        <Stat
          label="Avg time to 1st helper"
          value={avgFirstHelper != null ? `${avgFirstHelper.toFixed(1)}h` : "--"}
        />
      </div>

      <Card className="rounded-[22px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6c7a71]">
          Requests by Category
        </p>
        <h2 className="mt-2 text-base font-bold text-[#1b1c1a]">Last 30 days</h2>
        {trends.length === 0 ? (
          <p className="mt-4 text-sm text-[#54615d]">No data yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {trends.map(({ category, count }) => (
              <div key={category} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-[#54615d]">{category}</span>
                <div className="flex-1 rounded-full bg-[#efeeea] overflow-hidden h-3">
                  <div
                    className="h-3 rounded-full bg-[#006c49]"
                    style={{ width: `${(count / maxTrendCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-semibold text-[#1b1c1a]">{count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="rounded-[22px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6c7a71]">
          Signups
        </p>
        <h2 className="mt-2 text-base font-bold text-[#1b1c1a]">New users per day (last 30 days)</h2>
        {signupEntries.length === 0 ? (
          <p className="mt-4 text-sm text-[#54615d]">No signups yet.</p>
        ) : (
          <div className="mt-6 flex items-end gap-2 h-28 overflow-x-auto pb-2">
            {signupEntries.map(([day, count]) => (
              <div
                key={day}
                className="shrink-0 flex flex-col items-center gap-2"
                title={`${day}: ${count}`}
              >
                <div
                  className="w-5 rounded-t-md bg-[#006c49] opacity-80"
                  style={{ height: `${(count / maxSignups) * 80}px` }}
                />
                <span className="text-[9px] text-[#A0A0A0] rotate-45 origin-left translate-y-2">
                  {day.slice(5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="rounded-[22px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6c7a71]">
          Skill Gaps
        </p>
        <h2 className="mt-2 text-base font-bold text-[#1b1c1a]">
          Most-demanded skills with fewest helpers
        </h2>
        {gaps.length === 0 ? (
          <p className="mt-4 text-sm text-[#54615d]">No skill gaps detected.</p>
        ) : (
          <div className="mt-4 divide-y divide-[#efeeea]">
            {gaps.map(({ tag, demand, helpers }) => (
              <div key={tag} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-[#1b1c1a]">{tag}</span>
                <div className="flex gap-4 text-sm text-[#54615d]">
                  <span>{demand} open</span>
                  <span>{helpers} helpers</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
