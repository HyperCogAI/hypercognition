import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border bg-card",
        elevated: "border-border bg-card shadow-lg hover:shadow-xl",
        outlined: "border-primary/20 bg-transparent",
        filled: "border-transparent bg-muted/50",
        neon: "border-primary/30 bg-card shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]",
        cyber: "border-gradient-primary bg-gradient-card shadow-[0_0_25px_hsl(var(--card-glow)/0.3)]",
        interactive: "border-border bg-card cursor-pointer hover:border-primary/50 hover:shadow-md active:scale-[0.98]"
      },
      size: {
        default: "",
        sm: "p-3",
        lg: "p-8",
        xl: "p-10"
      },
      spacing: {
        default: "",
        tight: "[&>*]:space-y-2",
        relaxed: "[&>*]:space-y-6",
        loose: "[&>*]:space-y-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      spacing: "default"
    }
  }
)

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  clickable?: boolean
  onCardClick?: () => void
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, spacing, clickable, onCardClick, onClick, ...props }, ref) => {
    const handleClick = onClick || onCardClick
    const cardVariant = clickable ? "interactive" : variant

    return (
      <div 
        ref={ref} 
        className={cn(cardVariants({ variant: cardVariant, size, spacing, className }))} 
        onClick={clickable ? handleClick : undefined}
        {...props} 
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

// Enhanced Card Components
interface StatCardProps extends CardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, subtitle, icon: Icon, trend, className, ...props }, ref) => (
    <Card ref={ref} variant="elevated" className={cn("relative overflow-hidden", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
              {trend && (
                <div className={cn(
                  "flex items-center text-xs font-medium",
                  trend.positive ? "text-green-600" : "text-red-600"
                )}>
                  <span className="mr-1">
                    {trend.positive ? "↗" : "↘"}
                  </span>
                  {trend.value}% {trend.label}
                </div>
              )}
            </div>
          </div>
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
)
StatCard.displayName = "StatCard"

interface FeatureCardProps extends CardProps {
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
  action?: {
    label: string
    onClick: () => void
  }
  badge?: string
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ title, description, icon: Icon, action, badge, className, ...props }, ref) => (
    <Card ref={ref} variant="elevated" className={cn("group hover:border-primary/50 transition-all duration-300", className)} {...props}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {Icon && (
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              )}
              <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
            </div>
            {badge && (
              <span className="px-2 py-1 text-xs font-medium bg-accent/20 text-accent-foreground rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {action.label} →
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
)
FeatureCard.displayName = "FeatureCard"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }