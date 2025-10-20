import { useState } from "react";
import { useTwitterKOLSignals } from "@/hooks/useTwitterKOLSignals";
import { useTwitterKOLWatchlists } from "@/hooks/useTwitterKOLWatchlists";
import { useSignalCommunity } from "@/hooks/useSignalCommunity";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SearchInput } from "@/components/ui/search-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Bookmark, X, Eye, TrendingUp, MessageCircle, ThumbsUp, ThumbsDown, Share2, Sparkles, Zap, Filter, BarChart3, Clock, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function AlphaSignals() {
  const [selectedWatchlist, setSelectedWatchlist] = useState<string>("all");
  const [selectedGemType, setSelectedGemType] = useState<string>("all");
  const [minConfidence, setMinConfidence] = useState<number>(50);
  const [showDismissed, setShowDismissed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [shareNote, setShareNote] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const { watchlists } = useTwitterKOLWatchlists();
  const { signals, isLoading, updateSignalStatus, updateSignalAction } = useTwitterKOLSignals({
    watchlistId: selectedWatchlist === "all" ? undefined : selectedWatchlist,
    gemType: selectedGemType === "all" ? undefined : selectedGemType,
    minConfidence,
    showDismissed,
  });

  const selectedSignal = selectedSignalId ? signals?.find(s => s.id === selectedSignalId) : null;
  const { comments, userVote, addComment, voteSignal, shareSignal, isLoading: communityLoading } = useSignalCommunity(selectedSignalId || '');

  const getGemTypeConfig = (type: string | null) => {
    const configs: Record<string, { emoji: string; color: string; label: string }> = {
      token: { emoji: "🪙", color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30", label: "Token" },
      nft: { emoji: "🖼️", color: "from-purple-500/20 to-pink-500/20 border-purple-500/30", label: "NFT" },
      protocol: { emoji: "⚡", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30", label: "Protocol" },
      airdrop: { emoji: "🎁", color: "from-green-500/20 to-emerald-500/20 border-green-500/30", label: "Airdrop" },
      alpha: { emoji: "🔥", color: "from-red-500/20 to-orange-500/20 border-red-500/30", label: "Alpha" },
    };
    return type ? configs[type] : { emoji: "🚨", color: "from-primary/20 to-accent/20 border-primary/30", label: "Alert" };
  };

  const getConfidenceConfig = (score: number) => {
    if (score >= 85) return { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", label: "High Confidence" };
    if (score >= 70) return { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", label: "Medium Confidence" };
    return { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", label: "Low Confidence" };
  };

  const filteredSignals = signals?.filter(signal => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      signal.tweet_text.toLowerCase().includes(query) ||
      signal.ai_analysis.toLowerCase().includes(query) ||
      signal.twitter_kol_accounts?.twitter_username.toLowerCase().includes(query) ||
      signal.extracted_data?.tokens?.some(t => t.ticker.toLowerCase().includes(query))
    );
  }).filter(signal => {
    if (activeTab === "all") return true;
    if (activeTab === "new") return signal.status === "new";
    if (activeTab === "reviewed") return signal.status === "reviewed";
    if (activeTab === "bookmarked") return signal.user_action === "bookmarked";
    return true;
  });

  const stats = {
    total: signals?.length || 0,
    new: signals?.filter(s => s.status === "new").length || 0,
    highConfidence: signals?.filter(s => s.confidence_score >= 85).length || 0,
    bookmarked: signals?.filter(s => s.user_action === "bookmarked").length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
      <div className="container max-w-7xl py-8 px-4 md:px-6">
        {/* Hero Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 blur-3xl -z-10 animate-pulse" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-shift">
                  Alpha Signals
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                AI-powered insights from crypto Twitter's most influential voices
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button variant="outline" size="lg" className="group">
                <Filter className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Signals", value: stats.total, icon: Zap, color: "from-blue-500 to-cyan-500" },
            { label: "New Today", value: stats.new, icon: Clock, color: "from-green-500 to-emerald-500" },
            { label: "High Confidence", value: stats.highConfidence, icon: Award, color: "from-yellow-500 to-amber-500" },
            { label: "Bookmarked", value: stats.bookmarked, icon: Bookmark, color: "from-purple-500 to-pink-500" },
          ].map((stat, idx) => (
            <Card key={idx} className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-3xl font-bold text-primary">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Advanced Filters Sidebar */}
          <Card className="lg:col-span-1 h-fit sticky top-4 border-border/50 bg-card/80 backdrop-blur-xl">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filters
              </CardTitle>
              <CardDescription>Refine your signal feed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search</Label>
                <SearchInput
                  placeholder="Search signals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Watchlist Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Watchlist
                </Label>
                <Select value={selectedWatchlist} onValueChange={setSelectedWatchlist}>
                  <SelectTrigger className="border-border/50 bg-background/50">
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

              {/* Gem Type Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Signal Type</Label>
                <Select value={selectedGemType} onValueChange={setSelectedGemType}>
                  <SelectTrigger className="border-border/50 bg-background/50">
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

              {/* Confidence Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Minimum Confidence</Label>
                  <span className={cn("text-sm font-bold px-2 py-1 rounded-md", getConfidenceConfig(minConfidence).bg)}>
                    {minConfidence}%
                  </span>
                </div>
                <Slider
                  value={[minConfidence]}
                  onValueChange={([value]) => setMinConfidence(value)}
                  min={0}
                  max={100}
                  step={5}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <Separator />

              {/* Show Dismissed Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <Label htmlFor="show-dismissed" className="text-sm cursor-pointer">
                  Show Dismissed
                </Label>
                <Switch
                  id="show-dismissed"
                  checked={showDismissed}
                  onCheckedChange={setShowDismissed}
                />
              </div>

              {/* Reset Filters */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedWatchlist("all");
                  setSelectedGemType("all");
                  setMinConfidence(50);
                  setShowDismissed(false);
                  setSearchQuery("");
                }}
              >
                Reset All Filters
              </Button>
            </CardContent>
          </Card>

          {/* Signal Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-4 bg-card/80 backdrop-blur-xl border border-border/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary/20">
                  All
                </TabsTrigger>
                <TabsTrigger value="new" className="data-[state=active]:bg-primary/20">
                  New
                  {stats.new > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
                      {stats.new}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reviewed" className="data-[state=active]:bg-primary/20">
                  Reviewed
                </TabsTrigger>
                <TabsTrigger value="bookmarked" className="data-[state=active]:bg-primary/20">
                  Saved
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4 mt-6">
                {isLoading ? (
                  <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
                        <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary" />
                      </div>
                      <p className="text-muted-foreground mt-4">Loading alpha signals...</p>
                    </CardContent>
                  </Card>
                ) : !filteredSignals || filteredSignals.length === 0 ? (
                  <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-4 rounded-full bg-muted/30 mb-4">
                        <Sparkles className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-semibold mb-2">No signals found</p>
                      <p className="text-muted-foreground max-w-md">
                        {searchQuery ? "Try adjusting your search or filters" : "Add KOL accounts to your watchlist to start receiving AI-powered alpha signals"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredSignals.map((signal) => {
                    const gemConfig = getGemTypeConfig(signal.gem_type);
                    const confidenceConfig = getConfidenceConfig(signal.confidence_score);

                    return (
                      <Card
                        key={signal.id}
                        className={cn(
                          "relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5",
                          signal.status === 'dismissed' && 'opacity-50'
                        )}
                      >
                        {/* Gradient Accent */}
                        <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", gemConfig.color)} />

                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {/* Gem Type Icon */}
                              <div className={cn(
                                "p-3 rounded-xl bg-gradient-to-br border flex-shrink-0",
                                gemConfig.color
                              )}>
                                <span className="text-2xl">{gemConfig.emoji}</span>
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Confidence & Type */}
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <Badge className={cn("font-bold border", confidenceConfig.bg, confidenceConfig.color)}>
                                    {signal.confidence_score}% {confidenceConfig.label}
                                  </Badge>
                                  {signal.gem_type && (
                                    <Badge variant="outline" className={cn("capitalize", gemConfig.color)}>
                                      {gemConfig.emoji} {gemConfig.label}
                                    </Badge>
                                  )}
                                  {signal.user_action === 'bookmarked' && (
                                    <Badge className="bg-purple-500/20 border-purple-500/30 text-purple-400">
                                      <Bookmark className="h-3 w-3 mr-1" />
                                      Saved
                                    </Badge>
                                  )}
                                  {signal.status === 'new' && (
                                    <Badge className="bg-green-500/20 border-green-500/30 text-green-400 animate-pulse">
                                      New
                                    </Badge>
                                  )}
                                </div>

                                {/* KOL Info */}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">
                                    @{signal.twitter_kol_accounts?.twitter_username}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(signal.posted_at), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Tweet Content */}
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-muted/30 backdrop-blur-sm p-4 rounded-lg border border-border/30">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{signal.tweet_text}</p>
                            </div>
                          </div>

                          {/* Detected Tokens */}
                          {signal.extracted_data?.tokens && signal.extracted_data.tokens.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                Detected Tokens
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {signal.extracted_data.tokens.map((token, idx) => (
                                  <Badge
                                    key={idx}
                                    className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-400 hover:from-yellow-500/30 hover:to-amber-500/30 transition-all cursor-pointer"
                                  >
                                    <span className="font-mono font-bold">${token.ticker}</span>
                                    {token.chain && (
                                      <span className="ml-1 text-xs opacity-75">({token.chain})</span>
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Analysis */}
                          <div className="space-y-2">
                            <p className="text-sm font-semibold flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-primary" />
                              AI Analysis
                            </p>
                            <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20">
                              <p className="text-sm text-foreground/90 leading-relaxed">{signal.ai_analysis}</p>
                            </div>
                          </div>

                          <Separator className="bg-border/50" />

                          {/* Actions */}
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-primary/10 hover:border-primary/50"
                                onClick={() => window.open(signal.tweet_url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Tweet
                              </Button>
                              <Button
                                variant={signal.user_action === 'bookmarked' ? 'default' : 'outline'}
                                size="sm"
                                className={signal.user_action === 'bookmarked' ? 'bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30' : 'hover:bg-purple-500/10 hover:border-purple-500/50'}
                                onClick={() => updateSignalAction({
                                  signalId: signal.id,
                                  action: signal.user_action === 'bookmarked' ? 'alerted' : 'bookmarked'
                                })}
                              >
                                <Bookmark className={cn("h-4 w-4 mr-2", signal.user_action === 'bookmarked' && 'fill-current')} />
                                {signal.user_action === 'bookmarked' ? 'Saved' : 'Save'}
                              </Button>
                              
                              {/* Community Dialog */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-primary/10 hover:border-primary/50"
                                    onClick={() => setSelectedSignalId(signal.id)}
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Community
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <MessageCircle className="h-5 w-5 text-primary" />
                                      Community Discussion
                                    </DialogTitle>
                                    <DialogDescription>
                                      Share insights and discuss this signal with the community
                                    </DialogDescription>
                                  </DialogHeader>

                                  <div className="space-y-6">
                                    {/* Voting */}
                                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant={userVote === 'up' ? 'default' : 'outline'}
                                          onClick={() => voteSignal('up')}
                                          disabled={communityLoading}
                                          className="hover:bg-green-500/20"
                                        >
                                          <ThumbsUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant={userVote === 'down' ? 'default' : 'outline'}
                                          onClick={() => voteSignal('down')}
                                          disabled={communityLoading}
                                          className="hover:bg-red-500/20"
                                        >
                                          <ThumbsDown className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Vote on signal quality
                                      </div>
                                    </div>

                                    {/* Share Signal */}
                                    <div className="space-y-2">
                                      <Label>Share with Community</Label>
                                      <div className="flex gap-2">
                                        <Textarea
                                          placeholder="Add your insights..."
                                          value={shareNote}
                                          onChange={(e) => setShareNote(e.target.value)}
                                          className="resize-none"
                                        />
                                        <Button
                                          onClick={() => {
                                            shareSignal(shareNote);
                                            setShareNote('');
                                          }}
                                          disabled={!shareNote || communityLoading}
                                        >
                                          <Share2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Comments */}
                                    <div className="space-y-4">
                                      <Label className="text-base">Comments</Label>
                                      
                                      {/* Add Comment */}
                                      <div className="flex gap-2">
                                        <Textarea
                                          placeholder="Share your thoughts..."
                                          value={commentText}
                                          onChange={(e) => setCommentText(e.target.value)}
                                          className="resize-none"
                                        />
                                        <Button
                                          onClick={() => {
                                            addComment(commentText);
                                            setCommentText('');
                                          }}
                                          disabled={!commentText || communityLoading}
                                        >
                                          Post
                                        </Button>
                                      </div>

                                      {/* Comments List */}
                                      <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {comments?.map((comment: any) => (
                                          <div key={comment.id} className="p-3 bg-muted/20 rounded-lg border border-border/30">
                                            <div className="flex items-center gap-2 mb-2">
                                              <span className="text-sm font-medium">
                                                {comment.profiles?.display_name || 'Anonymous'}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                              </span>
                                            </div>
                                            <p className="text-sm text-foreground/80">{comment.comment_text}</p>
                                          </div>
                                        ))}
                                        {(!comments || comments.length === 0) && (
                                          <p className="text-sm text-muted-foreground text-center py-4">
                                            No comments yet. Be the first to share your thoughts!
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>

                            <div className="flex items-center gap-2">
                              {signal.status !== 'reviewed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-blue-500/10 hover:border-blue-500/50"
                                  onClick={() => updateSignalStatus({ signalId: signal.id, status: 'reviewed' })}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Mark Read
                                </Button>
                              )}
                              {signal.status !== 'dismissed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-red-500/10 hover:border-red-500/50"
                                  onClick={() => updateSignalStatus({ signalId: signal.id, status: 'dismissed' })}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Dismiss
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
