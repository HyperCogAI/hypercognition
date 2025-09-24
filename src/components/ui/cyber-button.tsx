import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cyberButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary/30 text-primary-foreground border border-primary shadow hover:bg-primary/40 hover:text-muted-foreground transition-all duration-300",
        destructive: "bg-destructive/80 text-destructive-foreground shadow-sm hover:bg-destructive hover:text-muted-foreground transition-all duration-300",
        outline: "border border-primary/30 bg-transparent text-primary shadow-sm hover:bg-primary/5 hover:border-primary/50 hover:text-muted-foreground transition-all duration-300",
        secondary: "bg-secondary/80 text-secondary-foreground shadow-sm hover:bg-secondary hover:text-muted-foreground transition-all duration-300",
        ghost: "hover:bg-muted/50 hover:text-muted-foreground transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline hover:text-muted-foreground",
        cyber: "bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground shadow-lg hover:shadow-xl hover:from-primary hover:to-accent hover:text-muted-foreground transition-all duration-300",
        neon: "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg glow-primary",
        analytics: "rounded-full border border-primary/30 bg-background/10 text-white hover:bg-primary/10 hover:border-primary/50 hover:text-muted-foreground transition-all duration-300 shadow-sm",
        ai: "bg-gradient-to-r from-secondary/70 to-primary/70 text-primary-foreground shadow-lg hover:from-secondary hover:to-primary hover:text-muted-foreground transition-all duration-300"
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