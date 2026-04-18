import { requireOnboarded } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getUserActivitySummary, getSuggestedRequestsForUser } from "@/lib/ai/insights";
import Stat from "@/components/ui/Stat";
import Link from "next/link";

export default async function DashboardPage() {
  const { user, profile } = await requireOnboarded();
  const sb = await createClient();

  const [{ count: openRequests }, { count: helping }, { data: notifications }, { data: badges }] = await Promise.all([
    sb.from("requests").select("*", { count: "exact", head: true }).eq("author_id", user.id).eq("status", "open"),
    sb.from("request_helpers").select("*", { count: "exact", head: true }).eq("helper_id", user.id).eq("status", "accepted"),
    sb.from("notifications").select("*, requests(title)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    sb.from("user_badges").select("*, badges(*)").eq("user_id", user.id),
  ]);

  const activity = await getUserActivitySummary(sb, user.id);
  const suggested = await getSuggestedRequestsForUser(sb, user.id);

  const stats = [
    { label: "Open requests", value: openRequests ?? 0, href: "/explore?status=open&author=" + user.id },
    { label: "Helping", value: helping ?? 0, href: "/explore?helper=" + user.id },
    { label: "Trust score", value: profile.trust_score ?? 0, suffix: "pts", href: "/leaderboard" },
    { label: "Badges", value: badges?.length ?? 0, href: "/profile/" + profile.username },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[#111111]">Welcome back, {profile.full_name?.split(" ")[0] ?? "there"}</h1>
        <p className="text-sm text-[#6B6B6B]">Here&apos;s what&apos;s happening in your community</p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className="no-underline">
            <Stat label={stat.label} value={stat.value} suffix={stat.suffix} />
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-[#111111] mb-4">Recent activity</h2>
          <div className="space-y-3">
            {notifications?.length === 0 && (
              <p className="text-sm text-[#6B6B6B] p-4 bg-white rounded-[14px] border border-[#E8E2D9]">No recent activity</p>
            )}
            {notifications?.map(n => (
              <div key={n.id} className="p-4 bg-white rounded-[14px] border border-[#E8E2D9] flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D1FAF4] flex items-center justify-center text-sm">
                  {n.type === "new_helper" && "🤝"}
                  {n.type === "request_solved" && "✅"}
                  {n.type === "new_message" && "💬"}
                  {n.type === "badge_earned" && "🏆"}
                  {n.type === "status_change" && "🔄"}
                  {n.type === "system" && "📢"}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#111111]">{formatNotif(n)}</p>
                  <p className="text-xs text-[#A0A0A0]">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-[#0C9F88]"></div>}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="p-5 bg-gradient-to-br from-[#0C9F88]/10 to-[#F5F0EA] rounded-[14px] border border-[#0C9F88]/20">
            <h3 className="font-semibold text-[#111111] mb-3">AI Insights</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Trust gained (30d)</span>
                <span className="font-medium text-[#0C9F88]">+{activity.trustGain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">People helped</span>
                <span className="font-medium">{activity.helpsGiven}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Matching requests</span>
                <span className="font-medium">{suggested.length}</span>
              </div>
            </div>
            <Link href="/explore" className="inline-block mt-4 text-sm font-medium text-[#0C9F88] hover:underline">
              View matching requests →
            </Link>
          </div>

          <div className="p-5 bg-white rounded-[14px] border border-[#E8E2D9]">
            <h3 className="font-semibold text-[#111111] mb-3">Quick actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction href="/requests/new" icon="➕" label="New request" />
              <QuickAction href="/explore" icon="🔍" label="Explore" />
              <QuickAction href="/messages" icon="💬" label="Messages" />
              <QuickAction href="/leaderboard" icon="🏆" label="Leaderboard" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 p-4 rounded-[10px] bg-[#F0EBE3] hover:bg-[#E8E2D9] transition-colors no-underline">
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium text-[#111111]">{label}</span>
    </Link>
  );
}

function formatNotif(n: { type: string; payload: Record<string, unknown> }): string {
  const p = n.payload;
  switch (n.type) {
    case "new_helper": return `${p.helper_name ?? "Someone"} offered to help on "${p.request_title ?? "your request"}"`;
    case "request_solved": return `Your request "${p.request_title ?? ""}" was marked solved`;
    case "new_message": return `${p.sender_name ?? "Someone"} sent you a message`;
    case "badge_earned": return `You earned the ${p.badge_name ?? ""} badge!`;
    case "status_change": return `"${p.request_title ?? ""}" status changed to ${p.new_status ?? ""}`;
    default: return p.message as string ?? "New notification";
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
