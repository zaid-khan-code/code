import React from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
};

export default function Select({
  label,
  error,
  options,
  className = "",
  id,
  ...rest
}: Props) {
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
      <select
        id={inputId}
        className={[
          "w-full rounded-[10px] border px-3 py-2 text-sm outline-none transition-colors appearance-none bg-white",
          "text-[#111111]",
          error
            ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
            : "border-[#E8E2D9] focus:border-[#0C9F88] focus:ring-1 focus:ring-[#0C9F88]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}
