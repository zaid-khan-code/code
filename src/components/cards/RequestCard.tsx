import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

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
    <article className="rounded-[20px] border border-[#d7e6e0] bg-white p-5 shadow-[0_8px_20px_rgba(27,28,26,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(27,28,26,0.08)]">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {request.category ? <Badge variant="category">{request.category}</Badge> : null}
        <Badge variant={getUrgencyVariant(request.urgency)}>{request.urgency}</Badge>
        <Badge variant={getStatusVariant(request.status)}>{request.status.replace("_", " ")}</Badge>
      </div>

      <h3
        className="text-[1.1rem] font-bold leading-tight tracking-[-0.02em] text-[#1b1c1a]"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        {request.title}
      </h3>
      <p
        className="mt-2 line-clamp-2 text-[13px] leading-[1.6] text-[#54615d]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {request.description}
      </p>

      {request.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {request.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="tag">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#efeeea] pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={authorName} src={authorAvatarUrl} size="md" />
          <div className="min-w-0">
            <p
              className="truncate text-[13px] font-semibold text-[#1b1c1a]"
              style={{ fontFamily: "var(--font-headline)" }}
            >{authorName}</p>
            <p
              className="truncate text-xs text-[#54615d]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {request.location || "Community"} &middot; {helperCount} helper{helperCount !== 1 ? "s" : ""} interested
            </p>
          </div>
        </div>
        <Link
          href={`/requests/${request.id}`}
          className="shrink-0 rounded-full bg-[#efeeea] px-3 py-1.5 text-[13px] font-semibold text-[#1b1c1a] no-underline transition-colors hover:bg-[#d7e6e0] hover:text-[#006c49]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Open details
        </Link>
      </div>
    </article>
  );
}
