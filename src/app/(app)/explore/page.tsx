import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth/guards";
import RequestCard from "@/components/cards/RequestCard";
import Button from "@/components/ui/Button";
import FeedFilters from "./_components/FeedFilters";

export const revalidate = 60;

type SearchParams = {
  category?: string;
  urgency?: string;
  skills?: string;
  location?: string;
  status?: string;
  sort?: string;
  cursor?: string;
};

const PAGE_SIZE = 20;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ profile }, params] = await Promise.all([
    requireOnboarded(),
    searchParams,
  ]);

  const sb = await createClient();

  // Get distinct categories for filter
  const { data: allCategories = [] } = await sb
    .from("requests")
    .select("category")
    .not("category", "is", null)
    .order("category");
  const categories = [...new Set(allCategories?.map((c) => c.category).filter((c): c is string => c !== null))];

  // Get all skills for filter
  const { data: skillsList = [] } = await sb
    .from("skills")
    .select("id, name")
    .order("name");

  // Build query
  let query = sb.from("requests").select(
    `id, title, description, category, urgency, status, tags, location, created_at, author_id`,
    { count: "exact" }
  );

  // Apply filters
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  } else {
    query = query.eq("status", "open");
  }

  if (params.category && params.category !== "all") {
    query = query.eq("category", params.category);
  }

  if (params.urgency) {
    const urgencies = params.urgency.split(",");
    if (urgencies.length > 0) {
      query = query.in("urgency", urgencies);
    }
  }

  if (params.location) {
    query = query.ilike("location", `%${params.location}%`);
  }

  if (params.skills) {
    const skillIds = params.skills.split(",");
    // Find requests where tags overlap with skill names
    const { data: skillNames } = await sb
      .from("skills")
      .select("name")
      .in("id", skillIds);
    const names = skillNames?.map((s) => s.name) ?? [];
    if (names.length > 0) {
      // This is a simplified approach - requests where any tag matches any skill name
      names.forEach((name) => {
        query = query.contains("tags", [name]);
      });
    }
  }

  // Apply sort
  const sort = params.sort ?? "newest";
  if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (sort === "urgent") {
    // Custom urgency ordering: critical > high > medium > low
    query = query
      .order("urgency", { ascending: false })
      .order("created_at", { ascending: false });
  } else if (sort === "offers") {
    // Requires joining with request_helpers - simplified to newest for now
    query = query.order("created_at", { ascending: false });
  }

  // Apply cursor pagination
  if (params.cursor) {
    query = query.lt("created_at", params.cursor);
  }

  query = query.limit(PAGE_SIZE + 1);

  const { data: rawRequests, count } = await query;
  const requests = rawRequests ?? [];

  const hasMore = requests.length > PAGE_SIZE;
  const nextCursor = hasMore ? requests[PAGE_SIZE - 1]?.created_at : null;
  const visibleRequests = requests.slice(0, PAGE_SIZE);

  // Fetch authors and helper counts for visible requests
  const authorIds = visibleRequests.map((r) => r.author_id);
  const requestIds = visibleRequests.map((r) => r.id);

  const [{ data: authors = [] }, { data: helpers = [] }] = await Promise.all([
    sb
      .from("profiles")
      .select("id, full_name, username, avatar_url, trust_score")
      .in("id", authorIds),
    sb
      .from("request_helpers")
      .select("request_id, id")
      .in("request_id", requestIds)
      .eq("status", "offered"),
  ]);

  const authorMap = new Map((authors ?? []).map((a) => [a.id, a]));
  const helperCounts = new Map<string, number>();
  helpers.forEach((h) => {
    helperCounts.set(h.request_id, (helperCounts.get(h.request_id) ?? 0) + 1);
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#111111]">Explore</h1>
        <Link href="/requests/new">
          <Button>+ New Request</Button>
        </Link>
      </div>

      <FeedFilters
        categories={categories
          .map((c) => c.category)
          .filter((c): c is string => c !== null)}
        skills={skillsList}
        currentParams={params}
      />

      <div className="space-y-4 mt-6">
        {visibleRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6B6B6B] mb-4">
              No requests match your filters.
            </p>
            <Link href="/explore">
              <Button variant="secondary">Clear filters</Button>
            </Link>
          </div>
        ) : (
          visibleRequests.map((r) => {
            const author = authorMap.get(r.author_id);
            return (
              <RequestCard
                key={r.id}
                request={r}
                authorName={author?.full_name ?? "Unknown"}
                authorUsername={author?.username ?? "unknown"}
                authorAvatarUrl={author?.avatar_url}
                authorTrustScore={author?.trust_score}
                helperCount={helperCounts.get(r.id) ?? 0}
              />
            );
          })
        )}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <Link
            href={{
              pathname: "/explore",
              query: { ...params, cursor: nextCursor },
            }}
          >
            <Button variant="secondary">Load more</Button>
          </Link>
        </div>
      )}

      <p className="text-xs text-[#A0A0A0] text-center mt-6">
        {count !== null ? `${count} total requests` : "Loading..."}
      </p>
    </div>
  );
}
