import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { deleteRequest, forceSolveRequest, rerunAiOnRequest } from "../actions";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdmin();
  const sb = createAdminClient();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = sb
    .from("requests")
    .select("*, author:profiles!author_id(id, username, full_name)", { count: "exact" });

  if (params.status) {
    query = query.eq("status", params.status as "open" | "in_progress" | "solved" | "closed");
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const totalPages = Math.ceil((count ?? 0) / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111111]">Requests</h1>
          <p className="text-sm text-[#6B6B6B]">Manage all help requests</p>
        </div>
        <div className="flex gap-2">
          {["open", "in_progress", "solved", "closed"].map((s) => (
            <a
              key={s}
              href={`?status=${s}`}
              className={`px-3 py-1 text-xs rounded-full border ${
                params.status === s
                  ? "bg-[#0C9F88] text-white border-[#0C9F88]"
                  : "bg-white text-[#6B6B6B] border-[#E8E2D9] hover:border-[#0C9F88]"
              }`}
            >
              {s}
            </a>
          ))}
          {params.status && (
            <a
              href="?"
              className="px-3 py-1 text-xs rounded-full border bg-white text-[#6B6B6B] border-[#E8E2D9] hover:border-[#EF4444]"
            >
              Clear
            </a>
          )}
        </div>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E2D9]">
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">ID</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Title</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Author</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Status</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Urgency</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Created</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Offers</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#EF4444]">Error loading requests</td>
              </tr>
            )}
            {!error && (!data || data.length === 0) && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6B6B6B]">No requests found</td>
              </tr>
            )}
            {data?.map((r) => (
              <tr key={r.id} className="border-b border-[#E8E2D9] last:border-0 hover:bg-[#FAFAFA]">
                <td className="py-3 px-4 font-mono text-xs text-[#A0A0A0]">
                  {r.id.slice(0, 8)}</td>
                <td className="py-3 px-4 max-w-xs truncate text-[#111111]">{r.title}</td>
                <td className="py-3 px-4 text-[#6B6B6B]">
                  {(r.author as { username?: string | null } | null)?.username ?? "--"}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={r.status}>{r.status}</Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={r.urgency}>{r.urgency}</Badge>
                </td>
                <td className="py-3 px-4 text-[#6B6B6B]">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-[#6B6B6B]">--</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <form action={async () => { "use server"; await deleteRequest({ requestId: r.id }); }}>
                      <Button variant="ghost" size="sm">Delete</Button>
                    </form>
                    {r.status !== "solved" && (
                      <form action={async () => { "use server"; await forceSolveRequest({ requestId: r.id }); }}>
                        <Button variant="secondary" size="sm">Solve</Button>
                      </form>
                    )}
                    <form action={async () => { "use server"; await rerunAiOnRequest({ requestId: r.id }); }}>
                      <Button variant="ghost" size="sm">AI</Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <a
              href={`?page=${page - 1}${params.status ? `&status=${params.status}` : ""}`}
              className="px-3 py-1 text-sm text-[#6B6B6B] hover:text-[#111111]"
            >
              Prev
            </a>
          )}
          <span className="text-sm text-[#6B6B6B]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`?page=${page + 1}${params.status ? `&status=${params.status}` : ""}`}
              className="px-3 py-1 text-sm text-[#6B6B6B] hover:text-[#111111]"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
