"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { notify } from "@/lib/notifications/emit";

const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});

const startConversationSchema = z.object({
  otherUserId: z.string().uuid(),
  body: z.string().min(1).max(4000),
  requestId: z.string().uuid().optional().or(z.literal("")),
});

export async function sendMessage(formData: FormData) {
  const user = await requireUser();
  const sb = await createClient();

  const parsed = sendMessageSchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  });

  if (!parsed.success) return;

  const { conversationId, body } = parsed.data;

  const { data: conversation } = await sb
    .from("conversations")
    .select("id, user_a, user_b")
    .eq("id", conversationId)
    .single();

  if (!conversation) return;
  if (conversation.user_a !== user.id && conversation.user_b !== user.id) return;

  const { error } = await sb.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: body.trim(),
  });

  if (!error) {
    const otherUserId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a;
    await notify(otherUserId, "new_message", {
      conversation_id: conversationId,
    });
  }

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
}

export async function startConversation(formData: FormData) {
  const user = await requireUser();
  const sb = await createClient();

  const parsed = startConversationSchema.safeParse({
    otherUserId: formData.get("otherUserId"),
    body: formData.get("body"),
    requestId: formData.get("requestId"),
  });

  if (!parsed.success) return;

  const otherUserId = parsed.data.otherUserId;
  if (otherUserId === user.id) return;

  const userA = user.id < otherUserId ? user.id : otherUserId;
  const userB = user.id < otherUserId ? otherUserId : user.id;
  const requestId = parsed.data.requestId || null;

  const { data: existingConversation } = await sb
    .from("conversations")
    .select("id")
    .eq("user_a", userA)
    .eq("user_b", userB)
    .is("request_id", requestId)
    .maybeSingle();

  let conversationId = existingConversation?.id ?? null;

  if (!conversationId) {
    const { data: newConversation } = await sb
      .from("conversations")
      .insert({
        user_a: userA,
        user_b: userB,
        request_id: requestId,
      })
      .select("id")
      .single();

    conversationId = newConversation?.id ?? null;
  }

  if (!conversationId) return;

  await sb.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: parsed.data.body.trim(),
  });

  await notify(otherUserId, "new_message", {
    conversation_id: conversationId,
  });

  redirect(`/messages/${conversationId}`);
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
