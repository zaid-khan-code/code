import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { timeAgo } from "@/lib/format";

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

function getUrgencyVariant(urgency: string) {
  if (urgency === "critical") return "critical";
  if (urgency === "high") return "high";
  if (urgency === "medium") return "medium";
  if (urgency === "low") return "low";
  return "default";
}

function getStatusVariant(status: string) {
  if (status === "solved") return "solved";
  if (status === "in_progress") return "in_progress";
  if (status === "closed") return "closed";
  if (status === "open") return "open";
  return "default";
}

export default function RequestCard({
  request,
  authorName,
  authorUsername,
  authorAvatarUrl,
  authorTrustScore,
  helperCount = 0,
}: Props) {
  return (
    <article className="rounded-[22px] border border-[#E8E2D9] bg-white p-5 shadow-[0_12px_28px_rgba(17,17,17,0.04)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {request.category ? <Badge variant="category">{request.category}</Badge> : null}
        <Badge variant={getUrgencyVariant(request.urgency)}>{request.urgency}</Badge>
        <Badge variant={getStatusVariant(request.status)}>{request.status.replace("_", " ")}</Badge>
      </div>

      <h3 className="text-[1.15rem] font-extrabold leading-tight tracking-[-0.03em] text-[#111111]">
        {request.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6B6B6B]">
        {request.description}
      </p>

      {request.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {request.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="tag">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={authorName} src={authorAvatarUrl} size="sm" />
          <div>
            <p className="text-sm font-semibold text-[#111111]">{authorName}</p>
            <p className="text-xs text-[#6B6B6B]">
              @{authorUsername}
              {authorTrustScore !== undefined ? ` · Trust ${authorTrustScore}%` : ""}
            </p>
          </div>
        </div>
        <Link
          href={`/requests/${request.id}`}
          className="text-sm font-semibold text-[#111111] underline-offset-4 hover:underline"
        >
          Open details
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#F0EBE3] pt-3 text-xs text-[#8B8B8B]">
        <span>{request.location || "Remote / Community"}</span>
        <span>{helperCount} helpers interested · {timeAgo(request.created_at)}</span>
      </div>
    </article>
  );
}
