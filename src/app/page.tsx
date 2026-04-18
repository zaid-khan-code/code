import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const revalidate = 60;

async function getCommunityStats() {
  const supabase = await createClient();
  const [
    { count: totalMembers },
    { count: openRequests },
    { count: solvedThisWeek },
    { count: helpOffered },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("requests").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("requests").select("*", { count: "exact", head: true }).eq("status", "solved").gte("solved_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("request_helpers").select("*", { count: "exact", head: true }),
  ]);
  return {
    totalMembers: totalMembers ?? 0,
    openRequests: openRequests ?? 0,
    solvedThisWeek: solvedThisWeek ?? 0,
    helpOffered: helpOffered ?? 0,
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

async function getFeaturedHelpers() {
  const supabase = await createClient();
  const { data: helpers } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url, trust_score")
    .order("trust_score", { ascending: false })
    .limit(4);
  return helpers ?? [];
}

const urgencyColors: Record<string, string> = {
  critical: "#EF4444",
  high: "#F97316",
  medium: "#F59E0B",
  low: "#10B981",
};

const statusColors: Record<string, string> = {
  open: "#10B981",
  solved: "#6B7280",
  in_progress: "#3B82F6",
  closed: "#6B7280",
};

export default async function LandingPage() {
  const [stats, featuredRequests] = await Promise.all([
    getCommunityStats(),
    getFeaturedRequests(),
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EA", fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
      {/* Topbar */}
      <header style={{ background: "#F5F0EA", borderBottom: "1px solid #E8E2D9", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "32px", height: "32px", background: "#0C9F88", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, color: "#fff" }}>H</div>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#111111", letterSpacing: "-0.01em" }}>Helplytics AI</span>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {[
              { label: "Home", href: "/" },
              { label: "Explore", href: "/explore" },
              { label: "Leaderboard", href: "/leaderboard" },
              { label: "AI Center", href: "/ai" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{ fontSize: "13px", fontWeight: 500, color: "#6B6B6B", textDecoration: "none", padding: "6px 12px", borderRadius: "999px" }}>
                {label}
              </Link>
            ))}
            <span style={{ width: "1px", height: "18px", background: "#E8E2D9", margin: "0 4px" }} />
            <Link href="/login" style={{ fontSize: "13px", fontWeight: 500, color: "#6B6B6B", textDecoration: "none", padding: "6px 12px" }}>
              Live community signals
            </Link>
            <Link href="/signup" style={{ fontSize: "13px", fontWeight: 600, color: "#fff", background: "#0C9F88", textDecoration: "none", padding: "8px 18px", borderRadius: "999px" }}>
              Join the platform
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "32px", alignItems: "start" }}>
          {/* Left */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", color: "#0C9F88", textTransform: "uppercase", marginBottom: "18px" }}>
              SMIT Grand Coding Night 2026
            </p>
            <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "#111111", margin: "0 0 20px" }}>
              Find help faster.<br />Become help that<br />matters.
            </h1>
            <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#6B6B6B", maxWidth: "460px", margin: "0 0 28px" }}>
              Helplytics AI is a community-powered support network for students, mentors, creators, and builders. Ask for help, offer help, track impact, and let AI surface smarter matches across the platform.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "36px" }}>
              <Link href="/login" style={{ fontSize: "14px", fontWeight: 600, color: "#fff", background: "#0C9F88", textDecoration: "none", padding: "12px 24px", borderRadius: "999px" }}>
                Open product demo
              </Link>
              <Link href="/signup" style={{ fontSize: "14px", fontWeight: 600, color: "#111111", background: "#fff", border: "1px solid #E8E2D9", textDecoration: "none", padding: "12px 24px", borderRadius: "999px" }}>
                Post a request
              </Link>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", maxWidth: "420px" }}>
              {[
                { label: "MEMBERS", value: `${stats.totalMembers}+` },
                { label: "REQUESTS", value: `${stats.openRequests}+` },
                { label: "SOLVED", value: `${stats.solvedThisWeek}+` },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#fff", border: "1px solid #E8E2D9", borderRadius: "14px", padding: "16px" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: "#A0A0A0", textTransform: "uppercase", marginBottom: "6px" }}>{label}</p>
                  <p style={{ fontSize: "22px", fontWeight: 900, color: "#111111", letterSpacing: "-0.03em" }}>{value}</p>
                  <p style={{ fontSize: "11px", color: "#6B6B6B", marginTop: "4px" }}>
                    {label === "MEMBERS" ? "Students, mentors, and helpers in the loop." : label === "REQUESTS" ? "Support posts shared across learning journeys." : "Problems resolved through fast community action."}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — dark ecosystem card */}
          <div style={{ background: "#1A2E2C", borderRadius: "20px", padding: "32px", color: "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "#F2B648", borderRadius: "50%", opacity: 0.9 }} />
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#8ED9CC", textTransform: "uppercase", marginBottom: "16px", position: "relative" }}>
              Live Product Feel
            </p>
            <h2 style={{ fontSize: "1.9rem", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "14px", position: "relative" }}>
              More than a form.<br />More like an ecosystem.
            </h2>
            <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(255,255,255,0.65)", marginBottom: "24px", position: "relative" }}>
              A polished multi-page experience with AI summaries, trust scores, contribution signals, notifications, and leaderboard momentum built directly in Next.js and Supabase.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", position: "relative" }}>
              {[
                { title: "AI request intelligence", desc: "Auto-categorization, urgency detection, tags, rewrite suggestions, and trend snapshots." },
                { title: "Community trust graph", desc: "Badges, helper rankings, trust score boosts, and visible contribution history." },
                { title: "100% open requests matched", desc: "Top trust score active across the sample mentor network." },
              ].map(({ title, desc }) => (
                <div key={title} style={{ background: "rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{title}</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Flow */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#0C9F88", textTransform: "uppercase", marginBottom: "8px" }}>Core Flow</p>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#111111", margin: 0 }}>
              From struggling alone to solving together
            </h2>
          </div>
          <Link href="/signup" style={{ fontSize: "13px", fontWeight: 600, color: "#111111", background: "#fff", border: "1px solid #E8E2D9", textDecoration: "none", padding: "10px 18px", borderRadius: "999px", whiteSpace: "nowrap" }}>
            Try onboarding AI
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            { title: "Ask for help clearly", desc: "Create structured requests with category, urgency, AI suggestions, and tags that attract the right people." },
            { title: "Discover the right people", desc: "Use the explore feed, helper lists, notifications, and messaging to move quickly once a match happens." },
            { title: "Track real contribution", desc: "Trust scores, badges, solved requests, and rankings help the community recognize meaningful support." },
          ].map(({ title, desc }) => (
            <div key={title} style={{ background: "#fff", border: "1px solid #E8E2D9", borderRadius: "16px", padding: "28px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "10px" }}>{title}</h3>
              <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#6B6B6B", margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Requests */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#0C9F88", textTransform: "uppercase", marginBottom: "8px" }}>Featured Requests</p>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#111111", margin: 0 }}>
              Community problems currently in motion
            </h2>
          </div>
          <Link href="/login" style={{ fontSize: "13px", fontWeight: 600, color: "#111111", background: "#fff", border: "1px solid #E8E2D9", textDecoration: "none", padding: "10px 18px", borderRadius: "999px", whiteSpace: "nowrap" }}>
            View full feed
          </Link>
        </div>

        {featuredRequests.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #E8E2D9", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
            <p style={{ color: "#6B6B6B", fontSize: "14px" }}>No open requests yet. Be the first to post.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {featuredRequests.map((req) => (
              <div key={req.id} style={{ background: "#fff", border: "1px solid #E8E2D9", borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {req.category && (
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#111111", background: "#F0EBE3", padding: "3px 10px", borderRadius: "999px" }}>{req.category}</span>
                  )}
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#fff", background: urgencyColors[req.urgency] ?? "#6B7280", padding: "3px 10px", borderRadius: "999px" }}>{req.urgency}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#fff", background: statusColors[req.status] ?? "#6B7280", padding: "3px 10px", borderRadius: "999px" }}>{req.status.replace("_", " ")}</span>
                </div>
                {/* Title + desc */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111111", margin: "0 0 6px", lineHeight: 1.3 }}>{req.title}</h3>
                  <p style={{ fontSize: "13px", color: "#6B6B6B", lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{req.description}</p>
                </div>
                {/* Skill tags */}
                {req.tags && req.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {req.tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} style={{ fontSize: "11px", color: "#6B6B6B", background: "#F7F2EC", padding: "2px 8px", borderRadius: "999px" }}>{tag}</span>
                    ))}
                  </div>
                )}
                {/* Footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", margin: 0 }}>{req.author?.full_name ?? "Community member"}</p>
                    <p style={{ fontSize: "12px", color: "#6B6B6B", margin: "2px 0 0" }}>{req.author?.location ?? "Community"} · {req.helperCount} helper{req.helperCount !== 1 ? "s" : ""} interested</p>
                  </div>
                  <Link href={`/login`} style={{ fontSize: "12px", fontWeight: 600, color: "#111111", textDecoration: "none", border: "1px solid #E8E2D9", padding: "6px 14px", borderRadius: "999px", background: "#fff", whiteSpace: "nowrap" }}>
                    Open details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #E8E2D9", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#A0A0A0", margin: 0 }}>
          Helplytics AI is built as a premium-feel, multi-page community support product using Next.js and Supabase.
        </p>
      </footer>
    </div>
  );
}
