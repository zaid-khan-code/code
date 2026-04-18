import React from "react";

type Props = {
  label?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function HeroBanner({ label, title, subtitle, children }: Props) {
  return (
    <div
      className="w-full rounded-[20px] flex items-center justify-between gap-6"
      style={{
        backgroundColor: "#1A2E2C",
        padding: "32px 40px",
      }}
    >
      <div className="flex flex-col gap-2">
        {label && (
          <span className="text-xs font-semibold uppercase tracking-widest text-[#5EEAD4]">
            {label}
          </span>
        )}
        <h1 className="text-3xl font-bold text-white leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-white/70">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="shrink-0">{children}</div>
      )}
    </div>
  );
}
