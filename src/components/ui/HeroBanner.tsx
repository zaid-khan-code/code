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
      className="w-full rounded-[28px] border border-[#1a3530] bg-[#17302E] px-8 py-8 shadow-[0_20px_48px_rgba(23,48,46,0.14)] sm:px-12 sm:py-10"
      style={{
        backgroundImage:
          "radial-gradient(circle at top right, rgba(16,185,129,0.12), transparent 28%), radial-gradient(circle at bottom left, rgba(0,108,73,0.08), transparent 32%)",
      }}
    >
      <div className="flex flex-col gap-3">
        {label && (
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6ffbbe]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {label}
          </span>
        )}
        <h1
          className="max-w-[780px] text-[2.2rem] font-extrabold leading-[1.0] tracking-[-0.04em] text-white sm:text-[3.2rem]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="max-w-[600px] text-[14px] leading-[1.65] text-white/65 sm:text-[15px]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="mt-6 shrink-0 sm:mt-0">{children}</div>
      )}
    </div>
  );
}
