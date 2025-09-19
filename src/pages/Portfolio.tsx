import { useState } from "react"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from "react-router-dom"
import { WalletButton } from "@/components/wallet/WalletButton"
import { useWallet } from "@/hooks/useWallet"

// Mock portfolio data
const mockHoldings = [
  {
    id: "1",
    name: "NeuralFlow",
    symbol: "NFLW",
    amount: "1,250.00",
    value: "9.25",
    totalValue: "11,562.50",
    change: "+12.5%",
    changeValue: "+1,282.50",
    isPositive: true,
    avatar: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=400&fit=crop&crop=face"
  },
  {
    id: "2", 
    name: "CogniCore",
    symbol: "COGN",
    amount: "890.00",
    value: "15.80",
    totalValue: "14,062.00",
    change: "-3.2%",
    changeValue: "-462.00",
    isPositive: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
  },
  {
    id: "3",
    name: "SynthMind", 
    symbol: "SYNT",
    amount: "2,100.00",
    value: "6.45",
    totalValue: "13,545.00",
    change: "+8.7%",
    changeValue: "+1,085.00",
    isPositive: true,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
  }
]

const mockTransactions = [
  {
    id: "1",
    type: "buy",
    agent: "NeuralFlow",
    symbol: "NFLW", 
    amount: "500.00",
    price: "8.10",
    total: "4,050.00",
    timestamp: "2 hours ago"
  },
  {
    id: "2",
    type: "sell",
    agent: "CogniCore",
    symbol: "COGN",
    amount: "200.00", 
    price: "16.30",
    total: "3,260.00",
    timestamp: "1 day ago"
  },
  {
    id: "3",
    type: "buy",
    agent: "SynthMind",
    symbol: "SYNT",
    amount: "750.00",
    price: "5.92",
    total: "4,440.00", 
    timestamp: "3 days ago"
  }
]

export default function Portfolio() {
  const navigate = useNavigate()
  const { isConnected } = useWallet()
  const [selectedTab, setSelectedTab] = useState("holdings")

  const totalPortfolioValue = mockHoldings.reduce((sum, holding) => 
    sum + parseFloat(holding.totalValue.replace(",", "")), 0
  )

  const totalChange = mockHoldings.reduce((sum, holding) => 
    sum + parseFloat(holding.changeValue.replace(/[+,-]/g, "").replace(",", "")), 0
  )

  const totalChangePercent = (totalChange / (totalPortfolioValue - totalChange)) * 100

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Connect your wallet to view your AI agent portfolio
            </p>
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/20 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold">Portfolio</h1>
            </div>
            <WalletButton />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
              <div className={`text-sm flex items-center gap-1 ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {totalChange >= 0 ? '+' : ''}${totalChange.toLocaleString()} ({totalChangePercent.toFixed(1)}%)
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockHoldings.length}</div>
              <div className="text-sm text-muted-foreground">Active positions</div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Best Performer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NFLW</div>
              <div className="text-sm text-green-400">+12.5%</div>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">24h Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$7,350</div>
              <div className="text-sm text-muted-foreground">Traded today</div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Details */}
        <Card className="bg-card/30 border-border/50">
          <CardHeader>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-card/50">
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} className="w-full">
              <TabsContent value="holdings" className="space-y-4">
                {mockHoldings.map((holding) => (
                  <div key={holding.id} className="flex items-center justify-between p-4 rounded-lg bg-card/20 hover:bg-card/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <img 
                        src={holding.avatar} 
                        alt={holding.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{holding.name}</div>
                        <div className="text-sm text-muted-foreground">{holding.amount} {holding.symbol}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">${holding.totalValue}</div>
                      <div className={`text-sm flex items-center gap-1 ${holding.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {holding.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {holding.change}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/agent/${holding.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Trade
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-card/20">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={transaction.type === 'buy' ? 'default' : 'secondary'}
                        className={transaction.type === 'buy' ? 'bg-green-600' : 'bg-red-600'}
                      >
                        {transaction.type.toUpperCase()}
                      </Badge>
                      <div>
                        <div className="font-medium">{transaction.agent}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.amount} {transaction.symbol} @ ${transaction.price}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">${transaction.total}</div>
                      <div className="text-sm text-muted-foreground">{transaction.timestamp}</div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}