import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, MoreVertical, Eye, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { usePortfolio } from "@/hooks/usePortfolio"
import { WalletButton } from "@/components/wallet/WalletButton"

export const Portfolio = () => {
  const navigate = useNavigate()
  const { isConnected } = useAuth()
  const { holdings, transactions, portfolioStats, isLoading } = usePortfolio()

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to view your portfolio and start trading AI agents.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">Portfolio</h1>
          </div>
          <div className="ml-auto">
            <WalletButton />
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Portfolio Value</CardDescription>
              <CardTitle className="text-2xl">
                ${portfolioStats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm">
                {portfolioStats.change24h >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={portfolioStats.change24h >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {portfolioStats.change24h >= 0 ? "+" : ""}{portfolioStats.change24h.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">24h</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Holdings</CardDescription>
              <CardTitle className="text-2xl">{portfolioStats.holdingsCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Active positions
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Best Performer</CardDescription>
              <CardTitle className="text-lg">{portfolioStats.bestPerformer?.symbol || "-"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm">
                {portfolioStats.bestPerformer && (
                  <>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-500">+{portfolioStats.bestPerformer.change24h.toFixed(1)}%</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total P&L</CardDescription>
              <CardTitle className="text-lg">
                ${portfolioStats.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm">
                {portfolioStats.totalPnL >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={portfolioStats.totalPnL >= 0 ? "text-emerald-500" : "text-red-500"}>
                  {portfolioStats.totalPnL >= 0 ? "+" : ""}
                  {portfolioStats.totalInvested > 0 ? ((portfolioStats.totalPnL / portfolioStats.totalInvested) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Details */}
        <Tabs defaultValue="holdings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="holdings" className="space-y-4">
            {holdings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-muted-foreground mb-4">No holdings found</div>
                  <Button onClick={() => navigate('/')}>
                    Explore Agents
                  </Button>
                </CardContent>
              </Card>
            ) : (
              holdings.map((holding) => (
                <Card key={holding.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={holding.agent?.avatar_url} alt={holding.agent?.name} />
                        <AvatarFallback>{holding.agent?.symbol}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{holding.agent?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {holding.total_amount.toLocaleString()} {holding.agent?.symbol}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">
                        ${(holding.total_amount * (holding.agent?.price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {holding.unrealized_pnl >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={holding.unrealized_pnl >= 0 ? "text-emerald-500" : "text-red-500"}>
                          {holding.unrealized_pnl >= 0 ? "+" : ""}${holding.unrealized_pnl.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/agent/${holding.agent_id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/agent/${holding.agent_id}`)}>
                          <Zap className="mr-2 h-4 w-4" />
                          Trade
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-muted-foreground mb-4">No transactions found</div>
                  <Button onClick={() => navigate('/')}>
                    Start Trading
                  </Button>
                </CardContent>
              </Card>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <Badge variant={transaction.type === "buy" ? "default" : "secondary"}>
                        {transaction.type.toUpperCase()}
                      </Badge>
                      <div>
                        <div className="font-semibold">{transaction.agent?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.amount.toLocaleString()} {transaction.agent?.symbol} @ ${transaction.price_per_token.toFixed(4)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">
                        ${transaction.total_value.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}