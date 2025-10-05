import { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GradientBorderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

export const GradientBorderButton = ({ children, className, ...props }: GradientBorderButtonProps) => {
  return (
    <button
      className={cn(
        "rounded-full px-3 h-8 text-xs font-medium inline-flex items-center justify-center gap-2 bg-[#697084] text-white border border-white hover:bg-[#697084]/90 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
