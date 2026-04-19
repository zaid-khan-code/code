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
    "border border-transparent bg-[linear-gradient(135deg,#109F88_0%,#24C9B0_100%)] text-white shadow-[0_14px_32px_rgba(16,159,136,0.22)] hover:-translate-y-px hover:brightness-[1.02]",
  secondary:
    "border border-[#E7DED2] bg-white text-[#171717] shadow-[0_10px_20px_rgba(28,25,23,0.04)] hover:-translate-y-px hover:border-[#CDDAD4] hover:bg-[#FCFBF8]",
  ghost:
    "border border-transparent bg-transparent text-[#655F57] hover:bg-[#F2ECE4] hover:text-[#171717]",
  danger:
    "border border-transparent bg-[#B42318] text-white shadow-[0_12px_24px_rgba(180,35,24,0.18)] hover:-translate-y-px hover:bg-[#9e1f16]",
};

const sizeClasses: Record<NonNullable<Props["size"]>, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
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
        "inline-flex cursor-pointer select-none items-center justify-center font-semibold tracking-[-0.02em] transition-all",
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
