import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import { useSolanaTransactions } from "@/hooks/useSolanaTransactions"
import { useToast } from "@/hooks/use-toast"
import { ArrowUpDown, TrendingUp, TrendingDown, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SolanaTradingPanelProps {
  token: any
  onTradeComplete?: () => void
}

export const SolanaTradingPanel: React.FC<SolanaTradingPanelProps> = ({ 
  token, 
  onTradeComplete 
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'swap'>('buy')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [fromToken, setFromToken] = useState('SOL')
  const [toToken, setToToken] = useState(token?.symbol || '')
  const [swapAmount, setSwapAmount] = useState('')
  const [slippage, setSlippage] = useState('0.5')
  
  const { isConnected, address, connectWallet } = useSolanaWallet()
  const { sendSOL, isLoading } = useSolanaTransactions()
  const { toast } = useToast()

  const handleBuy = async () => {
    if (!isConnected) {
      connectWallet()
      return
    }

    try {
      // For demo purposes - in real implementation, this would integrate with Jupiter
      toast({
        title: "Buy Order Placed",
        description: `Buying ${amount} ${token.symbol} for ${(parseFloat(amount) * token.price).toFixed(2)} SOL`,
      })
      
      setAmount('')
      onTradeComplete?.()
    } catch (error) {
      toast({
        title: "Trade Failed",
        description: "Failed to execute buy order",
        variant: "destructive"
      })
    }
  }

  const handleSell = async () => {
    if (!isConnected) {
      connectWallet()
      return
    }

    try {
      toast({
        title: "Sell Order Placed",
        description: `Selling ${amount} ${token.symbol} for ${(parseFloat(amount) * token.price).toFixed(2)} SOL`,
      })
      
      setAmount('')
      onTradeComplete?.()
    } catch (error) {
      toast({
        title: "Trade Failed",
        description: "Failed to execute sell order",
        variant: "destructive"
      })
    }
  }

  const handleSwap = async () => {
    if (!isConnected) {
      connectWallet()
      return
    }

    try {
      // This would integrate with Jupiter API for actual swaps
      toast({
        title: "Swap Executed",
        description: `Swapped ${swapAmount} ${fromToken} for ${toToken}`,
      })
      
      setSwapAmount('')
      onTradeComplete?.()
    } catch (error) {
      toast({
        title: "Swap Failed", 
        description: "Failed to execute swap",
        variant: "destructive"
      })
    }
  }

  const calculateTotal = () => {
    if (!amount || !token?.price) return '0.00'
    return (parseFloat(amount) * token.price).toFixed(4)
  }

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-purple-400" />
            Solana Trading
          </CardTitle>
          <CardDescription>Connect your wallet to start trading</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connectWallet} className="w-full">
            Connect Solana Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5 text-purple-400" />
          Trade {token?.symbol}
        </CardTitle>
        <CardDescription>
          Current Price: ${token?.price?.toFixed(4)} • 24h: {token?.change_24h > 0 ? '+' : ''}{token?.change_24h?.toFixed(2)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buy" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Sell
            </TabsTrigger>
            <TabsTrigger value="swap" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Swap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={(v) => setOrderType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market Order</SelectItem>
                  <SelectItem value="limit">Limit Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {orderType === 'limit' && (
              <div className="space-y-2">
                <Label>Price (SOL)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Amount ({token?.symbol})</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total Cost:</span>
              <span>{calculateTotal()} SOL</span>
            </div>

            <LoadingButton
              onClick={handleBuy}
              loading={isLoading}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Buy {token?.symbol}
            </LoadingButton>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={(v) => setOrderType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market Order</SelectItem>
                  <SelectItem value="limit">Limit Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {orderType === 'limit' && (
              <div className="space-y-2">
                <Label>Price (SOL)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Amount ({token?.symbol})</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total Receive:</span>
              <span>{calculateTotal()} SOL</span>
            </div>

            <LoadingButton
              onClick={handleSell}
              loading={isLoading}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Sell {token?.symbol}
            </LoadingButton>
          </TabsContent>

          <TabsContent value="swap" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>From Token</Label>
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>To Token</Label>
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={token?.symbol}>{token?.symbol}</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Slippage Tolerance (%)</Label>
              <Select value={slippage} onValueChange={setSlippage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.1">0.1%</SelectItem>
                  <SelectItem value="0.5">0.5%</SelectItem>
                  <SelectItem value="1.0">1.0%</SelectItem>
                  <SelectItem value="3.0">3.0%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Powered by Jupiter Exchange</span>
            </div>

            <LoadingButton
              onClick={handleSwap}
              loading={isLoading}
              disabled={!swapAmount || parseFloat(swapAmount) <= 0}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Swap {fromToken} for {toToken}
            </LoadingButton>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}