import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { promoteToAdmin, demoteToUser, banUser } from "../actions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string }>;
}) {
  await requireAdmin();
  const sb = createAdminClient();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = sb.from("profiles").select("*", { count: "exact" });

  if (params.role) {
    query = query.eq("role", params.role as "user" | "admin");
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const totalPages = Math.ceil((count ?? 0) / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111111]">Users</h1>
          <p className="text-sm text-[#6B6B6B]">Manage community members</p>
        </div>
        <div className="flex gap-2">
          {["admin", "user"].map((r) => (
            <a
              key={r}
              href={`?role=${r}`}
              className={`px-3 py-1 text-xs rounded-full border ${
                params.role === r
                  ? "bg-[#0C9F88] text-white border-[#0C9F88]"
                  : "bg-white text-[#6B6B6B] border-[#E8E2D9] hover:border-[#0C9F88]"
              }`}
            >
              {r}
            </a>
          ))}
          {params.role && (
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
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Avatar</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Name</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Username</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Role</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Trust</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Onboarded</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Joined</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B6B6B]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!data || data.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6B6B6B]">No users found</td>
              </tr>
            ) : (
              data.map((u) => (
                <tr key={u.id} className="border-b border-[#E8E2D9] last:border-0 hover:bg-[#FAFAFA]">
                  <td className="py-3 px-4">
                    <Avatar
                      name={u.full_name ?? u.username ?? "U"}
                      src={u.avatar_url ?? null}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 px-4 text-[#111111]">{u.full_name ?? "--"}</td>
                  <td className="py-3 px-4 text-[#6B6B6B]">{u.username ?? "--"}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === "admin" ? "critical" : "default"}>{u.role}</Badge>
                  </td>
                  <td className="py-3 px-4 text-[#6B6B6B]">{u.trust_score}</td>
                  <td className="py-3 px-4">
                    {u.onboarded ? (
                      <span className="text-[#0C9F88]">Yes</span>
                    ) : (
                      <span className="text-[#EF4444]">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#6B6B6B]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      <a href={`/profile/${u.username}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </a>
                      {u.role !== "admin" ? (
                        <form
                          action={async () => {
                            "use server";
                            await promoteToAdmin({ userId: u.id });
                          }}
                        >
                          <Button variant="secondary" size="sm">Promote</Button>
                        </form>
                      ) : (
                        <form
                          action={async () => {
                            "use server";
                            await demoteToUser({ userId: u.id });
                          }}
                        >
                          <Button variant="ghost" size="sm">Demote</Button>
                        </form>
                      )}
                      <form
                        action={async () => {
                          "use server";
                          await banUser({ userId: u.id });
                        }}
                      >
                        <Button variant="ghost" size="sm" className="text-[#EF4444]">Ban</Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <a
              href={`?page=${page - 1}${params.role ? `&role=${params.role}` : ""}`}
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
              href={`?page=${page + 1}${params.role ? `&role=${params.role}` : ""}`}
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
