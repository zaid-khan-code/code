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
    <header className="sticky top-0 z-40 border-b border-[#E8E2D9]/80 bg-[#F5F0EA]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-3 no-underline">
          <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0C9F88] text-sm font-extrabold text-white">
            H
          </span>
          <span className="text-[15px] font-bold tracking-tight text-[#111111]">
            HelpHub AI
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto">
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
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors no-underline",
                  active
                    ? "bg-[#EEF4EF] text-[#111111]"
                    : "text-[#6B6B6B] hover:bg-[#F0EBE3] hover:text-[#111111]",
                ].join(" ")}
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
              className="inline-flex items-center justify-center rounded-full bg-[#0C9F88] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(12,159,136,0.22)] transition-colors hover:bg-[#0a8a77] no-underline"
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
