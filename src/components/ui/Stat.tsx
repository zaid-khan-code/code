import React from "react";

type Props = {
  label: string;
  value: string | number;
  sublabel?: string;
  delta?: number;
};

export default function Stat({ label, value, sublabel, delta }: Props) {
  return (
    <div className="bg-white rounded-[14px] border border-[#E8E2D9] p-5 shadow-[0_1px_2px_rgba(0,0,0,.04)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#A0A0A0] mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-[#111111] leading-none">{value}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {sublabel && (
          <p className="text-xs text-[#6B6B6B]">{sublabel}</p>
        )}
        {delta !== undefined && (
          <span
            className={[
              "text-xs font-medium",
              delta >= 0 ? "text-[#0C9F88]" : "text-[#EF4444]",
            ].join(" ")}
          >
            {delta >= 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>
    </div>
  );
}
