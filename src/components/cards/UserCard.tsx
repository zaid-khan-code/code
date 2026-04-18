import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

type Props = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  trust_score: number;
  location?: string | null;
  badge_count?: number;
  rank?: number;
};

export default function UserCard({ username, full_name, avatar_url, trust_score, location, badge_count, rank }: Props) {
  const slug = username ?? "member";
  return (
    <Link
      href={`/profile/${slug}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        textDecoration: "none",
        transition: "box-shadow 0.15s",
      }}
    >
      {rank != null && (
        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-muted)", width: "24px", textAlign: "center" }}>
          {rank}
        </span>
      )}
      <Avatar name={full_name ?? slug} src={avatar_url} size="md" />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {full_name ?? slug}
        </p>
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
          @{slug}{location ? ` · ${location}` : ""}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-brand)" }}>{trust_score}</span>
        {badge_count != null && badge_count > 0 && (
          <Badge variant="open">{badge_count} badges</Badge>
        )}
      </div>
    </Link>
  );
}
