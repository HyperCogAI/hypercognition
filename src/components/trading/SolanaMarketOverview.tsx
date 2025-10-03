import React, { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSolanaRealtime } from "@/hooks/useSolanaRealtime"
import { TrendingUp, TrendingDown, Activity, DollarSign, RefreshCw } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export const SolanaMarketOverview = () => {
  const { tokens, isLoading, fetchTokens } = useSolanaRealtime()
  const [isSyncing, setIsSyncing] = useState(false)
  const { toast } = useToast()

  const handleManualSync = useCallback(async () => {
    setIsSyncing(true)
    try {
      const { error } = await supabase.functions.invoke('solana-data-sync')
      
      if (error) throw error
      
      // Wait a moment then refresh the data
      setTimeout(() => {
        fetchTokens()
      }, 2000)
      
      toast({
        title: "Sync Started",
        description: "Fetching latest Solana market data...",
      })
    } catch (error) {
      console.error('Sync error:', error)
      toast({
        title: "Sync Failed",
        description: "Could not fetch latest data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setTimeout(() => setIsSyncing(false), 3000)
    }
  }, [fetchTokens, toast])

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value)
  }, [])

  const formatMarketCap = useCallback((value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }, [])

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle>Solana Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Solana Market Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {tokens.length} Tokens
            </Badge>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="gap-2"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tokens.map((token) => (
          <div 
            key={token.id} 
            className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background/70 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                {token.image_url ? (
                  <img 
                    src={token.image_url} 
                    alt={token.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <DollarSign className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <p className="font-medium">{token.name}</p>
                <p className="text-sm text-muted-foreground">{token.symbol}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-medium">{formatCurrency(token.price)}</p>
              <div className="flex items-center justify-end gap-2">
                <Badge 
                  variant={token.change_24h >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {token.change_24h >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {token.change_24h >= 0 ? '+' : ''}{token.change_24h.toFixed(2)}%
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatMarketCap(token.market_cap)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {tokens.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No Solana tokens available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}