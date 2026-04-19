import React from "react";

type Props = {
  label: string;
  value: string | number;
  sublabel?: string;
  delta?: number;
  suffix?: string;
};

export default function Stat({ label, value, sublabel, delta, suffix }: Props) {
  return (
    <div className="rounded-[24px] border border-[#E7DED2] bg-white/95 p-5 shadow-[0_12px_28px_rgba(28,25,23,0.05)]">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8AA79E]">
        {label}
      </p>
      <p className="text-3xl font-black leading-none tracking-[-0.04em] text-[#171717]">
        {value}
        {suffix ? <span className="ml-1 text-lg">{suffix}</span> : null}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
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
