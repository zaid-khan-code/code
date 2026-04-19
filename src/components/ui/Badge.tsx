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
  solved:      "bg-[#E5F6EE] text-[#1F7A61]",
  open:        "bg-[#F1EFE9] text-[#655F57]",
  in_progress: "bg-[#E7F0FF] text-[#245FA8]",
  closed:      "bg-[#F1F1F1] text-[#6B7280]",
  low:         "bg-[#E5F6EE] text-[#1F7A61]",
  medium:      "bg-[#FEF1D5] text-[#9B6312]",
  high:        "bg-[#FEE5D8] text-[#B45309]",
  critical:    "bg-[#FDE2E2] text-[#B42318]",
  category:    "bg-[#EAF4EF] text-[#245D51]",
  tag:         "border border-[#E7DED2] bg-[#FBFAF8] text-[#655F57]",
  default:     "bg-[#F2ECE4] text-[#655F57]",
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
