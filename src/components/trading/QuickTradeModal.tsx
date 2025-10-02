import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRightLeft, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useUserBalance } from '@/hooks/useUserBalance'

interface QuickTradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  crypto: {
    id: string
    name: string
    symbol: string
    current_price: number
    image?: string
  }
}

export function QuickTradeModal({ open, onOpenChange, crypto }: QuickTradeModalProps) {
  const { user } = useAuth()
  const { balance } = useUserBalance()
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState(crypto.current_price.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0
    const priceNum = parseFloat(price) || 0
    return amountNum * priceNum
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please sign in to trade')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const total = calculateTotal()

    if (orderType === 'buy' && balance && total > balance.available_balance) {
      toast.error('Insufficient balance')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success(`${orderType === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`, {
        description: `${amount} ${crypto.symbol.toUpperCase()} @ $${parseFloat(price).toFixed(2)}`
      })

      // Reset form
      setAmount('')
      setPrice(crypto.current_price.toString())
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to place order')
      console.error('Order error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {crypto.image && (
              <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
            )}
            <div>
              <DialogTitle>Trade {crypto.name}</DialogTitle>
              <DialogDescription className="text-xs">
                {crypto.symbol.toUpperCase()} • ${crypto.current_price.toFixed(2)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value={orderType} className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Balance Display */}
              {balance && (
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Available:</span>
                      <span className="font-medium">{formatCurrency(balance.available_balance)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({crypto.symbol.toUpperCase()})</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.0001"
                  min="0"
                  required
                />
              </div>

              {/* Price Input */}
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Current market price: ${crypto.current_price.toFixed(2)}
                </p>
              </div>

              {/* Total */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              >
                {isSubmitting ? (
                  <>
                    <ArrowRightLeft className="h-4 w-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    {orderType === 'buy' ? <TrendingUp className="h-4 w-4 mr-2" /> : <TrendingDown className="h-4 w-4 mr-2" />}
                    {orderType === 'buy' ? 'Buy' : 'Sell'} {crypto.symbol.toUpperCase()}
                  </>
                )}
              </Button>

              {/* Paper Trading Notice */}
              <Card className="bg-amber-500/10 border-amber-500/20">
                <CardContent className="p-3">
                  <p className="text-xs text-amber-400 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    This is a simulated trade for demonstration purposes
                  </p>
                </CardContent>
              </Card>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
