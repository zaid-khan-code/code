import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type NotifType = Database["public"]["Tables"]["notifications"]["Insert"]["type"];

export async function notify(userId: string, type: NotifType, payload: Record<string, unknown>) {
  const sb = createAdminClient();
  await sb.from("notifications").insert({ user_id: userId, type, payload });
}

export async function notifyMany(userIds: string[], type: NotifType, payload: Record<string, unknown>) {
  if (userIds.length === 0) return;
  const sb = createAdminClient();
  await sb.from("notifications").insert(
    userIds.map((user_id) => ({ user_id, type, payload }))
  );
}
