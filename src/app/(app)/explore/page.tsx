import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import HeroBanner from "@/components/ui/HeroBanner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
        <Card className="rounded-[22px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6c7a71]">Filters</p>
          <h2 className="mt-3 text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-[#1b1c1a]">
            Refine the feed
          </h2>

          <form method="get" className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#54615d]">Category</span>
              <select
                name="category"
                defaultValue={params.category ?? "all"}
                className="w-full rounded-[14px] border border-[#d7e6e0] bg-white px-4 py-3 text-sm text-[#1b1c1a] outline-none focus:border-[#006c49]"
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
              <span className="mb-2 block text-sm font-medium text-[#54615d]">Urgency</span>
              <select
                name="urgency"
                defaultValue={params.urgency ?? "all"}
                className="w-full rounded-[14px] border border-[#d7e6e0] bg-white px-4 py-3 text-sm text-[#1b1c1a] outline-none focus:border-[#006c49]"
              >
                <option value="all">All urgency levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#54615d]">Skills</span>
              <input
                name="skills"
                defaultValue={params.skills ?? ""}
                placeholder="React, Figma, Git/GitHub"
                className="w-full rounded-[14px] border border-[#d7e6e0] bg-white px-4 py-3 text-sm text-[#1b1c1a] outline-none placeholder:text-[#A0A0A0] focus:border-[#006c49]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#54615d]">Location</span>
              <input
                name="location"
                defaultValue={params.location ?? ""}
                placeholder="Karachi, Lahore, Remote"
                className="w-full rounded-[14px] border border-[#d7e6e0] bg-white px-4 py-3 text-sm text-[#1b1c1a] outline-none placeholder:text-[#A0A0A0] focus:border-[#006c49]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#54615d]">Status</span>
              <select
                name="status"
                defaultValue={params.status ?? "all"}
                className="w-full rounded-[14px] border border-[#d7e6e0] bg-white px-4 py-3 text-sm text-[#1b1c1a] outline-none focus:border-[#006c49]"
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="solved">Solved</option>
                <option value="closed">Closed</option>
              </select>
            </label>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Apply filters</Button>
              <Link href="/explore" className="inline-flex items-center text-sm font-medium text-[#54615d]">
                Clear
              </Link>
            </div>

            <div className="rounded-[14px] bg-[#efeeea] p-4 text-xs leading-5 text-[#54615d]">
              {skillRows?.length ?? 0} skills in the community catalog &middot; {count ?? 0} requests visible
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          {requestRows.length === 0 ? (
            <Card className="rounded-[22px] p-10 text-center">
              <p className="text-lg font-semibold text-[#1b1c1a]">No requests match the current filters.</p>
              <p className="mt-2 text-sm text-[#54615d]">Try widening the category or clearing the skills/location filters.</p>
            </Card>
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
