import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth/guards";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import { sendMessage, markMessagesRead } from "../actions";

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const { user } = await requireOnboarded();
  const sb = await createClient();
  const { conversationId } = await params;

  const { data: conversation } = await sb
    .from("conversations")
    .select(`
      id,
      request_id,
      user_a,
      user_b,
      profiles_a:profiles!conversations_user_a_fkey(id, full_name, username, avatar_url),
      profiles_b:profiles!conversations_user_b_fkey(id, full_name, username, avatar_url)
    `)
    .eq("id", conversationId)
    .single();

  if (!conversation) {
    return <div>Conversation not found</div>;
  }

  const isParticipant = conversation.user_a === user.id || conversation.user_b === user.id;
  if (!isParticipant) {
    return <div>Access denied</div>;
  }

  const otherUser = conversation.user_a === user.id ? conversation.profiles_b : conversation.profiles_a;
  const otherId = conversation.user_a === user.id ? conversation.user_b : conversation.user_a;

  const { data: messages } = await sb
    .from("messages")
    .select(`
      id,
      sender_id,
      body,
      created_at,
      read_at
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  await markMessagesRead(conversationId, user.id);

  const { data: conversations } = await sb
    .from("conversations")
    .select(`
      id,
      last_message_at,
      user_a,
      user_b,
      profiles_a:profiles!conversations_user_a_fkey(full_name, username, avatar_url),
      profiles_b:profiles!conversations_user_b_fkey(full_name, username, avatar_url)
    `)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  const { data: unreadCounts } = await sb
    .from("messages")
    .select("conversation_id, count", { count: "exact" })
    .is("read_at", null)
    .neq("sender_id", user.id)
    .in("conversation_id", conversations?.map((c) => c.id) ?? []);

  const unreadMap = new Map<string, number>();
  unreadCounts?.forEach((u) => {
    const convId = (u as { conversation_id: string }).conversation_id;
    unreadMap.set(convId, (unreadMap.get(convId) ?? 0) + 1);
  });

  return (
    <div className="flex h-[calc(100vh-48px)] gap-4">
      <Card className="w-[320px] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#E8E2D9]">
          <h1 className="text-lg font-semibold text-[#111111]">Messages</h1>
        </div>
        <div className="flex-1 overflow-auto">
          {conversations?.length === 0 ? (
            <div className="p-8 text-center text-[#6B6B6B]">
              No conversations yet.
            </div>
          ) : (
            <div className="divide-y divide-[#E8E2D9]">
              {conversations.map((conv) => {
                const other = conv.user_a === user.id ? conv.profiles_b : conv.profiles_a;
                const unread = unreadMap.get(conv.id) ?? 0;
                const isActive = conv.id === conversationId;
                return (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className={`block p-4 transition-colors no-underline ${
                      isActive ? "bg-[#F0EBE3]" : "hover:bg-[#F5F0EA]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={other?.full_name ?? other?.username ?? "U"}
                        src={other?.avatar_url}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#111111] truncate">
                          {other?.full_name ?? other?.username}
                        </div>
                        <div className="text-sm text-[#A0A0A0]">
                          {new Date(conv.last_message_at).toLocaleDateString()}
                        </div>
                      </div>
                      {unread > 0 && (
                        <span className="bg-[#EF4444] text-white text-xs font-medium rounded-full px-2 py-0.5">
                          {unread}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#E8E2D9] flex items-center gap-3">
          <Avatar
            name={otherUser?.full_name ?? otherUser?.username ?? "U"}
            src={otherUser?.avatar_url}
            size="md"
          />
          <div>
            <div className="font-medium text-[#111111]">
              {otherUser?.full_name ?? otherUser?.username}
            </div>
            <div className="text-sm text-[#6B6B6B]">
              @{otherUser?.username}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {messages?.length === 0 ? (
            <div className="text-center text-[#6B6B6B] py-8">
              Start the conversation
            </div>
          ) : (
            messages?.map((msg) => {
              const isMe = msg.sender_id === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-[14px] text-sm ${
                      isMe
                        ? "bg-[#0C9F88] text-white rounded-br-[6px]"
                        : "bg-[#F0EBE3] text-[#111111] rounded-bl-[6px]"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.body}</div>
                    <div
                      className={`text-xs mt-1 ${
                        isMe ? "text-white/70" : "text-[#A0A0A0]"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {isMe && msg.read_at && " · Read"}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-[#E8E2D9]">
          <form
            action={sendMessage}
            className="flex gap-2"
          >
            <input type="hidden" name="conversationId" value={conversationId} />
            <textarea
              name="body"
              placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
              className="flex-1 px-4 py-2 rounded-[10px] border border-[#E8E2D9] bg-white text-[#111111] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0C9F88]"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  (e.target as HTMLTextAreaElement).form?.requestSubmit();
                }
              }}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#0C9F88] text-white text-sm font-medium rounded-[999px] hover:bg-[#0a8a77] transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
