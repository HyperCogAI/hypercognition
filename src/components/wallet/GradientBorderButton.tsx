import { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GradientBorderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

export const GradientBorderButton = ({ children, className, ...props }: GradientBorderButtonProps) => {
  return (
    <div className="relative inline-flex">
      {/* Animated gradient ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full p-[2px] bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)),hsl(var(--primary)))] bg-[length:300%_100%] animate-[gradientShift_2.5s_linear_infinite] shadow-[0_0_12px_hsl(var(--primary)/0.35)]"
        style={{
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor" as any,
          maskComposite: "exclude" as any,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        }}
      />

      {/* Button content */}
      <button
        className={cn(
          "relative rounded-full px-3 h-8 text-xs font-medium inline-flex items-center justify-center gap-2 bg-black/60 hover:bg-black/70 text-white transition-colors duration-300",
          className
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  )
}
