import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, ExternalLink, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DEX_STYLES } from "@/lib/dex-styles";

interface SwapRecord {
  id: string;
  from_token_symbol: string;
  to_token_symbol: string;
  from_amount: number;
  to_amount: number;
  status: string;
  created_at: string;
  transaction_hash?: string;
  chain_name?: string;
}

interface EVMSwapHistoryProps {
  swaps: SwapRecord[];
}

export const EVMSwapHistory = ({ swaps }: EVMSwapHistoryProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
      case 'confirming':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (swaps.length === 0) {
    return (
      <div className={DEX_STYLES.card.container}>
        <div className={DEX_STYLES.card.glow} />
        <Card className={DEX_STYLES.card.main}>
          <CardHeader className="border-b border-border/20">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-5 w-5 text-primary" />
              Recent Swaps
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">
              No swap history yet. Make your first swap to see it here!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={DEX_STYLES.card.container}>
      <div className={DEX_STYLES.card.glow} />
      <Card className={DEX_STYLES.card.main}>
        <CardHeader className="border-b border-border/20">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5 text-primary" />
            Recent Swaps
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {swaps.map((swap) => (
                <div
                  key={swap.id}
                  className="p-3 bg-muted/30 rounded-xl border border-border/20 hover:border-border/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {swap.from_amount.toFixed(4)} {swap.from_token_symbol}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">
                        {swap.to_amount.toFixed(4)} {swap.to_token_symbol}
                      </span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(swap.status) + " text-xs"}>
                      {swap.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {swap.chain_name && (
                        <span className="px-2 py-0.5 rounded-lg bg-background/80 border border-border/20 text-[10px]">
                          {swap.chain_name}
                        </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(swap.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {swap.transaction_hash && (
                      <a
                        href={`https://etherscan.io/tx/${swap.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
