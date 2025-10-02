import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { coinGeckoApi } from "@/lib/apis/coinGeckoApi";

export const MarketHeatmap = () => {
  const { data: topData, isLoading } = useQuery({
    queryKey: ["coingecko-top", 100],
    queryFn: () => coinGeckoApi.getTopCryptos(100),
    staleTime: 30000,
    gcTime: 300000,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attempt) => Math.min(30000, 1000 * 2 ** attempt),
  });
  const cryptos = (topData as any[] | undefined)?.slice(0, 50) || [];

  const getColorClass = (change: number) => {
    if (change > 10) return "bg-green-600";
    if (change > 5) return "bg-green-500";
    if (change > 0) return "bg-green-400";
    if (change > -5) return "bg-red-400";
    if (change > -10) return "bg-red-500";
    return "bg-red-600";
  };

  const getSize = (marketCap: number, maxMarketCap: number) => {
    const ratio = marketCap / maxMarketCap;
    if (ratio > 0.5) return "col-span-2 row-span-2";
    if (ratio > 0.2) return "col-span-2";
    return "";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Heatmap</CardTitle>
          <CardDescription>Loading market data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  const maxMarketCap = cryptos?.[0]?.market_cap || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Heatmap</CardTitle>
        <CardDescription>
          Visual representation of top 50 cryptocurrencies by market cap and 24h performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 auto-rows-fr">
          {cryptos?.map((crypto: any) => (
            <div
              key={crypto.id}
              className={`${getColorClass(crypto.price_change_percentage_24h)} ${getSize(
                crypto.market_cap,
                maxMarketCap
              )} p-3 rounded-lg flex flex-col justify-between min-h-[80px] hover:opacity-80 transition-opacity cursor-pointer group relative`}
              title={`${crypto.name}: ${crypto.price_change_percentage_24h.toFixed(2)}%`}
            >
              <div className="text-white font-bold text-xs truncate">
                {crypto.symbol.toUpperCase()}
              </div>
              <div className="text-white text-xs font-semibold">
                {crypto.price_change_percentage_24h > 0 ? "+" : ""}
                {crypto.price_change_percentage_24h.toFixed(1)}%
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border">
                <div className="font-semibold">{crypto.name}</div>
                <div>Price: ${crypto.current_price.toLocaleString()}</div>
                <div>Market Cap: ${(crypto.market_cap / 1e9).toFixed(2)}B</div>
                <div>
                  24h: {crypto.price_change_percentage_24h > 0 ? "+" : ""}
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded" />
            <span className="text-muted-foreground">&gt;10%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded" />
            <span className="text-muted-foreground">0-10%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded" />
            <span className="text-muted-foreground">0 to -10%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded" />
            <span className="text-muted-foreground">&lt;-10%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};