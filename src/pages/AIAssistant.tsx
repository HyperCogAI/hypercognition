import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import VoiceInterface from '@/components/ai/VoiceInterface'
import { SEOHead } from '@/components/seo/SEOHead'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Mic, 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Zap,
  Brain,
  Activity
} from 'lucide-react'

export function AIAssistantPage() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const features = [
    {
      icon: TrendingUp,
      title: "Market Analysis",
      description: "Get real-time insights on market trends, agent performance, and trading opportunities"
    },
    {
      icon: BarChart3,
      title: "Portfolio Review",
      description: "Analyze your holdings, performance metrics, and optimization suggestions"
    },
    {
      icon: DollarSign,
      title: "Trading Guidance",
      description: "Receive personalized trading advice based on your risk profile and goals"
    },
    {
      icon: Brain,
      title: "AI Agent Insights",
      description: "Deep dive into AI agent strategies, performance, and potential"
    }
  ]

  return (
    <>
      <SEOHead
        title="AI Trading Assistant | Voice-Powered Trading Support"
        description="Get real-time trading advice and market analysis through our advanced AI assistant. Voice-enabled trading support for the AI agent marketplace."
        keywords="AI trading assistant, voice trading, market analysis, trading advice, AI agent trading"
        url="https://hypercognition.lovable.app/ai-assistant"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="relative">
                <div className={`w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center transition-all duration-300 ${
                  isSpeaking ? 'ring-4 ring-primary/30 animate-pulse' : ''
                }`}>
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                {isSpeaking && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Activity className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AI Trading Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your intelligent trading companion powered by advanced AI. Get real-time market insights, 
              trading advice, and platform guidance through voice or text.
            </p>
          </div>

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat Interface
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Features
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-8">
              <div className="max-w-4xl mx-auto">
                <VoiceInterface onSpeakingChange={setIsSpeaking} />
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-8">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <Card key={index} className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <feature.icon className="w-5 h-5 text-primary" />
                          </div>
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Capabilities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Capabilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Mic className="w-4 h-4 text-primary" />
                          Voice Interaction
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Natural voice conversations with real-time audio responses
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          Market Intelligence
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Real-time market analysis and trend identification
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          Portfolio Analytics
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Deep portfolio analysis and optimization recommendations
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Bot className="w-4 h-4 text-primary" />
                          Agent Insights
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Detailed AI agent performance and strategy analysis
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          Trading Advice
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Personalized trading recommendations and risk assessment
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          Platform Guidance
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Step-by-step help with platform features and navigation
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tips for Best Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">1</Badge>
                        <div>
                          <p className="font-medium">Use a quiet environment</p>
                          <p className="text-sm text-muted-foreground">
                            For best voice recognition, use the assistant in a quiet space with minimal background noise.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">2</Badge>
                        <div>
                          <p className="font-medium">Speak clearly and naturally</p>
                          <p className="text-sm text-muted-foreground">
                            The AI understands natural language, so speak as you would to a human trading advisor.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">3</Badge>
                        <div>
                          <p className="font-medium">Be specific with your questions</p>
                          <p className="text-sm text-muted-foreground">
                            The more context you provide, the better the AI can tailor its advice to your needs.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">4</Badge>
                        <div>
                          <p className="font-medium">Use both voice and text</p>
                          <p className="text-sm text-muted-foreground">
                            Switch between voice and text input based on your preference and environment.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}