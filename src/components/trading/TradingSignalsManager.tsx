import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Radio, TrendingUp, TrendingDown, Bell, Target, Zap, Activity, Settings } from 'lucide-react'

interface TradingSignal {
  id: string
  symbol: string
  type: 'buy' | 'sell' | 'hold'
  strength: 'weak' | 'moderate' | 'strong'
  confidence: number
  price: number
  targetPrice: number
  stopLoss: number
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  source: string
  reason: string
  timestamp: Date
  isActive: boolean
  pnl?: number
}

interface SignalProvider {
  id: string
  name: string
  description: string
  successRate: number
  totalSignals: number
  isActive: boolean
  subscription: 'free' | 'premium'
  averageReturn: number
  riskScore: number
}

export const TradingSignalsManager: React.FC = () => {
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [providers, setProviders] = useState<SignalProvider[]>([])
  const [enabledProviders, setEnabledProviders] = useState<string[]>([])
  const [autoTrading, setAutoTrading] = useState(false)
  const [signalHistory, setSignalHistory] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'hold'>('all')

  useEffect(() => {
    // Generate mock signals
    const mockSignals: TradingSignal[] = [
      {
        id: 'sig-1',
        symbol: 'BTC/USDT',
        type: 'buy',
        strength: 'strong',
        confidence: 85,
        price: 65000,
        targetPrice: 68000,
        stopLoss: 63000,
        timeframe: '4h',
        source: 'AI Analysis Pro',
        reason: 'Bullish divergence on RSI with volume confirmation',
        timestamp: new Date(Date.now() - 900000),
        isActive: true,
        pnl: 1200
      },
      {
        id: 'sig-2',
        symbol: 'ETH/USDT',
        type: 'sell',
        strength: 'moderate',
        confidence: 72,
        price: 2600,
        targetPrice: 2480,
        stopLoss: 2680,
        timeframe: '1h',
        source: 'Technical Scanner',
        reason: 'Resistance at key level, bearish momentum',
        timestamp: new Date(Date.now() - 1800000),
        isActive: true,
        pnl: -150
      },
      {
        id: 'sig-3',
        symbol: 'SOL/USDT',
        type: 'buy',
        strength: 'weak',
        confidence: 58,
        price: 190,
        targetPrice: 205,
        stopLoss: 185,
        timeframe: '15m',
        source: 'Community Signals',
        reason: 'Oversold conditions, potential bounce',
        timestamp: new Date(Date.now() - 3600000),
        isActive: false
      }
    ]

    const mockProviders: SignalProvider[] = [
      {
        id: 'provider-1',
        name: 'AI Analysis Pro',
        description: 'Advanced AI-powered technical analysis with ML predictions',
        successRate: 78.5,
        totalSignals: 342,
        isActive: true,
        subscription: 'premium',
        averageReturn: 12.4,
        riskScore: 6.2
      },
      {
        id: 'provider-2',
        name: 'Technical Scanner',
        description: 'Real-time technical indicators and pattern recognition',
        successRate: 65.8,
        totalSignals: 156,
        isActive: true,
        subscription: 'free',
        averageReturn: 8.7,
        riskScore: 5.1
      },
      {
        id: 'provider-3',
        name: 'Community Signals',
        description: 'Crowdsourced trading signals from verified traders',
        successRate: 52.3,
        totalSignals: 89,
        isActive: false,
        subscription: 'free',
        averageReturn: 4.2,
        riskScore: 7.8
      },
      {
        id: 'provider-4',
        name: 'Whale Tracker',
        description: 'Large order flow analysis and whale movement tracking',
        successRate: 71.2,
        totalSignals: 67,
        isActive: true,
        subscription: 'premium',
        averageReturn: 15.8,
        riskScore: 5.9
      }
    ]

    // Generate signal performance history
    const history = Array.from({ length: 24 }, (_, i) => ({
      hour: `${23 - i}h`,
      signals: Math.floor(Math.random() * 10) + 2,
      successRate: 60 + Math.random() * 25,
      avgReturn: Math.random() * 20 - 5,
      confidence: 70 + Math.random() * 20
    })).reverse()

    setSignals(mockSignals)
    setProviders(mockProviders)
    setEnabledProviders(['provider-1', 'provider-2', 'provider-4'])
    setSignalHistory(history)
  }, [])

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="h-4 w-4 text-success" />
      case 'sell':
        return <TrendingDown className="h-4 w-4 text-destructive" />
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getSignalBadge = (type: string) => {
    const variants = {
      buy: 'default',
      sell: 'destructive',
      hold: 'secondary'
    } as const

    return <Badge variant={variants[type as keyof typeof variants]}>{type.toUpperCase()}</Badge>
  }

  const getStrengthBadge = (strength: string) => {
    const variants = {
      weak: 'outline',
      moderate: 'secondary',
      strong: 'default'
    } as const

    return <Badge variant={variants[strength as keyof typeof variants]}>{strength}</Badge>
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success'
    if (confidence >= 60) return 'text-warning'
    return 'text-destructive'
  }

  const getPnlColor = (pnl?: number) => {
    if (!pnl) return 'text-muted-foreground'
    return pnl >= 0 ? 'text-success' : 'text-destructive'
  }

  const toggleProvider = (providerId: string) => {
    setEnabledProviders(prev => 
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    )
  }

  const filteredSignals = signals.filter(signal => 
    filter === 'all' || signal.type === filter
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="h-6 w-6" />
            Trading Signals Manager
          </h2>
          <p className="text-muted-foreground">Monitor and manage trading signals from multiple sources</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Auto Trading</span>
            <Switch checked={autoTrading} onCheckedChange={setAutoTrading} />
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Auto Trading Alert */}
      {autoTrading && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            Auto trading is enabled. Signals will be executed automatically based on your configured parameters.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Signals</span>
            </div>
            <div className="text-2xl font-bold">{signals.filter(s => s.isActive).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-success">73.2%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Return</span>
            </div>
            <div className="text-2xl font-bold text-success">+8.4%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Providers</span>
            </div>
            <div className="text-2xl font-bold">{enabledProviders.length}/{providers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="signals">Live Signals</TabsTrigger>
          <TabsTrigger value="providers">Signal Providers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="signals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Trading Signals
                <div className="flex gap-2">
                  {(['all', 'buy', 'sell', 'hold'] as const).map(type => (
                    <Button
                      key={type}
                      variant={filter === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardTitle>
              <CardDescription>
                Real-time trading signals from enabled providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-10 gap-4 p-3 text-sm font-medium text-muted-foreground border-b">
                  <div>Symbol</div>
                  <div>Signal</div>
                  <div>Strength</div>
                  <div>Confidence</div>
                  <div>Price</div>
                  <div>Target</div>
                  <div>Stop Loss</div>
                  <div>Source</div>
                  <div>P&L</div>
                  <div>Actions</div>
                </div>

                {/* Signal Rows */}
                {filteredSignals.map(signal => (
                  <div key={signal.id} className="grid grid-cols-10 gap-4 p-3 hover:bg-muted/50 rounded-lg">
                    <div className="font-medium">{signal.symbol}</div>
                    <div className="flex items-center gap-2">
                      {getSignalIcon(signal.type)}
                      {getSignalBadge(signal.type)}
                    </div>
                    <div>{getStrengthBadge(signal.strength)}</div>
                    <div className={getConfidenceColor(signal.confidence)}>
                      {signal.confidence}%
                    </div>
                    <div className="text-sm">${signal.price.toLocaleString()}</div>
                    <div className="text-sm">${signal.targetPrice.toLocaleString()}</div>
                    <div className="text-sm">${signal.stopLoss.toLocaleString()}</div>
                    <div className="text-sm">{signal.source}</div>
                    <div className={`text-sm font-medium ${getPnlColor(signal.pnl)}`}>
                      {signal.pnl ? `$${signal.pnl}` : '-'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Target className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Bell className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <div className="space-y-4">
            {providers.map(provider => (
              <Card key={provider.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{provider.name}</h3>
                        <Badge variant={provider.subscription === 'premium' ? 'default' : 'outline'}>
                          {provider.subscription}
                        </Badge>
                        <Badge 
                          variant={enabledProviders.includes(provider.id) ? 'default' : 'destructive'}
                        >
                          {enabledProviders.includes(provider.id) ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <span>
                          Success Rate: <span className="text-success font-medium">{provider.successRate}%</span>
                        </span>
                        <span>
                          Signals: <span className="font-medium">{provider.totalSignals}</span>
                        </span>
                        <span>
                          Avg Return: <span className="text-success font-medium">+{provider.averageReturn}%</span>
                        </span>
                        <span>
                          Risk: <span className="font-medium">{provider.riskScore}/10</span>
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={enabledProviders.includes(provider.id)}
                      onCheckedChange={() => toggleProvider(provider.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Signal Performance</CardTitle>
              <CardDescription>Historical performance of trading signals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={signalHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Success Rate (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgReturn" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Avg Return (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive signal alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Push Notifications</span>
                    <p className="text-sm text-muted-foreground">Real-time alerts to your device</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Email Alerts</span>
                    <p className="text-sm text-muted-foreground">Email notifications for signals</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Sound Alerts</span>
                    <p className="text-sm text-muted-foreground">Audio notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Signal Filters</CardTitle>
                <CardDescription>Set minimum criteria for signal alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Confidence</label>
                  <div className="text-2xl font-bold">70%</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Signal Strength</label>
                  <div className="text-sm">Moderate or higher</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timeframes</label>
                  <div className="text-sm">1h, 4h, 1d</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}