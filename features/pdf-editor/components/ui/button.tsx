"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "ghost" | "outline";
type Size = "md" | "sm" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const baseStyles =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition-[opacity,box-shadow,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hub-primary focus-visible:ring-offset-2 focus-visible:ring-offset-hub-bg disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-hub-accent text-white shadow-[0_2px_4px_rgba(22,163,74,0.24)] hover:opacity-90",
  ghost: "bg-transparent text-hub-fg hover:bg-white/50",
  outline:
    "border-2 border-hub-primary bg-white/70 text-hub-fg hover:bg-hub-border",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-sm",
  sm: "h-10 px-3 text-sm",
  icon: "size-11 shrink-0 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
