"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";

const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});

export async function sendMessage(formData: FormData) {
  const user = await requireUser();
  const sb = await createClient();

  const raw = {
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  };

  const parsed = sendMessageSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const { conversationId, body } = parsed.data;

  const { data: conversation } = await sb
    .from("conversations")
    .select("user_a, user_b")
    .eq("id", conversationId)
    .single();

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const isParticipant = conversation.user_a === user.id || conversation.user_b === user.id;
  if (!isParticipant) {
    throw new Error("Not authorized");
  }

  const { error } = await sb.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: body.trim(),
  });

  if (error) {
    throw new Error("Failed to send message");
  }

  revalidatePath(`/messages/${conversationId}`);
}

export async function createOrFindConversation(
  otherUserId: string,
  requestId?: string
): Promise<string | null> {
  const user = await requireUser();
  const sb = await createClient();

  if (user.id === otherUserId) {
    return null;
  }

  const userA = user.id < otherUserId ? user.id : otherUserId;
  const userB = user.id < otherUserId ? otherUserId : user.id;

  const { data: existing } = await sb
    .from("conversations")
    .select("id")
    .eq("user_a", userA)
    .eq("user_b", userB)
    .is("request_id", requestId ?? null)
    .single();

  if (existing) {
    return existing.id;
  }

  const { data: created, error } = await sb
    .from("conversations")
    .insert({
      user_a: userA,
      user_b: userB,
      request_id: requestId ?? null,
    })
    .select("id")
    .single();

  if (error || !created) {
    return null;
  }

  return created.id;
}

export async function markMessagesRead(conversationId: string, userId: string) {
  const sb = await createClient();

  await sb
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const sb = await createClient();

  const { count } = await sb
    .from("messages")
    .select("id", { count: "exact", head: true })
    .is("read_at", null)
    .neq("sender_id", userId)
    .filter("conversation_id", "in", [
      `select id from conversations where user_a = '${userId}' or user_b = '${userId}'`,
    ]);

  return count ?? 0;
}
