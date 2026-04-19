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
    <div className="min-h-screen bg-[#fbf9f5]">
      {/* Topbar */}
      <header className="bg-[#fbf9f5]/90 backdrop-blur-[20px] border-b border-[#d7e6e0]/60 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[60px]">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span
              className="w-8 h-8 bg-[#006c49] rounded-[10px] flex items-center justify-center text-sm font-black text-white"
              style={{ fontFamily: "var(--font-headline)" }}
            >H</span>
            <span
              className="text-[15px] font-bold text-[#1b1c1a] tracking-tight"
              style={{ fontFamily: "var(--font-headline)" }}
            >HelpHub AI</span>
          </Link>
          <nav className="flex items-center gap-1">
            {[
              { label: "Home", href: "/" },
              { label: "Explore", href: "/explore" },
              { label: "Leaderboard", href: "/leaderboard" },
              { label: "AI Center", href: "/ai" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-[13px] font-medium text-[#54615d] no-underline py-1.5 px-3 rounded-full hover:bg-[#efeeea] hover:text-[#1b1c1a] transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {label}
              </Link>
            ))}
            <span className="w-px h-[18px] bg-[#d7e6e0] mx-1" />
            <Link
              href="/login"
              className="text-[13px] font-medium text-[#54615d] no-underline py-1.5 px-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Live community signals
            </Link>
            <Link href="/signup">
              <Button size="sm">Join the platform</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 py-14 pb-10">
        <div className="grid grid-cols-[1fr_420px] gap-8 items-start">
          {/* Left */}
          <div>
            <p
              className="text-[11px] font-bold tracking-[0.18em] text-[#006c49] uppercase mb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              SMIT Grand Coding Night 2026
            </p>
            <h1
              className="text-[clamp(2.6rem,5vw,3.8rem)] font-extrabold leading-[1.0] tracking-[-0.04em] text-[#1b1c1a] mb-5"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Find help faster.<br />Become help that<br />matters.
            </h1>
            <p
              className="text-[14px] leading-[1.7] text-[#54615d] max-w-[460px] mb-7"
              style={{ fontFamily: "var(--font-body)" }}
            >
              HelpHub AI is a community-powered support network for students, mentors, creators, and builders. Ask for help, offer help, track impact, and let AI surface smarter matches across the platform.
            </p>
            <div className="flex gap-3 flex-wrap mb-10">
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
                { label: "SOLVED", value: `${stats.solvedThisWeek}+`, desc: "Problems resolved through community action." },
              ].map(({ label, value, desc }) => (
                <Card key={label} className="p-4 rounded-[18px]">
                  <p
                    className="text-[10px] font-bold tracking-[0.14em] text-[#6c7a71] uppercase mb-1.5"
                    style={{ fontFamily: "var(--font-body)" }}
                  >{label}</p>
                  <p
                    className="text-[22px] font-extrabold text-[#1b1c1a] tracking-tight"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >{value}</p>
                  <p
                    className="text-[11px] text-[#54615d] mt-1"
                    style={{ fontFamily: "var(--font-body)" }}
                  >{desc}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Right — dark ecosystem card */}
          <div
            className="bg-[#17302E] rounded-[24px] p-8 text-white relative overflow-hidden shadow-[0_16px_40px_rgba(23,48,46,0.16)]"
            style={{
              backgroundImage: "radial-gradient(circle at top right, rgba(16,185,129,0.14), transparent 32%)"
            }}
          >
            <div className="absolute -top-4 -right-4 w-[100px] h-[100px] bg-[#10b981] rounded-full opacity-20 blur-2xl" />
            <p
              className="text-[10px] font-bold tracking-[0.18em] text-[#6ffbbe] uppercase mb-4 relative"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Live Product Feel
            </p>
            <h2
              className="text-[1.9rem] font-extrabold leading-tight tracking-[-0.04em] mb-3.5 relative"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              More than a form.<br />More like an ecosystem.
            </h2>
            <p
              className="text-[13px] leading-relaxed text-white/60 mb-6 relative"
              style={{ fontFamily: "var(--font-body)" }}
            >
              A polished multi-page experience with AI summaries, trust scores, contribution signals, notifications, and leaderboard momentum built in Next.js and Supabase.
            </p>
            <div className="flex flex-col gap-2.5 relative">
              {[
                { title: "AI request intelligence", desc: "Auto-categorization, urgency detection, tags, rewrite suggestions, and trend snapshots." },
                { title: "Community trust graph", desc: "Badges, helper rankings, trust score boosts, and visible contribution history." },
                { title: "100% open requests matched", desc: "Top trust score active across the sample mentor network." },
              ].map(({ title, desc }) => (
                <div key={title} className="bg-white/[0.07] rounded-[14px] p-3.5 px-4 border border-white/[0.08]">
                  <p
                    className="text-[13px] font-semibold text-white mb-1"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >{title}</p>
                  <p
                    className="text-xs text-white/55 leading-relaxed"
                    style={{ fontFamily: "var(--font-body)" }}
                  >{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Flow */}
      <section className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <p
              className="text-[10px] font-bold tracking-[0.18em] text-[#006c49] uppercase mb-2"
              style={{ fontFamily: "var(--font-body)" }}
            >Core Flow</p>
            <h2
              className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-[-0.04em] text-[#1b1c1a] m-0"
              style={{ fontFamily: "var(--font-headline)" }}
            >
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
            <Card key={title} className="p-6 rounded-[20px]">
              <h3
                className="text-[15px] font-bold text-[#1b1c1a] mb-2.5"
                style={{ fontFamily: "var(--font-headline)" }}
              >{title}</h3>
              <p
                className="text-[13px] leading-relaxed text-[#54615d] m-0"
                style={{ fontFamily: "var(--font-body)" }}
              >{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Requests */}
      <section className="max-w-[1200px] mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <p
              className="text-[10px] font-bold tracking-[0.18em] text-[#006c49] uppercase mb-2"
              style={{ fontFamily: "var(--font-body)" }}
            >Featured Requests</p>
            <h2
              className="text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-[-0.04em] text-[#1b1c1a] m-0"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Community problems currently in motion
            </h2>
          </div>
          <Link href="/login">
            <Button variant="secondary">View full feed</Button>
          </Link>
        </div>

        {featuredRequests.length === 0 ? (
          <Card className="p-10 text-center rounded-[20px]">
            <p className="text-[#54615d] text-sm" style={{ fontFamily: "var(--font-body)" }}>No open requests yet. Be the first to post.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
            {featuredRequests.map((req) => (
              <Card key={req.id} className="p-5 rounded-[20px] flex flex-col gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {req.category && <Badge variant="category">{req.category}</Badge>}
                  <Badge variant={getUrgencyVariant(req.urgency)}>{req.urgency}</Badge>
                  <Badge variant={getStatusVariant(req.status)}>{req.status.replace("_", " ")}</Badge>
                </div>
                <div>
                  <h3
                    className="text-[15px] font-bold text-[#1b1c1a] mb-1.5 leading-tight"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >{req.title}</h3>
                  <p
                    className="text-[13px] text-[#54615d] leading-relaxed m-0 line-clamp-2"
                    style={{ fontFamily: "var(--font-body)" }}
                  >{req.description}</p>
                </div>
                {req.tags && req.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {req.tags.slice(0, 4).map((tag: string) => (
                      <Badge key={tag} variant="tag">{tag}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div>
                    <p
                      className="text-[13px] font-semibold text-[#1b1c1a] m-0"
                      style={{ fontFamily: "var(--font-headline)" }}
                    >{req.author?.full_name ?? "Community member"}</p>
                    <p
                      className="text-xs text-[#54615d] mt-0.5"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
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
      <footer className="border-t border-[#d7e6e0] py-6 px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 bg-[#006c49] rounded-[8px] flex items-center justify-center text-xs font-black text-white"
              style={{ fontFamily: "var(--font-headline)" }}
            >H</span>
            <span
              className="text-sm font-semibold text-[#1b1c1a]"
              style={{ fontFamily: "var(--font-headline)" }}
            >HelpHub AI</span>
          </div>
          <p
            className="text-xs text-[#6c7a71] m-0"
            style={{ fontFamily: "var(--font-body)" }}
          >
            &copy; 2026 HelpHub AI. Cultivating better workflows.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service", "Help Center", "Community Guidelines"].map((link) => (
              <Link
                key={link}
                href="#"
                className="text-xs text-[#6c7a71] no-underline hover:text-[#006c49]"
                style={{ fontFamily: "var(--font-body)" }}
              >{link}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
