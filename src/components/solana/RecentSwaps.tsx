import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@solana/wallet-adapter-react";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, ExternalLink } from "lucide-react";

interface SwapRecord {
  id: string;
  input_symbol: string;
  output_symbol: string;
  input_amount: number;
  output_amount: number;
  transaction_hash: string | null;
  status: string;
  created_at: string;
}

export function RecentSwaps() {
  const { publicKey } = useWallet();
  const [swaps, setSwaps] = useState<SwapRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) {
      setSwaps([]);
      setLoading(false);
      return;
    }

    const fetchSwaps = async () => {
      const { data, error } = await supabase
        .from('solana_swaps')
        .select('*')
        .eq('wallet_address', publicKey.toString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setSwaps(data);
      }
      setLoading(false);
    };

    fetchSwaps();

    // Subscribe to new swaps
    const channel = supabase
      .channel('swap-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'solana_swaps',
          filter: `wallet_address=eq.${publicKey.toString()}`
        },
        () => fetchSwaps()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [publicKey]);

  if (!publicKey) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">
          Connect your wallet to view swap history
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">Loading...</p>
      </Card>
    );
  }

  if (swaps.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">No swaps yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Recent Swaps</h3>
      <div className="space-y-3">
        {swaps.map((swap) => (
          <div
            key={swap.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{swap.input_amount.toFixed(4)}</span>
                <span className="text-sm text-muted-foreground">{swap.input_symbol}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span className="font-medium">{swap.output_amount.toFixed(4)}</span>
                <span className="text-sm text-muted-foreground">{swap.output_symbol}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                swap.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                swap.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                'bg-yellow-500/20 text-yellow-500'
              }`}>
                {swap.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(swap.created_at), { addSuffix: true })}
              </span>
              {swap.transaction_hash && (
                <a
                  href={`https://solscan.io/tx/${swap.transaction_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
