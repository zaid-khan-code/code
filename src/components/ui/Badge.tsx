import React from "react";

type Variant =
  | "solved"
  | "open"
  | "in_progress"
  | "closed"
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "category"
  | "tag"
  | "default";

type Props = {
  variant: Variant;
  children: React.ReactNode;
};

const variantClasses: Record<Variant, string> = {
  solved:      "bg-[#D1FAF4] text-[#0C9F88]",
  open:        "bg-[#F0EBE3] text-[#6B6B6B]",
  in_progress: "bg-[#DBEAFE] text-[#1D4ED8]",
  closed:      "bg-[#F3F4F6] text-[#6B7280]",
  low:         "bg-[#D1FAF4] text-[#0C9F88]",
  medium:      "bg-[#FEF3C7] text-[#B45309]",
  high:        "bg-[#FFEDD5] text-[#C2410C]",
  critical:    "bg-[#FEE2E2] text-[#B91C1C]",
  category:    "bg-[#F3F4F6] text-[#111111]",
  tag:         "bg-[#FAFAFA] text-[#6B6B6B] border border-[#E8E2D9]",
  default:     "bg-[#F0EBE3] text-[#6B6B6B]",
};

export default function Badge({ variant, children }: Props) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-[999px] px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
