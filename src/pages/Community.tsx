import { useState, useEffect, useRef } from "react"
import { generateDefaultAvatar } from "@/utils/avatarUtils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, ThumbsUp, Users, TrendingUp, Clock, Send, Pin, Loader2, ArrowUp } from "lucide-react"
import { SEOHead } from "@/components/seo/SEOHead"
import { useCommunity } from "@/hooks/useCommunity"
import { useAuth } from "@/contexts/AuthContext"
import { formatDistanceToNow } from "date-fns"

const Community = () => {
  const { user } = useAuth()
  const [newMessage, setNewMessage] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  const {
    stats,
    posts,
    chatMessages,
    leaderboard,
    isLoading,
    sendMessage,
    isSendingMessage,
    likePost,
  } = useCommunity()

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = () => {
    if (newMessage.trim() && user) {
      sendMessage(newMessage)
      setNewMessage("")
    }
  }

  const communityStats = [
    { label: "Active Members", value: stats?.activeMembers.toLocaleString() || "0", icon: Users },
    { label: "Forum Posts", value: stats?.totalPosts.toLocaleString() || "0", icon: MessageCircle },
    { label: "Chat Messages", value: stats?.totalMessages.toLocaleString() || "0", icon: TrendingUp }
  ]

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name.slice(0, 2).toUpperCase()
  }

  const getRankBadge = (rank?: number) => {
    if (!rank) return "Member"
    if (rank === 1) return "🥇 Elite Trader"
    if (rank === 2) return "🥈 Advanced Trader"
    if (rank === 3) return "🥉 Pro Trader"
    if (rank <= 10) return "⭐ Top Trader"
    return "Active Trader"
  }

  return (
    <>
      <SEOHead
        title="Community - Connect with AI Traders"
        description="Join our vibrant community of AI traders. Share strategies, get advice, and connect with fellow traders in our forums and live chat."
        keywords="trading community, trader forum, AI trading chat, trading strategies, market discussion"
      />
      
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 md:mb-4">
            Trading Community
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Connect with fellow traders, share strategies, and learn from the community
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {communityStats.map((stat, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="forum" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forum">Forum</TabsTrigger>
            <TabsTrigger value="chat">Live Chat</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="forum" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Forum Discussions</h2>
              <Button disabled={!user}>New Post</Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-12 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No posts yet. Be the first to start a discussion!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={post.profiles?.avatar_url || generateDefaultAvatar(post.profiles?.display_name || 'User', 'initials')} />
                          <AvatarFallback>{getInitials(post.profiles?.display_name)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {post.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                            <h3 className="font-semibold">{post.title}</h3>
                            {post.community_categories?.name && (
                              <Badge variant="outline">{post.community_categories.name}</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span>by {post.profiles?.display_name || 'Anonymous'}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {post.reply_count} replies
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => user && likePost(post.id)}
                              disabled={!user}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              {post.like_count}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Live Trading Chat</CardTitle>
                <CardDescription>
                  Real-time discussions with the community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-80 overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-lg">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mb-2" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((message) => (
                        <div key={message.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.profiles?.avatar_url || generateDefaultAvatar(message.profiles?.display_name || 'User', 'initials')} />
                            <AvatarFallback>{getInitials(message.profiles?.display_name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{message.profiles?.display_name || 'Anonymous'}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder={user ? "Type your message..." : "Sign in to chat"}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={!user || isSendingMessage}
                  />
                    <Button 
                      variant="ghost"
                      onClick={handleSendMessage} 
                      disabled={!user || isSendingMessage || !newMessage.trim()}
                      size="icon"
                      className="rounded-full bg-primary/10 hover:bg-primary/20 border-0 outline outline-[1px] outline-primary/30 hover:outline-primary/50 transition-all duration-300"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowUp className="h-4 w-4" />
                      )}
                    </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Top Community Contributors</CardTitle>
                <CardDescription>
                  Leaderboard based on community engagement and reputation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                    <p>No community stats yet. Start contributing to climb the ranks!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((user, index) => (
                      <div key={user.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="w-8 text-center font-bold text-primary">#{index + 1}</div>
                        <Avatar>
                          <AvatarImage src={user.profiles?.avatar_url || generateDefaultAvatar(user.profiles?.display_name || 'User', "initials")} />
                          <AvatarFallback>{getInitials(user.profiles?.display_name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold">{user.profiles?.display_name || 'Anonymous'}</div>
                          <div className="text-sm text-muted-foreground">
                            {getRankBadge(index + 1)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {user.reputation_score.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">Reputation</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default Community