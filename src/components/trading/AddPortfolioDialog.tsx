import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCryptoPortfolio } from "@/hooks/useCryptoPortfolio"

interface AddPortfolioDialogProps {
  crypto: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AddPortfolioDialog = ({ crypto, open, onOpenChange }: AddPortfolioDialogProps) => {
  const [amount, setAmount] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [exchange, setExchange] = useState("")
  const [notes, setNotes] = useState("")
  const { addHolding } = useCryptoPortfolio()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!crypto || !amount || !purchasePrice) return

    setIsSubmitting(true)
    const success = await addHolding(
      crypto.crypto_id,
      crypto.crypto_name,
      crypto.crypto_symbol,
      parseFloat(amount),
      parseFloat(purchasePrice),
      exchange || undefined,
      notes || undefined
    )

    if (success) {
      setAmount("")
      setPurchasePrice("")
      setExchange("")
      setNotes("")
      onOpenChange(false)
    }
    setIsSubmitting(false)
  }

  const totalValue = amount && purchasePrice 
    ? (parseFloat(amount) * parseFloat(purchasePrice)).toFixed(2)
    : "0.00"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Portfolio</DialogTitle>
          <DialogDescription>
            Track your {crypto?.crypto_name} holdings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              step="any"
              placeholder="e.g., 0.5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Purchase Price ($)</Label>
            <Input
              type="number"
              step="any"
              placeholder="e.g., 45000"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Exchange (Optional)</Label>
            <Input
              placeholder="e.g., Binance, Coinbase"
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add any notes about this purchase..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {amount && purchasePrice && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Investment:</span>
                <span className="font-medium">${totalValue}</span>
              </div>
              {crypto && crypto.current_price && (
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Current Value:</span>
                  <span className="font-medium">
                    ${(parseFloat(amount) * crypto.current_price).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!amount || !purchasePrice || isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Holding"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}