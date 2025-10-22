import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { useEVMSwap } from "@/hooks/useEVMSwap";
import { ArrowDown, Settings, Wallet, AlertCircle, Loader2, Plus } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { type Address, isAddress } from "viem";
import { Slider } from "@/components/ui/slider";

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
    { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address, symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address, symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address, symbol: 'USDT', name: 'Tether', decimals: 6 },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as Address, symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
  ],
  56: [ // BSC
    { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address, symbol: 'BNB', name: 'BNB', decimals: 18 },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d' as Address, symbol: 'USDC', name: 'USD Coin', decimals: 18 },
    { address: '0x55d398326f99059fF775485246999027B3197955' as Address, symbol: 'USDT', name: 'Tether', decimals: 18 },
  ],
  8453: [ // Base
    { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address, symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address, symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  ],
  42161: [ // Arbitrum
    { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address, symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Address, symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' as Address, symbol: 'USDT', name: 'Tether', decimals: 6 },
  ],
  10: [ // Optimism
    { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address, symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as Address, symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  ],
};

export const EVMDEX = () => {
  const { address, chain } = useAccount();
  const { connectWallet, isConnected } = useWallet();
  const { toast } = useToast();
  const { getQuote, executeSwap, quote, isLoadingQuote, isSwapping, swapHistory, fetchSwapHistory } = useEVMSwap();

  const [tokens, setTokens] = useState<Token[]>([]);
  const [fromToken, setFromToken] = useState<Address | ''>('');
  const [toToken, setToToken] = useState<Address | ''>('');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState('');

  // Load tokens for current chain and fetch swap history
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
      // In a real implementation, fetch token details from chain
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
    return parseFloat(toAmount) / parseFloat(fromAmount);
  }, [fromAmount, toAmount]);

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Swap</CardTitle>
          <div className="flex items-center gap-2">
            <Dialog open={showAddToken} onOpenChange={setShowAddToken}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Token</DialogTitle>
                  <DialogDescription>Enter the token contract address</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Token Contract Address</Label>
                    <Input
                      placeholder="0x..."
                      value={customTokenAddress}
                      onChange={(e) => setCustomTokenAddress(e.target.value)}
                    />
                  </div>
                  <Button onClick={addCustomToken} className="w-full">
                    Add Token
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
      <CardContent className="space-y-3 px-6 pt-2 pb-6">
        {/* Token Swap Container */}
        <div className="relative">
          <div className="flex flex-col gap-2">
            {/* From Token */}
            <div className="p-6 bg-muted/20 rounded-2xl border border-border/20">
              <p className="text-muted-foreground text-sm font-medium mb-4">Swap</p>
              <div className="flex items-start justify-between gap-4">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="text-3xl font-light bg-transparent border-none shadow-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Select value={fromToken} onValueChange={(val) => setFromToken(val as Address)}>
                  <SelectTrigger className="w-auto gap-2 bg-background/50 px-4 py-2 rounded-xl border-border/40">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.address} value={token.address}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{token.symbol}</span>
                          {token.isCustom && <Badge variant="outline" className="text-xs">Custom</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
                <span>≈$0.00</span>
                <span className="flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  {fromBalance ? parseFloat(fromBalance.formatted).toFixed(6) : '0.00'}
                </span>
              </div>
            </div>

            {/* To Token */}
            <div className="p-6 bg-muted/20 rounded-2xl border border-border/20">
              <p className="text-muted-foreground text-sm font-medium mb-4">For</p>
              <div className="flex items-start justify-between gap-4">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={toAmount}
                  disabled
                  className="text-3xl font-light bg-transparent border-none shadow-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Select value={toToken} onValueChange={(val) => setToToken(val as Address)}>
                  <SelectTrigger className="w-auto gap-2 bg-background/50 px-4 py-2 rounded-xl border-border/40">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.address} value={token.address}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{token.symbol}</span>
                          {token.isCustom && <Badge variant="outline" className="text-xs">Custom</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
                <span>≈$0.00</span>
                <span className="flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  0.00
                </span>
              </div>
            </div>
          </div>

          {/* Absolutely Positioned Swap Button */}
          <button
            onClick={handleSwapTokens}
            className="absolute left-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-full bg-background border-2 border-border/30 hover:border-border/50 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
            style={{ top: '50%', marginTop: '-24px' }}
          >
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </button>
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
        {isConnected ? (
          <Button
            className="w-full !mt-10"
            size="lg"
            onClick={handleSwap}
            disabled={!quote || isLoadingQuote || isSwapping || !fromAmount || !toAmount}
          >
            {isSwapping ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Swapping...
              </>
            ) : (
              'Swap'
            )}
          </Button>
        ) : (
          <Button className="w-full !mt-10" size="lg" onClick={connectWallet}>
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
              <p className="text-muted-foreground">
                This swap has a price impact of {quote.priceImpactPct.toFixed(2)}%. Consider reducing your swap amount.
              </p>
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
    </Card>
  );
};
