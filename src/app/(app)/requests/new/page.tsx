"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createRequest } from "./actions";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const CATEGORY_OPTIONS = [
  "Programming",
  "Design",
  "Academic",
  "Career",
  "Business",
  "Data",
  "Language",
  "Other",
];

const URGENCY_OPTIONS = [
  { value: "low", label: "Low", color: "#0C9F88" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "high", label: "High", color: "#F97316" },
  { value: "critical", label: "Critical", color: "#EF4444" },
];

interface AISuggestions {
  category?: string;
  urgency?: "low" | "medium" | "high" | "critical";
  tags?: string[];
}

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions>({});
  const [aiRewritten, setAiRewritten] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleAICategorize = useCallback(async () => {
    const title = (document.getElementById("title") as HTMLInputElement)
      ?.value;
    const description = (
      document.getElementById("description") as HTMLTextAreaElement
    )?.value;

    if (!title || !description || description.length < 20) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestions((prev) => ({ ...prev, ...data }));
      }

      // Also get tags
      const tagRes = await fetch("/api/ai/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${title} ${description}` }),
      });
      if (tagRes.ok) {
        const tagData = await tagRes.json();
        setAiSuggestions((prev) => ({ ...prev, tags: tagData.tags }));
      }
    } catch {
      // Silent fail - AI is optional
    } finally {
      setAiLoading(false);
    }
  }, []);

  const handleAIRewrite = async () => {
    const description = (
      document.getElementById("description") as HTMLTextAreaElement
    )?.value;
    if (!description || description.length < 20) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: description, mode: "rewrite" }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiRewritten(data.text);
      }
    } catch {
      // Silent fail
    } finally {
      setAiLoading(false);
    }
  };

  const acceptRewrite = () => {
    if (aiRewritten) {
      const textarea = document.getElementById(
        "description"
      ) as HTMLTextAreaElement;
      textarea.value = aiRewritten;
      setAiRewritten(null);
    }
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    tags.forEach((tag) => formData.append("tags", tag));

    const result = await createRequest({}, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.requestId) {
      router.push(`/requests/${result.requestId}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-[#111111] mb-6">
        Create New Request
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-[#111111] mb-1"
            >
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              minLength={10}
              maxLength={120}
              placeholder="e.g., Need help with React useEffect cleanup"
              className="w-full px-4 py-2 border border-[#E8E2D9] rounded-[10px] text-[#111111] focus:border-[#0C9F88] focus:outline-none"
            />
            <p className="text-xs text-[#A0A0A0] mt-1">
              10-120 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[#111111] mb-1"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              minLength={30}
              maxLength={4000}
              rows={6}
              placeholder="Describe what you need help with in detail..."
              onBlur={handleAICategorize}
              className="w-full px-4 py-2 border border-[#E8E2D9] rounded-[10px] text-[#111111] focus:border-[#0C9F88] focus:outline-none resize-y"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-[#A0A0A0]">
                30-4000 characters. Supports markdown.
              </p>
              <button
                type="button"
                onClick={handleAIRewrite}
                disabled={aiLoading}
                className="text-xs text-[#0C9F88] hover:underline"
              >
                {aiLoading ? "Processing..." : "Rewrite with AI"}
              </button>
            </div>

            {/* AI Rewrite suggestion */}
            {aiRewritten && (
              <div className="mt-3 p-3 bg-[#F5F0EA] rounded-[10px]">
                <p className="text-xs font-medium text-[#6B6B6B] mb-1">
                  AI Rewrite:
                </p>
                <p className="text-sm text-[#111111] mb-2">{aiRewritten}</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={acceptRewrite}
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAiRewritten(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-[#111111] mb-1"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={aiSuggestions.category || ""}
              className="w-full px-4 py-2 border border-[#E8E2D9] rounded-[10px] text-[#111111] focus:border-[#0C9F88] focus:outline-none"
            >
              <option value="">Select category...</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {aiSuggestions.category && (
              <p className="text-xs text-[#0C9F88] mt-1">
                AI suggested: {aiSuggestions.category}
              </p>
            )}
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-2">
              Urgency *
            </label>
            <div className="flex flex-wrap gap-2">
              {URGENCY_OPTIONS.map((opt) => (
                <label key={opt.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="urgency"
                    value={opt.value}
                    defaultChecked={
                      aiSuggestions.urgency === opt.value ||
                      (!aiSuggestions.urgency && opt.value === "medium")
                    }
                    className="sr-only peer"
                  />
                  <span
                    className={[
                      "inline-block px-4 py-2 rounded-[999px] text-sm font-medium transition-all",
                      "border-2 peer-checked:border-current",
                      "border-transparent text-[#6B6B6B] bg-[#F0EBE3]",
                    ].join(" ")}
                    style={{
                      color: opt.color,
                      backgroundColor: `${opt.color}15`,
                      borderColor: opt.color,
                    }}
                  >
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            {aiSuggestions.urgency && (
              <p className="text-xs text-[#0C9F88] mt-1">
                AI suggested: {aiSuggestions.urgency}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-[#6B6B6B] hover:text-[#EF4444]"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="Add a tag..."
                maxLength={50}
                className="flex-1 px-4 py-2 border border-[#E8E2D9] rounded-[10px] text-[#111111] focus:border-[#0C9F88] focus:outline-none"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => addTag(tagInput)}
              >
                Add
              </Button>
            </div>
            {aiSuggestions.tags && aiSuggestions.tags.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-[#6B6B6B]">
                  AI suggestions:{" "}
                </span>
                {aiSuggestions.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="text-xs text-[#0C9F88] hover:underline mr-2"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-[#111111] mb-1"
            >
              Location (optional)
            </label>
            <input
              id="location"
              name="location"
              type="text"
              maxLength={100}
              placeholder="e.g., Remote, New York, London"
              className="w-full px-4 py-2 border border-[#E8E2D9] rounded-[10px] text-[#111111] focus:border-[#0C9F88] focus:outline-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-[#FEE2E2] text-[#B91C1C] rounded-[10px] text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Request"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/explore")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
