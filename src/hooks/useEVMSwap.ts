import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAccount, useWalletClient } from 'wagmi';
import { parseUnits, formatUnits, type Address } from 'viem';
import { supabase } from '@/integrations/supabase/client';

interface SwapQuote {
  fromToken: Address;
  toToken: Address;
  fromAmount: string;
  toAmount: string;
  priceImpactPct: number;
  estimatedGas: string;
  route: any;
}

interface SwapRecord {
  id: string;
  from_token_symbol: string;
  to_token_symbol: string;
  from_amount: number;
  to_amount: number;
  status: string;
  created_at: string;
  transaction_hash?: string;
}

export const useEVMSwap = () => {
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [swapHistory, setSwapHistory] = useState<SwapRecord[]>([]);
  const { toast } = useToast();
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Fetch swap history
  const fetchSwapHistory = async () => {
    if (!address) return;

    try {
      const { data, error } = await supabase
        .from('dex_swaps')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSwapHistory(data || []);
    } catch (error) {
      console.error('Error fetching swap history:', error);
    }
  };

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
    slippagePercentage: number = 1,
    fromTokenSymbol: string,
    toTokenSymbol: string
  ) => {
    if (!address || !walletClient || !chain) {
      throw new Error('Wallet not connected');
    }

    setIsSwapping(true);
    let swapId: string | null = null;

    try {
      // Create swap record in database
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data: swapRecord, error: dbError } = await supabase
        .from('dex_swaps')
        .insert({
          user_id: userData.user.id,
          from_token_address: fromToken,
          to_token_address: toToken,
          from_token_symbol: fromTokenSymbol,
          to_token_symbol: toTokenSymbol,
          from_amount: parseFloat(amount),
          to_amount: quote ? parseFloat(quote.toAmount) : 0,
          chain_id: chain.id,
          chain_name: chain.name,
          slippage_percentage: slippagePercentage,
          price_impact_percentage: quote?.priceImpactPct || 0,
          estimated_gas: quote?.estimatedGas || '0',
          quote_data: quote?.route || {},
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;
      swapId = swapRecord.id;

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

      // Update status to confirming
      await supabase
        .from('dex_swaps')
        .update({ status: 'confirming' })
        .eq('id', swapId);

      // Execute the transaction
      const hash = await walletClient.sendTransaction({
        to: swapData.tx.to as Address,
        data: swapData.tx.data as `0x${string}`,
        value: BigInt(swapData.tx.value || 0),
      } as any);

      // Update with transaction hash and completed status
      await supabase
        .from('dex_swaps')
        .update({ 
          transaction_hash: hash,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', swapId);

      toast({
        title: "Swap Successful!",
        description: `Swapped ${amount} ${fromTokenSymbol} for ${quote?.toAmount} ${toTokenSymbol}`,
      });

      setQuote(null);
      await fetchSwapHistory();
      return hash;
    } catch (error: any) {
      console.error('Swap error:', error);
      
      // Update swap record with failure
      if (swapId) {
        await supabase
          .from('dex_swaps')
          .update({ 
            status: 'failed',
            failure_reason: error.message
          })
          .eq('id', swapId);
      }

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
    swapHistory,
    fetchSwapHistory,
  };
};
