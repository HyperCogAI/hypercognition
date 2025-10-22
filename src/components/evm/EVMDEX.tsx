import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { useEVMSwap } from "@/hooks/useEVMSwap";
import { ArrowDownUp, Settings, AlertCircle, RefreshCw } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { type Address, isAddress } from "viem";
import { DEX_STYLES } from "@/lib/dex-styles";
import { TokenInputField } from "@/components/dex/TokenInputField";
import { TokenSelectModal } from "@/components/dex/TokenSelectModal";
import { SwapQuoteDisplay } from "@/components/dex/SwapQuoteDisplay";
import { GradientBorderButton } from "@/components/wallet/GradientBorderButton";
import { cn } from "@/lib/utils";

interface Token {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  isCustom?: boolean;
}

// Popular tokens by chain
const POPULAR_TOKENS: Record<number, Token[]> = {
  1: [ // Ethereum Mainnet
    { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address, symbol: 'ETH', name: 'Ethereum', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address, symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png' },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address, symbol: 'USDT', name: 'Tether', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as Address, symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, logoURI: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png' },
  ],
  56: [ // BSC
    { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address, symbol: 'BNB', name: 'BNB', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as Address, symbol: 'USDC', name: 'USD Coin', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png' },
    { address: '0x55d398326f99059fF775485246999027B3197955' as Address, symbol: 'USDT', name: 'Tether', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  ],
  8453: [ // Base
    { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address, symbol: 'ETH', name: 'Ethereum', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address, symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png' },
  ],
  42161: [ // Arbitrum
    { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address, symbol: 'ETH', name: 'Ethereum', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Address, symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png' },
    { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' as Address, symbol: 'USDT', name: 'Tether', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  ],
  10: [ // Optimism
    { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address, symbol: 'ETH', name: 'Ethereum', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as Address, symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png' },
  ],
};

export const EVMDEX = () => {
  const { address, chain } = useAccount();
  const { connectWallet, isConnected } = useWallet();
  const { toast } = useToast();
  const { getQuote, executeSwap, quote, isLoadingQuote, isSwapping, fetchSwapHistory } = useEVMSwap();

  const [tokens, setTokens] = useState<Token[]>([]);
  const [fromToken, setFromToken] = useState<Address | ''>('');
  const [toToken, setToToken] = useState<Address | ''>('');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showFromTokenModal, setShowFromTokenModal] = useState(false);
  const [showToTokenModal, setShowToTokenModal] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState('');

  // Load tokens for current chain
  useEffect(() => {
    if (chain?.id) {
      const popularTokens = POPULAR_TOKENS[chain.id] || [];
      const storedCustomTokens = JSON.parse(localStorage.getItem(`custom_tokens_${chain.id}`) || '[]');
      setTokens([...popularTokens, ...storedCustomTokens]);
      
      // Set default tokens
      if (popularTokens.length >= 2 && !fromToken) {
        setFromToken(popularTokens[0].address);
        setToToken(popularTokens[1].address);
      }
      
      // Fetch swap history
      if (isConnected) {
        fetchSwapHistory();
      }
    }
  }, [chain?.id, isConnected]);

  const selectedFromToken = useMemo(() => 
    tokens.find(t => t.address.toLowerCase() === fromToken.toLowerCase()),
    [tokens, fromToken]
  );

  const selectedToToken = useMemo(() => 
    tokens.find(t => t.address.toLowerCase() === toToken.toLowerCase()),
    [tokens, toToken]
  );

  const { data: fromBalance } = useBalance({
    address: address,
    token: fromToken !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' ? fromToken as Address : undefined,
  });

  // Fetch quote when inputs change
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0 && selectedFromToken) {
      const timer = setTimeout(() => {
        getQuote(fromToken as Address, toToken as Address, fromAmount, selectedFromToken.decimals, slippage)
          .then((quoteData) => {
            if (quoteData) {
              setToAmount(quoteData.toAmount);
            }
          })
          .catch(() => setToAmount(''));
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setToAmount('');
    }
  }, [fromToken, toToken, fromAmount, slippage, selectedFromToken]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || !selectedFromToken || !selectedToToken) return;

    try {
      await executeSwap(
        fromToken as Address, 
        toToken as Address, 
        fromAmount, 
        selectedFromToken.decimals, 
        slippage,
        selectedFromToken.symbol,
        selectedToToken.symbol
      );
      setFromAmount('');
      setToAmount('');
      toast({
        title: "Swap Successful",
        description: `Swapped ${fromAmount} ${selectedFromToken.symbol} for ${toAmount} ${selectedToToken.symbol}`,
      });
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  const addCustomToken = async () => {
    if (!customTokenAddress || !isAddress(customTokenAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid token contract address",
        variant: "destructive"
      });
      return;
    }

    try {
      const newToken: Token = {
        address: customTokenAddress as Address,
        symbol: 'CUSTOM',
        name: 'Custom Token',
        decimals: 18,
        isCustom: true,
      };

      const chainId = chain?.id || 1;
      const storedTokens = JSON.parse(localStorage.getItem(`custom_tokens_${chainId}`) || '[]');
      const updatedTokens = [...storedTokens, newToken];
      localStorage.setItem(`custom_tokens_${chainId}`, JSON.stringify(updatedTokens));
      
      setTokens([...tokens, newToken]);
      setCustomTokenAddress('');
      setShowAddToken(false);
      
      toast({
        title: "Token Added",
        description: "Custom token has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add custom token",
        variant: "destructive"
      });
    }
  };

  const pricePerToken = useMemo(() => {
    if (!fromAmount || !toAmount || parseFloat(fromAmount) === 0) return null;
    return (parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6);
  }, [fromAmount, toAmount]);

  const quoteData = quote && selectedFromToken && selectedToToken ? {
    fromTokenSymbol: selectedFromToken.symbol,
    toTokenSymbol: selectedToToken.symbol,
    rate: pricePerToken || undefined,
    priceImpactPct: quote.priceImpactPct,
    estimatedGas: quote.estimatedGas
  } : null;

  return (
    <div className={DEX_STYLES.card.container}>
      {/* Background glow */}
      <div className={DEX_STYLES.card.glow} />
      
      {/* Main card */}
      <Card className={DEX_STYLES.card.main}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-border/20">
          <h3 className="text-lg font-semibold">Swap</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fetchSwapHistory()}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <CardContent className="space-y-3 pt-6">
          {/* From Token Input */}
          <TokenInputField
            token={selectedFromToken || null}
            amount={fromAmount}
            balance={fromBalance?.formatted}
            onAmountChange={setFromAmount}
            onTokenSelect={() => setShowFromTokenModal(true)}
            label="From"
            onMaxClick={() => fromBalance && setFromAmount(fromBalance.formatted)}
          />

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={handleSwapTokens}
              className={DEX_STYLES.swap.button}
            >
              <ArrowDownUp className="h-5 w-5" />
            </button>
          </div>

          {/* To Token Input */}
          <TokenInputField
            token={selectedToToken || null}
            amount={toAmount}
            onAmountChange={() => {}}
            onTokenSelect={() => setShowToTokenModal(true)}
            label="To"
            disabled={true}
          />

          {/* Quote Display */}
          <SwapQuoteDisplay quote={quoteData} isLoading={isLoadingQuote} />

          {/* Swap Button */}
          {isConnected ? (
            <GradientBorderButton
              className="w-full h-14 text-lg font-semibold"
              onClick={handleSwap}
              disabled={!quote || isLoadingQuote || isSwapping || !fromAmount || !toAmount}
            >
              {isSwapping ? 'Swapping...' : 'Swap'}
            </GradientBorderButton>
          ) : (
            <GradientBorderButton
              className="w-full h-14 text-lg font-semibold"
              onClick={connectWallet}
            >
              Connect Wallet
            </GradientBorderButton>
          )}

          {/* High Price Impact Warning */}
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

      {/* Token Selection Modals */}
      <TokenSelectModal
        open={showFromTokenModal}
        onOpenChange={setShowFromTokenModal}
        tokens={tokens}
        onSelect={(token) => setFromToken(token.address as Address)}
        onAddCustomToken={() => {
          setShowFromTokenModal(false);
          setShowAddToken(true);
        }}
        title="Select token to swap from"
      />

      <TokenSelectModal
        open={showToTokenModal}
        onOpenChange={setShowToTokenModal}
        tokens={tokens}
        onSelect={(token) => setToToken(token.address as Address)}
        onAddCustomToken={() => {
          setShowToTokenModal(false);
          setShowAddToken(true);
        }}
        title="Select token to receive"
      />

      {/* Settings Dialog */}
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

      {/* Add Custom Token Dialog */}
      <Dialog open={showAddToken} onOpenChange={setShowAddToken}>
        <DialogContent className={DEX_STYLES.modal.content}>
          <DialogHeader>
            <DialogTitle className="text-xl">Add Custom Token</DialogTitle>
            <DialogDescription>Enter the token contract address</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Token Contract Address</Label>
              <Input
                placeholder="0x..."
                value={customTokenAddress}
                onChange={(e) => setCustomTokenAddress(e.target.value)}
                className="bg-muted/30 border-border/30"
              />
            </div>
            <GradientBorderButton onClick={addCustomToken} className="w-full h-12">
              Add Token
            </GradientBorderButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
