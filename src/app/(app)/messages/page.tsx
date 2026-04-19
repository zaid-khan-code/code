import { requireOnboarded } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import HeroBanner from "@/components/ui/HeroBanner";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { formatTime } from "@/lib/format";
import { startConversation } from "./actions";
import Button from "@/components/ui/Button";

type SearchParams = Promise<{
  user_id?: string;
  request_id?: string;
}>;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [{ user }, params] = await Promise.all([requireOnboarded(), searchParams]);
  const sb = await createClient();
  const admin = createAdminClient();

  const { data: conversations } = await sb
    .from("conversations")
    .select("id, user_a, user_b, request_id, last_message_at")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  const conversationRows = conversations ?? [];
  const conversationIds = conversationRows.map((row) => row.id);
  const otherUserIds = Array.from(
    new Set(
      conversationRows.map((row) => (row.user_a === user.id ? row.user_b : row.user_a))
    )
  );

  const [{ data: profileRows }, { data: messageRows }, { data: recipientRows }] = await Promise.all([
    otherUserIds.length > 0
      ? admin
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", otherUserIds)
      : Promise.resolve({ data: [] as never[] }),
    conversationIds.length > 0
      ? sb
          .from("messages")
          .select("conversation_id, body, sender_id, read_at, created_at")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as never[] }),
    admin
      .from("profiles")
      .select("id, full_name, username")
      .neq("id", user.id)
      .order("trust_score", { ascending: false })
      .limit(20),
  ]);

  const profileMap = new Map((profileRows ?? []).map((row) => [row.id, row]));
  const latestMessage = new Map<string, { body: string; created_at: string }>();
  const unreadCounts = new Map<string, number>();

  for (const row of messageRows ?? []) {
    if (!latestMessage.has(row.conversation_id)) {
      latestMessage.set(row.conversation_id, {
        body: row.body,
        created_at: row.created_at,
      });
    }

    if (!row.read_at && row.sender_id !== user.id) {
      unreadCounts.set(
        row.conversation_id,
        (unreadCounts.get(row.conversation_id) ?? 0) + 1
      );
    }
  }

  return (
    <div className="space-y-6">
      <HeroBanner
        label="Interaction / Messaging"
        title="Keep support moving through direct communication."
        subtitle="Basic messaging gives helpers and requesters a clear follow-up path once a match happens."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_420px]">
        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
            Conversation Stream
          </p>
          <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#111111]">
            Recent messages
          </h2>

          <div className="mt-6 space-y-4">
            {conversationRows.length === 0 ? (
              <p className="rounded-[18px] border border-[#F0EBE3] p-5 text-sm text-[#6B6B6B]">
                No conversations yet. Start one from a request or send a direct message.
              </p>
            ) : (
              conversationRows.map((conversation) => {
                const otherUserId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a;
                const otherUser = profileMap.get(otherUserId);
                const preview = latestMessage.get(conversation.id);

                return (
                  <Link
                    key={conversation.id}
                    href={`/messages/${conversation.id}`}
                    className="block rounded-[18px] border border-[#F0EBE3] p-4 no-underline transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#111111]">
                          {otherUser?.full_name ?? "Community"} &rarr; {user.user_metadata?.full_name ?? "You"}
                        </p>
                        <p className="mt-2 max-w-[420px] text-sm leading-6 text-[#6B6B6B]">
                          {preview?.body ?? "No messages yet."}
                        </p>
                      </div>
                      <div className="rounded-full bg-[#EEF4EF] px-3 py-2 text-xs font-semibold text-[#245D51]">
                        {preview ? formatTime(preview.created_at) : "--"}
                      </div>
                    </div>
                    {(unreadCounts.get(conversation.id) ?? 0) > 0 ? (
                      <p className="mt-3 text-xs font-semibold text-[#0C9F88]">
                        {unreadCounts.get(conversation.id)} unread
                      </p>
                    ) : null}
                  </Link>
                );
              })
            )}
          </div>
        </Card>

        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
            Send Message
          </p>
          <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#111111]">
            Start a conversation
          </h2>

          <form action={startConversation} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">To</span>
              <select
                name="otherUserId"
                defaultValue={params.user_id ?? ""}
                className="w-full rounded-[14px] border border-[#E8E2D9] px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#0C9F88]"
              >
                <option value="">Select a member</option>
                {(recipientRows ?? []).map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.full_name ?? recipient.username ?? "Community member"}
                  </option>
                ))}
              </select>
            </label>

            <input type="hidden" name="requestId" value={params.request_id ?? ""} />

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Message</span>
              <textarea
                name="body"
                rows={6}
                placeholder="Share support details, ask for files, or suggest next steps."
                className="w-full rounded-[14px] border border-[#E8E2D9] px-4 py-3 text-sm leading-6 text-[#111111] outline-none placeholder:text-[#A0A0A0] focus:border-[#0C9F88]"
              />
            </label>

            <Button type="submit" className="w-full">
              Send
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
