import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@solana/wallet-adapter-react"
import { useSolanaRealtime } from "@/hooks/useSolanaRealtime"
import { jupiterApi } from "@/lib/apis/jupiterApi"
import { ArrowDownUp, Settings, TrendingUp, Wallet, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { Connection, VersionedTransaction } from "@solana/web3.js"
import { supabase } from "@/integrations/supabase/client"
import { AddCustomToken } from "./AddCustomToken"

interface SwapQuote {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  priceImpactPct: number
  slippageBps: number
  otherAmountThreshold: string
  swapMode: string
}

export const SolanaDEX = () => {
  const { tokens, refetchTokens } = useSolanaRealtime()
  const { publicKey, signTransaction, connected } = useWallet()
  const { toast } = useToast()

  // Refetch tokens when wallet connects to include custom tokens
  useEffect(() => {
    if (publicKey && refetchTokens) {
      refetchTokens(true, publicKey.toString())
    }
  }, [publicKey, refetchTokens])

  const [fromToken, setFromToken] = useState<string>("")
  const [toToken, setToToken] = useState<string>("")
  const [fromAmount, setFromAmount] = useState<string>("")
  const [toAmount, setToAmount] = useState<string>("")
  const [slippage, setSlippage] = useState<number>(1)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Default to SOL and USDC
  useEffect(() => {
    if (tokens.length > 0 && !fromToken) {
      const sol = tokens.find(t => t.symbol === 'SOL')
      const usdc = tokens.find(t => t.symbol === 'USDC')
      if (sol) setFromToken(sol.mint_address)
      if (usdc) setToToken(usdc.mint_address)
    }
  }, [tokens, fromToken])

  const selectedFromToken = useMemo(() => 
    tokens.find(t => t.mint_address === fromToken),
    [tokens, fromToken]
  )

  const selectedToToken = useMemo(() => 
    tokens.find(t => t.mint_address === toToken),
    [tokens, toToken]
  )

  const fetchQuote = useCallback(async () => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      setQuote(null)
      setToAmount("")
      return
    }

    setIsLoadingQuote(true)
    try {
      const amount = parseFloat(fromAmount) * Math.pow(10, selectedFromToken?.decimals || 9)
      const slippageBps = slippage * 100 // Convert percentage to basis points

      const quoteResponse = await jupiterApi.getSwapRoute(
        fromToken,
        toToken,
        Math.floor(amount),
        slippageBps
      )

      if (quoteResponse && quoteResponse.length > 0) {
        const bestRoute = quoteResponse[0]
        const outAmountDecimal = parseFloat(bestRoute.outAmount) / Math.pow(10, selectedToToken?.decimals || 9)
        setToAmount(outAmountDecimal.toFixed(6))
        setQuote({
          inputMint: fromToken,
          outputMint: toToken,
          inAmount: bestRoute.inAmount,
          outAmount: bestRoute.outAmount,
          priceImpactPct: parseFloat(bestRoute.priceImpactPct || '0'),
          slippageBps,
          otherAmountThreshold: bestRoute.otherAmountThreshold,
          swapMode: bestRoute.swapMode,
        })
      }
    } catch (error) {
      console.error("Quote error:", error)
      toast({
        title: "Quote Failed",
        description: "Unable to fetch swap quote. Please try again.",
        variant: "destructive"
      })
      setToAmount("")
      setQuote(null)
    } finally {
      setIsLoadingQuote(false)
    }
  }, [fromToken, toToken, fromAmount, slippage, selectedFromToken, selectedToToken, toast])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote()
    }, 500)
    return () => clearTimeout(timer)
  }, [fetchQuote])

  const handleSwapTokens = () => {
    const tempToken = fromToken
    const tempAmount = fromAmount
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
    setQuote(null)
  }

  const executeSwap = async () => {
    if (!connected || !publicKey || !signTransaction || !quote) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Solana wallet to swap.",
        variant: "destructive"
      })
      return
    }

    setIsSwapping(true)
    try {
      // Call backend to prepare swap and record in database
      const { data: swapData, error: backendError } = await supabase.functions.invoke(
        'solana-swap',
        {
          body: {
            walletAddress: publicKey.toString(),
            inputMint: fromToken,
            outputMint: toToken,
            inputAmount: parseFloat(fromAmount),
            slippageBps: slippage * 100,
            route: quote
          }
        }
      );

      if (backendError || !swapData?.success) {
        throw new Error(backendError?.message || swapData?.error || "Failed to prepare swap");
      }

      const { swapTransaction, swapId } = swapData;

      // Deserialize and sign transaction
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64')
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf)
      
      const signedTransaction = await signTransaction(transaction)

      // Send transaction
      const connection = new Connection(
        'https://api.mainnet-beta.solana.com',
        'confirmed'
      )

      const rawTransaction = signedTransaction.serialize()
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
      })

      console.log("Transaction sent:", txid);
      
      // Update swap record with transaction hash
      await supabase
        .from('solana_swaps')
        .update({ 
          transaction_hash: txid,
          status: 'confirming'
        })
        .eq('id', swapId);

      // Confirm transaction
      await connection.confirmTransaction(txid, 'confirmed')

      // Mark as completed
      await supabase
        .from('solana_swaps')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', swapId);

      toast({
        title: "Swap Successful!",
        description: `Swapped ${fromAmount} ${selectedFromToken?.symbol} for ${toAmount} ${selectedToToken?.symbol}`,
      })

      // Reset form
      setFromAmount("")
      setToAmount("")
      setQuote(null)
      setShowConfirm(false)

    } catch (error: any) {
      console.error("Swap error:", error)
      toast({
        title: "Swap Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSwapping(false)
    }
  }

  const pricePerToken = useMemo(() => {
    if (!fromAmount || !toAmount || parseFloat(fromAmount) === 0) return null
    return parseFloat(toAmount) / parseFloat(fromAmount)
  }, [fromAmount, toAmount])

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Solana DEX
            </CardTitle>
            <CardDescription>Swap tokens instantly via Jupiter Aggregator</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <AddCustomToken onTokenAdded={() => refetchTokens?.(true, publicKey?.toString())} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <Label>From</Label>
          <div className="flex gap-2">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.mint_address} value={token.mint_address}>
                    <div className="flex items-center gap-2">
                      {token.image_url && (
                        <img src={token.image_url} alt={token.symbol} className="w-5 h-5 rounded-full" />
                      )}
                      {token.symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1"
            />
          </div>
          {selectedFromToken && (
            <p className="text-xs text-muted-foreground">
              Balance: 0.00 {selectedFromToken.symbol} • ${selectedFromToken.price.toFixed(4)}
            </p>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwapTokens}
            className="rounded-full"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <Label>To</Label>
          <div className="flex gap-2">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.mint_address} value={token.mint_address}>
                    <div className="flex items-center gap-2">
                      {token.image_url && (
                        <img src={token.image_url} alt={token.symbol} className="w-5 h-5 rounded-full" />
                      )}
                      {token.symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              value={toAmount}
              disabled
              className="flex-1"
            />
          </div>
          {selectedToToken && (
            <p className="text-xs text-muted-foreground">
              ${selectedToToken.price.toFixed(4)}
            </p>
          )}
        </div>

        {isLoadingQuote && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching best price...
          </div>
        )}

        {/* Quote Details */}
        {quote && !isLoadingQuote && (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span>1 {selectedFromToken?.symbol} = {pricePerToken?.toFixed(6)} {selectedToToken?.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price Impact</span>
              <span className={quote.priceImpactPct > 1 ? "text-destructive" : "text-green-500"}>
                {quote.priceImpactPct.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slippage Tolerance</span>
              <span>{slippage}%</span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        {publicKey ? (
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowConfirm(true)}
            disabled={!quote || isLoadingQuote || !fromAmount || !toAmount}
          >
            {isLoadingQuote ? "Loading..." : "Review Swap"}
          </Button>
        ) : (
          <Button className="w-full" size="lg" disabled>
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet to Swap
          </Button>
        )}

        {/* Warning for high price impact */}
        {quote && quote.priceImpactPct > 5 && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">High Price Impact</p>
              <p className="text-muted-foreground">This swap has a price impact of {quote.priceImpactPct.toFixed(2)}%. Consider reducing your swap amount.</p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Swap Settings</DialogTitle>
            <DialogDescription>Adjust your swap preferences</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Slippage Tolerance</Label>
                <Badge variant="outline">{slippage}%</Badge>
              </div>
              <Slider
                value={[slippage]}
                onValueChange={(value) => setSlippage(value[0])}
                min={0.1}
                max={5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.1%</span>
                <span>5%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSlippage(0.5)}>0.5%</Button>
              <Button variant="outline" size="sm" onClick={() => setSlippage(1)}>1%</Button>
              <Button variant="outline" size="sm" onClick={() => setSlippage(2)}>2%</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Swap Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Swap</DialogTitle>
            <DialogDescription>Review your swap details carefully</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">You Pay</span>
                <div className="text-right">
                  <p className="font-semibold">{fromAmount} {selectedFromToken?.symbol}</p>
                  <p className="text-xs text-muted-foreground">
                    ${(parseFloat(fromAmount) * (selectedFromToken?.price || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">You Receive</span>
                <div className="text-right">
                  <p className="font-semibold">{toAmount} {selectedToToken?.symbol}</p>
                  <p className="text-xs text-muted-foreground">
                    ${(parseFloat(toAmount) * (selectedToToken?.price || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>1 {selectedFromToken?.symbol} = {pricePerToken?.toFixed(6)} {selectedToToken?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className={quote && quote.priceImpactPct > 1 ? "text-destructive" : "text-green-500"}>
                  {quote?.priceImpactPct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span>{slippage}%</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={executeSwap}
              disabled={isSwapping}
            >
              {isSwapping ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Swapping...
                </>
              ) : (
                "Confirm Swap"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}