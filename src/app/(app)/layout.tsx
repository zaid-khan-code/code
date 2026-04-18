import { requireOnboarded } from "@/lib/auth/guards";
import Topbar from "@/components/layout/Topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboarded();

  return (
    <div className="min-h-screen">
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
    </div>
  );
}
