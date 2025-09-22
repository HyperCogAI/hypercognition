import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Zap
} from "lucide-react"
import { useSolanaRealtime } from "@/hooks/useSolanaRealtime"

interface TradingSignal {
  id: string
  tokenSymbol: string
  tokenName: string
  signalType: 'buy' | 'sell' | 'hold'
  strength: 'weak' | 'moderate' | 'strong'
  price: number
  targetPrice: number
  stopLoss: number
  timeframe: string
  confidence: number
  reason: string
  timestamp: Date
  status: 'active' | 'triggered' | 'expired'
}

export const SolanaTradingSignals = () => {
  const { tokens } = useSolanaRealtime()
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [activeTab, setActiveTab] = useState("live")

  // Generate mock signals based on real token data
  useEffect(() => {
    if (tokens.length === 0) return

    const mockSignals: TradingSignal[] = tokens.slice(0, 8).map((token, index) => {
      const signalTypes: Array<'buy' | 'sell' | 'hold'> = ['buy', 'sell', 'hold']
      const strengths: Array<'weak' | 'moderate' | 'strong'> = ['weak', 'moderate', 'strong']
      const statuses: Array<'active' | 'triggered' | 'expired'> = ['active', 'triggered', 'expired']
      
      const signalType = signalTypes[Math.floor(Math.random() * signalTypes.length)]
      const strength = strengths[Math.floor(Math.random() * strengths.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      
      const targetMultiplier = signalType === 'buy' ? 1.1 + Math.random() * 0.2 : 0.8 + Math.random() * 0.1
      const stopLossMultiplier = signalType === 'buy' ? 0.9 - Math.random() * 0.1 : 1.1 + Math.random() * 0.1

      return {
        id: `signal-${index}`,
        tokenSymbol: token.symbol,
        tokenName: token.name,
        signalType,
        strength,
        price: token.price,
        targetPrice: token.price * targetMultiplier,
        stopLoss: token.price * stopLossMultiplier,
        timeframe: ['1h', '4h', '1d', '1w'][Math.floor(Math.random() * 4)],
        confidence: 60 + Math.random() * 35,
        reason: [
          'Technical breakout pattern detected',
          'Strong volume surge with bullish momentum',
          'RSI oversold conditions',
          'Breaking resistance level',
          'Bearish divergence on indicators',
          'Support level holding strong'
        ][Math.floor(Math.random() * 6)],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        status
      }
    })

    setSignals(mockSignals)
  }, [tokens])

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-500'
      case 'sell': return 'text-red-500'
      case 'hold': return 'text-yellow-500'
      default: return 'text-muted-foreground'
    }
  }

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="h-4 w-4" />
      case 'sell': return <TrendingDown className="h-4 w-4" />
      case 'hold': return <Activity className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4 text-blue-500" />
      case 'triggered': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'expired': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStrengthBadge = (strength: string) => {
    const colors = {
      weak: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      moderate: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      strong: 'bg-green-500/20 text-green-500 border-green-500/30'
    }
    return colors[strength as keyof typeof colors] || colors.weak
  }

  const activeSignals = signals.filter(s => s.status === 'active')
  const triggeredSignals = signals.filter(s => s.status === 'triggered')
  const expiredSignals = signals.filter(s => s.status === 'expired')

  const formatPrice = (price: number) => price < 1 ? price.toFixed(6) : price.toFixed(2)
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Solana Trading Signals</h2>
          <p className="text-muted-foreground">
            AI-powered trading signals for Solana tokens
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Zap className="h-3 w-3 mr-1" />
          {activeSignals.length} Active
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">
            Live Signals ({activeSignals.length})
          </TabsTrigger>
          <TabsTrigger value="triggered">
            Triggered ({triggeredSignals.length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired ({expiredSignals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {activeSignals.length === 0 ? (
            <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Signals</h3>
                <p className="text-muted-foreground">
                  No trading signals are currently active. Check back later for new opportunities.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeSignals.map((signal) => (
                <Card key={signal.id} className="border-border/40 bg-card/60 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={getSignalColor(signal.signalType)}>
                          {getSignalIcon(signal.signalType)}
                        </div>
                        <CardTitle className="text-lg">
                          {signal.tokenSymbol}
                        </CardTitle>
                        <Badge className={getStrengthBadge(signal.strength)}>
                          {signal.strength}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(signal.status)}
                        <Badge variant="outline" className="text-xs">
                          {signal.timeframe}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{signal.tokenName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current</p>
                        <p className="font-semibold">${formatPrice(signal.price)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target</p>
                        <p className="font-semibold text-green-500">
                          ${formatPrice(signal.targetPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stop Loss</p>
                        <p className="font-semibold text-red-500">
                          ${formatPrice(signal.stopLoss)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Confidence:</span>
                        <span className="font-semibold">
                          {signal.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Reason:</p>
                        <p className="text-sm">{signal.reason}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(signal.timestamp)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" disabled>
                        <Target className="h-3 w-3 mr-1" />
                        Set Alert
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" disabled>
                        <Star className="h-3 w-3 mr-1" />
                        Follow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="triggered" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {triggeredSignals.map((signal) => (
              <Card key={signal.id} className="border-border/40 bg-card/60 backdrop-blur-sm opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <CardTitle className="text-lg">
                        {signal.tokenSymbol}
                      </CardTitle>
                      <Badge variant="outline" className="text-green-500 border-green-500/30">
                        Triggered
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {signal.timeframe}
                    </Badge>
                  </div>
                  <CardDescription>{signal.tokenName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Entry</p>
                      <p className="font-semibold">${formatPrice(signal.price)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-semibold text-green-500">
                        ${formatPrice(signal.targetPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P&L</p>
                      <p className="font-semibold text-green-500">
                        +{((signal.targetPrice - signal.price) / signal.price * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Triggered {formatTime(signal.timestamp)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {expiredSignals.map((signal) => (
              <Card key={signal.id} className="border-border/40 bg-card/60 backdrop-blur-sm opacity-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-gray-500" />
                      <CardTitle className="text-lg">
                        {signal.tokenSymbol}
                      </CardTitle>
                      <Badge variant="outline" className="text-gray-500 border-gray-500/30">
                        Expired
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {signal.timeframe}
                    </Badge>
                  </div>
                  <CardDescription>{signal.tokenName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Expired {formatTime(signal.timestamp)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}