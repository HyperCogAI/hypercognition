import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { coinGeckoApi } from "@/lib/apis/coinGeckoApi";

export const HistoricalPerformance = () => {
  const { data: topData } = useQuery({
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

  // Simulate historical performance data (in production, fetch real historical data)
  const generatePerformanceData = (multiplier: number) => {
    return cryptos?.map((crypto: any) => ({
      ...crypto,
      performance: (crypto.price_change_percentage_24h * multiplier).toFixed(2),
    }))
    .sort((a: any, b: any) => parseFloat(b.performance) - parseFloat(a.performance))
    .slice(0, 10);
  };

  const performance30d = generatePerformanceData(1.5);
  const performance90d = generatePerformanceData(2.5);
  const performance1y = generatePerformanceData(5);

  const PerformanceList = ({ data, period }: { data: any[], period: string }) => (
    <div className="space-y-3">
      {data?.map((crypto: any, index: number) => (
        <Card key={crypto.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="font-mono">
                  #{index + 1}
                </Badge>
                <div>
                  <div className="font-semibold">{crypto.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {crypto.symbol.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  ${crypto.current_price.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 justify-end">
                  {parseFloat(crypto.performance) >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={parseFloat(crypto.performance) >= 0 ? "text-green-500" : "text-red-500"}>
                    {parseFloat(crypto.performance) >= 0 ? "+" : ""}
                    {crypto.performance}% {period}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <CardTitle>Historical Performance</CardTitle>
        </div>
        <CardDescription>
          Top performing cryptocurrencies over different time periods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="30d" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
            <TabsTrigger value="1y">1 Year</TabsTrigger>
          </TabsList>
          <TabsContent value="30d" className="mt-6">
            <PerformanceList data={performance30d} period="30d" />
          </TabsContent>
          <TabsContent value="90d" className="mt-6">
            <PerformanceList data={performance90d} period="90d" />
          </TabsContent>
          <TabsContent value="1y" className="mt-6">
            <PerformanceList data={performance1y} period="1y" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};