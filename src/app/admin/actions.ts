"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const deleteRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export async function deleteRequest(input: unknown) {
  await requireAdmin();
  const { requestId } = deleteRequestSchema.parse(input);
  const sb = createAdminClient();

  await sb.from("requests").delete().eq("id", requestId);
  revalidatePath("/admin/requests");
  revalidatePath("/explore");
  return { ok: true };
}

const forceSolveSchema = z.object({
  requestId: z.string().uuid(),
});

export async function forceSolveRequest(input: unknown) {
  await requireAdmin();
  const { requestId } = forceSolveSchema.parse(input);
  const sb = createAdminClient();

  await sb
    .from("requests")
    .update({ status: "solved", solved_at: new Date().toISOString() })
    .eq("id", requestId);

  revalidatePath("/admin/requests");
  revalidatePath("/requests/[id]", "page");
  return { ok: true };
}

const rerunAiSchema = z.object({
  requestId: z.string().uuid(),
});

export async function rerunAiOnRequest(input: unknown) {
  await requireAdmin();
  const { requestId } = rerunAiSchema.parse(input);
  const sb = createAdminClient();

  const { data: req } = await sb
    .from("requests")
    .select("title, description")
    .eq("id", requestId)
    .single();

  if (!req) return { ok: false, error: "Not found" };

  const [{ categorize }, { detectUrgency }, { suggestTags }] = await Promise.all([
    import("@/lib/ai/categorize"),
    import("@/lib/ai/urgency"),
    import("@/lib/ai/tags"),
  ]);

  const { data: skills } = await sb.from("skills").select("name");
  const skillNames = skills?.map((s) => s.name) ?? [];

  const [cat, urg, tags] = await Promise.all([
    categorize(`${req.title} ${req.description}`),
    detectUrgency(`${req.title} ${req.description}`),
    suggestTags(`${req.title} ${req.description}`, skillNames),
  ]);

  await sb
    .from("requests")
    .update({
      ai_category: cat.category,
      ai_urgency_score: urg.score,
      category: cat.category,
      urgency: urg.urgency,
      tags,
    })
    .eq("id", requestId);

  revalidatePath("/admin/requests");
  revalidatePath("/requests/[id]", "page");
  return { ok: true };
}

const promoteUserSchema = z.object({
  userId: z.string().uuid(),
});

export async function promoteToAdmin(input: unknown) {
  await requireAdmin();
  const { userId } = promoteUserSchema.parse(input);
  const sb = createAdminClient();

  await sb.from("profiles").update({ role: "admin" }).eq("id", userId);
  revalidatePath("/admin/users");
  return { ok: true };
}

const demoteUserSchema = z.object({
  userId: z.string().uuid(),
});

export async function demoteToUser(input: unknown) {
  await requireAdmin();
  const { userId } = demoteUserSchema.parse(input);
  const sb = createAdminClient();

  await sb.from("profiles").update({ role: "user" }).eq("id", userId);
  revalidatePath("/admin/users");
  return { ok: true };
}

const banUserSchema = z.object({
  userId: z.string().uuid(),
});

export async function banUser(input: unknown) {
  await requireAdmin();
  const { userId } = banUserSchema.parse(input);
  const sb = createAdminClient();

  await sb.from("profiles").update({ onboarded: false }).eq("id", userId);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function recomputeStats() {
  await requireAdmin();
  const sb = createAdminClient();

  const [{ count: totalUsers }, { count: openRequests }, { count: solvedRequests }] =
    await Promise.all([
      sb.from("profiles").select("id", { count: "exact", head: true }),
      sb.from("requests").select("id", { count: "exact", head: true }).eq("status", "open"),
      sb.from("requests").select("id", { count: "exact", head: true }).eq("status", "solved"),
    ]);

  return {
    totalUsers: totalUsers ?? 0,
    openRequests: openRequests ?? 0,
    solvedRequests: solvedRequests ?? 0,
    solveRate:
      (totalUsers ?? 0) > 0
        ? Math.round(((solvedRequests ?? 0) / ((openRequests ?? 0) + (solvedRequests ?? 0))) * 100)
        : 0,
  };
}
