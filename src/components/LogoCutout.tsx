import React from "react";
import { cn } from "@/lib/utils";

interface LogoCutoutProps {
  src: string;
  alt?: string;
  className?: string;
}

export const LogoCutout: React.FC<LogoCutoutProps> = ({ src, alt = "Logo", className }) => {
  return (
    <div className={cn("relative inline-block overflow-hidden rounded-md", className)}>
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)),hsl(var(--primary)))] bg-[length:300%_100%] animate-gradient-shift pointer-events-none scale-[0.93] origin-center"
        aria-hidden="true"
      />
      {/* Logo overlay with transparent middle */}
      <img
        src={src}
        alt={alt}
        className="relative z-10 block h-full w-auto transform-gpu scale-[1.09] origin-center"
        decoding="async"
        loading="eager"
      />
    </div>
  );
};
