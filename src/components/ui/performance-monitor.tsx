import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { performanceOptimizer } from '@/lib/performanceOptimizer'
import { useMemoryMonitoring } from '@/hooks/usePerformanceMonitoring'
import { Activity, Clock, MemoryStick, Zap } from 'lucide-react'

interface PerformanceMonitorProps {
  showDetails?: boolean
  className?: string
}

export function PerformanceMonitor({ showDetails = false, className }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState(performanceOptimizer.getAllMetrics())
  const [analysis, setAnalysis] = useState(performanceOptimizer.analyzeBundleSize())
  const { memoryUsage } = useMemoryMonitoring()

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceOptimizer.getAllMetrics())
      setAnalysis(performanceOptimizer.analyzeBundleSize())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'success'
    if (value <= thresholds.warning) return 'warning'
    return 'destructive'
  }

  const formatTime = (ms: number) => `${ms.toFixed(1)}ms`

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant={getPerformanceColor(memoryUsage * 100, { good: 60, warning: 80 })}>
          <MemoryStick className="w-3 h-3 mr-1" />
          {(memoryUsage * 100).toFixed(1)}%
        </Badge>
        <Badge variant={analysis.criticalComponents.length > 0 ? 'destructive' : 'default'}>
          <Zap className="w-3 h-3 mr-1" />
          {metrics.size} components
        </Badge>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Memory Usage</span>
            <span className="text-sm text-muted-foreground">
              {(memoryUsage * 100).toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={memoryUsage * 100} 
            className="h-2"
          />
        </div>

        {/* Component Performance */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Component Performance</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {Array.from(metrics.entries()).map(([name, metric]) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <span className="truncate flex-1">{name}</span>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getPerformanceColor(metric.componentLoadTime, { good: 100, warning: 500 })}
                    className="text-xs"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(metric.componentLoadTime)}
                  </Badge>
                  {metric.renderTime > 0 && (
                    <Badge 
                      variant={getPerformanceColor(metric.renderTime, { good: 50, warning: 100 })}
                      className="text-xs"
                    >
                      {formatTime(metric.renderTime)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-destructive">Performance Recommendations</h4>
            <div className="space-y-1">
              {analysis.recommendations.slice(0, 3).map((rec, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  • {rec}
                </p>
              ))}
              {analysis.recommendations.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{analysis.recommendations.length - 3} more recommendations
                </p>
              )}
            </div>
          </div>
        )}

        {/* Critical Components */}
        {analysis.criticalComponents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-destructive">Critical Components</h4>
            <div className="flex flex-wrap gap-1">
              {analysis.criticalComponents.map(component => (
                <Badge key={component} variant="destructive" className="text-xs">
                  {component}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={() => performanceOptimizer.cleanup()}
          variant="outline" 
          size="sm"
          className="w-full"
        >
          Clear Metrics
        </Button>
      </CardContent>
    </Card>
  )
}