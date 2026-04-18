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
    "bg-[#0C9F88] text-white hover:bg-[#0a8a77] border border-transparent",
  secondary:
    "bg-white text-[#0C9F88] border border-[#0C9F88] hover:bg-[#F0EBE3]",
  ghost:
    "bg-transparent text-[#6B6B6B] border border-transparent hover:bg-[#F0EBE3]",
  danger:
    "bg-[#EF4444] text-white border border-transparent hover:bg-[#dc2626]",
};

const sizeClasses: Record<NonNullable<Props["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2 text-sm",
  lg: "px-7 py-3 text-base",
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
        "inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none",
        "rounded-[999px]",
        variantClasses[variant],
        sizeClasses[size],
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
