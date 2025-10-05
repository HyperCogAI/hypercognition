import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoCutoutProps {
  src: string;
  alt?: string;
  className?: string; // controls height like h-8/h-12; width auto via img
}

// Utility: RGB -> HSL
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

// Heuristic: detect "light blue/cyan" range to remove
function isLightBlue(r: number, g: number, b: number) {
  const { h, s, l } = rgbToHsl(r, g, b);
  // cyan-blue hue band, sufficiently saturated and light
  return h >= 180 && h <= 215 && s >= 0.25 && l >= 0.55;
}

export const LogoCutout: React.FC<LogoCutoutProps> = ({ src, alt = "Logo", className }) => {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  // Process the image once to make light-blue pixels transparent
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Make light-blue pixels transparent
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a !== 0 && isLightBlue(r, g, b)) {
          data[i + 3] = 0; // make transparent
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Export data URL
      const url = canvas.toDataURL("image/png");
      if (!cancelled) setProcessedSrc(url);
    };
    img.src = src;
    return () => { cancelled = true; };
  }, [src]);

  // Mask styles to clamp gradient only to the logo silhouette
  const maskStyle = useMemo(() => ({
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  } as React.CSSProperties), [src]);

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Animated gradient visible only within the logo silhouette */}
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)),hsl(var(--primary)))] bg-[length:300%_100%] animate-gradient-shift"
        style={maskStyle}
        aria-hidden="true"
      />
      {/* Logo with light-blue areas removed to let gradient show through */}
      <img
        src={processedSrc || src}
        alt={alt}
        className="block h-full w-auto"
        decoding="async"
        loading="eager"
      />
    </div>
  );
};
