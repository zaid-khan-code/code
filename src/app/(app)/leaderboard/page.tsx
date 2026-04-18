import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth/guards";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";

interface LeaderboardUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  trust_score: number;
  badge_count: number;
}

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LeaderboardPage({ searchParams }: Props) {
  const { user } = await requireOnboarded();
  const sb = await createClient();
  const params = await searchParams;
  const tab = (params.tab as string) ?? "all";

  let users: LeaderboardUser[] = [];

  if (tab === "weekly") {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await sb.rpc("get_weekly_leaderboard", { since });
    users = (data as LeaderboardUser[] | null) ?? [];
  } else {
    const { data } = await sb
      .from("profiles")
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        location,
        trust_score,
        user_badges(count)
      `)
      .eq("onboarded", true)
      .order("trust_score", { ascending: false })
      .limit(50);

    users = (data?.map((u) => ({
        ...u,
        badge_count: (u as unknown as { user_badges: [{ count: number }] }).user_badges[0]?.count ?? 0,
      })) ?? []) as LeaderboardUser[];
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#111111]">Leaderboard</h1>
        <p className="text-[#6B6B6B] mt-2">Top community helpers by trust score</p>
      </div>

      <div className="flex justify-center gap-2">
        <Link
          href="/leaderboard?tab=all"
          className={`px-4 py-2 rounded-[999px] text-sm font-medium transition-colors ${
            tab === "all"
              ? "bg-[#0C9F88] text-white"
              : "bg-white text-[#6B6B6B] hover:bg-[#F0EBE3]"
          }`}
        >
          All Time
        </Link>
        <Link
          href="/leaderboard?tab=weekly"
          className={`px-4 py-2 rounded-[999px] text-sm font-medium transition-colors ${
            tab === "weekly"
              ? "bg-[#0C9F88] text-white"
              : "bg-white text-[#6B6B6B] hover:bg-[#F0EBE3]"
          }`}
        >
          This Week
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-[60px_1fr_100px_100px] gap-4 px-6 py-3 bg-[#F0EBE3] text-sm font-medium text-[#6B6B6B]">
          <div>Rank</div>
          <div>User</div>
          <div className="text-right">Trust</div>
          <div className="text-right">Badges</div>
        </div>

        <div className="divide-y divide-[#E8E2D9]">
          {users.length === 0 ? (
            <div className="p-12 text-center text-[#6B6B6B]">No users found</div>
          ) : (
            users.map((u, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const isMe = u.id === user.id;

              return (
                <Link
                  key={u.id}
                  href={`/profile/${u.username ?? u.id}`}
                  className={`grid grid-cols-[60px_1fr_100px_100px] gap-4 px-6 py-4 items-center transition-colors no-underline ${
                    isMe ? "bg-[#D1FAF4]/30" : "hover:bg-[#F5F0EA]"
                  } ${isTop3 ? "bg-gradient-to-r from-[#FEF3C7]/30 to-transparent" : ""}`}
                >
                  <div className="flex items-center justify-center">
                    {rank === 1 && <span className="text-2xl"></span>}
                    {rank === 2 && <span className="text-2xl"></span>}
                    {rank === 3 && <span className="text-2xl"></span>}
                    {rank > 3 && <span className="font-medium text-[#6B6B6B]">#{rank}</span>}
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar
                      name={u.full_name ?? u.username ?? "U"}
                      src={u.avatar_url}
                      size={isTop3 ? "lg" : "md"}
                    />
                    <div>
                      <div className="font-medium text-[#111111]">
                        {u.full_name ?? u.username}
                        {isMe && <span className="ml-2 text-xs text-[#0C9F88]">(you)</span>}
                      </div>
                      <div className="text-sm text-[#6B6B6B]">
                        @{u.username}
                        {u.location && ` · ${u.location}`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-semibold text-[#0C9F88]">
                    {u.trust_score}
                  </div>

                  <div className="text-right text-[#6B6B6B]">
                    {u.badge_count}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
