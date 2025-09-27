import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { 
  Zap, 
  Clock, 
  Database, 
  Wifi, 
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  target: number
  description: string
}

interface OptimizationFeature {
  id: string
  name: string
  description: string
  enabled: boolean
  impact: 'low' | 'medium' | 'high'
  category: 'caching' | 'networking' | 'rendering' | 'database'
}

export const AdvancedPerformanceOptimizer = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'page-load',
      name: 'Page Load Time',
      value: 2.3,
      unit: 's',
      status: 'good',
      target: 3.0,
      description: 'Time to fully load and render the page'
    },
    {
      id: 'api-response',
      name: 'API Response Time',
      value: 420,
      unit: 'ms',
      status: 'good',
      target: 500,
      description: 'Average response time from backend APIs'
    },
    {
      id: 'bundle-size',
      name: 'Bundle Size',
      value: 2.8,
      unit: 'MB',
      status: 'warning',
      target: 2.0,
      description: 'Total size of JavaScript bundles'
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      value: 45,
      unit: 'MB',
      status: 'good',
      target: 100,
      description: 'Current memory consumption'
    },
    {
      id: 'cache-hit',
      name: 'Cache Hit Rate',
      value: 87,
      unit: '%',
      status: 'good',
      target: 85,
      description: 'Percentage of requests served from cache'
    },
    {
      id: 'db-query',
      name: 'Database Query Time',
      value: 150,
      unit: 'ms',
      status: 'warning',
      target: 100,
      description: 'Average database query execution time'
    }
  ])

  const [optimizations, setOptimizations] = useState<OptimizationFeature[]>([
    {
      id: 'lazy-loading',
      name: 'Lazy Loading',
      description: 'Load components and images only when needed',
      enabled: true,
      impact: 'high',
      category: 'rendering'
    },
    {
      id: 'service-worker',
      name: 'Service Worker Caching',
      description: 'Cache static assets and API responses',
      enabled: true,
      impact: 'high',
      category: 'caching'
    },
    {
      id: 'code-splitting',
      name: 'Code Splitting',
      description: 'Split code into smaller chunks for faster loading',
      enabled: true,
      impact: 'medium',
      category: 'rendering'
    },
    {
      id: 'image-optimization',
      name: 'Image Optimization',
      description: 'Compress and optimize images automatically',
      enabled: false,
      impact: 'medium',
      category: 'networking'
    },
    {
      id: 'cdn-caching',
      name: 'CDN Caching',
      description: 'Serve static assets from global CDN',
      enabled: false,
      impact: 'high',
      category: 'networking'
    },
    {
      id: 'database-indexing',
      name: 'Database Indexing',
      description: 'Optimize database queries with proper indexes',
      enabled: true,
      impact: 'high',
      category: 'database'
    },
    {
      id: 'memory-pooling',
      name: 'Memory Pooling',
      description: 'Reuse objects to reduce garbage collection',
      enabled: false,
      impact: 'medium',
      category: 'rendering'
    },
    {
      id: 'api-batching',
      name: 'API Request Batching',
      description: 'Combine multiple API requests into batches',
      enabled: true,
      impact: 'medium',
      category: 'networking'
    }
  ])

  const [isOptimizing, setIsOptimizing] = useState(false)
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null)
  const { toast } = useToast()
  const metricsIntervalRef = useRef<NodeJS.Timeout>()

  // Simulate real-time metrics updates
  useEffect(() => {
    metricsIntervalRef.current = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (crypto.getRandomValues(new Int32Array(1))[0] % 200 - 100) / 1000,
        status: metric.value > metric.target * 0.9 ? 'critical' :
                metric.value > metric.target * 0.7 ? 'warning' : 'good'
      })))
    }, 5000)

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current)
      }
    }
  }, [])

  const runOptimization = async () => {
    setIsOptimizing(true)
    
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Improve metrics
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(metric.value * 0.8, metric.target * 0.5),
        status: 'good'
      })))

      setLastOptimization(new Date())
      
      toast({
        title: "Optimization Complete",
        description: "Performance metrics have been improved",
      })
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Could not complete performance optimization",
        variant: "destructive"
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const toggleOptimization = (id: string) => {
    setOptimizations(prev => prev.map(opt => 
      opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
    ))

    const optimization = optimizations.find(opt => opt.id === id)
    if (optimization) {
      toast({
        title: `${optimization.name} ${optimization.enabled ? 'Disabled' : 'Enabled'}`,
        description: optimization.description,
      })
    }
  }

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'page-load': return <Clock className="h-4 w-4" />
      case 'api-response': return <Wifi className="h-4 w-4" />
      case 'bundle-size': return <HardDrive className="h-4 w-4" />
      case 'memory-usage': return <MemoryStick className="h-4 w-4" />
      case 'cache-hit': return <Database className="h-4 w-4" />
      case 'db-query': return <Database className="h-4 w-4" />
      default: return <Cpu className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'caching': return <Database className="h-4 w-4" />
      case 'networking': return <Globe className="h-4 w-4" />
      case 'rendering': return <Cpu className="h-4 w-4" />
      case 'database': return <HardDrive className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge className="bg-green-500">High Impact</Badge>
      case 'medium': return <Badge className="bg-orange-500 text-white border-0">Medium Impact</Badge>
      case 'low': return <Badge variant="outline">Low Impact</Badge>
      default: return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const overallScore = Math.round(
    metrics.reduce((acc, metric) => {
      const score = Math.min((metric.target / Math.max(metric.value, 0.1)) * 100, 100)
      return acc + score
    }, 0) / metrics.length
  )

  const enabledOptimizations = optimizations.filter(opt => opt.enabled).length

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{overallScore}</div>
            <p className="text-sm text-muted-foreground">Performance Score</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{enabledOptimizations}</div>
            <p className="text-sm text-muted-foreground">Active Optimizations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">
              {lastOptimization ? lastOptimization.toLocaleTimeString() : 'Never'}
            </div>
            <p className="text-sm text-muted-foreground">Last Optimization</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              {metrics.filter(m => m.status === 'good').length}
            </div>
            <p className="text-sm text-muted-foreground">Healthy Metrics</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button 
              onClick={runOptimization} 
              disabled={isOptimizing}
              className="flex-1"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Optimization
                </>
              )}
            </Button>
          </div>

          <Tabs defaultValue="metrics" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid gap-4">
                {metrics.map((metric) => (
                  <Card key={metric.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getMetricIcon(metric.id)}
                          <h3 className="font-medium">{metric.name}</h3>
                          {getStatusIcon(metric.status)}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {metric.value.toFixed(metric.unit === '%' ? 0 : 1)}{metric.unit}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Target: {metric.target}{metric.unit}
                          </div>
                        </div>
                      </div>
                      
                      <Progress 
                        value={Math.min((metric.target / Math.max(metric.value, 0.1)) * 100, 100)} 
                        className="h-2 mb-2" 
                      />
                      
                      <p className="text-sm text-muted-foreground">
                        {metric.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="optimizations" className="space-y-4">
              <div className="grid gap-4">
                {optimizations.map((optimization) => (
                  <Card key={optimization.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(optimization.category)}
                          <div>
                            <h3 className="font-medium">{optimization.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {optimization.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getImpactBadge(optimization.impact)}
                          <Switch
                            checked={optimization.enabled}
                            onCheckedChange={() => toggleOptimization(optimization.id)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Bottlenecks Detected</h4>
                      <div className="space-y-2">
                        {metrics.filter(m => m.status !== 'good').map(metric => (
                          <div key={metric.id} className="flex items-center gap-2 text-sm">
                            {getStatusIcon(metric.status)}
                            <span>{metric.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Recommended Actions</h4>
                      <div className="space-y-2 text-sm">
                        <div>• Enable CDN caching for faster asset delivery</div>
                        <div>• Implement image optimization</div>
                        <div>• Consider database query optimization</div>
                        <div>• Enable memory pooling for better performance</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Performance Trends</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-500">+12%</div>
                        <p className="text-sm text-muted-foreground">Load Speed</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-500">-8%</div>
                        <p className="text-sm text-muted-foreground">Memory Usage</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-500">+25%</div>
                        <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}