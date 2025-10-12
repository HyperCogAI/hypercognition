import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Zap, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react'

interface ExecutionMetrics {
  totalExecutions: number
  successRate: number
  avgLatency: number
  slippageAvg: number
  failureRate: number
  volumeProcessed: number
}

interface ExecutionOrder {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  type: string
  requestedAmount: number
  executedAmount: number
  requestedPrice?: number
  executedPrice: number
  slippage: number
  latency: number
  status: 'executing' | 'completed' | 'failed' | 'cancelled'
  timestamp: Date
  venue: string
  fees: number
}

interface ExecutionStrategy {
  name: string
  description: string
  isActive: boolean
  successRate: number
  avgLatency: number
  lastUsed: Date
}

export const ExecutionEngine: React.FC = () => {
  const [metrics, setMetrics] = useState<ExecutionMetrics>({
    totalExecutions: 1247,
    successRate: 99.2,
    avgLatency: 45,
    slippageAvg: 0.02,
    failureRate: 0.8,
    volumeProcessed: 15420000
  })

  const [recentExecutions, setRecentExecutions] = useState<ExecutionOrder[]>([])
  const [strategies, setStrategies] = useState<ExecutionStrategy[]>([])
  const [isEngineActive, setIsEngineActive] = useState(true)
  const [executionHistory, setExecutionHistory] = useState<any[]>([])

  useEffect(() => {
    // Generate mock execution data
    const mockExecutions: ExecutionOrder[] = Array.from({ length: 10 }, (_, i) => ({
      id: `exec-${i + 1}`,
      symbol: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'][Math.floor(Math.random() * 3)],
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      type: ['market', 'limit', 'iceberg'][Math.floor(Math.random() * 3)],
      requestedAmount: Math.random() * 10 + 0.1,
      executedAmount: Math.random() * 10 + 0.1,
      requestedPrice: Math.random() > 0.3 ? Math.random() * 50000 + 30000 : undefined,
      executedPrice: Math.random() * 50000 + 30000,
      slippage: Math.random() * 0.1,
      latency: Math.random() * 100 + 20,
      status: ['executing', 'completed', 'failed'][Math.floor(Math.random() * 3)] as any,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      venue: ['Wallet', 'DEX', 'Direct'][Math.floor(Math.random() * 3)],
      fees: Math.random() * 10 + 1
    }))

    const mockStrategies: ExecutionStrategy[] = [
      {
        name: 'TWAP (Time-Weighted Average Price)',
        description: 'Executes large orders over time to minimize market impact',
        isActive: true,
        successRate: 98.5,
        avgLatency: 120,
        lastUsed: new Date(Date.now() - 1800000)
      },
      {
        name: 'Iceberg Orders',
        description: 'Breaks large orders into smaller visible chunks',
        isActive: true,
        successRate: 97.8,
        avgLatency: 85,
        lastUsed: new Date(Date.now() - 3600000)
      },
      {
        name: 'Smart Order Routing (SOR)',
        description: 'Routes orders to optimal venues for best execution',
        isActive: true,
        successRate: 99.1,
        avgLatency: 35,
        lastUsed: new Date(Date.now() - 900000)
      },
      {
        name: 'Volume Participation',
        description: 'Participates in market volume at specified percentage',
        isActive: false,
        successRate: 96.2,
        avgLatency: 95,
        lastUsed: new Date(Date.now() - 86400000)
      }
    ]

    // Generate execution history for chart
    const history = Array.from({ length: 24 }, (_, i) => ({
      hour: `${23 - i}h ago`,
      executions: Math.floor(Math.random() * 50) + 20,
      successRate: 95 + Math.random() * 5,
      avgLatency: 30 + Math.random() * 40,
      slippage: Math.random() * 0.1
    })).reverse()

    setRecentExecutions(mockExecutions)
    setStrategies(mockStrategies)
    setExecutionHistory(history)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'executing':
        return <Clock className="h-4 w-4 text-warning" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      executing: 'secondary',
      completed: 'default',
      failed: 'destructive',
      cancelled: 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    )
  }

  const formatLatency = (ms: number) => `${ms.toFixed(0)}ms`
  const formatSlippage = (slippage: number) => `${(slippage * 100).toFixed(3)}%`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Execution Engine
          </h2>
          <p className="text-muted-foreground">Advanced order execution and routing system</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isEngineActive ? "default" : "destructive"} className="flex items-center gap-1">
            <Activity className={`h-3 w-3 ${isEngineActive ? 'animate-pulse' : ''}`} />
            {isEngineActive ? 'Active' : 'Inactive'}
          </Badge>
          <Button 
            variant={isEngineActive ? "destructive" : "default"}
            onClick={() => setIsEngineActive(!isEngineActive)}
          >
            {isEngineActive ? 'Stop Engine' : 'Start Engine'}
          </Button>
        </div>
      </div>

      {/* Execution Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Executions</span>
            </div>
            <div className="text-2xl font-bold">{metrics.totalExecutions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-success">{metrics.successRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Latency</span>
            </div>
            <div className="text-2xl font-bold">{formatLatency(metrics.avgLatency)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Slippage</span>
            </div>
            <div className="text-2xl font-bold">{formatSlippage(metrics.slippageAvg)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Failure Rate</span>
            </div>
            <div className="text-2xl font-bold text-destructive">{metrics.failureRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Volume 24h</span>
            </div>
            <div className="text-2xl font-bold">${(metrics.volumeProcessed / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="executions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="executions">Recent Executions</TabsTrigger>
          <TabsTrigger value="strategies">Execution Strategies</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Latest order executions and their performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-9 gap-4 p-3 text-sm font-medium text-muted-foreground border-b">
                  <div>ID</div>
                  <div>Symbol</div>
                  <div>Side</div>
                  <div>Type</div>
                  <div>Amount</div>
                  <div>Price</div>
                  <div>Slippage</div>
                  <div>Latency</div>
                  <div>Status</div>
                </div>

                {/* Rows */}
                {recentExecutions.map(execution => (
                  <div key={execution.id} className="grid grid-cols-9 gap-4 p-3 hover:bg-muted/50 rounded-lg">
                    <div className="font-mono text-sm">{execution.id}</div>
                    <div className="font-medium">{execution.symbol}</div>
                    <div>
                      <Badge variant={execution.side === 'buy' ? 'default' : 'destructive'}>
                        {execution.side}
                      </Badge>
                    </div>
                    <div className="text-sm">{execution.type}</div>
                    <div className="text-sm">{execution.executedAmount.toFixed(4)}</div>
                    <div className="text-sm">${execution.executedPrice.toLocaleString()}</div>
                    <div className={`text-sm ${execution.slippage > 0.05 ? 'text-destructive' : 'text-success'}`}>
                      {formatSlippage(execution.slippage)}
                    </div>
                    <div className={`text-sm ${execution.latency > 100 ? 'text-warning' : 'text-success'}`}>
                      {formatLatency(execution.latency)}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      {getStatusBadge(execution.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies">
          <div className="space-y-4">
            {strategies.map((strategy, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{strategy.name}</h3>
                        <Badge variant={strategy.isActive ? "default" : "outline"}>
                          {strategy.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{strategy.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Success Rate: <span className="text-success font-medium">{strategy.successRate}%</span></span>
                        <span>Avg Latency: <span className="font-medium">{formatLatency(strategy.avgLatency)}</span></span>
                        <span>Last Used: <span className="text-muted-foreground">{strategy.lastUsed.toLocaleString()}</span></span>
                      </div>
                    </div>
                    <Button variant={strategy.isActive ? "destructive" : "default"} size="sm">
                      {strategy.isActive ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Execution Performance</CardTitle>
              <CardDescription>Performance metrics over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={executionHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="executions" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Executions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Success Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Execution engine is operating normally. All strategies are within acceptable performance thresholds.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>CPU Usage</span>
                      <span>23%</span>
                    </div>
                    <Progress value={23} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Memory Usage</span>
                      <span>67%</span>
                    </div>
                    <Progress value={67} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Network Latency</span>
                      <span>12ms</span>
                    </div>
                    <Progress value={12} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wallet Connectivity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['MetaMask', 'Phantom', 'WalletConnect'].map(wallet => (
                    <div key={wallet} className="flex items-center justify-between">
                      <span>{wallet}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        <span className="text-sm text-muted-foreground">Connected</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}