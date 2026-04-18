import React from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export default function Textarea({ label, error, className = "", id, ...rest }: Props) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[#111111]"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={[
          "w-full rounded-[10px] border px-3 py-2 text-sm outline-none transition-colors resize-y min-h-[80px]",
          "bg-white text-[#111111] placeholder:text-[#A0A0A0]",
          error
            ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
            : "border-[#E8E2D9] focus:border-[#0C9F88] focus:ring-1 focus:ring-[#0C9F88]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}
