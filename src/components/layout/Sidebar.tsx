import React from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const NAV: NavItem[] = [
  { href: "/dashboard",       label: "Dashboard",       icon: "⊞" },
  { href: "/explore",         label: "Explore",         icon: "🔍" },
  { href: "/requests/new",    label: "Create Request",  icon: "✦" },
  { href: "/messages",        label: "Messages",        icon: "💬" },
  { href: "/leaderboard",     label: "Leaderboard",     icon: "🏆" },
  { href: "/ai-center",       label: "AI Center",       icon: "✦" },
  { href: "/notifications",   label: "Notifications",   icon: "🔔" },
  { href: "/profile",         label: "Profile",         icon: "👤" },
];

type Props = {
  activeHref?: string;
  user?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export default function Sidebar({ activeHref, user }: Props) {
  return (
    <aside
      className="flex flex-col justify-between border-r border-[#E8E2D9] bg-white py-5 shrink-0"
      style={{ width: 220 }}
    >
      {/* Logo */}
      <div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 mb-6 no-underline"
        >
          <span
            className="flex items-center justify-center rounded-[8px] text-white font-bold text-sm"
            style={{ width: 32, height: 32, backgroundColor: "#0C9F88" }}
            aria-hidden="true"
          >
            H
          </span>
          <span className="font-semibold text-[#111111] text-sm">HelpHub AI</span>
        </Link>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 px-2">
          {NAV.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-colors no-underline",
                  active
                    ? "bg-[#F0EBE3] text-[#111111]"
                    : "text-[#6B6B6B] hover:bg-[#F5F0EA] hover:text-[#111111]",
                ].join(" ")}
              >
                <span className="text-base leading-none w-5 text-center" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User footer */}
      {user && (
        <div className="px-4 pt-4 border-t border-[#E8E2D9] flex items-center gap-3">
          <Avatar
            name={user.full_name ?? user.username ?? "U"}
            src={user.avatar_url}
            size="sm"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-[#111111] truncate">
              {user.full_name ?? user.username ?? "User"}
            </p>
            {user.username && (
              <p className="text-xs text-[#A0A0A0] truncate">@{user.username}</p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
