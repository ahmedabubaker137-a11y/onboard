import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "icon" | "image";
  size?: "sm" | "md" | "lg";
  className?: string;
  showSubtitle?: boolean;
}

export function OnboardXLogo({
  variant = "full",
  size = "md",
  className = "",
  showSubtitle = false,
}: LogoProps) {
  const heights = {
    sm: "h-6 w-auto",
    md: "h-7 sm:h-8 w-auto",
    lg: "h-9 sm:h-10 w-auto",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl",
  };

  if (variant === "icon") {
    return (
      <Link href="/" className={`inline-flex items-center group shrink-0 ${className}`}>
        <img
          src="/onboardx-emblem.png"
          alt="OnboardX Emblem"
          className={`${heights[size]} object-contain drop-shadow-subtle group-hover:scale-105 transition-transform duration-150`}
        />
      </Link>
    );
  }

  if (variant === "image") {
    return (
      <Link href="/" className={`inline-flex items-center group shrink-0 ${className}`}>
        <img
          src="/onboardx-full-logo.png"
          alt="OnboardX"
          className={`${heights[size]} object-contain group-hover:opacity-90 transition-opacity`}
        />
      </Link>
    );
  }

  return (
    <Link href="/" className={`inline-flex items-center gap-2 sm:gap-2.5 group shrink-0 select-none ${className}`}>
      {/* Official OnboardX Gateway Emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src="/onboardx-emblem.png"
          alt="OnboardX Mark"
          className={`${heights[size]} object-contain group-hover:scale-105 transition-transform duration-150`}
        />
      </div>

      <div className="flex flex-col shrink-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-headline font-bold ${textSizes[size]} tracking-tight text-graphite dark:text-ivory group-hover:text-pine dark:group-hover:text-amberSignal transition-colors`}>
            Onboard<span className="text-amberSignal">X</span>
          </span>
          <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-mist dark:bg-graphite-cardDark text-pine dark:text-amberSignal font-semibold border border-mist-dark dark:border-graphite-borderDark leading-none">
            OS
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] sm:text-[11px] font-medium text-graphite-muted dark:text-gray-400 mt-0.5">
            Enterprise Onboarding Operating System
          </span>
        )}
      </div>
    </Link>
  );
}
