import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth/guards";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

interface PageProps {
  params: Promise<{ username: string }>;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function ProfilePage({ params }: PageProps) {
  const [{ profile: me }, { username }] = await Promise.all([
    requireOnboarded(),
    params,
  ]);

  const sb = await createClient();

  // Fetch profile by username
  const { data: user } = await sb
    .from("profiles")
    .select(
      `id, full_name, username, location, bio, avatar_url, trust_score, user_mode, onboarded, created_at`
    )
    .eq("username", username)
    .single();

  if (!user) notFound();

  const isMe = me?.id === user.id;

  // Fetch badges
  const { data: badges = [] } = await sb
    .from("user_badges")
    .select(
      `earned_at, badge:badges(id, slug, name, description, icon, criteria)`
    )
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  // Fetch skills
  const { data: userSkills = [] } = await sb
    .from("user_skills")
    .select(`can_help, needs_help, skill:skills(id, name, category)`)
    .eq("user_id", user.id);

  const canHelp = userSkills.filter((s) => s.can_help);
  const needsHelp = userSkills.filter((s) => s.needs_help);

  // Fetch stats
  const [
    { count: requestsPosted = 0 },
    { count: peopleHelped = 0 },
    { data: trustEvents = [] },
  ] = await Promise.all([
    sb.from("requests").select("*", { count: "exact" }).eq("author_id", user.id),
    sb
      .from("request_helpers")
      .select("*", { count: "exact" })
      .eq("helper_id", user.id)
      .eq("status", "completed"),
    sb
      .from("trust_events")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Calculate rank
  const { data: higherRanked = [] } = await sb
    .from("profiles")
    .select("id")
    .gt("trust_score", user.trust_score)
    .eq("onboarded", true);
  const rank = higherRanked.length + 1;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <div className="flex items-start gap-6">
          <Avatar
            name={user.full_name ?? user.username}
            src={user.avatar_url}
            size="lg"
          />

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-[#111111]">
                  {user.full_name}
                </h1>
                <p className="text-[#6B6B6B]">
                  @{user.username} · {user.location || "No location"}
                </p>

                {user.user_mode && (
                  <div className="mt-2">
                    <Badge
                      variant={
                        user.user_mode === "can_help"
                          ? "solved"
                          : user.user_mode === "need_help"
                          ? "medium"
                          : "category"
                      }
                    >
                      {user.user_mode === "can_help" && "Can Help"}
                      {user.user_mode === "need_help" && "Needs Help"}
                      {user.user_mode === "both" && "Can Help & Needs Help"}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isMe ? (
                  <Link href="/profile/me">
                    <Button variant="secondary">Edit Profile</Button>
                  </Link>
                ) : (
                  <Link href={`/messages?user_id=${user.id}`}>
                    <Button>Message</Button>
                  </Link>
                )}
              </div>
            </div>

            {user.bio && (
              <p className="mt-4 text-[#111111] leading-relaxed">{user.bio}</p>
            )}

            <p className="mt-2 text-xs text-[#A0A0A0]">
              Joined{" "}
              {new Date(user.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Trust score */}
          <Card>
            <h3 className="font-semibold text-[#111111] mb-4">Trust Score</h3>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#0C9F88]">
                {user.trust_score}%
              </div>
              <p className="text-sm text-[#6B6B6B] mt-1">
                Rank #{rank} on leaderboard
              </p>
            </div>
          </Card>

          {/* Stats */}
          <Card>
            <h3 className="font-semibold text-[#111111] mb-4">Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">Requests posted</span>
                <span className="font-medium">{requestsPosted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B6B]">People helped</span>
                <span className="font-medium">{peopleHelped}</span>
              </div>
            </div>
          </Card>

          {/* Badges */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#111111]">Badges</h3>
              <span className="text-sm text-[#6B6B6B]">
                {badges.length} earned
              </span>
            </div>

            {badges.length === 0 ? (
              <p className="text-sm text-[#6B6B6B]">No badges earned yet.</p>
            ) : (
              <div className="space-y-3">
                {badges.map((b: any) => (
                  <div
                    key={b.badge.id}
                    className="flex items-center gap-3 p-2 bg-[#F5F0EA] rounded-[10px]"
                  >
                    <span className="text-2xl">{b.badge.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{b.badge.name}</p>
                      <p className="text-xs text-[#6B6B6B]">
                        {b.badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Skills */}
          <Card>
            <h3 className="font-semibold text-[#111111] mb-4">Skills</h3>

            {canHelp.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-[#6B6B6B] mb-2">Can help with:</p>
                <div className="flex flex-wrap gap-2">
                  {canHelp.map((s: any) => (
                    <Badge key={s.skill.id} variant="solved">
                      {s.skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {needsHelp.length > 0 && (
              <div>
                <p className="text-sm text-[#6B6B6B] mb-2">Needs help with:</p>
                <div className="flex flex-wrap gap-2">
                  {needsHelp.map((s: any) => (
                    <Badge key={s.skill.id} variant="medium">
                      {s.skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {canHelp.length === 0 && needsHelp.length === 0 && (
              <p className="text-sm text-[#6B6B6B]">No skills listed yet.</p>
            )}
          </Card>

          {/* Recent activity */}
          <Card>
            <h3 className="font-semibold text-[#111111] mb-4">
              Recent Activity
            </h3>

            {trustEvents.length === 0 ? (
              <p className="text-sm text-[#6B6B6B]">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {trustEvents.map((e: any) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between py-2 border-b border-[#E8E2D9] last:border-0"
                  >
                    <span className="text-sm">
                      {e.event_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-[#A0A0A0]">
                      {timeAgo(e.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* CTA */}
          {!isMe && (
            <Card className="bg-[#F5F0EA]">
              <div className="text-center py-4">
                <p className="text-[#111111] mb-3">
                  Need help with something {user.full_name} knows?
                </p>
                <Link href={`/messages?user_id=${user.id}`}>
                  <Button>Start a conversation</Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
