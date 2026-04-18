"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function NotifBell() {
  const [count, setCount] = useState<number>(0);

  const fetchCount = () => {
    fetch("/api/notifications/unread-count")
      .then((r) => r.json())
      .then((data: { count: number }) => setCount(data.count))
      .catch(() => {/* silently ignore */});
  };

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#F0EBE3] transition-colors no-underline"
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6B6B6B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#EF4444] text-white text-[10px] font-bold px-1">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
