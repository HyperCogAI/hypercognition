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
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-3 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 md:space-y-6 pt-4 md:pt-8 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              AI{" "}
              <span className="text-white">
                Trading Assistant
              </span>
            </h1>
            <Badge variant="secondary" className="bg-primary/60 border border-white text-white text-xs sm:text-sm">
              Powered by GPT-5
            </Badge>
          </div>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Get intelligent market insights, personalized trading recommendations, and real-time analysis 
              to make better trading decisions with AI-powered assistance.
            </p>
          </div>

          <div className="space-y-6 md:space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 h-full">
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="flex items-center gap-2 md:gap-3 text-sm md:text-base">
                      <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                        <feature.icon className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                      </div>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* AI Trading Assistant Interface */}
            <AITradingAssistant
              selectedAgent={selectedAgent}
              portfolio={mockPortfolio}
              marketData={{}}
            />

            <Card 
              className="border-primary/20 relative overflow-hidden mt-6"
              style={{ 
                backgroundImage: `url(${gradientBlurMidBlue})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <CardContent className="p-6 md:p-12 text-center space-y-4 md:space-y-6">
                <Brain className="h-10 w-10 md:h-16 md:w-16 mx-auto text-primary" />
                <h3 className="text-xl md:text-3xl font-bold text-white">Need More Help?</h3>
                <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-lg leading-relaxed">
                  Try our voice assistant for hands-free trading guidance and real-time market insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-2 md:pt-4">
                  <VoiceAssistantModal selectedAgent={selectedAgent} portfolio={mockPortfolio} marketData={{}}>
                    <Button 
                      variant="default" 
                      size="lg"
                      className="gap-2 text-sm md:text-base"
                    >
                      <Mic className="h-4 w-4 md:h-5 md:w-5" />
                      Try Voice Mode
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