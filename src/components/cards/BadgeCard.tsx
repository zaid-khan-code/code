type Props = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  earned?: boolean;
  earnedAt?: string | null;
};

export default function BadgeCard({ name, description, icon, earned = false, earnedAt }: Props) {
  return (
    <div
      title={description}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px",
        background: "var(--color-surface)",
        border: `1px solid ${earned ? "var(--color-brand)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-lg)",
        opacity: earned ? 1 : 0.45,
        textAlign: "center",
        gap: "8px",
      }}
    >
      <span style={{ fontSize: "32px", lineHeight: 1 }}>{icon}</span>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>{name}</p>
      <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: 0 }}>{description}</p>
      {earned && earnedAt && (
        <p style={{ fontSize: "10px", color: "var(--color-brand)", margin: 0 }}>
          Earned {new Date(earnedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
