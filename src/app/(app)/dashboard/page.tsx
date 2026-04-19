import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getUserActivitySummary, getSuggestedRequestsForUser } from "@/lib/ai/insights";
import { createAdminClient } from "@/lib/supabase/admin";
import HeroBanner from "@/components/ui/HeroBanner";
import Card from "@/components/ui/Card";
import RequestCard from "@/components/cards/RequestCard";

export default async function DashboardPage() {
  const { user, profile } = await requireOnboarded();
  const sb = await createClient();
  const admin = createAdminClient();

  const [
    { count: openRequests },
    { count: helpingCount },
    { count: helpedCount },
    { data: recentRequests },
    { data: notifications },
  ] = await Promise.all([
    sb.from("requests").select("*", { count: "exact", head: true }).eq("author_id", user.id).eq("status", "open"),
    sb.from("request_helpers").select("*", { count: "exact", head: true }).eq("helper_id", user.id).eq("status", "accepted"),
    sb.from("request_helpers").select("*", { count: "exact", head: true }).eq("helper_id", user.id).eq("status", "completed"),
    sb.from("requests").select("*").order("created_at", { ascending: false }).limit(3),
    sb.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const activity = await getUserActivitySummary(sb, user.id);
  const suggested = await getSuggestedRequestsForUser(sb, user.id);

  const requestIds = recentRequests?.map((request) => request.id) ?? [];
  const authorIds = Array.from(new Set(recentRequests?.map((request) => request.author_id) ?? []));

  const [{ data: authorRows }, { data: helperRows }] = await Promise.all([
    authorIds.length > 0
      ? admin.from("profiles").select("id, full_name, username, avatar_url, trust_score").in("id", authorIds)
      : Promise.resolve({ data: [] as never[] }),
    requestIds.length > 0
      ? admin.from("request_helpers").select("request_id").in("request_id", requestIds).eq("status", "offered")
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const authorMap = new Map((authorRows ?? []).map((row) => [row.id, row]));
  const helperCounts = new Map<string, number>();
  for (const row of helperRows ?? []) {
    helperCounts.set(row.request_id, (helperCounts.get(row.request_id) ?? 0) + 1);
  }

  const stats = [
    { label: "OPEN REQUESTS", value: openRequests ?? 0, href: "/explore?filter=my" },
    { label: "HELPING", value: helpingCount ?? 0, href: "/explore?filter=helping" },
    { label: "HELPED", value: helpedCount ?? 0, href: "/profile/me" },
    { label: "TRUST SCORE", value: profile.trust_score ?? 0, suffix: "%", href: "/leaderboard" },
  ];

  return (
    <div className="space-y-8">
      <HeroBanner
        label="Dashboard"
        title={`Welcome back, ${profile.full_name?.split(" ")[0] ?? "there"}`}
        subtitle="Here is what is moving through your community right now, including open asks, active help, and trust growth."
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="no-underline">
            <Card className="rounded-[24px] p-5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">{stat.label}</p>
              <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#171717]">
                {stat.value}
                {stat.suffix ? <span className="text-xl">{stat.suffix}</span> : null}
              </p>
            </Card>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">Recent Requests</p>
            <Link href="/explore" className="text-sm font-semibold text-[#109F88] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentRequests?.length === 0 ? (
              <Card className="rounded-[24px] p-8 text-center">
                <p className="text-sm text-[#655F57]">No requests yet.</p>
              </Card>
            ) : null}
            {recentRequests?.map((request) => {
              const author = authorMap.get(request.author_id);
              return (
                <RequestCard
                  key={request.id}
                  request={request}
                  authorName={author?.full_name ?? "Community member"}
                  authorUsername={author?.username ?? "member"}
                  authorAvatarUrl={author?.avatar_url}
                  authorTrustScore={author?.trust_score ?? 0}
                  helperCount={helperCounts.get(request.id) ?? 0}
                />
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <Card className="rounded-[24px] border-[#109F88]/20 bg-gradient-to-br from-[#109F88]/10 via-white to-[#F6F0E7] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#109F88]">AI Insights</p>
            <h3 className="mt-3 text-xl font-black tracking-[-0.03em] text-[#171717]">Your impact</h3>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between border-b border-[#109F88]/10 pb-3">
                <span className="text-[#655F57]">Trust gained (30d)</span>
                <span className="font-semibold text-[#109F88]">+{activity.trustGain}</span>
              </div>
              <div className="flex justify-between border-b border-[#109F88]/10 pb-3">
                <span className="text-[#655F57]">People helped</span>
                <span className="font-semibold text-[#171717]">{activity.helpsGiven}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#655F57]">Matching requests</span>
                <span className="font-semibold text-[#171717]">{suggested.length}</span>
              </div>
            </div>
            <Link href="/explore" className="mt-5 inline-block text-sm font-semibold text-[#109F88] hover:underline">
              View matching requests &rarr;
            </Link>
          </Card>

          <Card className="rounded-[24px] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">Quick Actions</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <QuickAction href="/requests/new" label="New Request" />
              <QuickAction href="/explore" label="Explore" />
              <QuickAction href="/messages" label="Messages" />
              <QuickAction href="/leaderboard" label="Leaderboard" />
            </div>
          </Card>

          <Card className="rounded-[24px] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">Notifications</p>
            <div className="mt-5 space-y-3">
              {notifications?.length === 0 ? (
                <p className="text-sm text-[#655F57]">No new notifications.</p>
              ) : null}
              {notifications?.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 rounded-[16px] border border-[#E7DED2] p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF8F5] text-[10px] font-bold text-[#245D51]">
                    {getNotifIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#171717]">{formatNotif(notification)}</p>
                    <p className="text-xs text-[#9B948B]">{timeAgo(notification.created_at)}</p>
                  </div>
                  {!notification.read ? <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#109F88]" /> : null}
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center rounded-[16px] bg-[#F2ECE4] px-4 py-3 text-sm font-semibold text-[#171717] transition-colors hover:bg-[#E7DED2]"
    >
      {label}
    </Link>
  );
}

function getNotifIcon(type: string) {
  switch (type) {
    case "new_helper":
      return "HL";
    case "request_solved":
      return "OK";
    case "new_message":
      return "MS";
    case "badge_earned":
      return "BD";
    case "status_change":
      return "UP";
    default:
      return "NT";
  }
}

function formatNotif(n: { type: string; payload: Record<string, unknown> }): string {
  const payload = n.payload;
  switch (n.type) {
    case "new_helper":
      return `${payload.helper_name ?? "Someone"} offered to help`;
    case "request_solved":
      return "Request marked as solved";
    case "new_message":
      return `${payload.sender_name ?? "Someone"} messaged you`;
    case "badge_earned":
      return `You earned the ${payload.badge_name ?? ""} badge`;
    case "status_change":
      return `Status changed to ${payload.new_status ?? ""}`;
    default:
      return (payload.message as string) ?? "New notification";
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
