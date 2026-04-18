"use client";

import React, { useState, useCallback, useRef } from "react";

type ToastItem = { id: number; message: string; variant: "success" | "error" | "info" };

const COLORS = {
  success: { bg: "#D1FAF4", text: "#065F46", border: "#6EE7D8" },
  error:   { bg: "#FEE2E2", text: "#B91C1C", border: "#FCA5A5" },
  info:    { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
};

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const toast = useCallback((message: string, variant: ToastItem["variant"] = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    const timer = setTimeout(() => dismiss(id), 4000);
    timers.current.set(id, timer);
  }, [dismiss]);

  return { toasts, toast, dismiss };
}

export default function ToastContainer({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {toasts.map((t) => {
        const c = COLORS[t.variant];
        return (
          <div
            key={t.id}
            role="alert"
            style={{
              background: c.bg,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: "280px",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              style={{ background: "none", border: "none", cursor: "pointer", color: c.text, fontSize: "16px", lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
