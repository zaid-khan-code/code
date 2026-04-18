"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";

const markReadSchema = z.object({
  id: z.string().uuid(),
});

export async function markNotificationRead(formData: FormData) {
  const user = await requireUser();
  const sb = await createClient();

  const parsed = markReadSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    throw new Error("Invalid notification ID");
  }

  const { error } = await sb
    .from("notifications")
    .update({ read: true })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Failed to mark as read");
  }

  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  const sb = await createClient();

  const { error } = await sb
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    throw new Error("Failed to mark all as read");
  }

  revalidatePath("/notifications");
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const sb = await createClient();

  const { count } = await sb
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  return count ?? 0;
}
