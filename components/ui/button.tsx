import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium font-headline transition-colors duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-pine/30 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary:
        "bg-pine dark:bg-[#32615E] text-ivory hover:bg-pine-600 dark:hover:bg-[#284E4C] active:bg-pine-700 shadow-subtle",
      accent:
        "bg-amberSignal text-white hover:bg-amberSignal-hover shadow-subtle font-semibold",
      secondary:
        "bg-mist dark:bg-graphite-cardDark text-graphite dark:text-ivory hover:bg-mist-dark dark:hover:bg-graphite-dark border border-mist-dark/60 dark:border-graphite-borderDark",
      outline:
        "border border-graphite-border dark:border-graphite-borderDark bg-white dark:bg-graphite-cardDark text-graphite dark:text-ivory hover:bg-mist/50 dark:hover:bg-graphite-dark hover:border-pine/40 dark:hover:border-pine shadow-subtle",
      ghost:
        "text-graphite dark:text-gray-300 hover:bg-mist/70 dark:hover:bg-graphite-dark hover:text-pine dark:hover:text-ivory",
      danger:
        "bg-brick text-white hover:bg-red-700 shadow-subtle font-semibold",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
