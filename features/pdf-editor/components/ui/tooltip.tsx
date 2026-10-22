"use client";

import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
};

export function Tooltip({ label, children }: Props) {
  return (
    <div className="group relative flex">
      {children}
      <span
        role="tooltip"
        aria-hidden="true"
        className="glass-card pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-medium text-hub-fg opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 lg:bottom-auto lg:left-full lg:top-1/2 lg:mb-0 lg:ml-2 lg:-translate-y-1/2 lg:translate-x-0"
      >
        {label}
      </span>
    </div>
  );
}
