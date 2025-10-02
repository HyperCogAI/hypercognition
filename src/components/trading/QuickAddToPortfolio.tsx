import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCryptoPortfolio } from "@/hooks/useCryptoPortfolio";
import { toast } from "sonner";

interface QuickAddToPortfolioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crypto: {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
  };
}

export const QuickAddToPortfolio = ({
  open,
  onOpenChange,
  crypto,
}: QuickAddToPortfolioProps) => {
  const [amount, setAmount] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(crypto.current_price.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addHolding } = useCryptoPortfolio();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await addHolding(
        crypto.id,
        crypto.name,
        crypto.symbol,
        parseFloat(amount),
        parseFloat(purchasePrice),
        "Manual Entry"
      );
      
      toast.success(`Added ${amount} ${crypto.symbol.toUpperCase()} to portfolio`);
      setAmount("");
      setPurchasePrice(crypto.current_price.toString());
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding to portfolio:", error);
      toast.error("Failed to add to portfolio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalInvestment = amount && purchasePrice 
    ? (parseFloat(amount) * parseFloat(purchasePrice)).toFixed(2)
    : "0.00";

  const currentValue = amount
    ? (parseFloat(amount) * crypto.current_price).toFixed(2)
    : "0.00";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Portfolio</DialogTitle>
          <DialogDescription>
            Add {crypto.name} ({crypto.symbol.toUpperCase()}) to your portfolio
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purchasePrice">Purchase Price (USD)</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="any"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                required
              />
            </div>

            {amount && (
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Investment:</span>
                  <span className="font-semibold">${totalInvestment}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Value:</span>
                  <span className="font-semibold">${currentValue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Price:</span>
                  <span className="font-semibold">${crypto.current_price.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !amount}>
              {isSubmitting ? "Adding..." : "Add to Portfolio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};