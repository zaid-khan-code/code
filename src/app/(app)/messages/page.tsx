import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth/guards";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";

export default async function MessagesPage() {
  const { user } = await requireOnboarded();
  const sb = await createClient();

  const { data: conversations } = await sb
    .from("conversations")
    .select(`
      id,
      request_id,
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
                const otherUser = conv.user_a === user.id ? conv.profiles_b : conv.profiles_a;
                const otherId = conv.user_a === user.id ? conv.user_b : conv.user_a;
                const unread = unreadMap.get(conv.id) ?? 0;
                return (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className="block p-4 hover:bg-[#F5F0EA] transition-colors no-underline"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={otherUser?.full_name ?? otherUser?.username ?? "U"}
                        src={otherUser?.avatar_url}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#111111] truncate">
                          {otherUser?.full_name ?? otherUser?.username}
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

      <div className="flex-1 flex items-center justify-center text-[#6B6B6B]">
        Select a conversation to view messages
      </div>
    </div>
  );
}
