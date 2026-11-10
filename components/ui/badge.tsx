import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  variant?: "forest" | "clay" | "brick" | "steel" | "pine" | "mist" | "amber";
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  variant = "mist",
  children,
  className,
  size = "md",
}: BadgeProps) {
  const variants = {
    forest:
      "bg-forest/10 dark:bg-forest/20 text-forest dark:text-[#38B38A] border border-forest/20 dark:border-forest/40 font-semibold",
    clay:
      "bg-clayGold/15 dark:bg-clayGold/25 text-[#9E6F10] dark:text-[#E8BA55] border border-clayGold/30 dark:border-clayGold/40 font-semibold",
    brick:
      "bg-brick/10 dark:bg-brick/20 text-brick dark:text-[#E8736B] border border-brick/20 dark:border-brick/40 font-semibold",
    steel:
      "bg-steelBlue/15 dark:bg-steelBlue/25 text-steelBlue dark:text-[#7FA6BF] border border-steelBlue/30 dark:border-steelBlue/40 font-medium",
    pine:
      "bg-pine/10 dark:bg-pine/30 text-pine dark:text-[#6BB3AF] border border-pine/25 dark:border-pine/40 font-semibold",
    mist:
      "bg-mist dark:bg-graphite-cardDark text-graphite dark:text-ivory border border-mist-dark dark:border-graphite-borderDark font-medium",
    amber:
      "bg-amberSignal/15 dark:bg-amberSignal/25 text-amberSignal dark:text-[#E59A33] border border-amberSignal/30 dark:border-amberSignal/40 font-semibold",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-headline tracking-wide uppercase",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
