import React from "react";
import { cn } from "@/lib/utils";

interface GradientCrownProps {
  className?: string;
  active?: boolean;
  size?: number | string;
}

// Gold gradient crown icon that reveals gradient only on hover/active
export const GradientCrown: React.FC<GradientCrownProps> = ({ className, active = false, size = 16 }) => {
  const dim = typeof size === "number" ? size : undefined;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Non-animated gold gradient using HSL values (no outer glow) */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(45 96% 65%)" />
          <stop offset="50%" stopColor="hsl(42 96% 55%)" />
          <stop offset="100%" stopColor="hsl(38 92% 45%)" />
        </linearGradient>
      </defs>

      {/* Base outline (inherits currentColor, muted by parent) */}
      <g className="pointer-events-none">
        <path d="M4 15L8 8l4 5 4-5 4 7" />
        <path d="M3 18h18" />
      </g>

      {/* Gold fill only when hovered/active */}
      <g
        className={cn(
          "transition-opacity duration-200 pointer-events-none",
          active ? "opacity-100" : "opacity-0",
          // Support both desktop group/menu and generic group hovers
          "group-hover:opacity-100 group-hover/menu:opacity-100"
        )}
      >
        <polygon points="4,15 8,8 12,13 16,8 20,15 20,18 4,18" fill="url(#goldGradient)" />
      </g>
    </svg>
  );
};

export default GradientCrown;
