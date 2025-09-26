import React, { useState } from 'react';
import gradientBlurMidBlue from '@/assets/gradient_blur_mid_blue-2.png';
import AITradingAssistant from '@/components/ai/AITradingAssistant';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-6">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6 pt-8 pb-4">
            <div className="flex items-center justify-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-white leading-tight">
                AI{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Trading Assistant
                </span>
              </h1>
              <Badge variant="secondary" className="bg-primary/60 border border-white text-white">
                Powered by GPT-4
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get intelligent market insights, personalized trading recommendations, and real-time analysis 
              to make better trading decisions with AI-powered assistance.
            </p>
          </div>

          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 h-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card 
              className="border-primary/20 relative overflow-hidden"
              style={{ 
                backgroundImage: `url(${gradientBlurMidBlue})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <CardContent className="p-12 text-center space-y-6">
                <Brain className="h-16 w-16 mx-auto text-primary" />
                <h3 className="text-3xl font-bold text-white">Ready to Start Trading Smarter?</h3>
                <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed">
                  Our AI assistant is trained on vast amounts of market data and uses advanced 
                  machine learning to provide you with the best possible trading insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button 
                    onClick={() => setSelectedAgent(undefined)} 
                    size="lg" 
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Try AI Assistant Now
                  </Button>
                  <VoiceAssistantModal selectedAgent={selectedAgent} portfolio={mockPortfolio} marketData={{}}>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="gap-2 border-white/30 text-white hover:bg-white/10 px-8 py-3"
                    >
                      <Mic className="h-5 w-5" />
                      Voice Mode
                    </Button>
                  </VoiceAssistantModal>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;