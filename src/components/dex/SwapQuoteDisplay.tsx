import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SwapQuoteDisplayProps {
  quote: {
    fromTokenSymbol: string
    toTokenSymbol: string
    rate?: string
    priceImpactPct?: number
    estimatedGas?: string
  } | null
  isLoading?: boolean
}

export const SwapQuoteDisplay = ({ quote, isLoading }: SwapQuoteDisplayProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Fetching best rate...</span>
      </div>
    )
  }

  if (!quote) return null

  return (
    <div className="space-y-2 px-1">
      {quote.rate && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Rate</span>
          <span className="font-medium">
            1 {quote.fromTokenSymbol} = {quote.rate} {quote.toTokenSymbol}
          </span>
        </div>
      )}
      
      {quote.priceImpactPct !== undefined && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Price Impact</span>
          <span className={cn(
            "font-medium",
            quote.priceImpactPct > 5 ? "text-destructive" :
            quote.priceImpactPct > 1 ? "text-yellow-500" :
            "text-green-500"
          )}>
            {quote.priceImpactPct < 0.01 ? "<0.01" : quote.priceImpactPct.toFixed(2)}%
          </span>
        </div>
      )}
      
      {quote.estimatedGas && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Network Fee</span>
          <span className="font-medium">{quote.estimatedGas}</span>
        </div>
      )}
    </div>
  )
}
