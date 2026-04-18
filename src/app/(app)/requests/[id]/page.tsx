import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { acceptHelper, markRequestSolved, offerHelp } from "./actions";
import { timeAgo } from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

function getBadgeVariant(value: string) {
  if (value === "solved") return "solved";
  if (value === "in_progress") return "in_progress";
  if (value === "closed") return "closed";
  if (value === "open") return "open";
  if (value === "critical") return "critical";
  if (value === "high") return "high";
  if (value === "medium") return "medium";
  if (value === "low") return "low";
  return "default";
}

export default async function RequestDetailPage({ params }: PageProps) {
  const [{ id }, { profile }] = await Promise.all([params, requireOnboarded()]);
  const admin = createAdminClient();

  const { data: request } = await admin
    .from("requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!request) notFound();

  const [{ data: author }, { data: helperRows }, { data: helperCandidates }] = await Promise.all([
    admin.from("profiles").select("id, full_name, username, avatar_url, trust_score, location").eq("id", request.author_id).single(),
    admin
      .from("request_helpers")
      .select("id, request_id, helper_id, status, note, created_at")
      .eq("request_id", id)
      .order("created_at", { ascending: false }),
    admin
      .from("profiles")
      .select("id, full_name, username, avatar_url, trust_score")
      .eq("user_mode", "can_help")
      .neq("id", request.author_id)
      .order("trust_score", { ascending: false })
      .limit(6),
  ]);

  const helperIds = Array.from(new Set((helperRows ?? []).map((row) => row.helper_id)));
  const [{ data: helperProfiles }, { data: helperSkillRows }] = await Promise.all([
    helperIds.length
      ? admin
          .from("profiles")
          .select("id, full_name, username, avatar_url, trust_score")
          .in("id", helperIds)
      : Promise.resolve({ data: [] }),
    helperIds.length
      ? admin
          .from("user_skills")
          .select("user_id, skills(name)")
          .in("user_id", helperIds)
          .eq("can_help", true)
      : Promise.resolve({ data: [] }),
  ]);

  const helperSkillsMap = new Map<string, string[]>();
  for (const row of helperSkillRows ?? []) {
    const skillName = (row.skills as { name: string } | null)?.name;
    if (!skillName) continue;
    const existing = helperSkillsMap.get(row.user_id) ?? [];
    existing.push(skillName);
    helperSkillsMap.set(row.user_id, existing);
  }

  const helperMap = new Map((helperProfiles ?? []).map((row) => [row.id, row]));
  const isAuthor = profile?.id === request.author_id;
  const existingOffer = (helperRows ?? []).find((row) => row.helper_id === profile?.id);

  const visibleHelperCandidates = (helperCandidates ?? []).filter(
    (candidate) => !helperIds.includes(candidate.id)
  );

  return (
    <div className="space-y-6">
      <Link href="/explore" className="inline-flex text-sm font-medium text-[#6B6B6B] hover:text-[#111111]">
        Back to feed
      </Link>

      <div className="rounded-[24px] border border-[#213532] bg-[#1A2E2C] px-7 py-7 text-white shadow-[0_18px_40px_rgba(26,46,44,0.12)] sm:px-10 sm:py-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8ED9CC]">
          Request Detail
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {request.category ? <Badge variant="category">{request.category}</Badge> : null}
          <Badge variant={getBadgeVariant(request.urgency)}>{request.urgency}</Badge>
          <Badge variant={getBadgeVariant(request.status)}>{request.status.replace("_", " ")}</Badge>
        </div>
        <h1 className="mt-4 max-w-[840px] text-[2.15rem] font-black leading-[0.96] tracking-[-0.045em] sm:text-[3rem]">
          {request.title}
        </h1>
        <p className="mt-4 max-w-[700px] text-sm leading-6 text-white/74">
          {request.description}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_360px]">
        <div className="space-y-6">
          <Card className="rounded-[22px] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
              AI Summary
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0C9F88] text-xs font-bold text-white">H</div>
              <span className="text-sm font-semibold text-[#111111]">Helplytics AI</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-[#4F4F4F]">
              {request.ai_summary || request.description}
            </p>

            {request.tags.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {request.tags.map((tag: string) => (
                  <Badge key={tag} variant="tag">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </Card>

          <Card className="rounded-[22px] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
              Actions
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {!isAuthor && request.status === "open" && !existingOffer ? (
                <form action={offerHelp}>
                  <input type="hidden" name="request_id" value={request.id} />
                  <input type="hidden" name="request_title" value={request.title} />
                  <Button type="submit">I can help</Button>
                </form>
              ) : null}

              {!isAuthor && existingOffer ? (
                <Button variant="secondary" type="button">
                  Offer sent
                </Button>
              ) : null}

              {isAuthor && request.status !== "solved" ? (
                <form action={markRequestSolved}>
                  <input type="hidden" name="request_id" value={request.id} />
                  <Button type="submit" variant="secondary">
                    Mark as solved
                  </Button>
                </form>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[22px] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
              Requester
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar
                name={author?.full_name ?? author?.username ?? "User"}
                src={author?.avatar_url}
                size="md"
              />
              <div>
                <p className="text-sm font-semibold text-[#111111]">
                  {author?.full_name ?? "Community member"}
                </p>
                <p className="text-xs text-[#6B6B6B]">
                  @{author?.username ?? "member"} · {author?.location || "Community"} · {author?.trust_score ?? 0}% trust
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-[22px] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
              Helpers
            </p>
            <h2 className="mt-3 text-xl font-extrabold tracking-[-0.03em] text-[#111111]">
              People ready to support
            </h2>

            <div className="mt-5 space-y-4">
              {(helperRows ?? []).map((row) => {
                const helper = helperMap.get(row.helper_id);

                return (
                  <div key={row.id} className="rounded-[18px] border border-[#F0EBE3] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={helper?.full_name ?? helper?.username ?? "Helper"}
                          src={helper?.avatar_url}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#111111]">
                            {helper?.full_name ?? "Helper"}
                          </p>
                          {helperSkillsMap.get(row.helper_id)?.length ? (
                            <p className="mt-0.5 text-xs text-[#6B6B6B]">
                              {helperSkillsMap.get(row.helper_id)!.slice(0, 3).join(", ")}
                            </p>
                          ) : null}
                          <span className="mt-1 inline-block rounded-full bg-[#EEF4EF] px-2 py-0.5 text-xs font-semibold text-[#0C9F88]">
                            Trust {helper?.trust_score ?? 0}%
                          </span>
                        </div>
                      </div>
                      <Badge variant={getBadgeVariant(row.status)}>{row.status}</Badge>
                    </div>
                    {row.note ? (
                      <p className="mt-3 text-sm leading-6 text-[#5F5F5F]">{row.note}</p>
                    ) : null}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-[#8B8B8B]">{timeAgo(row.created_at)}</span>
                      {isAuthor && row.status === "offered" ? (
                        <form action={acceptHelper}>
                          <input type="hidden" name="helper_id" value={row.id} />
                          <input type="hidden" name="request_title" value={request.title} />
                          <Button type="submit" size="sm">
                            Accept
                          </Button>
                        </form>
                      ) : (
                        <Link
                          href={`/messages?user_id=${row.helper_id}&request_id=${request.id}`}
                          className="text-sm font-semibold text-[#111111] underline-offset-4 hover:underline"
                        >
                          Message
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}

              {(helperRows ?? []).length === 0 ? (
                <>
                  {visibleHelperCandidates.slice(0, 2).map((candidate) => (
                    <div key={candidate.id} className="rounded-[18px] border border-[#F0EBE3] p-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={candidate.full_name ?? candidate.username ?? "Helper"}
                          src={candidate.avatar_url}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#111111]">
                            {candidate.full_name ?? "Suggested helper"}
                          </p>
                          <span className="mt-1 inline-block rounded-full bg-[#EEF4EF] px-2 py-0.5 text-xs font-semibold text-[#0C9F88]">
                            Trust {candidate.trust_score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
