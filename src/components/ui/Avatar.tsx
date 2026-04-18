import React from "react";
import Image from "next/image";

type Props = {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizePx: Record<NonNullable<Props["size"]>, number> = {
  sm: 28,
  md: 36,
  lg: 48,
};

const PALETTE = [
  "#0C9F88", "#F59E0B", "#F97316", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
];

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({ name, src, size = "md" }: Props) {
  const px = sizePx[size];
  const initial = name.trim().charAt(0).toUpperCase();
  const bg = colorFromName(name);

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        unoptimized
        className="rounded-full object-cover"
        style={{ width: px, height: px }}
      />
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white font-semibold select-none shrink-0"
      style={{ width: px, height: px, backgroundColor: bg, fontSize: px * 0.4 }}
      aria-label={name}
    >
      {initial}
    </span>
  );
}
