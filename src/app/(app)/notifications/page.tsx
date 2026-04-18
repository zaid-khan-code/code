import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth/guards";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { markNotificationRead, markAllNotificationsRead } from "./actions";
import Link from "next/link";

interface NotificationPayload {
  title?: string;
  username?: string;
  full_name?: string;
  badge_name?: string;
  request_id?: string;
}

function groupByDay(notifications: { created_at: string }[]) {
  const groups: Record<string, typeof notifications> = {};
  for (const n of notifications) {
    const date = new Date(n.created_at).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(n);
  }
  return groups;
}

function getNotificationText(type: string, payload: NotificationPayload) {
  switch (type) {
    case "new_helper":
      return `${payload.full_name ?? payload.username} offered to help on your request: ${payload.title}`;
    case "request_solved":
      return `Your request "${payload.title}" was marked solved`;
    case "new_message":
      return `${payload.full_name ?? payload.username} sent you a message`;
    case "badge_earned":
      return `You earned the ${payload.badge_name} badge`;
    case "status_change":
      return `Request "${payload.title}" changed status`;
    case "request_commented":
      return `New comment on "${payload.title}"`;
    case "system":
      return payload.title ?? "System notification";
    default:
      return "New notification";
  }
}

function getNotificationLink(type: string, payload: NotificationPayload, id: string) {
  if (payload.request_id) return `/requests/${payload.request_id}`;
  if (type === "new_message") return `/messages`;
  if (type === "badge_earned") return `/profile/me`;
  return `/notifications`;
}

export default async function NotificationsPage() {
  const { user } = await requireOnboarded();
  const sb = await createClient();

  const { data: notifications } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;
  const grouped = groupByDay(notifications ?? []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#111111]">Notifications</h1>
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-[#0C9F88] hover:bg-[#F0EBE3] rounded-[999px] transition-colors"
            >
              Mark all read ({unreadCount})
            </button>
          </form>
        )}
      </div>

      {notifications?.length === 0 ? (
        <Card className="p-12 text-center text-[#6B6B6B]">
          No notifications yet
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="sticky top-0 bg-[#F5F0EA] py-2 px-4 -mx-4">
                <h2 className="text-sm font-medium text-[#6B6B6B]">{date}</h2>
              </div>
              <div className="space-y-2 mt-2">
                {items.map((n) => {
                  const payload = (n.payload ?? {}) as NotificationPayload;
                  const link = getNotificationLink(n.type, payload, n.id);
                  return (
                    <Card
                      key={n.id}
                      className={`p-4 flex items-start gap-4 ${
                        !n.read ? "border-l-4 border-l-[#0C9F88]" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          href={link}
                          className="block text-[#111111] no-underline hover:underline"
                        >
                          {getNotificationText(n.type, payload)}
                        </Link>
                        <div className="text-sm text-[#A0A0A0] mt-1">
                          {new Date(n.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {!n.read && (
                        <form action={markNotificationRead}>
                          <input type="hidden" name="id" value={n.id} />
                          <button
                            type="submit"
                            className="text-xs text-[#0C9F88] hover:underline"
                          >
                            Mark read
                          </button>
                        </form>
                      )}
                      <Badge variant={n.type as any}>
                        {n.type.replace("_", " ")}
                      </Badge>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
