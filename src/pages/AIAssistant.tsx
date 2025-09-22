import React, { useState } from 'react';
import AITradingAssistant from '@/components/ai/AITradingAssistant';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, Target, Shield, Zap, BarChart3, Mic } from 'lucide-react';
import { VoiceAssistantModal } from '@/components/ai/VoiceAssistantModal';

const AIAssistant = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>();

  // Mock portfolio data - in real app this would come from portfolio hook
  const mockPortfolio = {
    total_value: 5420.32,
    holdings: [
      { agent_id: '1', agent_symbol: 'ALICE', amount: 100, value: 1250.50 },
      { agent_id: '2', agent_symbol: 'BOB', amount: 250, value: 2100.75 },
      { agent_id: '3', agent_symbol: 'CHARLIE', amount: 75, value: 2069.07 }
    ]
  };

  const features = [
    {
      icon: Brain,
      title: "Intelligent Analysis",
      description: "Advanced AI algorithms analyze market patterns, sentiment, and technical indicators in real-time"
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description: "Get deep insights into market trends, price movements, and emerging opportunities"
    },
    {
      icon: Target,
      title: "Portfolio Optimization",
      description: "Receive personalized recommendations to optimize your portfolio performance and risk"
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Comprehensive risk analysis with actionable recommendations for better risk management"
    },
    {
      icon: Zap,
      title: "Trading Signals",
      description: "Real-time trading signals with precise entry/exit points and confidence levels"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track and analyze your trading performance with detailed metrics and insights"
    }
  ];

  return (
    <>
      <SEOHead 
        title="AI Trading Assistant - Get Intelligent Market Insights | HyperCognition"
        description="Access AI-powered trading insights, market analysis, and personalized trading recommendations for AI agent investments with real-time data analysis."
        keywords="AI trading assistant, market analysis, trading insights, portfolio optimization, AI recommendations"
      />
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">AI Trading Assistant</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Powered by GPT-4
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get intelligent market insights, personalized trading recommendations, and real-time analysis 
              to make better trading decisions with AI-powered assistance.
            </p>
          </div>

          <Tabs defaultValue="assistant" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="assistant" className="space-y-6">
              <AITradingAssistant 
                selectedAgent={selectedAgent}
                portfolio={mockPortfolio}
                marketData={{}}
              />
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <feature.icon className="h-5 w-5 text-primary" />
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

              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-8 text-center space-y-4">
                  <Brain className="h-12 w-12 mx-auto text-primary" />
                  <h3 className="text-2xl font-bold">Ready to Start Trading Smarter?</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Our AI assistant is trained on vast amounts of market data and uses advanced 
                    machine learning to provide you with the best possible trading insights.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => setSelectedAgent(undefined)} size="lg" className="gap-2">
                      <Zap className="h-4 w-4" />
                      Try AI Assistant Now
                    </Button>
                    <VoiceAssistantModal selectedAgent={selectedAgent} portfolio={mockPortfolio} marketData={{}}>
                      <Button variant="outline" size="lg" className="gap-2">
                        <Mic className="h-4 w-4" />
                        Voice Mode
                      </Button>
                    </VoiceAssistantModal>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;