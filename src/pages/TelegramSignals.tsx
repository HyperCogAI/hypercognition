import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Search, Filter, Bookmark, Eye, Trash2, ExternalLink, Image, Video, Forward, RefreshCw } from "lucide-react";
import { useTelegramCredentials } from "@/hooks/useTelegramCredentials";
import { useTelegramKOLSignals } from "@/hooks/useTelegramKOLSignals";
import { useTelegramKOLWatchlists } from "@/hooks/useTelegramKOLWatchlists";
import { useTelegramKOLChannels } from "@/hooks/useTelegramKOLChannels";
import { SEOHead } from "@/components/seo/SEOHead";
import { Link } from "react-router-dom";
import { SignalCard } from "@/components/settings/telegram-kols/SignalCard";

const TelegramSignals = () => {
  const { isAuthenticated } = useTelegramCredentials();
  const { watchlists } = useTelegramKOLWatchlists();
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>("all");
  const [selectedGemType, setSelectedGemType] = useState<string>("all");
  const [minConfidence, setMinConfidence] = useState(50);
  const [showDismissed, setShowDismissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { signals, updateSignalStatus, toggleBookmark, isLoading } = useTelegramKOLSignals({
    watchlistId: selectedWatchlist === "all" ? undefined : selectedWatchlist,
    gemType: selectedGemType,
    minConfidence,
    showDismissed,
  });

  const { syncChannel, isUpdating } = useTelegramKOLChannels();

  const filteredSignals = signals?.filter(signal => 
    !searchQuery || 
    signal.message_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    signal.ai_reasoning.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getGemTypeConfig = (type: string) => {
    const configs: Record<string, { emoji: string; color: string }> = {
      token: { emoji: "💎", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      nft: { emoji: "🎨", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      protocol: { emoji: "⚡", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
      airdrop: { emoji: "🎁", color: "bg-green-500/10 text-green-500 border-green-500/20" },
      alpha: { emoji: "🔥", color: "bg-red-500/10 text-red-500 border-red-500/20" },
    };
    return configs[type] || { emoji: "💬", color: "" };
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "bg-success/10 text-success border-success/20";
    if (score >= 60) return "bg-warning/10 text-warning border-warning/20";
    return "bg-muted text-muted-foreground border-border";
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <SEOHead 
          title="Telegram Alpha Signals - HyperCognition"
          description="AI-powered cryptocurrency signals from Telegram KOL channels"
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              Telegram Alpha Signals
            </CardTitle>
            <CardDescription>
              Connect your Telegram account to start monitoring KOL channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              To use this feature, you need to authenticate with Telegram first.
            </p>
            <Button asChild>
              <Link to="/settings?tab=telegram-kols">
                Go to Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (watchlists.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <SEOHead 
          title="Telegram Alpha Signals - HyperCognition"
          description="AI-powered cryptocurrency signals from Telegram KOL channels"
        />
        <Card>
          <CardHeader>
            <CardTitle>Create Your First Watchlist</CardTitle>
            <CardDescription>
              Set up a watchlist to start monitoring Telegram channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/settings?tab=telegram-kols">
                Create Watchlist
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    total: filteredSignals.length,
    new: filteredSignals.filter(s => s.status === 'new').length,
    highConfidence: filteredSignals.filter(s => s.confidence_score >= 80).length,
    bookmarked: filteredSignals.filter(s => s.bookmarked).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Telegram Alpha Signals - HyperCognition"
        description="AI-powered cryptocurrency signals from Telegram KOL channels"
      />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageCircle className="w-8 h-8" />
              Telegram Alpha Signals
            </h1>
            <p className="text-muted-foreground">
              AI-powered gem signals from Telegram KOL channels
            </p>
          </div>
          <Button 
            onClick={() => syncChannel(selectedWatchlist === "all" ? undefined : selectedWatchlist)} 
            disabled={isUpdating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Signals</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>New</CardDescription>
              <CardTitle className="text-3xl text-primary">{stats.new}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>High Confidence</CardDescription>
              <CardTitle className="text-3xl text-success">{stats.highConfidence}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Bookmarked</CardDescription>
              <CardTitle className="text-3xl text-warning">{stats.bookmarked}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Watchlist</Label>
                <Select value={selectedWatchlist} onValueChange={setSelectedWatchlist}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Watchlists</SelectItem>
                    {watchlists.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Gem Type</Label>
                <Select value={selectedGemType} onValueChange={setSelectedGemType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="token">💎 Token</SelectItem>
                    <SelectItem value="nft">🎨 NFT</SelectItem>
                    <SelectItem value="protocol">⚡ Protocol</SelectItem>
                    <SelectItem value="airdrop">🎁 Airdrop</SelectItem>
                    <SelectItem value="alpha">🔥 Alpha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search signals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Min Confidence: {minConfidence}%</Label>
              <Slider
                value={[minConfidence]}
                onValueChange={(v) => setMinConfidence(v[0])}
                min={0}
                max={100}
                step={5}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={showDismissed}
                onCheckedChange={setShowDismissed}
              />
              <Label>Show dismissed signals</Label>
            </div>
          </CardContent>
        </Card>

        {/* Signals Feed */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading signals...</p>
            ) : filteredSignals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No signals found</p>
                </CardContent>
              </Card>
            ) : (
              filteredSignals.map((signal) => (
                <SignalCard 
                  key={signal.id}
                  signal={signal}
                  onUpdateStatus={updateSignalStatus}
                  onToggleBookmark={toggleBookmark}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="new">
            {filteredSignals.filter(s => s.status === 'new').length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No new signals</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSignals.filter(s => s.status === 'new').map(signal => (
                  <SignalCard 
                    key={signal.id}
                    signal={signal}
                    onUpdateStatus={updateSignalStatus}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviewed">
            {filteredSignals.filter(s => s.status === 'reviewed').length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No reviewed signals</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSignals.filter(s => s.status === 'reviewed').map(signal => (
                  <SignalCard 
                    key={signal.id}
                    signal={signal}
                    onUpdateStatus={updateSignalStatus}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarked">
            {filteredSignals.filter(s => s.bookmarked).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No bookmarked signals</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSignals.filter(s => s.bookmarked).map(signal => (
                  <SignalCard 
                    key={signal.id}
                    signal={signal}
                    onUpdateStatus={updateSignalStatus}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TelegramSignals;
