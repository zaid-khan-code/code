import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import HeroBanner from "@/components/ui/HeroBanner";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { formatTime } from "@/lib/format";
import { markMessagesRead, sendMessage } from "../actions";

type PageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ConversationPage({ params }: PageProps) {
  const [{ user }, { conversationId }] = await Promise.all([requireOnboarded(), params]);
  const sb = await createClient();
  const admin = createAdminClient();

  const { data: conversation } = await sb
    .from("conversations")
    .select("id, user_a, user_b, request_id, last_message_at")
    .eq("id", conversationId)
    .single();

  if (!conversation) notFound();
  if (conversation.user_a !== user.id && conversation.user_b !== user.id) notFound();

  const { data: allConversations } = await sb
    .from("conversations")
    .select("id, user_a, user_b, request_id, last_message_at")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  const conversationRows = allConversations ?? [];
  const otherUserIds = Array.from(
    new Set(conversationRows.map((row) => (row.user_a === user.id ? row.user_b : row.user_a)))
  );

  const [{ data: profileRows }, { data: messages }] = await Promise.all([
    otherUserIds.length > 0
      ? admin
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", otherUserIds)
      : Promise.resolve({ data: [] as never[] }),
    sb
      .from("messages")
      .select("id, sender_id, body, created_at, read_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }),
  ]);

  await markMessagesRead(conversationId, user.id);

  const profileMap = new Map((profileRows ?? []).map((row) => [row.id, row]));
  const otherUserId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a;
  const otherUser = profileMap.get(otherUserId);

  return (
    <div className="space-y-6">
      <HeroBanner
        label="Interaction / Messaging"
        title="Keep support moving through direct communication."
        subtitle="Follow up on accepted help, share files, and move requests toward a solution."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="rounded-[22px] p-4">
          <div className="space-y-3">
            {conversationRows.map((row) => {
              const profile = profileMap.get(row.user_a === user.id ? row.user_b : row.user_a);
              const active = row.id === conversationId;

              return (
                <Link
                  key={row.id}
                  href={`/messages/${row.id}`}
                  className={[
                    "block rounded-[18px] border p-4 no-underline transition-colors",
                    active
                      ? "border-[#CFE5DF] bg-[#F6FBF8]"
                      : "border-[#F0EBE3] hover:border-[#D8D1C7]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={profile?.full_name ?? profile?.username ?? "Member"}
                      src={profile?.avatar_url}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#111111]">
                        {profile?.full_name ?? profile?.username ?? "Community member"}
                      </p>
                      <p className="text-xs text-[#6B6B6B]">@{profile?.username ?? "member"}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="rounded-[22px] p-0 overflow-hidden">
          <div className="border-b border-[#F0EBE3] px-6 py-4">
            <div className="flex items-center gap-3">
              <Avatar
                name={otherUser?.full_name ?? otherUser?.username ?? "Member"}
                src={otherUser?.avatar_url}
                size="md"
              />
              <div>
                <p className="text-sm font-semibold text-[#111111]">
                  {otherUser?.full_name ?? otherUser?.username ?? "Community member"}
                </p>
                <p className="text-xs text-[#6B6B6B]">@{otherUser?.username ?? "member"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 px-6 py-5">
            {(messages ?? []).length === 0 ? (
              <p className="text-sm text-[#6B6B6B]">Start the conversation.</p>
            ) : (
              (messages ?? []).map((message) => {
                const isMe = message.sender_id === user.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={[
                        "max-w-[75%] rounded-[18px] px-4 py-3 text-sm leading-6",
                        isMe
                          ? "rounded-br-[8px] bg-[#0C9F88] text-white"
                          : "rounded-bl-[8px] bg-[#F5F1EA] text-[#111111]",
                      ].join(" ")}
                    >
                      <p>{message.body}</p>
                      <p
                        className={[
                          "mt-2 text-xs",
                          isMe ? "text-white/70" : "text-[#7A7A7A]",
                        ].join(" ")}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form action={sendMessage} className="border-t border-[#F0EBE3] px-6 py-4">
            <input type="hidden" name="conversationId" value={conversationId} />
            <div className="flex gap-3">
              <textarea
                name="body"
                rows={3}
                placeholder="Share support details, files, or next steps."
                className="min-h-[92px] flex-1 rounded-[14px] border border-[#E8E2D9] px-4 py-3 text-sm leading-6 text-[#111111] outline-none placeholder:text-[#A0A0A0] focus:border-[#0C9F88]"
              />
              <Button type="submit">Send</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
