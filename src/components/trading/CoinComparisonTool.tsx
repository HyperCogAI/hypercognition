import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { coinGeckoApi } from "@/lib/apis/coinGeckoApi";
interface Crypto {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
}

export const CoinComparisonTool = () => {
  const navigate = useNavigate();
  const [selectedCoins, setSelectedCoins] = useState<Crypto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cryptos } = useQuery({
    queryKey: ["coingecko-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return { coins: [] } as any;
      return coinGeckoApi.searchCoins(searchQuery);
    },
    enabled: searchQuery.length > 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attempt) => Math.min(30000, 1000 * 2 ** attempt),
  });

  const addCoin = async (coinId: string) => {
    if (selectedCoins.length >= 4) return;
    const data = await coinGeckoApi.getCryptoById(coinId);
    if (data) {
      setSelectedCoins([...selectedCoins, data as any]);
      setSearchQuery("");
    }
  };

  const removeCoin = (coinId: string) => {
    setSelectedCoins(selectedCoins.filter(c => c.id !== coinId));
  };

  const handleTrade = (coin: Crypto) => {
    navigate('/exchange-trading', { 
      state: { 
        selectedCrypto: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        price: coin.current_price
      } 
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compare Cryptocurrencies</CardTitle>
          <CardDescription>
            Add up to 4 cryptocurrencies to compare side by side
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a cryptocurrency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {cryptos?.coins && cryptos.coins.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-auto">
                {cryptos.coins.slice(0, 5).map((coin: any) => (
                  <button
                    key={coin.id}
                    onClick={() => addCoin(coin.id)}
                    className="w-full px-4 py-2 text-left hover:bg-accent flex items-center gap-2"
                    disabled={selectedCoins.some(c => c.id === coin.id)}
                  >
                    <span className="font-medium">{coin.name}</span>
                    <span className="text-muted-foreground text-sm">
                      {coin.symbol?.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCoins.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedCoins.map((coin) => (
            <Card key={coin.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{coin.name}</CardTitle>
                    <CardDescription>{coin.symbol.toUpperCase()}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCoin(coin.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl font-bold">
                    ${coin.current_price.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <div className="flex items-center gap-1">
                    {coin.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={coin.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}>
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="font-semibold">
                    ${(coin.market_cap / 1e9).toFixed(2)}B
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="font-semibold">
                    ${(coin.total_volume / 1e9).toFixed(2)}B
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Rank</p>
                  <Badge variant="secondary">#{coin.market_cap_rank}</Badge>
                </div>

                <Button 
                  variant="default" 
                  className="w-full mt-2"
                  onClick={() => handleTrade(coin)}
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Trade {coin.symbol.toUpperCase()}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};