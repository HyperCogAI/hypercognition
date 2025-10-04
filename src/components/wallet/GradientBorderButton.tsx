import { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GradientBorderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

export const GradientBorderButton = ({ children, className, ...props }: GradientBorderButtonProps) => {
  return (
    <div className="relative inline-flex rounded-full p-[2px] bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)),hsl(var(--primary)))] bg-[length:300%_100%] animate-gradient-shift">
      <button
        className={cn(
          "relative rounded-full px-3 h-8 text-xs font-medium inline-flex items-center justify-center gap-2 bg-[#0d0f15] hover:bg-[#14171e] text-white transition-colors duration-300",
          className
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  )
}
