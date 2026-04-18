import Link from "next/link";
import Image from "next/image";
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

async function getFeaturedHelpers() {
  const supabase = await createClient();

  const { data: helpers } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url, trust_score")
    .order("trust_score", { ascending: false })
    .limit(4);

  if (!helpers) return [];

  // Get badge counts for each helper
  const helpersWithBadges = await Promise.all(
    helpers.map(async (helper) => {
      const { count: badgeCount } = await supabase
        .from("user_badges")
        .select("*", { count: "exact", head: true })
        .eq("user_id", helper.id);

      return {
        ...helper,
        badgeCount: badgeCount ?? 0,
      };
    })
  );

  return helpersWithBadges;
}

export default async function LandingPage() {
  const stats = await getCommunityStats();
  const featuredHelpers = await getFeaturedHelpers();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Topbar */}
      <header style={topbarStyle}>
        <div style={containerStyle}>
          <div style={topbarInnerStyle}>
            <Link href="/" style={logoStyle}>
              Helplytics
            </Link>

            <nav style={navStyle}>
              <Link href="#how-it-works" style={navLinkStyle}>
                Features
              </Link>
              <Link href="/leaderboard" style={navLinkStyle}>
                Leaderboard
              </Link>
              <Link href="/login" style={navLinkStyle}>
                Login
              </Link>
              <Link href="/signup" style={navButtonStyle}>
                Signup
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div style={containerStyle}>
          <div style={heroContentStyle}>
            <h1 style={heroTitleStyle}>Ask for help. Offer what you know.</h1>
            <p style={heroSubtitleStyle}>
              A community where knowledge moves both ways.
            </p>
            <div style={heroCtaStyle}>
              <Link href="/signup" style={primaryButtonStyle}>
                Get started
              </Link>
              <Link href="/login" style={secondaryButtonStyle}>
                Explore community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <div style={statsGridStyle}>
            <div style={statCardStyle}>
              <div style={statValueStyle}>{stats.totalMembers.toLocaleString()}</div>
              <div style={statLabelStyle}>Community Members</div>
            </div>
            <div style={statCardStyle}>
              <div style={statValueStyle}>{stats.openRequests.toLocaleString()}</div>
              <div style={statLabelStyle}>Open Requests</div>
            </div>
            <div style={statCardStyle}>
              <div style={statValueStyle}>{stats.solvedThisWeek.toLocaleString()}</div>
              <div style={statLabelStyle}>Solved This Week</div>
            </div>
            <div style={statCardStyle}>
              <div style={statValueStyle}>{stats.helpOffered.toLocaleString()}</div>
              <div style={statLabelStyle}>Help Offered</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={sectionStyle}>
        <div style={containerStyle}>
          <h2 style={sectionTitleStyle}>How it works</h2>
          <div style={stepsGridStyle}>
            <div style={stepCardStyle}>
              <div style={stepNumberStyle}>1</div>
              <h3 style={stepTitleStyle}>Post your question</h3>
              <p style={stepDescStyle}>
                Share what you need help with. Add details, tags, and urgency to get the right match.
              </p>
            </div>
            <div style={stepCardStyle}>
              <div style={stepNumberStyle}>2</div>
              <h3 style={stepTitleStyle}>Get matched with helpers</h3>
              <p style={stepDescStyle}>
                AI-powered matching connects you to community members with the right skills.
              </p>
            </div>
            <div style={stepCardStyle}>
              <div style={stepNumberStyle}>3</div>
              <h3 style={stepTitleStyle}>Solve and pay it forward</h3>
              <p style={stepDescStyle}>
                Get the help you need, then help others to build your trust score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Helpers */}
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <h2 style={sectionTitleStyle}>Featured helpers</h2>
          <p style={sectionSubtitleStyle}>Top community members by trust score</p>
          <div style={helpersGridStyle}>
            {featuredHelpers.map((helper) => (
              <Link
                key={helper.id}
                href={`/profile/${helper.username ?? helper.id}`}
                style={helperCardStyle}
              >
                <div style={helperAvatarStyle}>
                  {helper.avatar_url ? (
                    <Image
                      src={helper.avatar_url}
                      alt={helper.full_name ?? "User"}
                      width={64}
                      height={64}
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={avatarPlaceholderStyle}>
                      {(helper.full_name ?? helper.username ?? "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div style={helperNameStyle}>{helper.full_name ?? helper.username}</div>
                <div style={helperTrustStyle}>{helper.trust_score} trust</div>
                {helper.badgeCount > 0 && (
                  <div style={helperBadgesStyle}>{helper.badgeCount} badges</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={containerStyle}>
          <div style={footerInnerStyle}>
            <span style={footerLogoStyle}>Helplytics</span>
            <span style={footerYearStyle}>2026</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={footerLinkStyle}
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Styles using design tokens
const containerStyle: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 24px",
};

const topbarStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  borderBottom: "1px solid var(--color-border)",
  position: "sticky",
  top: 0,
  zIndex: 100,
};

const topbarInnerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "64px",
};

const logoStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "var(--color-brand)",
  textDecoration: "none",
  letterSpacing: "-0.02em",
};

const navStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
};

const navLinkStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  color: "var(--color-text-muted)",
  textDecoration: "none",
  transition: "color 0.15s",
};

const navButtonStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "var(--color-brand-fg)",
  background: "var(--color-brand)",
  padding: "8px 16px",
  borderRadius: "var(--radius-pill)",
  textDecoration: "none",
};

const heroSectionStyle: React.CSSProperties = {
  padding: "80px 0 64px",
  background: `linear-gradient(180deg, rgba(12,159,136,0.06) 0%, var(--color-bg) 100%)`,
};

const heroContentStyle: React.CSSProperties = {
  maxWidth: "640px",
};

const heroTitleStyle: React.CSSProperties = {
  fontSize: "48px",
  fontWeight: 700,
  lineHeight: 1.15,
  margin: "0 0 20px",
  color: "var(--color-text)",
  letterSpacing: "-0.02em",
};

const heroSubtitleStyle: React.CSSProperties = {
  fontSize: "20px",
  lineHeight: 1.5,
  margin: "0 0 32px",
  color: "var(--color-text-muted)",
};

const heroCtaStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  flexWrap: "wrap",
};

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 28px",
  fontSize: "15px",
  fontWeight: 600,
  color: "var(--color-brand-fg)",
  background: "var(--color-brand)",
  borderRadius: "var(--radius-pill)",
  textDecoration: "none",
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 28px",
  fontSize: "15px",
  fontWeight: 600,
  color: "var(--color-text)",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-pill)",
  textDecoration: "none",
};

const sectionStyle: React.CSSProperties = {
  padding: "64px 0",
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
};

const statCardStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
  textAlign: "center",
};

const statValueStyle: React.CSSProperties = {
  fontSize: "36px",
  fontWeight: 700,
  color: "var(--color-brand)",
  marginBottom: "8px",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "var(--color-text-muted)",
  fontWeight: 500,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 700,
  margin: "0 0 16px",
  color: "var(--color-text)",
  textAlign: "center",
};

const sectionSubtitleStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "var(--color-text-muted)",
  margin: "0 0 32px",
  textAlign: "center",
};

const stepsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "24px",
  marginTop: "40px",
};

const stepCardStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: "32px",
  textAlign: "center",
};

const stepNumberStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "var(--color-brand)",
  color: "var(--color-brand-fg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  fontWeight: 700,
  margin: "0 auto 20px",
};

const stepTitleStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 600,
  margin: "0 0 12px",
  color: "var(--color-text)",
};

const stepDescStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.6,
  color: "var(--color-text-muted)",
  margin: 0,
};

const helpersGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginTop: "40px",
};

const helperCardStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
  textAlign: "center",
  textDecoration: "none",
  transition: "box-shadow 0.15s",
};

const helperAvatarStyle: React.CSSProperties = {
  width: "64px",
  height: "64px",
  margin: "0 auto 16px",
  borderRadius: "50%",
  overflow: "hidden",
};

const avatarPlaceholderStyle: React.CSSProperties = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  background: "var(--color-surface2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: 600,
  color: "var(--color-brand)",
  margin: "0 auto 16px",
};

const helperNameStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 600,
  color: "var(--color-text)",
  marginBottom: "4px",
};

const helperTrustStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "var(--color-text-muted)",
  marginBottom: "4px",
};

const helperBadgesStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "var(--color-brand)",
  fontWeight: 500,
};

const footerStyle: React.CSSProperties = {
  marginTop: "auto",
  padding: "24px 0",
  borderTop: "1px solid var(--color-border)",
};

const footerInnerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "16px",
};

const footerLogoStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: "var(--color-text)",
};

const footerYearStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "var(--color-text-muted)",
};

const footerLinkStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "var(--color-text-muted)",
  textDecoration: "none",
};
