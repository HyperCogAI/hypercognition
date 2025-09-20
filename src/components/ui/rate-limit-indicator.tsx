import { Clock, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RateLimitIndicatorProps {
  requests: number
  maxRequests: number
  resetTimeRemaining: number
  isLimited: boolean
  className?: string
}

export const RateLimitIndicator = ({
  requests,
  maxRequests,
  resetTimeRemaining,
  isLimited,
  className
}: RateLimitIndicatorProps) => {
  const progress = (requests / maxRequests) * 100
  const remainingSeconds = Math.ceil(resetTimeRemaining / 1000)
  
  const getVariant = () => {
    if (isLimited) return "destructive"
    if (progress >= 80) return "secondary"
    return "default"
  }
  
  const getProgressColor = () => {
    if (progress >= 90) return "bg-destructive"
    if (progress >= 70) return "bg-yellow-500"
    return "bg-primary"
  }

  if (requests === 0) return null

  return (
    <Card className={`w-full max-w-sm ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Rate Limit</span>
          </div>
          <Badge variant={getVariant()}>
            {requests}/{maxRequests}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="h-2"
            style={{
              // @ts-ignore - Custom CSS property
              '--progress-background': getProgressColor()
            }}
          />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{maxRequests - requests} requests remaining</span>
            {isLimited && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-3 w-3" />
                <span>Reset in {remainingSeconds}s</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}