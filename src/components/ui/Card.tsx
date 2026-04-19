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
        "rounded-[24px] border border-[#d7e6e0] bg-white p-5",
        "shadow-[0_8px_24px_rgba(27,28,26,0.05)]",
        hover
          ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(27,28,26,0.08)]"
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
