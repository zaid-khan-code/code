import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { daysAgoISOString } from "@/lib/format";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export const revalidate = 60;

async function getCommunityStats() {
  const supabase = await createClient();
  const [
    { count: totalMembers },
    { count: openRequests },
    { count: solvedThisWeek },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("requests").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("requests").select("*", { count: "exact", head: true }).eq("status", "solved").gte("solved_at", daysAgoISOString(7)),
  ]);
  return {
    totalMembers: totalMembers ?? 0,
    openRequests: openRequests ?? 0,
    solvedThisWeek: solvedThisWeek ?? 0,
  };
}

async function getFeaturedRequests() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("requests")
    .select("id, title, description, category, urgency, status, tags, location, author_id, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(3);
  if (!requests || requests.length === 0) return [];
  const authorIds = [...new Set(requests.map((r) => r.author_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, location")
    .in("id", authorIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const requestIds = requests.map((r) => r.id);
  const { data: helpers } = await supabase
    .from("request_helpers")
    .select("request_id")
    .in("request_id", requestIds);
  const helperCounts = new Map<string, number>();
  for (const h of helpers ?? []) {
    helperCounts.set(h.request_id, (helperCounts.get(h.request_id) ?? 0) + 1);
  }
  return requests.map((r) => ({
    ...r,
    author: profileMap.get(r.author_id),
    helperCount: helperCounts.get(r.id) ?? 0,
  }));
}

function getUrgencyVariant(urgency: string): "low" | "medium" | "high" | "critical" | "default" {
  if (urgency === "critical") return "critical";
  if (urgency === "high") return "high";
  if (urgency === "medium") return "medium";
  if (urgency === "low") return "low";
  return "default";
}

function getStatusVariant(status: string): "open" | "in_progress" | "solved" | "closed" | "default" {
  if (status === "solved") return "solved";
  if (status === "in_progress") return "in_progress";
  if (status === "closed") return "closed";
  if (status === "open") return "open";
  return "default";
}

export default async function LandingPage() {
  const [stats, featuredRequests] = await Promise.all([
    getCommunityStats(),
    getFeaturedRequests(),
  ]);

  return (
    <div className="min-h-screen bg-[#F5F0EA]">
      {/* Topbar */}
      <header className="bg-[#F5F0EA] border-b border-[#E8E2D9] sticky top-0 z-100">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[60px]">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 bg-[#0C9F88] rounded-lg flex items-center justify-center text-base font-extrabold text-white">H</div>
            <span className="text-[15px] font-bold text-[#111111] tracking-tight">HelpHub AI</span>
          </Link>
          <nav className="flex items-center gap-2">
            {[
              { label: "Home", href: "/" },
              { label: "Explore", href: "/explore" },
              { label: "Leaderboard", href: "/leaderboard" },
              { label: "AI Center", href: "/ai" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="text-[13px] font-medium text-[#6B6B6B] no-underline py-1.5 px-3 rounded-full hover:bg-white/50 transition-colors">
                {label}
              </Link>
            ))}
            <span className="w-px h-[18px] bg-[#E8E2D9] mx-1" />
            <Link href="/login" className="text-[13px] font-medium text-[#6B6B6B] no-underline py-1.5 px-3">
              Live community signals
            </Link>
            <Link href="/signup">
              <Button size="sm">Join the platform</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 py-12 pb-10">
        <div className="grid grid-cols-[1fr_420px] gap-8 items-start">
          {/* Left */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#0C9F88] uppercase mb-4">
              SMIT Grand Coding Night 2026
            </p>
            <h1 className="text-[clamp(2.4rem,5vw,3.5rem)] font-black leading-none tracking-tight text-[#111111] mb-5">
              Find help faster.<br />Become help that<br />matters.
            </h1>
            <p className="text-sm leading-relaxed text-[#6B6B6B] max-w-[460px] mb-7">
              HelpHub AI is a community-powered support network for students, mentors, creators, and builders. Ask for help, offer help, track impact, and let AI surface smarter matches across the platform.
            </p>
            <div className="flex gap-3 flex-wrap mb-9">
              <Link href="/login">
                <Button size="lg">Open product demo</Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary" size="lg">Post a request</Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 max-w-[420px]">
              {[
                { label: "MEMBERS", value: `${stats.totalMembers}+`, desc: "Students, mentors, and helpers in the loop." },
                { label: "REQUESTS", value: `${stats.openRequests}+`, desc: "Support posts shared across learning journeys." },
                { label: "SOLVED", value: `${stats.solvedThisWeek}+`, desc: "Problems resolved through fast community action." },
              ].map(({ label, value, desc }) => (
                <Card key={label} className="p-4">
                  <p className="text-[10px] font-bold tracking-[0.14em] text-[#A0A0A0] uppercase mb-1.5">{label}</p>
                  <p className="text-[22px] font-black text-[#111111] tracking-tight">{value}</p>
                  <p className="text-[11px] text-[#6B6B6B] mt-1">{desc}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Right — dark ecosystem card */}
          <div className="bg-[#1A2E2C] rounded-[22px] p-8 text-white relative overflow-hidden shadow-[0_12px_28px_rgba(17,17,17,0.04)]">
            <div className="absolute -top-5 -right-5 w-[120px] h-[120px] bg-[#F2B648] rounded-full opacity-90" />
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#8ED9CC] uppercase mb-4 relative">
              Live Product Feel
            </p>
            <h2 className="text-[1.9rem] font-black leading-tight tracking-tight mb-3.5 relative">
              More than a form.<br />More like an ecosystem.
            </h2>
            <p className="text-[13px] leading-relaxed text-white/65 mb-6 relative">
              A polished multi-page experience with AI summaries, trust scores, contribution signals, notifications, and leaderboard momentum built directly in Next.js and Supabase.
            </p>
            <div className="flex flex-col gap-2.5 relative">
              {[
                { title: "AI request intelligence", desc: "Auto-categorization, urgency detection, tags, rewrite suggestions, and trend snapshots." },
                { title: "Community trust graph", desc: "Badges, helper rankings, trust score boosts, and visible contribution history." },
                { title: "100% open requests matched", desc: "Top trust score active across the sample mentor network." },
              ].map(({ title, desc }) => (
                <div key={title} className="bg-white/[0.07] rounded-xl p-3.5 px-4">
                  <p className="text-[13px] font-bold text-white mb-1">{title}</p>
                  <p className="text-xs text-white/60 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Flow */}
      <section className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#0C9F88] uppercase mb-2">Core Flow</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-black tracking-tight text-[#111111] m-0">
              From struggling alone to solving together
            </h2>
          </div>
          <Link href="/signup">
            <Button variant="secondary">Try onboarding AI</Button>
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          {[
            { title: "Ask for help clearly", desc: "Create structured requests with category, urgency, AI suggestions, and tags that attract the right people." },
            { title: "Discover the right people", desc: "Use the explore feed, helper lists, notifications, and messaging to move quickly once a match happens." },
            { title: "Track real contribution", desc: "Trust scores, badges, solved requests, and rankings help the community recognize meaningful support." },
          ].map(({ title, desc }) => (
            <Card key={title} className="p-7 rounded-[22px]">
              <h3 className="text-base font-bold text-[#111111] mb-2.5">{title}</h3>
              <p className="text-[13px] leading-relaxed text-[#6B6B6B] m-0">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Requests */}
      <section className="max-w-[1200px] mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#0C9F88] uppercase mb-2">Featured Requests</p>
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-black tracking-tight text-[#111111] m-0">
              Community problems currently in motion
            </h2>
          </div>
          <Link href="/login">
            <Button variant="secondary">View full feed</Button>
          </Link>
        </div>

        {featuredRequests.length === 0 ? (
          <Card className="p-10 text-center rounded-[22px]">
            <p className="text-[#6B6B6B] text-sm">No open requests yet. Be the first to post.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
            {featuredRequests.map((req) => (
              <Card key={req.id} className="p-5 rounded-[22px] flex flex-col gap-3">
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {req.category && <Badge variant="category">{req.category}</Badge>}
                  <Badge variant={getUrgencyVariant(req.urgency)}>{req.urgency}</Badge>
                  <Badge variant={getStatusVariant(req.status)}>{req.status.replace("_", " ")}</Badge>
                </div>
                {/* Title + desc */}
                <div>
                  <h3 className="text-[15px] font-bold text-[#111111] mb-1.5 leading-tight">{req.title}</h3>
                  <p className="text-[13px] text-[#6B6B6B] leading-relaxed m-0 line-clamp-2">{req.description}</p>
                </div>
                {/* Skill tags */}
                {req.tags && req.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {req.tags.slice(0, 4).map((tag: string) => (
                      <Badge key={tag} variant="tag">{tag}</Badge>
                    ))}
                  </div>
                )}
                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div>
                    <p className="text-[13px] font-semibold text-[#111111] m-0">{req.author?.full_name ?? "Community member"}</p>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      {req.author?.location ?? "Community"} &middot; {req.helperCount} helper{req.helperCount !== 1 ? "s" : ""} interested
                    </p>
                  </div>
                  <Link href="/login">
                    <Button variant="secondary" size="sm">Open details</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D9] py-5 px-6 text-center">
        <p className="text-xs text-[#A0A0A0] m-0">
          HelpHub AI is built as a premium-feel, multi-page community support product using Next.js and Supabase.
        </p>
      </footer>
    </div>
  );
}
