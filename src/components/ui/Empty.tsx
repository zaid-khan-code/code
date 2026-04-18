import React from "react";

type Props = {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function Empty({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      {icon && <span className="text-5xl leading-none">{icon}</span>}
      <p className="text-base font-semibold text-[#111111]">{title}</p>
      {description && (
        <p className="text-sm text-[#6B6B6B] max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
