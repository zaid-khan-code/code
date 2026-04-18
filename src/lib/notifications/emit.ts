import { createAdminClient } from "@/lib/supabase/admin";

type NotifType = "new_helper" | "request_solved" | "new_message" | "badge_earned" | "request_commented" | "status_change" | "system";

export async function notify(userId: string, type: NotifType, payload: Record<string, unknown>) {
  const sb = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (sb.from("notifications").insert as any)({ user_id: userId, type, payload });
}

export async function notifyMany(userIds: string[], type: NotifType, payload: Record<string, unknown>) {
  if (userIds.length === 0) return;
  const sb = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (sb.from("notifications").insert as any)(
    userIds.map((user_id) => ({ user_id, type, payload }))
  );
}
