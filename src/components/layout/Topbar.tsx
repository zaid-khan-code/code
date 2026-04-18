import React from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";

type Props = {
  navLinks: { href: string; label: string }[];
  activeHref?: string;
  ctaLabel?: string;
  ctaHref?: string;
  user?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export default function Topbar({
  navLinks,
  activeHref,
  ctaLabel,
  ctaHref,
  user,
}: Props) {
  return (
    <header className="w-full bg-white border-b border-[#E8E2D9] px-6 h-14 flex items-center justify-between gap-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0 no-underline">
        <span
          className="flex items-center justify-center rounded-[8px] text-white font-bold text-sm"
          style={{ width: 32, height: 32, backgroundColor: "#0C9F88" }}
          aria-hidden="true"
        >
          H
        </span>
        <span className="font-semibold text-[#111111] text-sm">Helplytics AI</span>
      </Link>

      {/* Nav */}
      <nav className="flex items-center gap-1">
        {navLinks.map((link) => {
          const active = link.href === activeHref;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={[
                "px-3 py-1.5 rounded-[999px] text-sm font-medium transition-colors no-underline",
                active
                  ? "bg-[#F0EBE3] text-[#111111]"
                  : "text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F5F0EA]",
              ].join(" ")}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        {user && (
          <Avatar
            name={user.full_name ?? user.username ?? "U"}
            src={user.avatar_url}
            size="sm"
          />
        )}
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-[999px] bg-[#0C9F88] text-white text-sm font-medium px-4 py-1.5 hover:bg-[#0a8a77] transition-colors no-underline"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
