import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "mist" | "outline";
}

export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variants = {
    default:
      "bg-white dark:bg-[#1A1F22] border border-[#D8DFDE] dark:border-graphite-borderDark shadow-subtle dark:shadow-darkCard",
    mist: "bg-mist dark:bg-graphite-cardDark border border-[#D0D8D7] dark:border-graphite-borderDark",
    outline: "bg-transparent border border-graphite-border dark:border-graphite-borderDark",
  };

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden transition-all duration-150",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-5 border-b border-[#E3ECEB] dark:border-graphite-borderDark",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold font-headline text-graphite dark:text-ivory",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs text-graphite-muted dark:text-gray-400 mt-1",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-[#E3ECEB] dark:border-graphite-borderDark bg-mist/30 dark:bg-graphite-dark/40",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
