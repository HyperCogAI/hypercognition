import { useState } from "react"
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useTradingOperations } from "@/hooks/useTradingOperations"

interface TradingPanelProps {
  agentId: string
  agent: {
    name: string
    symbol: string
    price: string
    balance?: string
  }
}

export const TradingPanel = ({ agentId, agent }: TradingPanelProps) => {
  const [buyAmount, setBuyAmount] = useState("")
  const [sellAmount, setSellAmount] = useState("")
  const [slippage, setSlippage] = useState("0.5")
  const [isTrading, setIsTrading] = useState(false)
  const { isConnected, address } = useAuth()
  const { placeOrder } = useTradingOperations()

  const handleBuy = async () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) return
    
    setIsTrading(true)
    try {
      const amount = parseFloat(buyAmount) / parseFloat(agent.price.replace('$', ''))
      const price = parseFloat(agent.price.replace('$', ''))
      
      const success = await placeOrder({
        agent_id: agentId,
        type: 'market',
        side: 'buy',
        amount: amount,
        price: price
      })
      if (success) {
        setBuyAmount("")
        // Refresh the page to show updated balance
        window.location.reload()
      }
    } finally {
      setIsTrading(false)
    }
  }

  const handleSell = async () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) return
    
    setIsTrading(true)
    try {
      const amount = parseFloat(sellAmount)
      const price = parseFloat(agent.price.replace('$', ''))
      
      const success = await placeOrder({
        agent_id: agentId,
        type: 'market',
        side: 'sell',
        amount: amount,
        price: price
      })
      if (success) {
        setSellAmount("")
        // Refresh the page to show updated balance
        window.location.reload()
      }
    } finally {
      setIsTrading(false)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <Card className="bg-card/30 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trade {agent.symbol}</span>
          {isConnected && (
            <Badge variant="secondary" className="flex items-center gap-2">
              <Wallet className="h-3 w-3" />
              {formatAddress(address || "")}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="text-center space-y-4">
            <div className="text-muted-foreground">
              Connect your wallet to start trading
            </div>
            <div className="text-sm text-muted-foreground">
              Trading requires wallet authentication
            </div>
          </div>
        ) : (
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card/50">
              <TabsTrigger value="buy" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Sell
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buy-amount">Amount to Buy</Label>
                <div className="relative">
                  <Input
                    id="buy-amount"
                    type="number"
                    placeholder="0.00"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="pr-16"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    ETH
                  </div>
                </div>
              </div>

              <div className="bg-card/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You'll receive:</span>
                  <span>
                    ~{buyAmount ? (parseFloat(buyAmount) / 0.0074).toFixed(2) : "0.00"} {agent.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per token:</span>
                  <span>{agent.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Slippage:</span>
                  <span>{slippage}%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBuyAmount("0.1")}
                  className="text-xs"
                >
                  0.1 ETH
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBuyAmount("0.5")}
                  className="text-xs"
                >
                  0.5 ETH
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBuyAmount("1")}
                  className="text-xs"
                >
                  1 ETH
                </Button>
              </div>

              <Button 
                onClick={handleBuy} 
                className="w-full bg-green-600 hover:bg-green-600/90"
                disabled={!buyAmount || parseFloat(buyAmount) <= 0 || isTrading}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {isTrading ? "Processing..." : `Buy ${agent.symbol}`}
              </Button>
            </TabsContent>

            <TabsContent value="sell" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sell-amount">Amount to Sell</Label>
                <div className="relative">
                  <Input
                    id="sell-amount"
                    type="number"
                    placeholder="0.00"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    {agent.symbol}
                  </div>
                </div>
              </div>

              <div className="bg-card/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You'll receive:</span>
                  <span>
                    ~{sellAmount ? (parseFloat(sellAmount) * 0.0074).toFixed(4) : "0.0000"} ETH
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance:</span>
                  <span>{agent.balance || "0.00"} {agent.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Slippage:</span>
                  <span>{slippage}%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSellAmount("25")}
                  className="text-xs"
                >
                  25%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSellAmount("50")}
                  className="text-xs"
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSellAmount("100")}
                  className="text-xs"
                >
                  Max
                </Button>
              </div>

              <Button 
                onClick={handleSell} 
                variant="destructive"
                className="w-full"
                disabled={!sellAmount || parseFloat(sellAmount) <= 0 || isTrading}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                {isTrading ? "Processing..." : `Sell ${agent.symbol}`}
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {isConnected && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="space-y-2">
              <Label htmlFor="slippage">Slippage Tolerance</Label>
              <div className="flex gap-2">
                {["0.1", "0.5", "1.0"].map((value) => (
                  <Button
                    key={value}
                    variant={slippage === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlippage(value)}
                    className="flex-1"
                  >
                    {value}%
                  </Button>
                ))}
                <Input
                  type="number"
                  placeholder="Custom"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-20 h-8 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}