"use client";

import React, { useState } from "react";

type Tab = { id: string; label: string };

type Props = {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  children?: React.ReactNode;
};

export default function Tabs({ tabs, defaultTab, onChange, children }: Props) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");

  function select(id: string) {
    setActive(id);
    onChange?.(id);
  }

  return (
    <div>
      <div
        role="tablist"
        style={{
          display: "flex",
          gap: "4px",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "16px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => select(tab.id)}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: active === tab.id ? 600 : 400,
              color: active === tab.id ? "var(--color-brand)" : "var(--color-text-muted)",
              borderBottom: active === tab.id ? "2px solid var(--color-brand)" : "2px solid transparent",
              background: "none",
              border: "none",
              borderRadius: "0",
              cursor: "pointer",
              transition: "color 0.15s",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function TabPanel({ id, active, children }: { id: string; active: string; children: React.ReactNode }) {
  if (id !== active) return null;
  return <div role="tabpanel">{children}</div>;
}
