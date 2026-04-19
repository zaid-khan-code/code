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
  solved:      "bg-[#d7e6e0] text-[#006c49]",
  open:        "bg-[#efeeea] text-[#3c4a42]",
  in_progress: "bg-[#dceeff] text-[#1a4f8a]",
  closed:      "bg-[#eae8e4] text-[#54615d]",
  low:         "bg-[#d7e6e0] text-[#006c49]",
  medium:      "bg-[#fef3c7] text-[#92400e]",
  high:        "bg-[#fee2cc] text-[#9a3412]",
  critical:    "bg-[#fde4e4] text-[#ba1a1a]",
  category:    "bg-[#d7e6e0] text-[#006c49]",
  tag:         "border border-[#bbcabf] bg-[#fbf9f5] text-[#3c4a42]",
  default:     "bg-[#efeeea] text-[#54615d]",
};

export default function Badge({ variant, children }: Props) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-[999px] px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {children}
    </span>
  );
}
