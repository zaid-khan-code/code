import { requireOnboarded } from "@/lib/auth/guards";
import Topbar from "@/components/layout/Topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboarded();

  return (
    <div className="min-h-screen bg-[#fbf9f5]">
      <Topbar
        navLinks={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/explore", label: "Explore" },
          { href: "/leaderboard", label: "Leaderboard" },
          { href: "/messages", label: "Messages" },
          { href: "/notifications", label: "Notifications" },
          { href: "/ai", label: "AI Center" },
          { href: "/profile/me", label: "Profile", match: ["/profile"] },
        ]}
        ctaLabel="Create Request"
        ctaHref="/requests/new"
        showNotifications
      />
      <main className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1180px]">{children}</div>
      </main>
      <footer className="mt-8 border-t border-[#d7e6e0] py-5 px-6">
        <div className="mx-auto max-w-[1180px] flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-[#6c7a71]" style={{ fontFamily: "var(--font-body)" }}>
            &copy; 2026 HelpHub AI. Designed for focus.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service", "Help Center", "Support"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs text-[#6c7a71] no-underline hover:text-[#006c49]"
                style={{ fontFamily: "var(--font-body)" }}
              >{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
