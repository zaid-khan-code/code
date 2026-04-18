import React from "react";
import { requireOnboarded } from "@/lib/auth/guards";
import Sidebar from "@/components/layout/Sidebar";
import { headers } from "next/headers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireOnboarded();

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeHref={pathname}
        user={{
          full_name: profile?.full_name ?? null,
          username: profile?.username ?? null,
          avatar_url: profile?.avatar_url ?? null,
        }}
      />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
