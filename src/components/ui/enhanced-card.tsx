import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"

interface EnhancedCardProps {
  title?: string
  children: ReactNode
  className?: string
  glowColor?: "primary" | "secondary" | "accent"
  animated?: boolean
}

export function EnhancedCard({ 
  title, 
  children, 
  className, 
  glowColor = "primary", 
  animated = false 
}: EnhancedCardProps) {
  const glowClass = {
    primary: "glow-primary",
    secondary: "glow-secondary", 
    accent: "glow-accent"
  }[glowColor]

  return (
    <Card 
      className={cn(
        "bg-gradient-to-br from-card/80 to-card-glow/50 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
        glowClass && `hover:${glowClass}`,
        animated && "hover:scale-[1.02] transition-transform",
        className
      )}
    >
      {title && (
        <CardHeader>
          <CardTitle className="text-foreground">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "" : "pt-6"}>
        {children}
      </CardContent>
    </Card>
  )
}