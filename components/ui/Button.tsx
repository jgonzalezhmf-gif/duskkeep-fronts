"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-black hover:brightness-105",
  secondary: "bg-panel2 text-white hover:bg-panel",
  ghost: "bg-transparent text-white hover:bg-white/5",
  danger: "bg-danger text-white hover:brightness-110",
};

const sizes = {
  sm: "text-xs px-2.5 py-1.5",
  md: "text-sm px-3 py-2",
  lg: "text-base px-4 py-3",
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", fullWidth, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...rest}
    />
  );
});

export default Button;
