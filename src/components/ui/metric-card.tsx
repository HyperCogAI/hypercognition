import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const metricCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-md hover:shadow-lg transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border",
        glow: "border-primary/20 glow-primary",
        accent: "border-accent/20 glow-accent",
        secondary: "border-secondary/20 glow-secondary"
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  title: string
  value: string
  subtitle?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, variant, size, title, value, subtitle, trend, icon, ...props }, ref) => {
    const getTrendColor = () => {
      switch (trend) {
        case "up": return "text-accent"
        case "down": return "text-destructive"
        default: return "text-muted-foreground"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(metricCardVariants({ variant, size, className }))}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className={cn("text-sm", getTrendColor())}>{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              {icon}
            </div>
          )}
        </div>
      </div>
    )
  }
)
MetricCard.displayName = "MetricCard"

export { MetricCard, metricCardVariants }