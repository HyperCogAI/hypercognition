import { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GradientBorderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

export const GradientBorderButton = ({ children, className, ...props }: GradientBorderButtonProps) => {
  return (
    <div className="relative p-[2px] rounded-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-[borderRotate_3s_linear_infinite]">
      <button
        className={cn(
          "w-full h-full bg-black/60 hover:bg-black/70 text-white rounded-full px-3 h-8 text-xs font-medium transition-all duration-300 inline-flex items-center justify-center gap-2",
          className
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  )
}
