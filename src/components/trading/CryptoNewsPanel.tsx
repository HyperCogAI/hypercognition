import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Newspaper } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Simulated news data - in production, integrate with a crypto news API
const cryptoNews = [
  {
    id: 1,
    title: "Bitcoin Reaches New All-Time High as Institutional Adoption Grows",
    source: "CryptoDaily",
    category: "Bitcoin",
    timestamp: "2 hours ago",
    excerpt: "Bitcoin surpassed previous records as major institutions continue to add BTC to their balance sheets...",
    url: "#",
  },
  {
    id: 2,
    title: "Ethereum Layer 2 Solutions See Record Transaction Volume",
    source: "DeFi Pulse",
    category: "Ethereum",
    timestamp: "4 hours ago",
    excerpt: "Arbitrum and Optimism process millions of transactions with significantly lower fees than mainnet...",
    url: "#",
  },
  {
    id: 3,
    title: "Major Bank Announces Crypto Trading Services",
    source: "Financial Times",
    category: "Adoption",
    timestamp: "6 hours ago",
    excerpt: "One of the world's largest banks reveals plans to offer cryptocurrency trading to institutional clients...",
    url: "#",
  },
  {
    id: 4,
    title: "DeFi Protocol Launches Innovative Yield Farming Strategy",
    source: "CoinDesk",
    category: "DeFi",
    timestamp: "8 hours ago",
    excerpt: "New automated strategy promises sustainable yields through advanced liquidity management...",
    url: "#",
  },
  {
    id: 5,
    title: "Regulatory Clarity Boosts Crypto Market Sentiment",
    source: "Bloomberg Crypto",
    category: "Regulation",
    timestamp: "12 hours ago",
    excerpt: "Clear guidelines from regulators provide confidence for institutional investors...",
    url: "#",
  },
];

export const CryptoNewsPanel = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            <CardTitle>Crypto News Feed</CardTitle>
          </div>
          <CardDescription>
            Latest cryptocurrency news and market updates
          </CardDescription>
        </CardHeader>
      </Card>

      {cryptoNews.map((news) => (
        <Card key={news.id} className="hover:bg-accent/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{news.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {news.source}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {news.timestamp}
                  </span>
                </div>
                <CardTitle className="text-lg hover:text-primary cursor-pointer">
                  {news.title}
                </CardTitle>
              </div>
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{news.excerpt}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};