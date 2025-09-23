import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/integrations/supabase/client'
import { 
  Database, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Activity,
  TrendingUp,
  RefreshCw
} from 'lucide-react'

interface DatabaseHealth {
  connectionStatus: 'healthy' | 'warning' | 'error'
  activeConnections: number
  maxConnections: number
  queryPerformance: {
    avgResponseTime: number
    slowQueries: number
  }
  storage: {
    used: number
    total: number
    percentage: number
  }
  replication: {
    status: 'synced' | 'lagging' | 'error'
    lag: number
  }
}

interface DatabaseOptimization {
  id: string
  type: 'index' | 'query' | 'schema' | 'config'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'easy' | 'moderate' | 'complex'
  implemented: boolean
}

class DatabaseOptimizer {
  private static instance: DatabaseOptimizer
  private healthData: DatabaseHealth | null = null
  private optimizations: DatabaseOptimization[] = []

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer()
    }
    return DatabaseOptimizer.instance
  }

  async checkHealth(): Promise<DatabaseHealth> {
    try {
      // Simulate database health check
      const mockHealth: DatabaseHealth = {
        connectionStatus: 'healthy',
        activeConnections: 15,
        maxConnections: 100,
        queryPerformance: {
          avgResponseTime: 45,
          slowQueries: 2
        },
        storage: {
          used: 2.3,
          total: 10,
          percentage: 23
        },
        replication: {
          status: 'synced',
          lag: 0
        }
      }

      this.healthData = mockHealth
      return mockHealth
    } catch (error) {
      throw new Error('Failed to check database health')
    }
  }

  getOptimizationRecommendations(): DatabaseOptimization[] {
    return [
      {
        id: '1',
        type: 'index',
        title: 'Add Index on User Queries',
        description: 'Create composite index on (user_id, created_at) for faster profile queries',
        impact: 'high',
        effort: 'easy',
        implemented: false
      },
      {
        id: '2',
        type: 'query',
        title: 'Optimize Agent Search Query',
        description: 'Use full-text search instead of LIKE patterns for agent name searches',
        impact: 'high',
        effort: 'moderate',
        implemented: true
      },
      {
        id: '3',
        type: 'schema',
        title: 'Partition Large Tables',
        description: 'Partition trading_history table by date for better performance',
        impact: 'medium',
        effort: 'complex',
        implemented: false
      },
      {
        id: '4',
        type: 'config',
        title: 'Optimize Connection Pool',
        description: 'Adjust connection pool settings for better resource utilization',
        impact: 'medium',
        effort: 'easy',
        implemented: true
      }
    ]
  }

  async optimizeDatabase(): Promise<void> {
    // Simulate database optimization
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  async analyzeSlowQueries(): Promise<Array<{
    query: string
    avgTime: number
    calls: number
    impact: 'high' | 'medium' | 'low'
  }>> {
    return [
      {
        query: 'SELECT * FROM agents WHERE name ILIKE...',
        avgTime: 150,
        calls: 1250,
        impact: 'high'
      },
      {
        query: 'SELECT COUNT(*) FROM trading_history...',
        avgTime: 89,
        calls: 890,
        impact: 'medium'
      }
    ]
  }
}

export const databaseOptimizer = DatabaseOptimizer.getInstance()

interface DatabaseOptimizationDashboardProps {
  className?: string
}

export function DatabaseOptimizationDashboard({ className }: DatabaseOptimizationDashboardProps) {
  const [health, setHealth] = useState<DatabaseHealth | null>(null)
  const [optimizations, setOptimizations] = useState<DatabaseOptimization[]>([])
  const [slowQueries, setSlowQueries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOptimizing, setIsOptimizing] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [healthData, optimizationData, slowQueryData] = await Promise.all([
        databaseOptimizer.checkHealth(),
        databaseOptimizer.getOptimizationRecommendations(),
        databaseOptimizer.analyzeSlowQueries()
      ])

      setHealth(healthData)
      setOptimizations(optimizationData)
      setSlowQueries(slowQueryData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptimize = async () => {
    setIsOptimizing(true)
    try {
      await databaseOptimizer.optimizeDatabase()
      await loadDashboardData()
    } catch (error) {
      console.error('Optimization failed:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'synced':
        return 'text-green-600'
      case 'warning':
      case 'lagging':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'synced':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
      case 'lagging':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-primary animate-pulse" />
          <h1 className="text-2xl font-bold">Loading Database Dashboard...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Database Optimization</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleOptimize} disabled={isOptimizing}>
            <TrendingUp className="w-4 h-4 mr-2" />
            {isOptimizing ? 'Optimizing...' : 'Optimize Now'}
          </Button>
        </div>
      </div>

      {/* Health Overview */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Connection Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(health.connectionStatus)}
                    <span className={`font-semibold capitalize ${getStatusColor(health.connectionStatus)}`}>
                      {health.connectionStatus}
                    </span>
                  </div>
                </div>
                <Database className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{health.activeConnections}</div>
                    <div className="text-xs text-muted-foreground">
                      of {health.maxConnections} max
                    </div>
                    <Progress 
                      value={(health.activeConnections / health.maxConnections) * 100} 
                      className="h-1"
                    />
                  </div>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{health.queryPerformance.avgResponseTime}ms</div>
                    <div className="text-xs text-muted-foreground">
                      {health.queryPerformance.slowQueries} slow queries
                    </div>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Storage Usage</p>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{health.storage.percentage}%</div>
                    <div className="text-xs text-muted-foreground">
                      {health.storage.used}GB / {health.storage.total}GB
                    </div>
                    <Progress value={health.storage.percentage} className="h-1" />
                  </div>
                </div>
                <Database className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Optimization Recommendations */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizations.map((opt) => (
              <div key={opt.id} className={`p-4 border rounded-lg ${opt.implemented ? 'bg-green-50 border-green-200' : 'bg-background'}`}>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{opt.title}</h3>
                      <Badge variant={getImpactColor(opt.impact)} className="text-xs">
                        {opt.impact} impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {opt.effort}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{opt.description}</p>
                  </div>
                  <div className="ml-4">
                    {opt.implemented ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Button size="sm" variant="outline">
                        Implement
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Slow Queries Analysis */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Slow Queries Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {slowQueries.map((query, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {query.query}
                      </code>
                      <Badge variant={getImpactColor(query.impact)} className="text-xs">
                        {query.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Avg Time: {query.avgTime}ms</span>
                      <span>Calls: {query.calls}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Optimize
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Replication Status */}
      {health && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Replication & Backup Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(health.replication.status)}
                  <div>
                    <p className="font-medium">Primary → Replica Sync</p>
                    <p className="text-sm text-muted-foreground">
                      {health.replication.status === 'synced' ? 'All replicas synchronized' : `${health.replication.lag}ms lag`}
                    </p>
                  </div>
                </div>
                <Badge variant={health.replication.status === 'synced' ? 'secondary' : 'destructive'}>
                  {health.replication.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}