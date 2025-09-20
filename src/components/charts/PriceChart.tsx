import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"

interface PriceChartProps {
  agentId: string
  symbol: string
  currentPrice: number
  change24h: number
}

interface PricePoint {
  timestamp: string
  price: number
  volume: number
  market_cap: number
}

export const PriceChart = ({ agentId, symbol, currentPrice, change24h }: PriceChartProps) => {
  const [priceData, setPriceData] = useState<PricePoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('24h')

  useEffect(() => {
    const fetchPriceHistory = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('price_history')
          .select('*')
          .eq('agent_id', agentId)
          .order('timestamp', { ascending: true })
          .limit(24) // Last 24 hours

        if (error) throw error

        const formattedData = (data || []).map(point => ({
          timestamp: new Date(point.timestamp).toISOString(),
          price: Number(point.price),
          volume: Number(point.volume),
          market_cap: Number(point.market_cap),
          time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))

        setPriceData(formattedData)
      } catch (error) {
        console.error('Error fetching price history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPriceHistory()
  }, [agentId, timeframe])

  const formatPrice = (value: number) => {
    if (value < 0.01) {
      return `$${value.toFixed(6)}`
    }
    return `$${value.toFixed(4)}`
  }

  const formatVolume = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  if (isLoading) {
    return (
      <Card className="bg-card/30 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Price Chart
            <Badge variant="secondary">{timeframe}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/30 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Price Chart</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{formatPrice(currentPrice)}</span>
              <Badge 
                variant={change24h >= 0 ? "default" : "destructive"}
                className={change24h >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
              >
                {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
              </Badge>
            </div>
          </div>
          <Badge variant="secondary">{timeframe}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {priceData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No price data available
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={formatPrice}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'price' ? formatPrice(value) : formatVolume(value),
                    name === 'price' ? 'Price' : 'Volume'
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={change24h >= 0 ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: change24h >= 0 ? "#22c55e" : "#ef4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <div className="text-sm text-muted-foreground">24h Volume</div>
                <div className="font-semibold">
                  {priceData.length > 0 ? formatVolume(priceData[priceData.length - 1]?.volume || 0) : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="font-semibold">
                  {priceData.length > 0 ? formatVolume(priceData[priceData.length - 1]?.market_cap || 0) : '-'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}