"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { submitStep1, submitStep2, submitStep3, submitStep4 } from "./actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Database } from "@/lib/supabase/types";

type Skill = Database["public"]["Tables"]["skills"]["Row"];
type Interest = Database["public"]["Tables"]["interests"]["Row"];

export default function OnboardingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentStep = parseInt(searchParams.get("step") ?? "1", 10);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [userSkills, setUserSkills] = useState<{ skill_id: string; can_help: boolean; needs_help: boolean }[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [userMode, setUserMode] = useState<string>("both");

  useEffect(() => {
    fetch("/api/skills").then(r => r.json()).then(d => setSkills(d.skills ?? []));
    fetch("/api/interests").then(r => r.json()).then(d => setInterests(d.interests ?? []));
  }, []);

  async function handleStep1(formData: FormData) {
    setError("");
    startTransition(async () => {
      const res = await submitStep1(formData);
      if (res?.error) setError(res.error);
      else router.push("/onboarding?step=2");
    });
  }

  async function handleStep2(mode: string) {
    setError("");
    startTransition(async () => {
      const res = await submitStep2(mode);
      if (res?.error) setError(res.error);
      else router.push("/onboarding?step=3");
    });
  }

  async function handleStep3() {
    setError("");
    if (userSkills.length === 0) {
      setError("Select at least 1 skill");
      return;
    }
    startTransition(async () => {
      const res = await submitStep3(userSkills);
      if (res?.error) setError(res.error);
      else router.push("/onboarding?step=4");
    });
  }

  async function handleStep4(formData: FormData) {
    setError("");
    if (selectedInterests.length < 3) {
      setError("Select at least 3 interests");
      return;
    }
    formData.append("interest_ids", JSON.stringify(selectedInterests));
    startTransition(async () => {
      const res = await submitStep4(formData);
      if (res?.error) setError(res.error);
      else router.push("/dashboard");
    });
  }

  function toggleSkill(skillId: string) {
    setUserSkills(prev => {
      const existing = prev.find(s => s.skill_id === skillId);
      if (existing) {
        return prev.filter(s => s.skill_id !== skillId);
      }
      return [...prev, { skill_id: skillId, can_help: true, needs_help: false }];
    });
  }

  function toggleSkillMode(skillId: string, mode: "can_help" | "needs_help") {
    setUserSkills(prev => prev.map(s => {
      if (s.skill_id !== skillId) return s;
      return mode === "can_help" ? { ...s, can_help: !s.can_help } : { ...s, needs_help: !s.needs_help };
    }));
  }

  function toggleInterest(interestId: string) {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) return prev.filter(i => i !== interestId);
      return [...prev, interestId];
    });
  }

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-[14px] border border-[#d7e6e0] p-8 shadow-[0_4px_12px_rgba(0,0,0,.06)]">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1b1c1a] mb-2">Welcome to HelpHub AI</h1>
          <p className="text-sm text-[#54615d]">Step {currentStep} of 4</p>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${s <= currentStep ? "bg-[#006c49]" : "bg-[#d7e6e0]"}`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-[10px] bg-[#FEE2E2] text-[#B91C1C] text-sm">{error}</div>
        )}

        {currentStep === 1 && (
          <form action={handleStep1} className="space-y-4">
            <Input name="full_name" label="Full name" required />
            <Input name="username" label="Username" required placeholder="lowercase_letters_and_numbers" />
            <Input name="location" label="Location (optional)" placeholder="City, Country" />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving..." : "Continue"}
            </Button>
          </form>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[#54615d] mb-4">How do you want to use HelpHub AI?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "need_help", label: "Get Help", desc: "I need help with things" },
                { id: "can_help", label: "Offer Help", desc: "I want to help others" },
                { id: "both", label: "Both", desc: "Give and receive help" },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setUserMode(opt.id)}
                  className={`p-4 rounded-[14px] border text-left transition-all ${
                    userMode === opt.id
                      ? "border-[#006c49] bg-[#D1FAF4]"
                      : "border-[#d7e6e0] hover:border-[#006c49]"
                  }`}
                >
                  <div className="font-medium text-[#1b1c1a]">{opt.label}</div>
                  <div className="text-xs text-[#54615d]">{opt.desc}</div>
                </button>
              ))}
            </div>
            <Button onClick={() => handleStep2(userMode)} disabled={isPending} className="w-full mt-6">
              {isPending ? "Saving..." : "Continue"}
            </Button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-[#54615d] mb-2">Select skills and indicate how you can help</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-2">
              {skills.map(skill => {
                const selected = userSkills.find(s => s.skill_id === skill.id);
                return (
                  <div
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`p-3 rounded-[10px] border cursor-pointer transition-all ${
                      selected ? "border-[#006c49] bg-[#D1FAF4]" : "border-[#d7e6e0] hover:border-[#006c49]"
                    }`}
                  >
                    <div className="font-medium text-sm text-[#1b1c1a]">{skill.name}</div>
                    <div className="text-xs text-[#54615d]">{skill.category}</div>
                    {selected && (
                      <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selected.can_help}
                            onChange={() => toggleSkillMode(skill.id, "can_help")}
                          />
                          Can help
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={selected.needs_help}
                            onChange={() => toggleSkillMode(skill.id, "needs_help")}
                          />
                          Need help
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Button onClick={handleStep3} disabled={isPending} className="w-full">
              {isPending ? "Saving..." : "Continue"}
            </Button>
          </div>
        )}

        {currentStep === 4 && (
          <form action={handleStep4} className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[#1b1c1a] mb-2">Interests (select at least 3)</p>
              <div className="flex flex-wrap gap-2">
                {interests.map(interest => (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedInterests.includes(interest.id)
                        ? "bg-[#006c49] text-white"
                        : "bg-[#efeeea] text-[#54615d] hover:bg-[#d7e6e0]"
                    }`}
                  >
                    {interest.name}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              name="bio"
              placeholder="Tell us about yourself (optional)"
              rows={4}
              className="w-full rounded-[10px] border border-[#d7e6e0] px-3 py-2 text-sm outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49]"
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Finishing..." : "Finish"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
