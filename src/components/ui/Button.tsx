import React from "react";

type Props = {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
};

const variantClasses: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "border border-transparent bg-[#006c49] text-white shadow-[0_10px_28px_rgba(0,108,73,0.22)] hover:-translate-y-px hover:bg-[#005236]",
  secondary:
    "border border-[#bbcabf] bg-white text-[#1b1c1a] shadow-[0_4px_12px_rgba(27,28,26,0.06)] hover:-translate-y-px hover:border-[#6c7a71] hover:bg-[#f5f3ef]",
  ghost:
    "border border-transparent bg-transparent text-[#54615d] hover:bg-[#efeeea] hover:text-[#1b1c1a]",
  danger:
    "border border-transparent bg-[#ba1a1a] text-white shadow-[0_10px_24px_rgba(186,26,26,0.18)] hover:-translate-y-px hover:bg-[#93000a]",
};

const sizeClasses: Record<NonNullable<Props["size"]>, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-[15px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex cursor-pointer select-none items-center justify-center font-semibold tracking-[-0.01em] transition-all",
        "rounded-[999px]",
        variantClasses[variant],
        sizeClasses[size],
        disabled ? "pointer-events-none opacity-50" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
