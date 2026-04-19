import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export default function Card({ children, className = "", hover = false }: Props) {
  return (
    <div
      className={[
        "rounded-[24px] border border-[#E7DED2] bg-white/95 p-5 backdrop-blur",
        "shadow-[0_12px_28px_rgba(28,25,23,0.05)]",
        hover
          ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(28,25,23,0.08)]"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
