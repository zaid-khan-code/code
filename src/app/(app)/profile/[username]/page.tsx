import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import HeroBanner from "@/components/ui/HeroBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { timeAgo } from "@/lib/format";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: PageProps) {
  const [{ profile: me }, { username }] = await Promise.all([requireOnboarded(), params]);
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const isMe = me?.id === profile.id;

  const [{ data: userSkillRows }, { data: allSkills }, { data: userBadgeRows }, { data: badgeRows }, { count: requestCount }, { count: helpCount }, { data: trustEvents }] =
    await Promise.all([
      admin.from("user_skills").select("skill_id, can_help, needs_help").eq("user_id", profile.id),
      admin.from("skills").select("id, name").order("name"),
      admin.from("user_badges").select("badge_id, earned_at").eq("user_id", profile.id),
      admin.from("badges").select("id, name, description, icon"),
      admin.from("requests").select("id", { count: "exact", head: true }).eq("author_id", profile.id),
      admin.from("request_helpers").select("id", { count: "exact", head: true }).eq("helper_id", profile.id),
      admin.from("trust_events").select("id, event_type, created_at").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(5),
    ]);

  const skillMap = new Map((allSkills ?? []).map((skill) => [skill.id, skill.name]));
  const canHelpSkills = (userSkillRows ?? [])
    .filter((row) => row.can_help)
    .map((row) => skillMap.get(row.skill_id))
    .filter(Boolean) as string[];
  const needHelpSkills = (userSkillRows ?? [])
    .filter((row) => row.needs_help)
    .map((row) => skillMap.get(row.skill_id))
    .filter(Boolean) as string[];

  const badgeMap = new Map((badgeRows ?? []).map((badge) => [badge.id, badge]));
  const badges = (userBadgeRows ?? [])
    .map((row) => badgeMap.get(row.badge_id))
    .filter((b): b is NonNullable<typeof b> => b != null);

  const modeLabel = profile.user_mode === "need_help" ? "Need Help" : profile.user_mode === "can_help" ? "Can Help" : "Both";

  return (
    <div className="space-y-6">
      <HeroBanner
        label="Profile"
        title={profile.full_name ?? profile.username ?? "Community member"}
        subtitle={`${modeLabel} · ${profile.location ?? "Community"}`}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_420px]">
        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6c7a71]">
            Public Profile
          </p>
          <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#1b1c1a]">
            Skills and reputation
          </h2>

          <div className="mt-8 divide-y divide-[#efeeea] border-y border-[#efeeea]">
            <div className="flex items-center justify-between py-4">
              <p className="text-sm text-[#54615d]">Trust score</p>
              <p className="text-sm font-semibold text-[#1b1c1a]">{profile.trust_score}%</p>
            </div>
            <div className="flex items-center justify-between py-4">
              <p className="text-sm text-[#54615d]">Contributions</p>
              <p className="text-sm font-semibold text-[#1b1c1a]">{helpCount ?? 0}</p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#1b1c1a]">Skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[...canHelpSkills, ...needHelpSkills].map((skill) => (
                  <Badge key={skill} variant="tag">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#1b1c1a]">Badges</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {badges.length > 0 ? (
                  badges.map((badge) => (
                    <Badge key={badge.id} variant="solved">
                      {badge.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-[#54615d]">No badges earned yet.</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#1b1c1a]">Recent activity</p>
              <div className="mt-3 space-y-3">
                {(trustEvents ?? []).map((event) => (
                  <div key={event.id} className="rounded-[18px] border border-[#efeeea] p-4">
                    <p className="text-sm font-medium capitalize text-[#1b1c1a]">
                      {event.event_type.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-xs text-[#54615d]">{timeAgo(event.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6c7a71]">
            Community View
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Avatar
              name={profile.full_name ?? profile.username ?? "Member"}
              src={profile.avatar_url}
              size="lg"
            />
            <div>
              <p className="text-lg font-bold text-[#1b1c1a]">
                {profile.full_name ?? profile.username ?? "Community member"}
              </p>
              <p className="text-sm text-[#54615d]">
                @{profile.username ?? "member"} &middot; {profile.location ?? "Community"}
              </p>
            </div>
          </div>

          {profile.bio ? (
            <p className="mt-6 text-sm leading-7 text-[#5F5F5F]">{profile.bio}</p>
          ) : null}

          <div className="mt-8 space-y-4 rounded-[18px] border border-[#efeeea] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#54615d]">Requests posted</span>
              <span className="font-semibold text-[#1b1c1a]">{requestCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#54615d]">Can help</span>
              <span className="font-semibold text-[#1b1c1a]">{canHelpSkills.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#54615d]">Need help</span>
              <span className="font-semibold text-[#1b1c1a]">{needHelpSkills.length}</span>
            </div>
          </div>

          <div className="mt-6">
            {isMe ? (
              <Link href="/profile/me">
                <Button variant="secondary">Edit profile</Button>
              </Link>
            ) : (
              <Link href={`/messages?user_id=${profile.id}`}>
                <Button>Message</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
