import HeroBanner from "@/components/ui/HeroBanner";
import Card from "@/components/ui/Card";
import { requireOnboarded } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { formatDayHeading, timeAgo } from "@/lib/format";
import { markAllNotificationsRead, markNotificationRead } from "./actions";

type NotificationPayload = Record<string, unknown>;

function formatNotification(type: string, payload: NotificationPayload) {
  switch (type) {
    case "new_helper":
      return `${payload.helper_name ?? "Someone"} offered help on "${payload.request_title ?? payload.title ?? "your request"}"`;
    case "request_solved":
      return `"${payload.request_title ?? payload.title ?? "Request"}" was marked as solved`;
    case "new_message":
      return `You received a new message`;
    case "badge_earned":
      return `You earned the ${payload.badge_name ?? "community"} badge`;
    case "status_change":
      return `"${payload.request_title ?? payload.title ?? "Request"}" changed to ${payload.new_status ?? payload.status ?? "a new status"}`;
    default:
      return String(payload.title ?? payload.message ?? "Platform update");
  }
}

export default async function NotificationsPage() {
  const { user } = await requireOnboarded();
  const sb = await createClient();

  const { data } = await sb
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const notifications = data ?? [];
  const unreadCount = notifications.filter((item) => !item.read).length;
  const groups = new Map<string, typeof notifications>();

  for (const item of notifications) {
    const key = formatDayHeading(item.created_at);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return (
    <div className="space-y-6">
      <HeroBanner
        label="Notifications"
        title="Stay updated on requests, helpers, and trust signals."
        subtitle="Your live feed keeps request progress, helper activity, and platform events in one place."
      />

      <Card className="rounded-[22px] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
              Live Updates
            </p>
            <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#111111]">
              Notification feed
            </h2>
          </div>

          {unreadCount > 0 ? (
            <form action={markAllNotificationsRead}>
              <button
                type="submit"
                className="rounded-full bg-[#EEF4EF] px-4 py-2 text-sm font-medium text-[#111111]"
              >
                Mark all read
              </button>
            </form>
          ) : null}
        </div>

        <div className="mt-6 space-y-8">
          {Array.from(groups.entries()).map(([heading, items]) => (
            <div key={heading}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8B8B8B]">
                {heading}
              </p>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded-[18px] border border-[#F0EBE3] p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#111111]">
                        {formatNotification(item.type, (item.payload ?? {}) as NotificationPayload)}
                      </p>
                      <p className="mt-2 text-xs text-[#6B6B6B]">
                        {item.type.replace("_", " ")} · {timeAgo(item.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {!item.read ? (
                        <form action={markNotificationRead}>
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" className="text-xs font-medium text-[#111111]">
                            Mark read
                          </button>
                        </form>
                      ) : null}
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-medium",
                          item.read
                            ? "bg-[#F4F1EC] text-[#6B6B6B]"
                            : "bg-[#EEF4EF] text-[#111111]",
                        ].join(" ")}
                      >
                        {item.read ? "Read" : "Unread"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
