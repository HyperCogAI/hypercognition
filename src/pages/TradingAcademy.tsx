import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Video, FileText, Trophy, Clock, Users } from "lucide-react"
import { SEOHead } from "@/components/seo/SEOHead"

const TradingAcademy = () => {
  const courses = [
    {
      id: 1,
      title: "AI Trading Fundamentals",
      description: "Learn the basics of AI-powered trading strategies and algorithms",
      level: "Beginner",
      duration: "4 hours",
      lessons: 12,
      progress: 0,
      price: "Free"
    },
    {
      id: 2,
      title: "Advanced Technical Analysis",
      description: "Master chart patterns, indicators, and market psychology",
      level: "Intermediate",
      duration: "6 hours",
      lessons: 18,
      progress: 35,
      price: "$99"
    },
    {
      id: 3,
      title: "Risk Management Strategies",
      description: "Protect your capital with proven risk management techniques",
      level: "Advanced",
      duration: "8 hours",
      lessons: 24,
      progress: 0,
      price: "$149"
    }
  ]

  const articles = [
    {
      title: "Understanding AI Trading Agents",
      category: "AI Technology",
      readTime: "5 min read",
      author: "Dr. Sarah Chen"
    },
    {
      title: "Market Volatility and Your Portfolio",
      category: "Risk Management",
      readTime: "8 min read",
      author: "Mike Johnson"
    },
    {
      title: "DeFi Integration Strategies",
      category: "DeFi",
      readTime: "12 min read",
      author: "Alex Rodriguez"
    }
  ]

  const webinars = [
    {
      title: "Live Market Analysis Session",
      date: "Today 2:00 PM EST",
      speaker: "Trading Expert Panel",
      participants: 1250
    },
    {
      title: "AI Agent Performance Review",
      date: "Tomorrow 3:00 PM EST",
      speaker: "Dr. Sarah Chen",
      participants: 890
    }
  ]

  return (
    <>
      <SEOHead
        title="Trading Academy - Learn AI Trading Strategies"
        description="Master AI trading with our comprehensive courses, tutorials, and expert guidance. From beginner to advanced strategies."
        keywords="trading education, AI trading courses, technical analysis, risk management, trading academy"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Trading Academy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master AI trading with expert-led courses, real-time market analysis, and proven strategies
          </p>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="webinars">Webinars</TabsTrigger>
            <TabsTrigger value="certification">Certification</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={course.level === "Beginner" ? "secondary" : 
                                   course.level === "Intermediate" ? "default" : "destructive"}>
                        {course.level}
                      </Badge>
                      <span className="text-sm font-semibold text-primary">{course.price}</span>
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.lessons} lessons
                      </span>
                    </div>
                    
                    {course.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}
                    
                    <Button className="w-full">
                      {course.progress > 0 ? "Continue Learning" : "Start Course"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="articles" className="space-y-6">
            <div className="grid gap-4">
              {articles.map((article, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Badge variant="outline">{article.category}</Badge>
                        <h3 className="text-lg font-semibold">{article.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>By {article.author}</span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {article.readTime}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Read</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="webinars" className="space-y-6">
            <div className="grid gap-4">
              {webinars.map((webinar, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{webinar.title}</h3>
                        <p className="text-muted-foreground">{webinar.date}</p>
                        <p className="text-sm">Speaker: {webinar.speaker}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {webinar.participants} registered
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4 mr-1" />
                          Join Live
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certification" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-8 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold mb-4">HyperCognition Trading Certification</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Earn official certification in AI trading strategies. Demonstrate your expertise and join an elite community of certified traders.
                </p>
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">3</div>
                    <div className="text-sm text-muted-foreground">Certification Levels</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">50+</div>
                    <div className="text-sm text-muted-foreground">Practice Tests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">90%</div>
                    <div className="text-sm text-muted-foreground">Pass Rate</div>
                  </div>
                </div>
                <Button size="lg">Start Certification Path</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default TradingAcademy