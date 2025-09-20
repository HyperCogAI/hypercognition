import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useMobile } from '@/hooks/useMobile'
import { useHaptics } from '@/hooks/useHaptics'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface MobileTradingPanelProps {
  agentId: string
  agent: {
    name: string
    symbol: string
    price: string
    balance?: string
  }
}

export const MobileTradingPanel = ({ agentId, agent }: MobileTradingPanelProps) => {
  const { isMobile, isNative } = useMobile()
  const { lightImpact, mediumImpact } = useHaptics()
  const { isConnected, address } = useAuth()
  const [buyAmount, setBuyAmount] = React.useState('')
  const [sellAmount, setSellAmount] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('buy')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    lightImpact()
  }

  const handleBuy = async () => {
    mediumImpact()
    // Trading logic here
  }

  const handleSell = async () => {
    mediumImpact()
    // Trading logic here
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isMobile) {
    return null // Use desktop version
  }

  return (
    <Card className={cn(
      "bg-card/30 border-border/50 backdrop-blur-sm",
      "w-full mx-auto max-w-md", // Mobile-optimized width
      isNative && "rounded-none border-0" // Native app styling
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="truncate">Trade {agent.symbol}</span>
          {isConnected && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Wallet className="h-3 w-3" />
              {formatAddress(address || "")}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center space-y-3 py-6">
            <div className="text-muted-foreground text-sm">
              Connect your wallet to start trading
            </div>
            <Button 
              className="w-full h-12 text-base"
              onClick={() => lightImpact()}
            >
              Connect Wallet
            </Button>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-card/50 h-12">
                <TabsTrigger value="buy" className="flex items-center gap-2 h-10">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Buy</span>
                </TabsTrigger>
                <TabsTrigger value="sell" className="flex items-center gap-2 h-10">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Sell</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Amount to Buy
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      className="h-12 text-base pr-16"
                      inputMode="decimal"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      ETH
                    </div>
                  </div>
                </div>

                <div className="bg-card/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You'll receive:</span>
                    <span className="font-medium">
                      ~{buyAmount ? (parseFloat(buyAmount) / 0.0074).toFixed(2) : "0.00"} {agent.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per token:</span>
                    <span className="font-medium">{agent.price}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBuyAmount("0.1")
                      lightImpact()
                    }}
                    className="h-10 text-sm"
                  >
                    0.1 ETH
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBuyAmount("0.5")
                      lightImpact()
                    }}
                    className="h-10 text-sm"
                  >
                    0.5 ETH
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBuyAmount("1")
                      lightImpact()
                    }}
                    className="h-10 text-sm"
                  >
                    1 ETH
                  </Button>
                </div>

                <Button 
                  onClick={handleBuy}
                  className="w-full h-12 bg-green-600 hover:bg-green-600/90 text-base font-medium"
                  disabled={!buyAmount || parseFloat(buyAmount) <= 0}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Buy {agent.symbol}
                </Button>
              </TabsContent>

              <TabsContent value="sell" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    Amount to Sell
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      className="h-12 text-base pr-20"
                      inputMode="decimal"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      {agent.symbol}
                    </div>
                  </div>
                </div>

                <div className="bg-card/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You'll receive:</span>
                    <span className="font-medium">
                      ~{sellAmount ? (parseFloat(sellAmount) * 0.0074).toFixed(4) : "0.0000"} ETH
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="font-medium">{agent.balance || "0.00"} {agent.symbol}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSellAmount("25")
                      lightImpact()
                    }}
                    className="h-10 text-sm"
                  >
                    25%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSellAmount("50")
                      lightImpact()
                    }}
                    className="h-10 text-sm"
                  >
                    50%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSellAmount("100")
                      lightImpact()
                    }}
                    className="h-10 text-sm"
                  >
                    Max
                  </Button>
                </div>

                <Button 
                  onClick={handleSell}
                  variant="destructive"
                  className="w-full h-12 text-base font-medium"
                  disabled={!sellAmount || parseFloat(sellAmount) <= 0}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Sell {agent.symbol}
                </Button>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}