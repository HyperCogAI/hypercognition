import { usePredictionMarkets } from '@/hooks/usePredictionMarkets'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Trophy, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function MyPositions() {
  const { userPositions, markets } = usePredictionMarkets()

  const totalValue = userPositions.reduce((sum, p) => sum + p.currentValue, 0)
  const totalPnL = userPositions.reduce((sum, p) => sum + p.pnl, 0)

  if (userPositions.length === 0) {
    return (
      <Card className="p-12 text-center bg-card/50 backdrop-blur-sm">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Positions Yet</h3>
        <p className="text-muted-foreground">
          Start trading prediction markets to see your positions here
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Total Value</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(totalValue)}
          </div>
        </Card>
        
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Total P&L</span>
          </div>
          <div className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
          </div>
        </Card>
        
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">Active Positions</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {userPositions.length}
          </div>
        </Card>
      </div>

      {/* Positions Table */}
      <Card className="overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border/50">
              <tr>
                <th className="text-left p-4 font-semibold">Market</th>
                <th className="text-left p-4 font-semibold">Outcome</th>
                <th className="text-right p-4 font-semibold">Shares</th>
                <th className="text-right p-4 font-semibold">Avg Price</th>
                <th className="text-right p-4 font-semibold">Current Value</th>
                <th className="text-right p-4 font-semibold">P&L</th>
                <th className="text-right p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {userPositions.map((position) => {
                const market = markets.find(m => m.id === position.marketId)
                const outcome = market?.outcomes.find(o => o.id === position.outcomeId)
                
                return (
                  <tr key={position.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium line-clamp-1 max-w-xs">
                        {market?.question}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        {outcome?.label}
                      </div>
                    </td>
                    <td className="text-right p-4 font-medium">
                      {position.shares}
                    </td>
                    <td className="text-right p-4 text-muted-foreground">
                      {formatCurrency(position.averagePrice)}
                    </td>
                    <td className="text-right p-4 font-semibold">
                      {formatCurrency(position.currentValue)}
                    </td>
                    <td className="text-right p-4">
                      <div className={`font-semibold ${position.pnl >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}
                        <div className="text-xs text-muted-foreground">
                          ({position.pnlPercentage >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%)
                        </div>
                      </div>
                    </td>
                    <td className="text-right p-4">
                      <Button variant="outline" size="sm">
                        Sell
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
