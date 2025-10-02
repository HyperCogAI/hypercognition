import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingButton } from "@/components/ui/loading-button"
import { useOrders } from "@/hooks/useOrders"
import { useUserBalance } from "@/hooks/useUserBalance"
import { TrendingUp, TrendingDown } from "lucide-react"

interface QuickTradeDialogProps {
  agent: {
    id: string
    name: string
    symbol: string
    price: number
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickTradeDialog({ agent, open, onOpenChange }: QuickTradeDialogProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [limitPrice, setLimitPrice] = useState('')
  
  const { createOrder, isCreatingOrder } = useOrders()
  const { balance } = useUserBalance()

  const handleTrade = () => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) return

    createOrder({
      agentId: agent.id,
      orderType,
      side,
      amount: numAmount,
      price: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
    })

    setAmount('')
    setLimitPrice('')
    onOpenChange(false)
  }

  const calculateTotal = () => {
    const numAmount = parseFloat(amount) || 0
    const price = orderType === 'limit' ? parseFloat(limitPrice) : agent.price
    return (numAmount * price).toFixed(2)
  }

  const canAfford = () => {
    if (side === 'sell') return true
    const total = parseFloat(calculateTotal())
    return balance ? balance.available_balance >= total : false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Trade {agent.name}
          </DialogTitle>
          <DialogDescription>
            Current Price: ${agent.price.toFixed(4)}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={side} onValueChange={(v) => setSide(v as any)} className="w-full">
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

          <div className="space-y-4 mt-4">
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
                <Label>Limit Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  step="0.0001"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Amount ({agent.symbol})</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium">${calculateTotal()}</span>
            </div>

            {balance && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Balance:</span>
                <span className="font-medium">${balance.available_balance.toFixed(2)}</span>
              </div>
            )}

            <LoadingButton
              onClick={handleTrade}
              loading={isCreatingOrder}
              disabled={!amount || parseFloat(amount) <= 0 || !canAfford()}
              className={`w-full ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {side === 'buy' ? 'Buy' : 'Sell'} {agent.symbol}
            </LoadingButton>

            {side === 'buy' && !canAfford() && (
              <p className="text-sm text-red-500 text-center">
                Insufficient balance
              </p>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}