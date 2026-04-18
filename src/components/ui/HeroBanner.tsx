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
      className="w-full rounded-[24px] border border-[#213532] bg-[#1A2E2C] px-7 py-7 shadow-[0_18px_40px_rgba(26,46,44,0.12)] sm:px-10 sm:py-9"
      style={{
        backgroundImage:
          "radial-gradient(circle at top right, rgba(255,196,87,0.16), transparent 22%)",
      }}
    >
      <div className="flex flex-col gap-3">
        {label && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8ED9CC]">
            {label}
          </span>
        )}
        <h1 className="max-w-[760px] text-[2.15rem] font-black leading-[0.96] tracking-[-0.045em] text-white sm:text-[3.25rem]">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-[660px] text-sm leading-6 text-white/72 sm:text-[15px]">
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
