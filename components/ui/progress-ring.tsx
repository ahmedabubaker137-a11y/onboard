import React from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showText?: boolean;
}

export function ProgressRing({
  progress,
  size = 110,
  strokeWidth = 9,
  className,
  showText = true,
}: ProgressRingProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  // Color changes to Forest when completed
  const strokeColor =
    normalizedProgress === 100
      ? "#1F7A5C" // Forest
      : normalizedProgress > 50
      ? "#274C4A" // Slate Pine
      : "#D98A1E"; // Amber Signal

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-[#E3ECEB] dark:text-[#2B3338]"
        />
        {/* Active progress stroke */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showText && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-headline font-bold text-2xl tracking-tight text-graphite dark:text-ivory">
            {normalizedProgress}%
          </span>
          <span className="text-[10px] uppercase font-semibold text-graphite-muted dark:text-gray-400 tracking-wider">
            {normalizedProgress === 100 ? "Done" : "Complete"}
          </span>
        </div>
      )}
    </div>
  );
}
