import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import HeroBanner from "@/components/ui/HeroBanner";
import Button from "@/components/ui/Button";
import RequestCard from "@/components/cards/RequestCard";

type SearchParams = Promise<{
  category?: string;
  urgency?: string;
  skills?: string;
  location?: string;
  status?: string;
}>;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireOnboarded();

  const params = await searchParams;
  const admin = createAdminClient();

  const [{ data: categoryRows }, { data: skillRows }] = await Promise.all([
    admin.from("requests").select("category").not("category", "is", null),
    admin.from("skills").select("id, name").order("name"),
  ]);

  const categories = Array.from(
    new Set((categoryRows ?? []).map((row) => row.category).filter(Boolean) as string[])
  ).sort();

  let query = admin
    .from("requests")
    .select("id, author_id, title, description, category, urgency, status, tags, location, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .limit(24);

  if (params.category && params.category !== "all") {
    query = query.eq("category", params.category);
  }

  if (params.urgency && params.urgency !== "all") {
    query = query.eq("urgency", params.urgency as "low" | "medium" | "high" | "critical");
  }

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status as "open" | "in_progress" | "solved" | "closed");
  }

  if (params.location) {
    query = query.ilike("location", `%${params.location}%`);
  }

  if (params.skills) {
    query = query.contains("tags", [params.skills]);
  }

  const { data: requests, count } = await query;
  const requestRows = requests ?? [];
  const authorIds = Array.from(new Set(requestRows.map((row) => row.author_id)));
  const requestIds = requestRows.map((row) => row.id);

  const [{ data: authorRows }, { data: helperRows }] = await Promise.all([
    authorIds.length > 0
      ? admin
          .from("profiles")
          .select("id, full_name, username, avatar_url, trust_score")
          .in("id", authorIds)
      : Promise.resolve({ data: [] as never[] }),
    requestIds.length > 0
      ? admin
          .from("request_helpers")
          .select("request_id")
          .in("request_id", requestIds)
          .eq("status", "offered")
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const authorMap = new Map((authorRows ?? []).map((row) => [row.id, row]));
  const helperCounts = new Map<string, number>();

  for (const row of helperRows ?? []) {
    helperCounts.set(row.request_id, (helperCounts.get(row.request_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <HeroBanner
        label="Explore / Feed"
        title="Browse help requests with filterable community context."
        subtitle="Filter by category, urgency, skills, and location to surface the best matches."
      />

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <form
          method="get"
          className="rounded-[22px] border border-[#E8E2D9] bg-white p-6 shadow-[0_12px_28px_rgba(17,17,17,0.04)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
            Filters
          </p>
          <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#111111]">
            Refine the feed
          </h2>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Category</span>
              <select
                name="category"
                defaultValue={params.category ?? "all"}
                className="w-full rounded-[14px] border border-[#E8E2D9] bg-white px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#0C9F88]"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Urgency</span>
              <select
                name="urgency"
                defaultValue={params.urgency ?? "all"}
                className="w-full rounded-[14px] border border-[#E8E2D9] bg-white px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#0C9F88]"
              >
                <option value="all">All urgency levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Skills</span>
              <input
                name="skills"
                defaultValue={params.skills ?? ""}
                placeholder="React, Figma, Git/GitHub"
                className="w-full rounded-[14px] border border-[#E8E2D9] bg-white px-4 py-3 text-sm text-[#111111] outline-none placeholder:text-[#A0A0A0] focus:border-[#0C9F88]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#6B6B6B]">Location</span>
              <input
                name="location"
                defaultValue={params.location ?? ""}
                placeholder="Karachi, Lahore, Remote"
                className="w-full rounded-[14px] border border-[#E8E2D9] bg-white px-4 py-3 text-sm text-[#111111] outline-none placeholder:text-[#A0A0A0] focus:border-[#0C9F88]"
              />
            </label>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Apply filters</Button>
              <Link href="/explore" className="inline-flex items-center text-sm font-medium text-[#6B6B6B]">
                Clear
              </Link>
            </div>

            <div className="rounded-[18px] bg-[#F7F2EC] p-4 text-xs leading-5 text-[#6B6B6B]">
              {skillRows?.length ?? 0} skills in the community catalog · {count ?? 0} requests visible
            </div>
          </div>
        </form>

        <div className="space-y-4">
          {requestRows.length === 0 ? (
            <div className="rounded-[22px] border border-[#E8E2D9] bg-white p-10 text-center shadow-[0_12px_28px_rgba(17,17,17,0.04)]">
              <p className="text-lg font-semibold text-[#111111]">No requests match the current filters.</p>
              <p className="mt-2 text-sm text-[#6B6B6B]">Try widening the category or clearing the skills/location filters.</p>
            </div>
          ) : (
            requestRows.map((request) => {
              const author = authorMap.get(request.author_id);

              return (
                <RequestCard
                  key={request.id}
                  request={request}
                  authorName={author?.full_name ?? "Community member"}
                  authorUsername={author?.username ?? "member"}
                  authorAvatarUrl={author?.avatar_url}
                  authorTrustScore={author?.trust_score ?? 0}
                  helperCount={helperCounts.get(request.id) ?? 0}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
