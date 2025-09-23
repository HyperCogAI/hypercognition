import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSolanaRealtime } from "@/hooks/useSolanaRealtime"
import { TrendingUp, TrendingDown, BarChart3, ArrowUpDown } from "lucide-react"
import { SolanaTradingPanel } from "./SolanaTradingPanel"
import { SolanaPriceChart } from "./SolanaPriceChart"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export const SolanaTokenGrid = () => {
  const { tokens, isLoading } = useSolanaRealtime()
  const [selectedToken, setSelectedToken] = useState<any>(null)
  const [showTrading, setShowTrading] = useState(false)
  const [showChart, setShowChart] = useState(false)

  const handleTrade = (token: any) => {
    setSelectedToken(token)
    setShowTrading(true)
  }

  const handleChart = (token: any) => {
    setSelectedToken(token)
    setShowChart(true)
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Solana Token Marketplace</h3>
          <p className="text-muted-foreground">
            Trade Solana tokens with instant execution and low fees
          </p>
        </div>

        {/* Token Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token, index) => (
            <Card key={token.id || index} className="hover:shadow-lg transition-shadow border-border/40 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {token.image_url ? (
                      <img 
                        src={token.image_url} 
                        alt={token.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {token.symbol?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{token.name}</CardTitle>
                      <CardDescription className="text-sm font-mono">
                        {token.symbol}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={token.change_24h >= 0 ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {token.change_24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {token.change_24h >= 0 ? '+' : ''}{token.change_24h?.toFixed(2)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Info */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-mono font-semibold">
                      ${token.price?.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Market Cap</span>
                    <span className="font-mono text-sm">
                      {formatMarketCap(token.market_cap)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Volume 24h</span>
                    <span className="font-mono text-sm">
                      {formatMarketCap(token.volume_24h)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleTrade(token)}
                    className="flex-1"
                    size="sm"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    Trade
                  </Button>
                  <Button 
                    onClick={() => handleChart(token)}
                    variant="outline"
                    size="sm"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tokens.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No Solana tokens available</p>
          </div>
        )}
      </div>

      {/* Trading Modal */}
      <Dialog open={showTrading} onOpenChange={setShowTrading}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Trade {selectedToken?.symbol}</DialogTitle>
          </DialogHeader>
          {selectedToken && (
            <SolanaTradingPanel 
              token={selectedToken}
              onTradeComplete={() => setShowTrading(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Chart Modal */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedToken?.name} Chart</DialogTitle>
          </DialogHeader>
          {selectedToken && (
            <SolanaPriceChart token={selectedToken} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}