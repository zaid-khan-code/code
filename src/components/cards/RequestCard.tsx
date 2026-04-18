import React from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

type BadgeVariant =
  | "solved" | "open" | "in_progress" | "closed"
  | "low" | "medium" | "high" | "critical"
  | "category" | "tag" | "default";

type Request = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  urgency: string;
  status: string;
  tags: string[];
  location: string | null;
  created_at: string;
};

type Props = {
  request: Request;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl?: string | null;
  authorTrustScore?: number;
  helperCount?: number;
};

function urgencyVariant(u: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    low: "low",
    medium: "medium",
    high: "high",
    critical: "critical",
  };
  return map[u.toLowerCase()] ?? "default";
}

function statusVariant(s: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
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

export default function RequestCard({
  request,
  authorName,
  authorUsername,
  authorAvatarUrl,
  authorTrustScore,
  helperCount,
}: Props) {
  const visibleTags = request.tags.slice(0, 4);
  const extraTags = request.tags.length - visibleTags.length;

  return (
    <article className="bg-white rounded-[14px] border border-[#E8E2D9] p-5 shadow-[0_1px_2px_rgba(0,0,0,.04)] hover:border-[#0C9F88] transition-colors flex flex-col gap-3">
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant={urgencyVariant(request.urgency)}>
          {request.urgency}
        </Badge>
        <Badge variant={statusVariant(request.status)}>
          {request.status.replace("_", " ")}
        </Badge>
        {request.category && (
          <Badge variant="category">{request.category}</Badge>
        )}
        {visibleTags.map((tag) => (
          <Badge key={tag} variant="tag">{tag}</Badge>
        ))}
        {extraTags > 0 && (
          <Badge variant="tag">+{extraTags}</Badge>
        )}
      </div>

      {/* Title + desc */}
      <div>
        <h3 className="text-sm font-semibold text-[#111111] leading-snug mb-1">
          {request.title}
        </h3>
        <p className="text-sm text-[#6B6B6B] line-clamp-2 leading-relaxed">
          {request.description}
        </p>
      </div>

      {/* Author row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar
            name={authorName}
            src={authorAvatarUrl}
            size="sm"
          />
          <div>
            <span className="text-xs font-medium text-[#111111]">{authorName}</span>
            <span className="text-xs text-[#A0A0A0] ml-1">@{authorUsername}</span>
            {authorTrustScore !== undefined && (
              <span className="text-xs text-[#0C9F88] ml-1">{authorTrustScore}%</span>
            )}
          </div>
        </div>
        <span className="text-xs text-[#A0A0A0]">{timeAgo(request.created_at)}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[#E8E2D9]">
        <div className="flex items-center gap-3 text-xs text-[#6B6B6B]">
          {request.location && (
            <span>📍 {request.location}</span>
          )}
          {helperCount !== undefined && helperCount > 0 && (
            <span>🤝 {helperCount} helper{helperCount !== 1 ? "s" : ""}</span>
          )}
        </div>
        <Link
          href={`/requests/${request.id}`}
          className="text-xs font-medium text-[#0C9F88] hover:text-[#0a8a77] no-underline transition-colors"
        >
          Open details →
        </Link>
      </div>
    </article>
  );
}
