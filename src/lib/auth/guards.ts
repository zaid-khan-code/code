import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type AppProfile = Tables<"profiles">;

export async function requireUser() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOnboarded() {
  const user = await requireUser();
  const sb = await createClient();
  const { data: p } = await sb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!p?.onboarded && p?.role !== "admin") redirect("/onboarding");
  return { user, profile: p };
}

export async function requireAdmin() {
  const { user, profile } = await requireOnboarded();
  if (profile?.role !== "admin") redirect("/dashboard");
  return { user, profile };
}
