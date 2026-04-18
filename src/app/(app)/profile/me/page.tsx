import { requireOnboarded } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import HeroBanner from "@/components/ui/HeroBanner";
import ProfileMeClient from "./profile-me-client";

export default async function ProfileMePage() {
  const { profile } = await requireOnboarded();
  const admin = createAdminClient();

  const [{ data: allSkills }, { data: allInterests }, { data: userSkillRows }, { data: userInterestRows }, { data: userBadgeRows }, { data: allBadges }, { count: contributionCount }] =
    await Promise.all([
      admin.from("skills").select("id, name, category").order("name"),
      admin.from("interests").select("id, name").order("name"),
      admin.from("user_skills").select("skill_id, can_help, needs_help").eq("user_id", profile.id),
      admin.from("user_interests").select("interest_id").eq("user_id", profile.id),
      admin.from("user_badges").select("badge_id").eq("user_id", profile.id),
      admin.from("badges").select("id, name"),
      admin.from("request_helpers").select("id", { count: "exact", head: true }).eq("helper_id", profile.id),
    ]);

  const skillMap = new Map((allSkills ?? []).map((skill) => [skill.id, skill]));
  const initialSkills = (userSkillRows ?? [])
    .map((row) => {
      const skill = skillMap.get(row.skill_id);
      return skill
        ? {
            id: skill.id,
            name: skill.name,
            category: skill.category,
            can_help: row.can_help,
            needs_help: row.needs_help,
          }
        : null;
    })
    .filter(Boolean);

  const badgeMap = new Map((allBadges ?? []).map((badge) => [badge.id, badge]));
  const earnedBadges = (userBadgeRows ?? [])
    .map((row) => badgeMap.get(row.badge_id))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <HeroBanner
        label="Profile"
        title={profile.full_name ?? profile.username ?? "Community member"}
        subtitle={`${profile.user_mode ?? "both"} · ${profile.location ?? "Community"}`}
      />

      <ProfileMeClient
        profile={profile}
        allSkills={allSkills ?? []}
        allInterests={allInterests ?? []}
        initialSkills={initialSkills}
        initialInterestIds={(userInterestRows ?? []).map((row) => row.interest_id)}
        contributionCount={contributionCount ?? 0}
        earnedBadges={earnedBadges}
      />
    </div>
  );
}
