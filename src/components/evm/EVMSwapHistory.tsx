import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, ExternalLink, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Swap History
          </CardTitle>
          <CardDescription>Your recent EVM DEX swaps</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No swap history yet. Make your first swap to see it here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Swap History
        </CardTitle>
        <CardDescription>Your recent EVM DEX swaps ({swaps.length})</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {swaps.map((swap) => (
              <div
                key={swap.id}
                className="p-4 rounded-lg border border-border/40 bg-muted/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {swap.from_amount.toFixed(6)} {swap.from_token_symbol}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {swap.to_amount.toFixed(6)} {swap.to_token_symbol}
                    </span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(swap.status)}>
                    {swap.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {swap.chain_name && (
                      <Badge variant="outline" className="text-xs">
                        {swap.chain_name}
                      </Badge>
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
  );
};
