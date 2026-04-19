"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface FeedFiltersProps {
  categories: string[];
  skills: { id: string; name: string }[];
  currentParams: {
    category?: string;
    urgency?: string;
    skills?: string;
    location?: string;
    status?: string;
    sort?: string;
    cursor?: string;
  };
}

const URGENCY_OPTIONS = [
  { value: "low", label: "Low", color: "bg-[#D1FAF4] text-[#006c49]" },
  { value: "medium", label: "Medium", color: "bg-[#FEF3C7] text-[#B45309]" },
  { value: "high", label: "High", color: "bg-[#FFEDD5] text-[#C2410C]" },
  { value: "critical", label: "Critical", color: "bg-[#FEE2E2] text-[#B91C1C]" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "urgent", label: "Most Urgent" },
  { value: "offers", label: "Most Offers" },
];

export default function FeedFilters({
  categories,
  currentParams,
}: FeedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = (
    updates: Record<string, string | undefined>
  ): string => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Remove cursor when filters change
    params.delete("cursor");
    return params.toString();
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "all" ? undefined : e.target.value;
    router.push(`${pathname}?${createQueryString({ category: value })}`);
  };

  const handleUrgencyToggle = (urgency: string) => {
    const current = currentParams.urgency?.split(",") ?? [];
    const next = current.includes(urgency)
      ? current.filter((u) => u !== urgency)
      : [...current, urgency];
    router.push(
      `${pathname}?${createQueryString({
        urgency: next.length > 0 ? next.join(",") : undefined,
      })}`
    );
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "all" ? undefined : e.target.value;
    router.push(`${pathname}?${createQueryString({ status: value })}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(
      `${pathname}?${createQueryString({ sort: e.target.value })}`
    );
  };

  const handleLocationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value || undefined;
    router.push(`${pathname}?${createQueryString({ location: value })}`);
  };

  const selectedUrgencies = currentParams.urgency?.split(",") ?? [];

  return (
    <div className="space-y-4 bg-white rounded-[14px] border border-[#d7e6e0] p-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Category filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#54615d]">Category:</label>
          <select
            value={currentParams.category ?? "all"}
            onChange={handleCategoryChange}
            className="px-3 py-1.5 text-sm border border-[#d7e6e0] rounded-[10px] bg-white text-[#1b1c1a] focus:border-[#006c49] focus:outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#54615d]">Status:</label>
          <select
            value={currentParams.status ?? "open"}
            onChange={handleStatusChange}
            className="px-3 py-1.5 text-sm border border-[#d7e6e0] rounded-[10px] bg-white text-[#1b1c1a] focus:border-[#006c49] focus:outline-none"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="solved">Solved</option>
            <option value="closed">Closed</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#54615d]">Sort:</label>
          <select
            value={currentParams.sort ?? "newest"}
            onChange={handleSortChange}
            className="px-3 py-1.5 text-sm border border-[#d7e6e0] rounded-[10px] bg-white text-[#1b1c1a] focus:border-[#006c49] focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Urgency pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-[#54615d] mr-1">Urgency:</span>
        {URGENCY_OPTIONS.map((opt) => {
          const selected = selectedUrgencies.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => handleUrgencyToggle(opt.value)}
              className={[
                "px-3 py-1 rounded-[999px] text-xs font-medium transition-all",
                selected ? opt.color : "bg-[#efeeea] text-[#54615d]",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Location filter */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-[#54615d]">Location:</label>
        <input
          type="text"
          placeholder="Filter by location..."
          defaultValue={currentParams.location ?? ""}
          onChange={handleLocationChange}
          className="px-3 py-1.5 text-sm border border-[#d7e6e0] rounded-[10px] bg-white text-[#1b1c1a] focus:border-[#006c49] focus:outline-none w-48"
        />
      </div>
    </div>
  );
}
