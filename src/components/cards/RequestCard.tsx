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
    <article className="rounded-[24px] border border-[#E7DED2] bg-white/95 p-5 shadow-[0_12px_28px_rgba(28,25,23,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(28,25,23,0.08)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {request.category ? <Badge variant="category">{request.category}</Badge> : null}
        <Badge variant={getUrgencyVariant(request.urgency)}>{request.urgency}</Badge>
        <Badge variant={getStatusVariant(request.status)}>{request.status.replace("_", " ")}</Badge>
      </div>

      <h3 className="text-[1.15rem] font-extrabold leading-tight tracking-[-0.03em] text-[#171717]">
        {request.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#655F57]">
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

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#F2ECE4] pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={authorName} src={authorAvatarUrl} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#171717]">{authorName}</p>
            <p className="truncate text-xs text-[#655F57]">
              @{authorUsername} &middot; {request.location || "Community"} &middot; {authorTrustScore ?? 0}% trust
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-[#655F57]">
            {helperCount} helper{helperCount !== 1 ? "s" : ""} interested
          </p>
          <Link
            href={`/requests/${request.id}`}
            className="mt-1 inline-flex rounded-full bg-[#F2ECE4] px-3 py-1.5 text-sm font-semibold text-[#171717] no-underline transition-colors hover:bg-[#E7DED2]"
          >
            Open details
          </Link>
        </div>
      </div>
    </article>
  );
}
