"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { deleteAccount, updateProfile } from "./actions";
import type { AppProfile } from "@/lib/auth/guards";

type Skill = {
  id: string;
  name: string;
  category: string;
};

type SelectedSkill = Skill & {
  can_help: boolean;
  needs_help: boolean;
};

type Interest = {
  id: string;
  name: string;
};

type BadgeItem = {
  id: string;
  name: string;
};

type Props = {
  profile: AppProfile;
  allSkills: Skill[];
  allInterests: Interest[];
  initialSkills: SelectedSkill[];
  initialInterestIds: string[];
  contributionCount: number;
  earnedBadges: BadgeItem[];
};

export default function ProfileMeClient({
  profile,
  allSkills,
  allInterests,
  initialSkills,
  initialInterestIds,
  contributionCount,
  earnedBadges,
}: Props) {
  const [formState, setFormState] = useState({
    full_name: profile.full_name ?? "",
    username: profile.username ?? "",
    location: profile.location ?? "",
    bio: profile.bio ?? "",
    avatar_url: profile.avatar_url ?? "",
    user_mode: profile.user_mode ?? "both",
  });
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>(initialSkills);
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>(initialInterestIds);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function toggleSkill(skill: Skill) {
    setSelectedSkills((current) => {
      const existing = current.find((item) => item.id === skill.id);
      if (existing) {
        return current.filter((item) => item.id !== skill.id);
      }

      return [
        ...current,
        {
          ...skill,
          can_help: true,
          needs_help: false,
        },
      ];
    });
  }

  function toggleSkillMode(skillId: string, key: "can_help" | "needs_help") {
    setSelectedSkills((current) =>
      current
        .map((item) =>
          item.id === skillId ? { ...item, [key]: !item[key] } : item
        )
        .filter((item) => item.can_help || item.needs_help)
    );
  }

  async function saveBasics(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    Object.entries(formState).forEach(([key, value]) => formData.set(key, value));
    const result = await updateProfile(formData);

    setIsSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    setMessage("Profile updated.");
  }

  async function saveSkills() {
    setError(null);
    setMessage(null);
    const response = await fetch("/api/user/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skills: selectedSkills.map((skill) => ({
          skill_id: skill.id,
          can_help: skill.can_help,
          needs_help: skill.needs_help,
        })),
      }),
    });

    if (!response.ok) {
      setError("Could not save skills.");
      return;
    }

    setMessage("Skills updated.");
  }

  async function saveInterests() {
    setError(null);
    setMessage(null);

    const response = await fetch("/api/user/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interest_ids: selectedInterestIds,
      }),
    });

    if (!response.ok) {
      setError("Could not save interests.");
      return;
    }

    setMessage("Interests updated.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_420px]">
      <Card className="rounded-[22px] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
          Public Profile
        </p>
        <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#111111]">
          Skills and reputation
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[18px] border border-[#F0EBE3] p-4">
            <p className="text-sm text-[#6B6B6B]">Trust score</p>
            <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111111]">
              {profile.trust_score}%
            </p>
          </div>
          <div className="rounded-[18px] border border-[#F0EBE3] p-4">
            <p className="text-sm text-[#6B6B6B]">Contributions</p>
            <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111111]">
              {contributionCount}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <p className="text-sm font-semibold text-[#111111]">Skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <Badge key={skill.id} variant="tag">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#111111]">Badges</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {earnedBadges.map((badge) => (
                <Badge key={badge.id} variant="solved">
                  {badge.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
            Edit Profile
          </p>
          <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#111111]">
            Update your identity
          </h2>

          <form onSubmit={saveBasics} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Name</span>
                <input
                  value={formState.full_name}
                  onChange={(event) => setFormState((state) => ({ ...state, full_name: event.target.value }))}
                  className="w-full rounded-[14px] border border-[#E8E2D9] px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#0C9F88]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Location</span>
                <input
                  value={formState.location}
                  onChange={(event) => setFormState((state) => ({ ...state, location: event.target.value }))}
                  className="w-full rounded-[14px] border border-[#E8E2D9] px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#0C9F88]"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Username</span>
              <input
                value={formState.username}
                onChange={(event) => setFormState((state) => ({ ...state, username: event.target.value }))}
                className="w-full rounded-[14px] border border-[#E8E2D9] px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#0C9F88]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Avatar URL</span>
              <input
                value={formState.avatar_url}
                onChange={(event) => setFormState((state) => ({ ...state, avatar_url: event.target.value }))}
                className="w-full rounded-[14px] border border-[#E8E2D9] px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#0C9F88]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Mode</span>
              <select
                value={formState.user_mode}
                onChange={(event) => setFormState((state) => ({ ...state, user_mode: event.target.value }))}
                className="w-full rounded-[14px] border border-[#E8E2D9] px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#0C9F88]"
              >
                <option value="need_help">Need help</option>
                <option value="can_help">Can help</option>
                <option value="both">Both</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Bio</span>
              <textarea
                value={formState.bio}
                onChange={(event) => setFormState((state) => ({ ...state, bio: event.target.value }))}
                rows={4}
                className="w-full rounded-[14px] border border-[#E8E2D9] px-4 py-3 text-sm leading-6 text-[#111111] outline-none focus:border-[#0C9F88]"
              />
            </label>

            <Button type="submit" className="w-full">
              {isSaving ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </Card>

        <Card className="rounded-[22px] p-6">
          <p className="text-sm font-semibold text-[#111111]">Skills</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {allSkills.map((skill) => {
              const selected = selectedSkills.find((item) => item.id === skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={[
                    "rounded-full px-3 py-2 text-sm",
                    selected ? "bg-[#EEF4EF] text-[#111111]" : "bg-[#F4F1EC] text-[#6B6B6B]",
                  ].join(" ")}
                >
                  {skill.name}
                </button>
              );
            })}
          </div>

          {selectedSkills.length > 0 ? (
            <div className="mt-5 space-y-3">
              {selectedSkills.map((skill) => (
                <div key={skill.id} className="rounded-[16px] border border-[#F0EBE3] p-4">
                  <p className="text-sm font-semibold text-[#111111]">{skill.name}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSkillMode(skill.id, "can_help")}
                      className={[
                        "rounded-full px-3 py-1.5 text-xs font-medium",
                        skill.can_help ? "bg-[#EEF4EF] text-[#111111]" : "bg-[#F4F1EC] text-[#6B6B6B]",
                      ].join(" ")}
                    >
                      Can help
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSkillMode(skill.id, "needs_help")}
                      className={[
                        "rounded-full px-3 py-1.5 text-xs font-medium",
                        skill.needs_help ? "bg-[#FFF3E6] text-[#8B4B16]" : "bg-[#F4F1EC] text-[#6B6B6B]",
                      ].join(" ")}
                    >
                      Need help
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-5">
            <Button type="button" variant="secondary" onClick={saveSkills}>
              Save skills
            </Button>
          </div>
        </Card>

        <Card className="rounded-[22px] p-6">
          <p className="text-sm font-semibold text-[#111111]">Interests</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {allInterests.map((interest) => {
              const selected = selectedInterestIds.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() =>
                    setSelectedInterestIds((current) =>
                      current.includes(interest.id)
                        ? current.filter((item) => item !== interest.id)
                        : [...current, interest.id]
                    )
                  }
                  className={[
                    "rounded-full px-3 py-2 text-sm",
                    selected ? "bg-[#EEF4EF] text-[#111111]" : "bg-[#F4F1EC] text-[#6B6B6B]",
                  ].join(" ")}
                >
                  {interest.name}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <Button type="button" variant="secondary" onClick={saveInterests}>
              Save interests
            </Button>
          </div>
        </Card>

        <Card className="rounded-[22px] border-[#F6D5D1] p-6">
          <p className="text-sm font-semibold text-[#8B1E1E]">Danger zone</p>
          <p className="mt-3 text-sm leading-6 text-[#6B6B6B]">
            Deleting your account removes your profile and related activity.
          </p>
          <div className="mt-4">
            <Button type="button" variant="danger" onClick={() => deleteAccount()}>
              Delete account
            </Button>
          </div>
        </Card>

        {message ? (
          <div className="rounded-[18px] bg-[#EEF4EF] px-4 py-3 text-sm text-[#245D51]">{message}</div>
        ) : null}
        {error ? (
          <div className="rounded-[18px] bg-[#FFF1EF] px-4 py-3 text-sm text-[#B42318]">{error}</div>
        ) : null}
      </div>
    </div>
  );
}
