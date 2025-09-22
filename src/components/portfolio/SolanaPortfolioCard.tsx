import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import { useSolanaPortfolio } from "@/hooks/useSolanaPortfolio"
import { Wallet, Coins, TrendingUp, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export const SolanaPortfolioCard = () => {
  const { isConnected, address, formatAddress } = useSolanaWallet()
  const { portfolio, solBalance, isLoading, fetchPortfolio, getTotalValue } = useSolanaPortfolio()

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-400" />
            Solana Portfolio
          </CardTitle>
          <CardDescription>Connect your Solana wallet to view portfolio</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-400" />
              Solana Portfolio
            </CardTitle>
            <CardDescription>
              {formatAddress(address!)} • Total Value: ${getTotalValue().toFixed(2)}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPortfolio}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SOL Balance */}
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Coins className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium">Solana</p>
              <p className="text-sm text-muted-foreground">SOL</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">{solBalance.toFixed(4)} SOL</p>
            <p className="text-sm text-muted-foreground">${(solBalance * 100).toFixed(2)}</p>
          </div>
        </div>

        {/* Token Holdings */}
        {portfolio.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Token Holdings</p>
            {portfolio.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    {item.token?.image_url ? (
                      <img 
                        src={item.token.image_url} 
                        alt={item.token.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <Coins className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{item.token?.name || 'Unknown Token'}</p>
                    <p className="text-sm text-muted-foreground">{item.token?.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.amount.toFixed(4)}</p>
                  <p className="text-sm text-muted-foreground">
                    ${((item.token?.price || 0) * item.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No token holdings found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}