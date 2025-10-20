import { useState } from "react";
import { useTwitterKOLSignals } from "@/hooks/useTwitterKOLSignals";
import { useTwitterKOLWatchlists } from "@/hooks/useTwitterKOLWatchlists";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Bookmark, X, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function KOLSignals() {
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>("all");
  const [selectedGemType, setSelectedGemType] = useState<string>("all");
  const [minConfidence, setMinConfidence] = useState<number>(50);
  const [showDismissed, setShowDismissed] = useState<boolean>(false);

  const { watchlists } = useTwitterKOLWatchlists();
  const { signals, isLoading, updateSignalStatus, updateSignalAction } = useTwitterKOLSignals({
    watchlistId: selectedWatchlist === "all" ? undefined : selectedWatchlist,
    gemType: selectedGemType === "all" ? undefined : selectedGemType,
    minConfidence,
    showDismissed,
  });

  const getGemTypeEmoji = (type: string | null) => {
    const emojiMap: Record<string, string> = {
      token: "🪙",
      nft: "🖼️",
      protocol: "⚡",
      airdrop: "🎁",
      alpha: "🔥",
    };
    return type ? emojiMap[type] || "🚨" : "🚨";
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">KOL Signal Feed</h1>
        <p className="text-muted-foreground">
          Real-time gem alerts from Twitter KOLs analyzed by AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Watchlist</Label>
              <Select value={selectedWatchlist} onValueChange={setSelectedWatchlist}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Watchlists</SelectItem>
                  {watchlists?.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gem Type</Label>
              <Select value={selectedGemType} onValueChange={setSelectedGemType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="token">🪙 Token</SelectItem>
                  <SelectItem value="nft">🖼️ NFT</SelectItem>
                  <SelectItem value="protocol">⚡ Protocol</SelectItem>
                  <SelectItem value="airdrop">🎁 Airdrop</SelectItem>
                  <SelectItem value="alpha">🔥 Alpha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Min Confidence: {minConfidence}%</Label>
              <Slider
                value={[minConfidence]}
                onValueChange={([value]) => setMinConfidence(value)}
                min={0}
                max={100}
                step={5}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-dismissed">Show Dismissed</Label>
              <Switch
                id="show-dismissed"
                checked={showDismissed}
                onCheckedChange={setShowDismissed}
              />
            </div>
          </CardContent>
        </Card>

        {/* Signal Feed */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          ) : !signals || signals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-2">No signals found</p>
                <p className="text-sm text-muted-foreground">
                  Add KOL accounts to your watchlist to start receiving alerts
                </p>
              </CardContent>
            </Card>
          ) : (
            signals.map((signal) => (
              <Card key={signal.id} className={signal.status === 'dismissed' ? 'opacity-50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getGemTypeEmoji(signal.gem_type)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getConfidenceColor(signal.confidence_score)}`}>
                            {signal.confidence_score}% Confidence
                          </span>
                          {signal.gem_type && (
                            <Badge variant="outline" className="capitalize">
                              {signal.gem_type}
                            </Badge>
                          )}
                          {signal.user_action === 'bookmarked' && (
                            <Badge variant="secondary">
                              <Bookmark className="h-3 w-3 mr-1" />
                              Bookmarked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          @{signal.twitter_kol_accounts?.twitter_username} ·{' '}
                          {formatDistanceToNow(new Date(signal.posted_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{signal.tweet_text}</p>
                  </div>

                  {signal.extracted_data?.tokens && signal.extracted_data.tokens.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">🪙 Detected Tokens:</p>
                      <div className="flex flex-wrap gap-2">
                        {signal.extracted_data.tokens.map((token, idx) => (
                          <Badge key={idx} variant="secondary">
                            ${token.ticker}
                            {token.chain && ` (${token.chain})`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold mb-2">🤖 AI Analysis:</p>
                    <p className="text-sm text-muted-foreground">{signal.ai_analysis}</p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(signal.tweet_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Tweet
                      </Button>
                      <Button
                        variant={signal.user_action === 'bookmarked' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSignalAction({
                          signalId: signal.id,
                          action: signal.user_action === 'bookmarked' ? 'alerted' : 'bookmarked'
                        })}
                      >
                        <Bookmark className="h-4 w-4 mr-1" />
                        {signal.user_action === 'bookmarked' ? 'Saved' : 'Bookmark'}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      {signal.status !== 'reviewed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSignalStatus({ signalId: signal.id, status: 'reviewed' })}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      {signal.status !== 'dismissed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSignalStatus({ signalId: signal.id, status: 'dismissed' })}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
