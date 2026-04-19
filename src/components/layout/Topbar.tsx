"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotifBell from "@/components/layout/NotifBell";

type Props = {
  navLinks: { href: string; label: string; match?: string[] }[];
  ctaLabel?: string;
  ctaHref?: string;
  showNotifications?: boolean;
};

export default function Topbar({
  navLinks,
  ctaLabel,
  ctaHref,
  showNotifications = false,
}: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[#d7e6e0]/70 bg-[#fbf9f5]/90 backdrop-blur-[20px]">
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#006c49] text-sm font-black text-white"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            H
          </span>
          <span
            className="text-[15px] font-bold tracking-tight text-[#1b1c1a]"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            HelpHub AI
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto">
          {navLinks.map((link) => {
            const active =
              pathname === link.href ||
              pathname.startsWith(`${link.href}/`) ||
              (link.match ?? []).some(
                (match) => pathname === match || pathname.startsWith(`${match}/`)
              );

            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "rounded-full px-3.5 py-2 text-[13px] font-medium transition-all no-underline",
                  active
                    ? "bg-[#d7e6e0] text-[#006c49] font-semibold"
                    : "text-[#54615d] hover:bg-[#efeeea] hover:text-[#1b1c1a]",
                ].join(" ")}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {showNotifications ? <NotifBell /> : null}
          {ctaLabel && ctaHref ? (
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-full bg-[#006c49] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(0,108,73,0.20)] transition-all hover:bg-[#005236] hover:-translate-y-px no-underline"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
