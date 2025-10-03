import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi';
import { parseUnits, formatUnits, type Address } from 'viem';

interface SwapQuote {
  fromToken: Address;
  toToken: Address;
  fromAmount: string;
  toAmount: string;
  priceImpactPct: number;
  estimatedGas: string;
  route: any;
}

export const useEVMSwap = () => {
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const { toast } = useToast();
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();

  const getQuote = async (
    fromToken: Address,
    toToken: Address,
    amount: string,
    decimals: number,
    slippagePercentage: number = 1
  ) => {
    if (!chain) {
      throw new Error('Chain not selected');
    }

    setIsLoadingQuote(true);
    try {
      // Use 1inch API for quotes
      const amountWei = parseUnits(amount, decimals);
      const apiUrl = `https://api.1inch.dev/swap/v5.2/${chain.id}/quote`;
      
      const params = new URLSearchParams({
        src: fromToken,
        dst: toToken,
        amount: amountWei.toString(),
      });

      const response = await fetch(`${apiUrl}?${params}`, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }

      const data = await response.json();
      
      const toAmountFormatted = formatUnits(BigInt(data.toAmount), data.toToken.decimals);
      const priceImpact = parseFloat(data.estimatedGas) / parseFloat(amount);

      const quoteData: SwapQuote = {
        fromToken,
        toToken,
        fromAmount: amount,
        toAmount: toAmountFormatted,
        priceImpactPct: priceImpact * 100,
        estimatedGas: data.estimatedGas || '0',
        route: data,
      };

      setQuote(quoteData);
      return quoteData;
    } catch (error: any) {
      console.error('Quote error:', error);
      toast({
        title: "Quote Failed",
        description: error.message || "Unable to fetch swap quote",
        variant: "destructive"
      });
      setQuote(null);
      throw error;
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const executeSwap = async (
    fromToken: Address,
    toToken: Address,
    amount: string,
    decimals: number,
    slippagePercentage: number = 1
  ) => {
    if (!address || !walletClient || !chain) {
      throw new Error('Wallet not connected');
    }

    setIsSwapping(true);
    try {
      // Get swap transaction from 1inch
      const amountWei = parseUnits(amount, decimals);
      const apiUrl = `https://api.1inch.dev/swap/v5.2/${chain.id}/swap`;
      
      const params = new URLSearchParams({
        src: fromToken,
        dst: toToken,
        amount: amountWei.toString(),
        from: address,
        slippage: slippagePercentage.toString(),
      });

      const response = await fetch(`${apiUrl}?${params}`, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get swap transaction');
      }

      const swapData = await response.json();

      // Execute the transaction
      const hash = await walletClient.sendTransaction({
        to: swapData.tx.to as Address,
        data: swapData.tx.data as `0x${string}`,
        value: BigInt(swapData.tx.value || 0),
      } as any);

      toast({
        title: "Swap Successful!",
        description: `Transaction hash: ${hash.slice(0, 10)}...`,
      });

      setQuote(null);
      return hash;
    } catch (error: any) {
      console.error('Swap error:', error);
      toast({
        title: "Swap Failed",
        description: error.message || "Transaction failed",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSwapping(false);
    }
  };

  return {
    getQuote,
    executeSwap,
    quote,
    isLoadingQuote,
    isSwapping,
  };
};
