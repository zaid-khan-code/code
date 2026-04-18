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
        "bg-white rounded-[14px] border border-[#E8E2D9] p-5",
        "shadow-[0_1px_2px_rgba(0,0,0,.04)]",
        hover
          ? "transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,.06)]"
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
