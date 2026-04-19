"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import HeroBanner from "@/components/ui/HeroBanner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { createRequest } from "./actions";

type SuggestionState = {
  category: string;
  urgency: "low" | "medium" | "high" | "critical";
  tags: string[];
  rewrite: string | null;
};

const initialSuggestions: SuggestionState = {
  category: "Community",
  urgency: "low",
  tags: [],
  rewrite: null,
};

const categories = [
  "Programming",
  "Design",
  "Academic",
  "Career",
  "Business",
  "Data",
  "Language",
  "Other",
];

export default function NewRequestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagLabel = useMemo(() => {
    if (suggestions.tags.length === 0) return "Add more detail for smarter tags";
    return suggestions.tags.join(", ");
  }, [suggestions.tags]);

  async function runAiSuggestions() {
    if (!title.trim() || description.trim().length < 20) {
      return;
    }

    setIsLoadingAI(true);
    setError(null);

    try {
      const [categoryRes, tagRes, rewriteRes] = await Promise.all([
        fetch("/api/ai/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        }),
        fetch("/api/ai/suggest-tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: `${title} ${description}` }),
        }),
        fetch("/api/ai/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: description, mode: "rewrite" }),
        }),
      ]);

      const nextSuggestions = { ...suggestions };

      if (categoryRes.ok) {
        const data = (await categoryRes.json()) as {
          category?: string;
          urgency?: "low" | "medium" | "high" | "critical";
        };
        nextSuggestions.category = data.category ?? nextSuggestions.category;
        nextSuggestions.urgency = data.urgency ?? nextSuggestions.urgency;
        if (!category) setCategory(data.category ?? "");
        setUrgency(data.urgency ?? urgency);
      }

      if (tagRes.ok) {
        const data = (await tagRes.json()) as { tags?: string[] };
        nextSuggestions.tags = data.tags ?? [];
      }

      if (rewriteRes.ok) {
        const data = (await rewriteRes.json()) as { text?: string };
        nextSuggestions.rewrite = data.text ?? null;
      }

      setSuggestions(nextSuggestions);
      if (nextSuggestions.tags.length > 0 && tags.length === 0) {
        setTags(nextSuggestions.tags);
      }
    } catch {
      setError("The AI helper could not respond. You can still publish the request manually.");
    } finally {
      setIsLoadingAI(false);
    }
  }

  function addTag(value: string) {
    const normalized = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (normalized.length === 0) return;

    setTags((current) => Array.from(new Set([...current, ...normalized])).slice(0, 10));
    setTagInput("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("category", category);
    formData.set("urgency", urgency);
    formData.set("location", location);
    tags.forEach((tag) => formData.append("tags", tag));

    const result = await createRequest(formData);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.requestId) {
      router.push(`/requests/${result.requestId}`);
    }
  }

  return (
    <div className="space-y-6">
      <HeroBanner
        label="Create Request"
        title="Turn a rough problem into a clear help request."
        subtitle="Use built-in AI suggestions for category, urgency, tags, and a stronger description rewrite."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_420px]">
        <Card className="rounded-[22px] p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Need review on my JavaScript quiz app before submission"
                  className="w-full rounded-[14px] border border-[#E8E2D9] bg-white px-4 py-3 text-sm text-[#111111] outline-none placeholder:text-[#A0A0A0] focus:border-[#0C9F88]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Explain the challenge, your current progress, deadline, and what kind of help would be useful."
                  rows={8}
                  className="w-full rounded-[14px] border border-[#E8E2D9] bg-white px-4 py-3 text-sm leading-6 text-[#111111] outline-none placeholder:text-[#A0A0A0] focus:border-[#0C9F88]"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Category</span>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full rounded-[14px] border border-[#E8E2D9] bg-white px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#0C9F88]"
                  >
                    <option value="">Select category</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Urgency</span>
                  <select
                    value={urgency}
                    onChange={(event) =>
                      setUrgency(event.target.value as "low" | "medium" | "high" | "critical")
                    }
                    className="w-full rounded-[14px] border border-[#E8E2D9] bg-white px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#0C9F88]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Location</span>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Remote, Karachi, Lahore"
                    className="w-full rounded-[14px] border border-[#E8E2D9] bg-white px-4 py-3 text-sm text-[#111111] outline-none placeholder:text-[#A0A0A0] focus:border-[#0C9F88]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Tags</span>
                  <input
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onBlur={() => addTag(tagInput)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    placeholder="Add tag and press Enter"
                    className="w-full rounded-[14px] border border-[#E8E2D9] bg-white px-4 py-3 text-sm text-[#111111] outline-none placeholder:text-[#A0A0A0] focus:border-[#0C9F88]"
                  />
                </label>
              </div>

              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                        className="ml-2 text-[#8B8B8B] hover:text-[#111111]"
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-[14px] bg-[#FFF1EF] px-4 py-3 text-sm text-[#B42318]">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={runAiSuggestions}>
                  {isLoadingAI ? "Applying AI..." : "Apply AI suggestions"}
                </Button>
                <Button type="submit">{isSubmitting ? "Publishing..." : "Publish request"}</Button>
              </div>
            </div>
          </form>
        </Card>

        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">AI Assistant</p>
          <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#111111]">
            Smart request guidance
          </h2>

          <div className="mt-8 space-y-5 text-sm">
            <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-[#F0EBE3] pb-4">
              <span className="text-[#6B6B6B]">Suggested category</span>
              <span className="font-semibold text-[#111111]">
                {category || suggestions.category || "--"}
              </span>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-[#F0EBE3] pb-4">
              <span className="text-[#6B6B6B]">Detected urgency</span>
              <span className="font-semibold capitalize text-[#111111]">{urgency}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-[#F0EBE3] pb-4">
              <span className="text-[#6B6B6B]">Suggested tags</span>
              <span className="font-semibold text-[#111111]">{tagLabel}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-3">
              <span className="text-[#6B6B6B]">Rewrite suggestion</span>
              <div className="space-y-3">
                <p className="font-semibold leading-6 text-[#111111]">
                  {suggestions.rewrite || "Start describing the challenge to generate a stronger version."}
                </p>
                {suggestions.rewrite ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setDescription(suggestions.rewrite ?? description)}
                  >
                    Use rewrite
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
