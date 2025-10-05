import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cyberButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary/60 text-white outline outline-[1px] outline-white shadow hover:bg-primary/70 hover:text-white transition-all duration-300",
        destructive: "bg-destructive/80 text-destructive-foreground shadow-sm hover:bg-destructive hover:text-muted-foreground transition-all duration-300",
        outline: "relative text-white transition-all duration-300 shadow-sm before:content-[''] before:absolute before:inset-[-2px] before:rounded-full before:bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)),hsl(var(--primary)))] before:bg-[length:300%_100%] before:animate-gradient-shift before:-z-10 bg-[#16181f] hover:!bg-[#1d2029]",
        secondary: "bg-secondary/80 text-secondary-foreground shadow-sm hover:bg-secondary hover:text-muted-foreground transition-all duration-300",
        ghost: "hover:bg-muted/50 hover:text-muted-foreground transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline hover:text-muted-foreground",
        cyber: "bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground shadow-lg hover:shadow-xl hover:from-primary hover:to-accent hover:text-muted-foreground transition-all duration-300",
        neon: "bg-primary/60 text-white outline outline-[1px] outline-white hover:bg-primary/70 transition-all duration-300 shadow-lg glow-primary",
        analytics: "relative rounded-full text-white transition-all duration-300 shadow-sm before:content-[''] before:absolute before:inset-[-2px] before:rounded-full before:bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)),hsl(var(--primary)))] before:bg-[length:300%_100%] before:animate-gradient-shift before:-z-10 bg-[#16181f] hover:!bg-[#1d2029]",
        ai: "bg-gradient-to-r from-secondary/70 to-primary/70 text-primary-foreground shadow-lg hover:from-secondary hover:to-primary hover:text-muted-foreground transition-all duration-300",
        "gradient-border": "bg-black/60 text-white border-2 border-transparent hover:bg-black/70 transition-all duration-300 [background-clip:padding-box] [border-image:linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)),hsl(var(--primary)))_1] animate-[borderRotate_3s_linear_infinite] bg-[length:200%_100%]"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-full px-3 text-xs",
        lg: "h-10 rounded-full px-8",
        xl: "h-12 rounded-full px-10 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CyberButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cyberButtonVariants> {
  asChild?: boolean
}

const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(cyberButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
CyberButton.displayName = "CyberButton"

export { CyberButton, cyberButtonVariants }