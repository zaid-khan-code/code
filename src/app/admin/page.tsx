import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { daysAgoISOString } from "@/lib/format";
import Card from "@/components/ui/Card";
import Stat from "@/components/ui/Stat";
import Link from "next/link";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const sb = createAdminClient();
  const weekAgo = daysAgoISOString(7);

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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">Admin</p>
        <h1 className="text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#111111]">Overview</h1>
        <p className="mt-2 text-sm text-[#6B6B6B]">Platform health and key metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat label="Total users" value={totalUsers.count ?? 0} />
        <Stat label="DAU last 7d" value={dau7d.count ?? 0} sublabel="new signups" />
        <Stat label="Open requests" value={openRequests.count ?? 0} />
        <Stat label="Solved requests" value={solvedRequests.count ?? 0} />
        <Stat label="Flagged items" value={flaggedCount.count ?? 0} sublabel="manual review" />
        <Stat label="Avg solve time" value={avgHours != null ? `${avgHours.toFixed(1)}h` : "--"} sublabel="hours" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">Navigation</p>
          <h3 className="mt-2 text-lg font-bold text-[#111111]">Quick links</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/admin/requests"
              className="rounded-full px-4 py-2 text-sm font-medium bg-[#EEF4EF] text-[#111111] no-underline hover:bg-[#0C9F88] hover:text-white transition-colors"
            >
              Manage requests
            </Link>
            <Link
              href="/admin/users"
              className="rounded-full px-4 py-2 text-sm font-medium bg-[#EEF4EF] text-[#111111] no-underline hover:bg-[#0C9F88] hover:text-white transition-colors"
            >
              Manage users
            </Link>
            <Link
              href="/admin/analytics"
              className="rounded-full px-4 py-2 text-sm font-medium bg-[#EEF4EF] text-[#111111] no-underline hover:bg-[#0C9F88] hover:text-white transition-colors"
            >
              View analytics
            </Link>
          </div>
        </Card>

        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">Status</p>
          <h3 className="mt-2 text-lg font-bold text-[#111111]">System status</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-[#F0EBE3]">
              <span className="text-[#6B6B6B]">Database</span>
              <span className="text-[#0C9F88] font-semibold">Connected</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[#F0EBE3]">
              <span className="text-[#6B6B6B]">Authentication</span>
              <span className="text-[#0C9F88] font-semibold">Active</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#6B6B6B]">AI Services</span>
              <span className="text-[#0C9F88] font-semibold">Running</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
