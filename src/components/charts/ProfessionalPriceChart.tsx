import { useState, useEffect } from "react"
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { coinGeckoApi } from "@/lib/apis/coinGeckoApi"
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, Activity } from "lucide-react"

interface ProfessionalPriceChartProps {
  cryptoId: string
  cryptoName: string
  symbol: string
  currentPrice: number
  change24h: number
  high24h?: number
  low24h?: number
  volume24h?: number
  marketCap?: number
}

interface ChartDataPoint {
  timestamp: number
  price: number
  volume: number
  marketCap: number
  date: string
  time: string
}

type Timeframe = '1' | '7' | '30' | '90' | '365' | 'max'
type ChartType = 'line' | 'area' | 'candle'

const timeframeLabels: Record<Timeframe, string> = {
  '1': '24H',
  '7': '7D',
  '30': '30D',
  '90': '90D',
  '365': '1Y',
  'max': 'ALL'
}

export const ProfessionalPriceChart = ({
  cryptoId,
  cryptoName,
  symbol,
  currentPrice,
  change24h,
  high24h,
  low24h,
  volume24h,
  marketCap
}: ProfessionalPriceChartProps) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<Timeframe>('7')
  const [chartType, setChartType] = useState<ChartType>('area')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const days = timeframe === 'max' ? 365 : parseInt(timeframe)
        const data = await coinGeckoApi.getMarketChart(cryptoId, days)
        
        if (data && data.prices && data.prices.length > 0) {
          const formatted: ChartDataPoint[] = data.prices.map((point, i) => {
            const date = new Date(point[0])
            return {
              timestamp: point[0],
              price: point[1],
              volume: data.total_volumes[i]?.[1] || 0,
              marketCap: data.market_caps[i]?.[1] || 0,
              date: date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: parseInt(timeframe) > 90 ? 'numeric' : undefined 
              }),
              time: date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            }
          })
          setChartData(formatted)
        } else {
          setError('No chart data available')
        }
      } catch (err) {
        console.error('Error fetching chart data:', err)
        setError('Failed to load chart data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [cryptoId, timeframe])

  const formatPrice = (value: number) => {
    if (value < 0.01) return `$${value.toFixed(6)}`
    if (value < 1) return `$${value.toFixed(4)}`
    if (value < 100) return `$${value.toFixed(2)}`
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  }

  const formatVolume = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(0)}`
  }

  const formatMarketCap = formatVolume

  const calculateStats = () => {
    if (chartData.length === 0) return null

    const prices = chartData.map(d => d.price)
    const high = Math.max(...prices)
    const low = Math.min(...prices)
    const avgVolume = chartData.reduce((sum, d) => sum + d.volume, 0) / chartData.length

    return { high, low, avgVolume }
  }

  const stats = calculateStats()

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null

    const data = payload[0].payload
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <div className="text-xs text-muted-foreground mb-1">
          {data.date} {parseInt(timeframe) <= 1 ? data.time : ''}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">Price:</span>
            <span className="font-semibold">{formatPrice(data.price)}</span>
          </div>
          {data.volume > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Volume:</span>
              <span className="font-semibold text-xs">{formatVolume(data.volume)}</span>
            </div>
          )}
          {data.marketCap > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Market Cap:</span>
              <span className="font-semibold text-xs">{formatMarketCap(data.marketCap)}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            Loading Chart Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Fetching market data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-destructive">{error}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="space-y-4">
          {/* Header with Price Info */}
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                {cryptoName}
                <Badge variant="outline" className="text-sm">{symbol.toUpperCase()}</Badge>
              </CardTitle>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-3xl font-bold">{formatPrice(currentPrice)}</span>
                <Badge 
                  variant={change24h >= 0 ? "default" : "destructive"}
                  className={`text-sm ${change24h >= 0 ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                >
                  {change24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                </Badge>
              </div>
            </div>

            {/* Chart Type Selector */}
            <div className="flex gap-2">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('area')}
              >
                <Activity className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'candle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('candle')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(timeframeLabels) as Timeframe[]).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className="min-w-[60px]"
              >
                {timeframeLabels[tf]}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="price" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="price">Price Chart</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>

          <TabsContent value="price" className="space-y-4">
            {/* Price Chart */}
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop 
                        offset="5%" 
                        stopColor={change24h >= 0 ? "#22c55e" : "#ef4444"} 
                        stopOpacity={0.3}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={change24h >= 0 ? "#22c55e" : "#ef4444"} 
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={formatPrice}
                    tickLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={change24h >= 0 ? "#22c55e" : "#ef4444"}
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    animationDuration={1000}
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={formatPrice}
                    tickLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={change24h >= 0 ? "#22c55e" : "#ef4444"}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    animationDuration={1000}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">24h High</div>
                <div className="font-semibold text-green-500">
                  {high24h ? formatPrice(high24h) : stats ? formatPrice(stats.high) : '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">24h Low</div>
                <div className="font-semibold text-red-500">
                  {low24h ? formatPrice(low24h) : stats ? formatPrice(stats.low) : '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">24h Volume</div>
                <div className="font-semibold">
                  {volume24h ? formatVolume(volume24h) : '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Market Cap</div>
                <div className="font-semibold">
                  {marketCap ? formatMarketCap(marketCap) : '-'}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="volume" className="space-y-4">
            {/* Volume Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={formatVolume}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="volume" 
                  fill="hsl(var(--primary))" 
                  opacity={0.8}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Volume Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">24h Volume</div>
                <div className="font-semibold">
                  {volume24h ? formatVolume(volume24h) : '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Avg Volume ({timeframeLabels[timeframe]})</div>
                <div className="font-semibold">
                  {stats ? formatVolume(stats.avgVolume) : '-'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Market Cap</div>
                <div className="font-semibold">
                  {marketCap ? formatMarketCap(marketCap) : '-'}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
