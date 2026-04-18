import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import Stat from "@/components/ui/Stat";
import Card from "@/components/ui/Card";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const sb = createAdminClient();
  // eslint-disable-next-line react-hooks/purity
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalUsers,
    dau7d,
    openRequests,
    solvedRequests,
    flaggedCount,
    avgSolveTime,
  ] = await Promise.all([
    sb.from("profiles").select("id", { count: "exact", head: true }),
    sb
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    sb.from("requests").select("id", { count: "exact", head: true }).eq("status", "open"),
    sb.from("requests").select("id", { count: "exact", head: true }).eq("status", "solved"),
    Promise.resolve({ count: 0 }),
    sb.from("requests").select("created_at, solved_at").eq("status", "solved").not("solved_at", "is", null).limit(100),
  ]);

  const solvedRows = avgSolveTime.data ?? [];
  const avgHours = solvedRows.length > 0
    ? solvedRows.reduce((sum, r) => {
        const ms = new Date(r.solved_at!).getTime() - new Date(r.created_at).getTime();
        return sum + ms / 3600000;
      }, 0) / solvedRows.length
    : null;

  const stats = [
    { label: "Total users", value: totalUsers.count ?? 0 },
    { label: "DAU last 7d", value: dau7d.count ?? 0, sublabel: "new signups" },
    { label: "Open requests", value: openRequests.count ?? 0 },
    { label: "Solved requests", value: solvedRequests.count ?? 0 },
    { label: "Flagged items", value: flaggedCount.count ?? 0, sublabel: "manual review" },
    { label: "Avg solve time", value: avgHours != null ? `${avgHours.toFixed(1)}h` : "--", sublabel: "hours" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#111111]">Overview</h1>
        <p className="text-sm text-[#6B6B6B]">Platform health and key metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Stat key={s.label} label={s.label} value={s.value} sublabel={s.sublabel} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-[#111111] mb-3">Quick links</h3>
          <div className="flex flex-wrap gap-2">
            <a href="/admin/requests" className="text-sm text-[#0C9F88] hover:underline">Manage requests</a>
            <span className="text-[#E8E2D9]">|</span>
            <a href="/admin/users" className="text-sm text-[#0C9F88] hover:underline">Manage users</a>
            <span className="text-[#E8E2D9]">|</span>
            <a href="/admin/analytics" className="text-sm text-[#0C9F88] hover:underline">View analytics</a>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[#111111] mb-3">System status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B6B6B]">Database</span>
              <span className="text-[#0C9F88] font-medium">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6B6B]">Auth</span>
              <span className="text-[#0C9F88] font-medium">Active</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
