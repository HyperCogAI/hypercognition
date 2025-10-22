import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@solana/wallet-adapter-react"
import { useSolanaRealtime } from "@/hooks/useSolanaRealtime"
import { jupiterApi } from "@/lib/apis/jupiterApi"
import { ArrowDownUp, Settings, AlertCircle, RefreshCw } from "lucide-react"
import { Connection, VersionedTransaction } from "@solana/web3.js"
import { supabase } from "@/integrations/supabase/client"
import { AddCustomToken } from "./AddCustomToken"
import { DEX_STYLES } from "@/lib/dex-styles"
import { TokenInputField, Token as TokenType } from "@/components/dex/TokenInputField"
import { TokenSelectModal } from "@/components/dex/TokenSelectModal"
import { SwapQuoteDisplay } from "@/components/dex/SwapQuoteDisplay"
import { GradientBorderButton } from "@/components/wallet/GradientBorderButton"
import { cn } from "@/lib/utils"

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
  const { tokens: solanaTokens, refetchTokens } = useSolanaRealtime()
  const { publicKey, signTransaction, connected } = useWallet()
  const { toast } = useToast()

  // Convert Solana tokens to generic Token interface
  const tokens: TokenType[] = useMemo(() => 
    solanaTokens.map(t => ({
      address: t.mint_address as `0x${string}`,
      symbol: t.symbol,
      name: t.name,
      decimals: t.decimals,
      logoURI: t.image_url || undefined,
    })),
    [solanaTokens]
  )

  // Refetch tokens when wallet connects
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
  const [showFromTokenModal, setShowFromTokenModal] = useState(false)
  const [showToTokenModal, setShowToTokenModal] = useState(false)

  // Default to SOL and USDC
  useEffect(() => {
    if (tokens.length > 0 && !fromToken) {
      const sol = tokens.find(t => t.symbol === 'SOL')
      const usdc = tokens.find(t => t.symbol === 'USDC')
      if (sol) setFromToken(sol.address)
      if (usdc) setToToken(usdc.address)
    }
  }, [tokens, fromToken])

  const selectedFromToken = useMemo(() => 
    tokens.find(t => t.address === fromToken),
    [tokens, fromToken]
  )

  const selectedToToken = useMemo(() => 
    tokens.find(t => t.address === toToken),
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
      const slippageBps = slippage * 100

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

      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64')
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf)
      
      const signedTransaction = await signTransaction(transaction)

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
      
      await supabase
        .from('solana_swaps')
        .update({ 
          transaction_hash: txid,
          status: 'confirming'
        })
        .eq('id', swapId);

      await connection.confirmTransaction(txid, 'confirmed')

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
    return (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)
  }, [fromAmount, toAmount])

  const quoteData = quote && selectedFromToken && selectedToToken ? {
    fromTokenSymbol: selectedFromToken.symbol,
    toTokenSymbol: selectedToToken.symbol,
    rate: pricePerToken || undefined,
    priceImpactPct: quote.priceImpactPct,
  } : null

  return (
    <div className={DEX_STYLES.card.container}>
      <div className={DEX_STYLES.card.glow} />
      
      <Card className={DEX_STYLES.card.main}>
        <div className="p-4 flex items-center justify-between border-b border-border/20">
          <h3 className="text-lg font-semibold">Swap</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => refetchTokens?.(true, publicKey?.toString())}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
            <AddCustomToken onTokenAdded={() => refetchTokens?.(true, publicKey?.toString())} />
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <CardContent className="space-y-3 pt-6">
          <TokenInputField
            token={selectedFromToken || null}
            amount={fromAmount}
            onAmountChange={setFromAmount}
            onTokenSelect={() => setShowFromTokenModal(true)}
            label="From"
          />

          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={handleSwapTokens}
              className={DEX_STYLES.swap.button}
            >
              <ArrowDownUp className="h-5 w-5" />
            </button>
          </div>

          <TokenInputField
            token={selectedToToken || null}
            amount={toAmount}
            onAmountChange={() => {}}
            onTokenSelect={() => setShowToTokenModal(true)}
            label="To"
            disabled={true}
          />

          <SwapQuoteDisplay quote={quoteData} isLoading={isLoadingQuote} />

          {publicKey ? (
            <GradientBorderButton
              className="w-full h-14 text-lg font-semibold"
              onClick={() => setShowConfirm(true)}
              disabled={!quote || isLoadingQuote || !fromAmount || !toAmount}
            >
              {isLoadingQuote ? "Loading..." : "Review Swap"}
            </GradientBorderButton>
          ) : (
            <GradientBorderButton
              className="w-full h-14 text-lg font-semibold"
              disabled
            >
              Connect Wallet
            </GradientBorderButton>
          )}

          {quote && quote.priceImpactPct > 5 && (
            <div className="relative p-4 bg-destructive/10 border border-destructive/30 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,hsl(var(--destructive)/0.05)_25%,hsl(var(--destructive)/0.05)_50%,transparent_50%,transparent_75%,hsl(var(--destructive)/0.05)_75%)] bg-[length:20px_20px] animate-gradient-shift" />
              
              <div className="relative flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">High Price Impact Warning</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This swap has a {quote.priceImpactPct.toFixed(2)}% price impact. Consider splitting into smaller trades.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TokenSelectModal
        open={showFromTokenModal}
        onOpenChange={setShowFromTokenModal}
        tokens={tokens}
        onSelect={(token) => setFromToken(token.address)}
        title="Select token to swap from"
      />

      <TokenSelectModal
        open={showToTokenModal}
        onOpenChange={setShowToTokenModal}
        tokens={tokens}
        onSelect={(token) => setToToken(token.address)}
        title="Select token to receive"
      />

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className={DEX_STYLES.modal.content}>
          <DialogHeader>
            <DialogTitle className="text-xl">Swap Settings</DialogTitle>
            <DialogDescription>Adjust slippage tolerance</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Slippage Tolerance</Label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSlippage(0.5)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium transition-all",
                    slippage === 0.5 
                      ? "bg-primary/20 text-primary border-2 border-primary/40" 
                      : "bg-muted/30 hover:bg-muted/50 border border-border/30"
                  )}
                >
                  0.5%
                </button>
                <button 
                  onClick={() => setSlippage(1)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium transition-all",
                    slippage === 1 
                      ? "bg-primary/20 text-primary border-2 border-primary/40" 
                      : "bg-muted/30 hover:bg-muted/50 border border-border/30"
                  )}
                >
                  1%
                </button>
                <button 
                  onClick={() => setSlippage(2)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-medium transition-all",
                    slippage === 2 
                      ? "bg-primary/20 text-primary border-2 border-primary/40" 
                      : "bg-muted/30 hover:bg-muted/50 border border-border/30"
                  )}
                >
                  2%
                </button>
              </div>
              <Input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value) || 1)}
                className="bg-muted/30 border-border/30"
                placeholder="Custom"
                min={0.1}
                max={50}
                step={0.1}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className={DEX_STYLES.modal.content}>
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Swap</DialogTitle>
            <DialogDescription>Review your swap details carefully</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-muted/30 rounded-xl border border-border/20">
                <span className="text-muted-foreground text-sm">You Pay</span>
                <div className="text-right">
                  <p className="font-semibold">{fromAmount} {selectedFromToken?.symbol}</p>
                </div>
              </div>
              <div className="flex justify-center">
                <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex justify-between items-center p-4 bg-muted/30 rounded-xl border border-border/20">
                <span className="text-muted-foreground text-sm">You Receive</span>
                <div className="text-right">
                  <p className="font-semibold">{toAmount} {selectedToToken?.symbol}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-border/20" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium">1 {selectedFromToken?.symbol} = {pricePerToken} {selectedToToken?.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className={cn(
                  "font-medium",
                  quote && quote.priceImpactPct > 5 ? "text-destructive" :
                  quote && quote.priceImpactPct > 1 ? "text-yellow-500" :
                  "text-green-500"
                )}>
                  {quote?.priceImpactPct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span className="font-medium">{slippage}%</span>
              </div>
            </div>

            <GradientBorderButton
              className="w-full h-12"
              onClick={executeSwap}
              disabled={isSwapping}
            >
              {isSwapping ? "Swapping..." : "Confirm Swap"}
            </GradientBorderButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
