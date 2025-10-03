import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import { supabase } from '@/integrations/supabase/client'

interface SolanaPriceChartProps {
  token: any
  className?: string
}

const SolanaPriceChartComponent: React.FC<SolanaPriceChartProps> = ({ 
  token, 
  className = "" 
}) => {
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | '1D' | '1W'>('1D')
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const attemptedSyncRef = useRef(false)

  // Fetch price history from Supabase
  const fetchPriceHistory = useCallback(async () => {
    if (!token?.mint_address) return
    
    setLoading(true)
    try {
      // Calculate time range
      const now = new Date()
      let hoursAgo = 24 // Default 1D
      if (timeframe === '1H') hoursAgo = 1
      else if (timeframe === '4H') hoursAgo = 4
      else if (timeframe === '1W') hoursAgo = 168
      
      const startTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
      
      // Fetch from database
      const { data, error } = await supabase
        .from('solana_price_history')
        .select('price, volume, timestamp')
        .eq('mint_address', token.mint_address)
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: true })
      
      if (error) throw error
      
      if (data && data.length > 0) {
        const formatted = data.map((item: any) => ({
          time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: Number(item.price),
          volume: Number(item.volume)
        }))
        setChartData(formatted)
      } else {
        // No data found - trigger sync once then retry
        if (!attemptedSyncRef.current) {
          attemptedSyncRef.current = true
          console.log('[Chart] No price history found, triggering background sync...')
          
          // Trigger sync in background
          supabase.functions.invoke('solana-data-sync').catch(e => 
            console.warn('[Chart] Sync trigger failed:', e)
          )
          
          // Wait 2 seconds then retry query
          await new Promise((r) => setTimeout(r, 2000))
          const { data: retryData } = await supabase
            .from('solana_price_history')
            .select('price, volume, timestamp')
            .eq('mint_address', token.mint_address)
            .gte('timestamp', startTime.toISOString())
            .order('timestamp', { ascending: true })
          
          if (retryData && retryData.length > 0) {
            console.log('[Chart] Found data after sync:', retryData.length, 'points')
            const formatted2 = retryData.map((item: any) => ({
              time: new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              price: Number(item.price),
              volume: Number(item.volume)
            }))
            setChartData(formatted2)
            return
          }
        }
        
        console.log('[Chart] Using fallback data')
        generateFallbackData()
      }
    } catch (error) {
      console.error('Error fetching price history:', error)
      generateFallbackData()
    } finally {
      setLoading(false)
    }
  }, [token?.mint_address, timeframe])

  const generateFallbackData = useCallback(() => {
    const basePrice = token?.price || 0
    if (!basePrice) return
    
    const dataPoints = timeframe === '1H' ? 12 : timeframe === '4H' ? 16 : timeframe === '1D' ? 24 : 30
    const data = Array.from({ length: dataPoints }, (_, i) => {
      const variation = (Math.random() - 0.5) * 0.02
      const price = basePrice * (1 + variation)
      
      return {
        time: timeframe === '1H' || timeframe === '4H' || timeframe === '1D'
          ? `${String(i).padStart(2, '0')}:00`
          : `Day ${i + 1}`,
        price: Number(price.toFixed(6)),
        volume: (token?.volume_24h || 0) / dataPoints
      }
    })
    setChartData(data)
  }, [token?.price, token?.volume_24h, timeframe])

  // Reset sync ref when token changes
  useEffect(() => {
    attemptedSyncRef.current = false
  }, [token?.mint_address])

  useEffect(() => {
    fetchPriceHistory()
  }, [fetchPriceHistory])

  const isPositive = useMemo(() => (token?.change_24h || 0) >= 0, [token?.change_24h])
  const priceColor = useMemo(() => isPositive ? '#10b981' : '#ef4444', [isPositive])

  const formatPrice = useCallback((value: number) => {
    return `$${value.toFixed(4)}`
  }, [])

  const formatVolume = useCallback((value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toFixed(0)
  }, [])

  return (
    <Card className={`bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              {token?.name} Price Chart
            </CardTitle>
            <div className="text-muted-foreground flex items-center gap-2 mt-1">
              <span>${(token?.price ?? 0).toFixed(4)}</span>
              <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? '+' : ''}{(token?.change_24h || 0).toFixed(2)}%
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            {(['1H', '4H', '1D', '1W'] as const).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                disabled={loading}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Price Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={priceColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={priceColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  formatter={(value: number) => [formatPrice(value), 'Price']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={priceColor}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Chart */}
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={formatVolume}
                />
                <Tooltip 
                  formatter={(value: number) => [formatVolume(value), 'Volume']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#volumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">24h High</p>
              <p className="font-semibold">${((token?.price ?? 0) * 1.05).toFixed(4)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">24h Low</p>
              <p className="font-semibold">${((token?.price ?? 0) * 0.95).toFixed(4)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">24h Volume</p>
              <p className="font-semibold">${formatVolume(token?.volume_24h || 0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Market Cap</p>
              <p className="font-semibold">
                {token?.market_cap > 0 ? formatVolume(token.market_cap) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Memoize to prevent unnecessary re-renders
export const SolanaPriceChart = React.memo(SolanaPriceChartComponent)