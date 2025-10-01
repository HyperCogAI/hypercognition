import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCryptoPortfolio } from "@/hooks/useCryptoPortfolio"
import { useRealMarketData } from "@/hooks/useRealMarketData"
import { TrendingUp, TrendingDown, Trash2, PieChart } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

export const PortfolioPanel = () => {
  const { holdings, isLoading, deleteHolding } = useCryptoPortfolio()
  const { crypto = [] } = useRealMarketData()

  const getPortfolioData = () => {
    return holdings.map(holding => {
      const liveData = crypto.find(c => c.id === holding.crypto_id)
      const currentPrice = liveData?.current_price || 0
      const currentValue = holding.amount * currentPrice
      const investedValue = holding.amount * holding.purchase_price
      const pnl = currentValue - investedValue
      const pnlPercentage = (pnl / investedValue) * 100

      return {
        ...holding,
        currentPrice,
        currentValue,
        investedValue,
        pnl,
        pnlPercentage
      }
    })
  }

  const portfolioData = getPortfolioData()
  const totalInvested = portfolioData.reduce((sum, h) => sum + h.investedValue, 0)
  const totalCurrentValue = portfolioData.reduce((sum, h) => sum + h.currentValue, 0)
  const totalPnL = totalCurrentValue - totalInvested
  const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (isLoading) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (holdings.length === 0) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio
          </CardTitle>
          <CardDescription>Track your cryptocurrency holdings and P&L</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <PieChart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No holdings in your portfolio</p>
            <p className="text-sm mt-1">Add holdings from your watchlist to track performance</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Portfolio
          <Badge>{holdings.length} Holdings</Badge>
        </CardTitle>
        <CardDescription>Track your holdings and performance</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-background/50 border border-border/30">
          <div>
            <div className="text-sm text-muted-foreground">Total Invested</div>
            <div className="text-2xl font-bold">{formatPrice(totalInvested)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Current Value</div>
            <div className="text-2xl font-bold">{formatPrice(totalCurrentValue)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total P&L</div>
            <div className={`text-2xl font-bold flex items-center gap-1 ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalPnL >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {formatPrice(Math.abs(totalPnL))}
              <span className="text-sm">
                ({totalPnL >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Holdings List */}
        <div className="space-y-3">
          {portfolioData.map((holding) => (
            <div
              key={holding.id}
              className="p-4 rounded-lg bg-background/50 border border-border/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-lg">{holding.crypto_name}</div>
                  <div className="text-sm text-muted-foreground">{holding.crypto_symbol.toUpperCase()}</div>
                  {holding.exchange && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {holding.exchange}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteHolding(holding.id)}
                  className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Amount</div>
                  <div className="font-medium">{holding.amount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Purchase Price</div>
                  <div className="font-medium">{formatPrice(holding.purchase_price)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Current Price</div>
                  <div className="font-medium">{formatPrice(holding.currentPrice)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">P&L</div>
                  <div className={`font-medium flex items-center gap-1 ${holding.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {holding.pnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {formatPrice(Math.abs(holding.pnl))}
                    <span className="text-xs">
                      ({holding.pnl >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border/30 text-sm">
                <div>
                  <div className="text-muted-foreground">Invested Value</div>
                  <div className="font-medium">{formatPrice(holding.investedValue)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Current Value</div>
                  <div className="font-medium">{formatPrice(holding.currentValue)}</div>
                </div>
              </div>

              {holding.notes && (
                <div className="mt-3 pt-3 border-t border-border/30 text-sm">
                  <div className="text-muted-foreground mb-1">Notes</div>
                  <div className="text-muted-foreground italic">{holding.notes}</div>
                </div>
              )}

              <div className="mt-2 text-xs text-muted-foreground">
                Added {format(new Date(holding.purchase_date), "MMM d, yyyy")}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}