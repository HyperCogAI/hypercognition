import { useState } from 'react'
import { PredictionMarket } from '@/types/predictionMarket'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface TradingModalProps {
  market: PredictionMarket
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TradingModal({ market, open, onOpenChange }: TradingModalProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [selectedOutcome, setSelectedOutcome] = useState(market.outcomes[0]?.id || '')
  const [amount, setAmount] = useState('')

  // Simple AMM calculation: Price = Shares_Outcome / Total_Shares
  const calculatePotentialProfit = () => {
    if (!amount || !selectedOutcome) return { shares: 0, potentialProfit: 0, totalCost: 0 }
    
    const outcome = market.outcomes.find(o => o.id === selectedOutcome)
    if (!outcome) return { shares: 0, potentialProfit: 0, totalCost: 0 }

    const investAmount = parseFloat(amount)
    const shares = investAmount / outcome.price
    const potentialProfit = tradeType === 'buy' 
      ? (shares * 1) - investAmount  // If correct, each share worth $1
      : investAmount - (shares * outcome.price)
    
    return {
      shares: shares.toFixed(2),
      potentialProfit: potentialProfit.toFixed(2),
      totalCost: investAmount,
    }
  }

  const { shares, potentialProfit, totalCost } = calculatePotentialProfit()

  const handleTrade = () => {
    // Mock transaction
    toast.success(
      `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${shares} shares`,
      {
        description: `Total: ${formatCurrency(Number(totalCost))}`,
      }
    )
    onOpenChange(false)
    setAmount('')
  }

  const outcome = market.outcomes.find(o => o.id === selectedOutcome)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Trade Market</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {market.question}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tradeType} className="space-y-4 mt-4">
            {/* Outcome Selection */}
            <div className="space-y-2">
              <Label>Outcome</Label>
              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {market.outcomes.map((outcome) => (
                    <SelectItem key={outcome.id} value={outcome.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{outcome.label}</span>
                        <span className="text-primary font-semibold">
                          {(outcome.price * 100).toFixed(0)}%
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label>Amount (USDC)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Current Price Display */}
            {outcome && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Price</span>
                  <span className="font-semibold">
                    {formatCurrency(outcome.price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shares</span>
                  <span className="font-semibold">{shares}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border/50 pt-2 mt-2">
                  <span className="text-muted-foreground">Potential Profit</span>
                  <span className={`font-semibold ${parseFloat(String(potentialProfit)) > 0 ? 'text-primary' : 'text-destructive'}`}>
                    {parseFloat(String(potentialProfit)) > 0 ? '+' : ''}{formatCurrency(parseFloat(String(potentialProfit)))}
                  </span>
                </div>
              </div>
            )}

            {/* Slippage Warning */}
            {parseFloat(amount) > market.totalLiquidity * 0.05 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Large trade may experience significant slippage
                </AlertDescription>
              </Alert>
            )}

            {/* Confirm Button */}
            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={handleTrade}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              {tradeType === 'buy' ? (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Buy {String(shares)} Shares for {formatCurrency(Number(totalCost))}
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4" />
                  Sell {String(shares)} Shares for {formatCurrency(Number(totalCost))}
                </>
              )}
            </Button>

            {/* Info */}
            <p className="text-xs text-muted-foreground text-center">
              Platform fee: 2.5% on winnings • Powered by smart contracts
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
