import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import Avatar from "@/components/ui/Avatar";
import { headers } from "next/headers";

const ADMIN_NAV = [
  { href: "/admin",            label: "Overview",   icon: "⊞" },
  { href: "/admin/requests",   label: "Requests",   icon: "📋" },
  { href: "/admin/users",      label: "Users",      icon: "👥" },
  { href: "/admin/analytics",  label: "Analytics",  icon: "📊" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  return (
    <div className="flex min-h-screen">
      <aside
        className="flex flex-col justify-between border-r border-[#d7e6e0] bg-white py-5 shrink-0"
        style={{ width: 220 }}
      >
        <div>
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 mb-6 no-underline"
          >
            <span
              className="flex items-center justify-center rounded-[8px] text-white font-bold text-sm"
              style={{ width: 32, height: 32, backgroundColor: "#006c49" }}
              aria-hidden="true"
            >
              H
            </span>
            <span className="font-semibold text-[#1b1c1a] text-sm">Admin</span>
          </Link>

          <nav className="flex flex-col gap-0.5 px-2">
            {ADMIN_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-colors no-underline",
                    active
                      ? "bg-[#efeeea] text-[#1b1c1a]"
                      : "text-[#54615d] hover:bg-[#fbf9f5] hover:text-[#1b1c1a]",
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

        {profile && (
          <div className="px-4 pt-4 border-t border-[#d7e6e0] flex items-center gap-3">
            <Avatar
              name={profile.full_name ?? profile.username ?? "A"}
              src={profile.avatar_url ?? null}
              size="sm"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#1b1c1a] truncate">
                {profile.full_name ?? profile.username ?? "Admin"}
              </p>
              <p className="text-xs text-[#EF4444] font-medium">Admin</p>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
