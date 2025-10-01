import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCryptoPriceAlerts } from "@/hooks/useCryptoPriceAlerts"

interface PriceAlertDialogProps {
  crypto: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const PriceAlertDialog = ({ crypto, open, onOpenChange }: PriceAlertDialogProps) => {
  const [alertType, setAlertType] = useState<"price_above" | "price_below" | "percent_change">("price_above")
  const [targetValue, setTargetValue] = useState("")
  const { createAlert } = useCryptoPriceAlerts()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!crypto || !targetValue) return

    setIsSubmitting(true)
    const success = await createAlert(
      crypto.crypto_id,
      crypto.crypto_name,
      crypto.crypto_symbol,
      alertType,
      parseFloat(targetValue)
    )

    if (success) {
      setTargetValue("")
      onOpenChange(false)
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
          <DialogDescription>
            Get notified when {crypto?.crypto_name} reaches your target
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Alert Type</Label>
            <Select value={alertType} onValueChange={(value: any) => setAlertType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_above">Price Goes Above</SelectItem>
                <SelectItem value="price_below">Price Goes Below</SelectItem>
                <SelectItem value="percent_change">Percent Change Exceeds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Target Value {alertType === "percent_change" ? "(%)" : "($)"}
            </Label>
            <Input
              type="number"
              step="any"
              placeholder={alertType === "percent_change" ? "e.g., 5" : "e.g., 50000"}
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
            />
          </div>

          {crypto && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <div className="font-medium">Current Price: ${crypto.current_price?.toFixed(2)}</div>
              <div className="text-muted-foreground mt-1">
                {alertType === "price_above" && targetValue && 
                  `Alert when price goes above $${targetValue}`}
                {alertType === "price_below" && targetValue && 
                  `Alert when price goes below $${targetValue}`}
                {alertType === "percent_change" && targetValue && 
                  `Alert when 24h change exceeds ${targetValue}%`}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!targetValue || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Alert"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}