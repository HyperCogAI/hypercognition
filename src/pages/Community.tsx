import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, ThumbsUp, Users, TrendingUp, Clock, Send, Pin } from "lucide-react"
import { SEOHead } from "@/components/seo/SEOHead"

const Community = () => {
  const [newMessage, setNewMessage] = useState("")

  const forumPosts = [
    {
      id: 1,
      title: "Best AI agents for current market conditions?",
      author: "TradingPro2024",
      avatar: "/placeholder.svg",
      category: "Strategy Discussion",
      replies: 23,
      likes: 45,
      time: "2 hours ago",
      isPinned: true,
      preview: "Looking for recommendations on which AI agents perform best in volatile markets..."
    },
    {
      id: 2,
      title: "Risk Management Tips for New Traders",
      author: "SafeTrader",
      avatar: "/placeholder.svg",
      category: "Education",
      replies: 18,
      likes: 32,
      time: "4 hours ago",
      isPinned: false,
      preview: "Here are some essential risk management strategies I've learned..."
    },
    {
      id: 3,
      title: "Monthly Portfolio Review - December 2024",
      author: "PortfolioMaster",
      avatar: "/placeholder.svg",
      category: "Portfolio Review",
      replies: 12,
      likes: 28,
      time: "6 hours ago",
      isPinned: false,
      preview: "Sharing my portfolio performance and key insights from December..."
    }
  ]

  const chatMessages = [
    {
      id: 1,
      user: "AlexCrypto",
      avatar: "/placeholder.svg",
      message: "Just saw THETA agent hit new highs! Anyone else tracking this?",
      time: "2 min ago",
      isOnline: true
    },
    {
      id: 2,
      user: "MarketWatcher",
      avatar: "/placeholder.svg",
      message: "The market sentiment analysis tool is incredibly accurate today",
      time: "5 min ago",
      isOnline: true
    },
    {
      id: 3,
      user: "TradingGuru",
      avatar: "/placeholder.svg",
      message: "Remember to set stop losses, especially with the volatility we're seeing",
      time: "8 min ago",
      isOnline: false
    }
  ]

  const communityStats = [
    { label: "Active Members", value: "12,847", icon: Users },
    { label: "Forum Posts", value: "3,421", icon: MessageCircle },
    { label: "Expert Traders", value: "89", icon: TrendingUp }
  ]

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message logic here
      setNewMessage("")
    }
  }

  return (
    <>
      <SEOHead
        title="Community - Connect with AI Traders"
        description="Join our vibrant community of AI traders. Share strategies, get advice, and connect with fellow traders in our forums and live chat."
        keywords="trading community, trader forum, AI trading chat, trading strategies, market discussion"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Trading Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
              <Button>New Post</Button>
            </div>
            
            <div className="space-y-4">
              {forumPosts.map((post) => (
                <Card key={post.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src={post.avatar} />
                        <AvatarFallback>{post.author.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {post.isPinned && <Pin className="h-4 w-4 text-primary" />}
                          <h3 className="font-semibold">{post.title}</h3>
                          <Badge variant="outline">{post.category}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{post.preview}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>by {post.author}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.replies} replies
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {post.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  {chatMessages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.avatar} />
                          <AvatarFallback>{message.user.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        {message.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{message.user}</span>
                          <span className="text-xs text-muted-foreground">{message.time}</span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Top Traders This Month</CardTitle>
                <CardDescription>
                  Community leaderboard based on trading performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <div key={rank} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="w-8 text-center font-bold text-primary">#{rank}</div>
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>U{rank}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold">Trader{rank}Pro</div>
                        <div className="text-sm text-muted-foreground">
                          {rank === 1 ? "Elite Trader" : rank === 2 ? "Advanced Trader" : "Pro Trader"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-500">
                          +{(100 - rank * 10)}%
                        </div>
                        <div className="text-sm text-muted-foreground">ROI</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default Community