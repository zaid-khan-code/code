"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, deleteAccount } from "./actions";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  user_mode: "need_help" | "can_help" | "both" | null;
  trust_score: number;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  can_help: boolean;
  needs_help: boolean;
}

interface Interest {
  id: string;
  name: string;
}

interface PageProps {
  profile: Profile;
  skills: Skill[];
  allSkills: { id: string; name: string; category: string }[];
  interests: Interest[];
  allInterests: { id: string; name: string }[];
}

const MODE_OPTIONS = [
  { value: "need_help", label: "Need Help", desc: "I'm here to ask questions" },
  { value: "can_help", label: "Can Help", desc: "I'm here to help others" },
  { value: "both", label: "Both", desc: "I can help and need help" },
];

export default function EditProfilePage({ profile, allSkills, allInterests }: PageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);

  // Load user skills and interests on mount
  useEffect(() => {
    // Fetch current user skills
    fetch("/api/user/skills")
      .then((r) => r.json())
      .then((data) => setUserSkills(data.skills || []));

    // Fetch current user interests
    fetch("/api/user/interests")
      .then((r) => r.json())
      .then((data) => setUserInterests(data.interests?.map((i: Interest) => i.id) || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile({}, formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    await deleteAccount();
  };

  const toggleSkill = (skillId: string, type: "can_help" | "needs_help") => {
    setUserSkills((prev) => {
      const existing = prev.find((s) => s.id === skillId);
      if (existing) {
        return prev.map((s) =>
          s.id === skillId ? { ...s, [type]: !s[type] } : s
        ).filter((s) => s.can_help || s.needs_help);
      }
      const skill = allSkills.find((s) => s.id === skillId);
      if (skill) {
        return [
          ...prev,
          {
            id: skillId,
            name: skill.name,
            category: skill.category,
            can_help: type === "can_help",
            needs_help: type === "needs_help",
          },
        ];
      }
      return prev;
    });
  };

  const toggleInterest = (interestId: string) => {
    setUserInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const saveSkills = async () => {
    const res = await fetch("/api/user/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills: userSkills }),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const saveInterests = async () => {
    const res = await fetch("/api/user/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interest_ids: userInterests }),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-[#111111]">Edit Profile</h1>

      {/* Success message */}
      {success && (
        <div className="p-3 bg-[#D1FAF4] text-[#0C9F88] rounded-[10px] text-sm">
          Changes saved successfully!
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-[#FEE2E2] text-[#B91C1C] rounded-[10px] text-sm">
          {error}
        </div>
      )}

      {/* Profile basics */}
      <Card>
        <h2 className="font-semibold text-[#111111] mb-4">Profile Information</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar
              name={profile.full_name || profile.username || "User"}
              src={profile.avatar_url}
              size="lg"
            />
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#111111] mb-1">
                Avatar URL
              </label>
              <input
                name="avatar_url"
                type="url"
                defaultValue={profile.avatar_url || ""}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-[#E8E2D9] rounded-[10px] text-[#111111] focus:border-[#0C9F88] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">
              Full Name *
            </label>
            <input
              name="full_name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              defaultValue={profile.full_name || ""}
              className="w-full px-4 py-2 border border-[#E8E2D9] rounded-[10px] text-[#111111] focus:border-[#0C9F88] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">
              Username *
            </label>
            <input
              name="username"
              type="text"
              required
              minLength={3}
              maxLength={30}
              pattern="[a-z0-9_]+"
              defaultValue={profile.username || ""}
              className="w-full px-4 py-2 border border-[#E8E2D9] rounded-[10px] text-[#111111] focus:border-[#0C9F88] focus:outline-none"
            />
            <p className="text-xs text-[#A0A0A0] mt-1">
              Lowercase letters, numbers, underscores only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">
              Location
            </label>
            <input
              name="location"
              type="text"
              maxLength={100}
              defaultValue={profile.location || ""}
              placeholder="e.g., New York, NY"
              className="w-full px-4 py-2 border border-[#E8E2D9] rounded-[10px] text-[#111111] focus:border-[#0C9F88] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#111111] mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              rows={4}
              maxLength={500}
              defaultValue={profile.bio || ""}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-2 border border-[#E8E2D9] rounded-[10px] text-[#111111] focus:border-[#0C9F88] focus:outline-none resize-y"
            />
            <p className="text-xs text-[#A0A0A0] mt-1">Max 500 characters</p>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>

      {/* User mode */}
      <Card>
        <h2 className="font-semibold text-[#111111] mb-4">User Mode</h2>

        <form action={updateProfile} className="space-y-3">
          <input type="hidden" name="user_mode" value={profile.user_mode || "both"} />
          {MODE_OPTIONS.map((mode) => (
            <label key={mode.value} className="block cursor-pointer">
              <input
                type="radio"
                name="user_mode"
                value={mode.value}
                defaultChecked={profile.user_mode === mode.value}
                className="sr-only peer"
              />
              <div className="p-4 border border-[#E8E2D9] rounded-[10px] peer-checked:border-[#0C9F88] peer-checked:bg-[#F5F0EA] transition-all">
                <p className="font-medium text-[#111111]">{mode.label}</p>
                <p className="text-sm text-[#6B6B6B]">{mode.desc}</p>
              </div>
            </label>
          ))}
          <Button type="submit" className="mt-4">Update Mode</Button>
        </form>
      </Card>

      {/* Skills management */}
      <Card>
        <h2 className="font-semibold text-[#111111] mb-4">Manage Skills</h2>

        <div className="space-y-4">
          {allSkills.map((skill) => {
            const userSkill = userSkills.find((s) => s.id === skill.id);
            return (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3 border border-[#E8E2D9] rounded-[10px]"
              >
                <span className="font-medium text-sm">{skill.name}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill.id, "can_help")}
                    className={[
                      "px-3 py-1 text-xs rounded-full transition-all",
                      userSkill?.can_help
                        ? "bg-[#D1FAF4] text-[#0C9F88]"
                        : "bg-[#F0EBE3] text-[#6B6B6B]",
                    ].join(" ")}
                  >
                    Can Help
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill.id, "needs_help")}
                    className={[
                      "px-3 py-1 text-xs rounded-full transition-all",
                      userSkill?.needs_help
                        ? "bg-[#FEF3C7] text-[#B45309]"
                        : "bg-[#F0EBE3] text-[#6B6B6B]",
                    ].join(" ")}
                  >
                    Needs Help
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <Button onClick={saveSkills} className="mt-4">Save Skills</Button>
      </Card>

      {/* Interests management */}
      <Card>
        <h2 className="font-semibold text-[#111111] mb-4">Manage Interests</h2>

        <div className="flex flex-wrap gap-2">
          {allInterests.map((interest) => (
            <button
              key={interest.id}
              type="button"
              onClick={() => toggleInterest(interest.id)}
              className={[
                "px-3 py-1.5 text-sm rounded-full transition-all",
                userInterests.includes(interest.id)
                  ? "bg-[#0C9F88] text-white"
                  : "bg-[#F0EBE3] text-[#6B6B6B] hover:bg-[#E8E2D9]",
              ].join(" ")}
            >
              {interest.name}
            </button>
          ))}
        </div>

        <Button onClick={saveInterests} className="mt-4">Save Interests</Button>
      </Card>

      {/* Danger zone */}
      <Card className="border-[#EF4444]">
        <h2 className="font-semibold text-[#EF4444] mb-4">Danger Zone</h2>

        {!showDeleteConfirm ? (
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-[#B91C1C] text-sm">
              This will permanently delete your account and all your data.
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="danger" onClick={handleDelete}>
                Confirm Delete
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
