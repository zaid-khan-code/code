import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth/guards";
import { offerHelp, markRequestSolved, acceptHelper } from "./actions";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

interface PageProps {
  params: Promise<{ id: string }>;
}

function urgencyVariant(u: string): any {
  const map: Record<string, any> = {
    low: "low",
    medium: "medium",
    high: "high",
    critical: "critical",
  };
  return map[u.toLowerCase()] ?? "default";
}

function statusVariant(s: string): any {
  const map: Record<string, any> = {
    solved: "solved",
    open: "open",
    in_progress: "in_progress",
    closed: "closed",
  };
  return map[s.toLowerCase()] ?? "default";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function RequestDetailPage({ params }: PageProps) {
  const [{ profile }, { id }] = await Promise.all([
    requireOnboarded(),
    params,
  ]);

  const sb = await createClient();

  // Fetch request with author details
  const { data: request } = await sb
    .from("requests")
    .select(
      `id, title, description, category, urgency, status, tags, location, ai_summary, created_at, updated_at, author_id`
    )
    .eq("id", id)
    .single();

  if (!request) notFound();

  // Fetch author
  const { data: author } = await sb
    .from("profiles")
    .select("id, full_name, username, avatar_url, trust_score, bio, location")
    .eq("id", request.author_id)
    .single();

  // Fetch helpers
  const { data: helpers = [] } = await sb
    .from("request_helpers")
    .select(
      `id, helper_id, status, note, created_at, helper:profiles!helper_id(full_name, username, avatar_url, trust_score)`
    )
    .eq("request_id", id)
    .order("created_at", { ascending: false });

  const isAuthor = profile?.id === request.author_id;
  const hasOffered = helpers.some(
    (h) => h.helper_id === profile?.id && h.status === "offered"
  );
  const hasAccepted = helpers.some(
    (h) => h.helper_id === profile?.id && h.status === "accepted"
  );

  // Fetch suggested helpers (users with matching skills)
  const { data: suggestedHelpers = [] } = await sb
    .from("profiles")
    .select("id, full_name, username, avatar_url, trust_score")
    .eq("user_mode", "can_help")
    .neq("id", request.author_id)
    .order("trust_score", { ascending: false })
    .limit(3);

  // Filter out already helping users
  const helpingIds = new Set(helpers.map((h) => h.helper_id));
  const filteredSuggested = suggestedHelpers.filter(
    (s) => !helpingIds.has(s.id)
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/explore"
          className="text-sm text-[#6B6B6B] hover:text-[#111111]"
        >
          ← Back to Explore
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={urgencyVariant(request.urgency)}>
                {request.urgency}
              </Badge>
              <Badge variant={statusVariant(request.status)}>
                {request.status.replace("_", " ")}
              </Badge>
              {request.category && (
                <Badge variant="category">{request.category}</Badge>
              )}
              {request.tags.map((tag) => (
                <Badge key={tag} variant="tag">{tag}</Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-xl font-semibold text-[#111111] mb-2">
              {request.title}
            </h1>

            {/* Author row */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E8E2D9]">
              <Avatar
                name={author?.full_name ?? "Unknown"}
                src={author?.avatar_url}
                size="md"
              />
              <div>
                <p className="font-medium text-[#111111]">
                  {author?.full_name}
                </p>
                <p className="text-sm text-[#6B6B6B]">
                  @{author?.username} · {author?.trust_score}% trust ·{" "}
                  {timeAgo(request.created_at)}
                </p>
              </div>
            </div>

            {/* AI Summary */}
            {request.ai_summary && (
              <div className="bg-[#F5F0EA] rounded-[10px] p-4 mb-4">
                <p className="text-xs font-medium text-[#6B6B6B] mb-1">
                  AI Summary
                </p>
                <p className="text-sm text-[#111111]">{request.ai_summary}</p>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-sm max-w-none text-[#111111]">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {request.description}
              </pre>
            </div>

            {/* Location */}
            {request.location && (
              <p className="text-sm text-[#6B6B6B] mt-4">
                📍 {request.location}
              </p>
            )}
          </Card>

          {/* Action bar */}
          <Card>
            <div className="flex items-center gap-3">
              {!isAuthor && request.status === "open" && !hasOffered && (
                <form action={offerHelp}>
                  <input type="hidden" name="request_id" value={request.id} />
                  <Button type="submit">I can help</Button>
                </form>
              )}

              {!isAuthor && hasOffered && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#0C9F88]">✓ Offer sent</span>
                  <Link href={`/messages?request_id=${request.id}`}>
                    <Button variant="secondary">Message author</Button>
                  </Link>
                </div>
              )}

              {isAuthor && request.status !== "solved" && (
                <div className="flex items-center gap-2">
                  <form action={markRequestSolved}>
                    <input
                      type="hidden"
                      name="request_id"
                      value={request.id}
                    />
                    <Button type="submit">Mark as solved</Button>
                  </form>
                  <Link href={`/requests/${request.id}/edit`}>
                    <Button variant="secondary">Edit</Button>
                  </Link>
                </div>
              )}

              {request.status === "solved" && (
                <Badge variant="solved">✓ Solved</Badge>
              )}
            </div>
          </Card>

          {/* Helpers section */}
          <Card>
            <h3 className="font-semibold text-[#111111] mb-4">
              {helpers.length} Helper{helpers.length !== 1 ? "s" : ""}
            </h3>

            {helpers.length === 0 ? (
              <p className="text-sm text-[#6B6B6B]">
                No helpers yet. Be the first to offer help!
              </p>
            ) : (
              <div className="space-y-4">
                {helpers.map((h) => {
                  const helperProfile = Array.isArray(h.helper)
                    ? h.helper[0]
                    : h.helper;
                  return (
                    <div
                      key={h.id}
                      className="flex items-start gap-3 p-3 bg-[#F5F0EA] rounded-[10px]"
                    >
                      <Avatar
                        name={helperProfile?.full_name ?? "Unknown"}
                        src={helperProfile?.avatar_url}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {helperProfile?.full_name}
                          </span>
                          <span className="text-xs text-[#6B6B6B]">
                            @{helperProfile?.username} ·{" "}
                            {helperProfile?.trust_score}% trust
                          </span>
                          <Badge variant={h.status as any}>{h.status}</Badge>
                        </div>
                        {h.note && (
                          <p className="text-sm text-[#6B6B6B] mt-1">
                            "{h.note}"
                          </p>
                        )}
                      </div>
                      {isAuthor && h.status === "offered" && (
                        <form action={acceptHelper}>
                          <input
                            type="hidden"
                            name="helper_id"
                            value={h.id}
                          />
                          <Button size="sm">Accept</Button>
                        </form>
                      )}
                      {<Link
                        href={`/messages?user_id=${h.helper_id}&request_id=${request.id}`}
                      >
                        <Button variant="ghost" size="sm">
                          Message
                        </Button>
                      </Link>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Suggested helpers */}
          {filteredSuggested.length > 0 && (
            <Card>
              <h3 className="font-semibold text-[#111111] mb-4">
                Suggested Helpers
              </h3>
              <div className="space-y-3">
                {filteredSuggested.map((u) => (
                  <div key={u.id} className="flex items-center gap-2">
                    <Avatar
                      name={u.full_name}
                      src={u.avatar_url}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {u.full_name}
                      </p>
                      <p className="text-xs text-[#6B6B6B]">
                        {u.trust_score}% trust
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AI suggestions */}
          <Card>
            <h3 className="font-semibold text-[#111111] mb-4">
              Response Templates
            </h3>
            <div className="space-y-2">
              {[
                "Happy to help. Can you share what you've already tried?",
                "I think I can assist. Is the deadline firm?",
                "I've worked on similar before — shoot me a message with the details.",
              ].map((template, i) => (
                <button
                  key={i}
                  className="w-full text-left p-3 text-sm text-[#6B6B6B] bg-[#F5F0EA] rounded-[10px] hover:bg-[#E8E2D9] transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(template);
                  }}
                >
                  {template}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
