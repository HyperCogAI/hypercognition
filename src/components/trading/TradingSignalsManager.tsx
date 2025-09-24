import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Radio, TrendingUp, TrendingDown, Bell, Target, Zap, Activity } from 'lucide-react'
import { useTradingSignals } from '@/hooks/useTradingSignals'

export const TradingSignalsManager: React.FC = () => {
  const {
    signals,
    alerts,
    stats,
    isLoading,
    error,
    refreshData
  } = useTradingSignals();

  const [autoTrading, setAutoTrading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'hold'>('all')

  // Filter signals based on selected filter
  const filteredSignals = signals.filter(signal => 
    filter === 'all' || signal.signal_type === filter
  )

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'sell':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Target className="h-4 w-4 text-blue-600" />
    }
  }

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'sell':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Signals</h1>
          <p className="text-muted-foreground">
            AI-powered trading signals and market alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Radio className="h-3 w-3 text-green-500" />
            Live Signals
          </Badge>
          <Button onClick={refreshData} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Signals</p>
                  <p className="text-2xl font-bold">{stats.totalSignals}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                  <p className="text-2xl font-bold">{stats.avgAccuracy}%</p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Profit</p>
                  <p className="text-2xl font-bold">${stats.totalProfit.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter:</label>
          <div className="flex gap-2">
            {(['all', 'buy', 'sell', 'hold'] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterType)}
              >
                {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-trading"
              checked={autoTrading}
              onCheckedChange={setAutoTrading}
            />
            <label htmlFor="auto-trading" className="text-sm font-medium">
              Auto Trading
            </label>
          </div>
        </div>
      </div>

      {/* Trading Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Active Trading Signals
          </CardTitle>
          <CardDescription>
            Real-time signals from AI trading algorithms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {filteredSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getSignalIcon(signal.signal_type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {signal.agent?.symbol || 'Unknown'}
                          </span>
                          <Badge className={getSignalColor(signal.signal_type)}>
                            {signal.signal_type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            Confidence: {signal.confidence_level}/10
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {signal.agent?.name || 'Unknown Agent'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${signal.price}</p>
                      <p className="text-sm text-muted-foreground">
                        {signal.time_horizon}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {signal.target_price && (
                      <div>
                        <span className="text-muted-foreground">Target: </span>
                        <span className="font-medium">${signal.target_price}</span>
                      </div>
                    )}
                    {signal.stop_loss_price && (
                      <div>
                        <span className="text-muted-foreground">Stop Loss: </span>
                        <span className="font-medium">${signal.stop_loss_price}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Time: </span>
                      <span className="font-medium">
                        {new Date(signal.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm">{signal.reasoning}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>👍 {signal.likes_count}</span>
                      <span>👁 {signal.views_count}</span>
                      <span>💬 {signal.comments_count}</span>
                      <span>By: {signal.user_profile?.display_name}</span>
                    </div>
                    {autoTrading && (
                      <Button size="sm" variant="outline">
                        Execute
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {filteredSignals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No trading signals found for the selected filter.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}