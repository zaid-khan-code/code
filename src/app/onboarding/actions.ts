"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
} from "@/lib/zod/schemas";

export async function submitStep1(formData: FormData) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const raw = {
    full_name: formData.get("full_name")?.toString() ?? "",
    username: formData.get("username")?.toString() ?? "",
    location: formData.get("location")?.toString() ?? undefined,
  };

  const parsed = onboardingStep1Schema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { data: existing } = await sb.from("profiles").select("id").eq("username", parsed.data.username).single();
  if (existing) return { error: "Username already taken" };

  const { error } = await sb.from("profiles").update({
    full_name: parsed.data.full_name,
    username: parsed.data.username,
    location: parsed.data.location,
  }).eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function submitStep2(mode: string) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = onboardingStep2Schema.safeParse({ user_mode: mode });
  if (!parsed.success) return { error: "Invalid mode" };

  const { error } = await sb.from("profiles").update({
    user_mode: parsed.data.user_mode,
  }).eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function submitStep3(skills: { skill_id: string; can_help: boolean; needs_help: boolean }[]) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = onboardingStep3Schema.safeParse({ skills });
  if (!parsed.success) return { error: "Select at least 1 skill" };

  const admin = createAdminClient();
  await admin.from("user_skills").delete().eq("user_id", user.id);

  const rows = parsed.data.skills.map(s => ({
    user_id: user.id,
    skill_id: s.skill_id,
    can_help: s.can_help,
    needs_help: s.needs_help,
  }));

  const { error } = await admin.from("user_skills").insert(rows);
  if (error) return { error: error.message };
  return { success: true };
}

export async function submitStep4(formData: FormData) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const interestIdsRaw = formData.get("interest_ids")?.toString() ?? "[]";
  const interestIds = JSON.parse(interestIdsRaw) as string[];
  const bio = formData.get("bio")?.toString() ?? undefined;

  const parsed = onboardingStep4Schema.safeParse({ interest_ids: interestIds, bio });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createAdminClient();
  await admin.from("user_interests").delete().eq("user_id", user.id);

  const interestRows = parsed.data.interest_ids.map(id => ({
    user_id: user.id,
    interest_id: id,
  }));

  if (interestRows.length > 0) {
    await admin.from("user_interests").insert(interestRows);
  }

  const { error } = await sb.from("profiles").update({
    bio: parsed.data.bio,
    onboarded: true,
  }).eq("id", user.id);

  if (error) return { error: error.message };

  await admin.rpc("trust_emit", { p_user: user.id, p_type: "complete_onboarding", p_delta: 10 });

  revalidatePath("/dashboard");
  return { success: true };
}
