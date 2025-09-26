import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, TrendingUp, Target, Zap, BarChart3, AlertCircle, Lightbulb, Cpu, LineChart, Activity } from "lucide-react"
import { SEOHead } from "@/components/seo/SEOHead"

interface AIInsight {
  id: string
  type: 'prediction' | 'recommendation' | 'alert' | 'optimization'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  category: string
  timestamp: string
  data?: any
}

interface MarketPrediction {
  symbol: string
  currentPrice: number
  predictedPrice: number
  timeframe: '1h' | '4h' | '1d' | '1w'
  confidence: number
  factors: string[]
}

const AdvancedAI = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1d")
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [predictions, setPredictions] = useState<MarketPrediction[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isUpdating, setIsUpdating] = useState(false)

  // Generate dynamic AI insights with real-time updates
  const generateInsights = () => {
    const insightTemplates = [
      {
        type: "prediction" as const,
        titles: [
          "ALPHA Token Bullish Breakout Predicted",
          "ETH Cross-Chain Bridge Activity Surge",
          "BTC Mining Difficulty Adjustment Impact",
          "DeFi TVL Momentum Building"
        ],
        descriptions: [
          "ML models indicate {confidence}% probability of upward breakout within 24h based on volume surge and technical patterns",
          "Neural network analysis shows {confidence}% chance of price increase due to institutional accumulation patterns",
          "Transformer model predicts {confidence}% likelihood of trend continuation based on on-chain metrics",
          "LSTM analysis indicates {confidence}% probability of resistance level breakthrough"
        ],
        category: "Technical Analysis"
      },
      {
        type: "recommendation" as const,
        titles: [
          "Portfolio Rebalancing Suggested",
          "Risk Exposure Optimization Alert",
          "Correlation-Based Asset Rotation",
          "Liquidity Pool Reallocation Advised"
        ],
        descriptions: [
          "Current allocation suboptimal. Recommend reducing exposure to DeFi tokens by {percentage}% based on correlation analysis",
          "Risk-adjusted returns could improve by {percentage}% through sector diversification adjustments",
          "Cross-asset correlation analysis suggests {percentage}% reallocation to maximize Sharpe ratio",
          "Portfolio concentration risk detected. Suggest {percentage}% reduction in top holdings"
        ],
        category: "Portfolio Management"
      },
      {
        type: "alert" as const,
        titles: [
          "Unusual Trading Pattern Detected",
          "Whale Movement Alert",
          "Market Maker Activity Surge",
          "Cross-Exchange Arbitrage Opportunity"
        ],
        descriptions: [
          "BETA agent showing abnormal volume spike (+{percentage}%) with whale accumulation signals",
          "Large wallet movement detected: {percentage}% of circulating supply transferred",
          "Orderbook imbalance detected with {percentage}% buy-side dominance",
          "Price differential of {percentage}% detected across major exchanges"
        ],
        category: "Market Anomaly"
      },
      {
        type: "optimization" as const,
        titles: [
          "Stop-Loss Optimization Available",
          "Take-Profit Level Adjustment",
          "Position Sizing Recommendation",
          "Trade Timing Enhancement"
        ],
        descriptions: [
          "Dynamic stop-loss adjustment could improve risk-adjusted returns by {percentage}% based on volatility modeling",
          "Optimal take-profit levels suggest {percentage}% improvement in win rate",
          "Kelly criterion analysis recommends {percentage}% position size adjustment",
          "Market microstructure analysis suggests {percentage}% execution cost reduction"
        ],
        category: "Risk Management"
      }
    ];

    const impacts: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    const now = new Date();
    
    return Array.from({ length: 4 }, (_, index) => {
      const template = insightTemplates[index % insightTemplates.length];
      const titleIndex = Math.floor(Math.random() * template.titles.length);
      const descIndex = Math.floor(Math.random() * template.descriptions.length);
      
      const confidence = 60 + Math.random() * 35; // 60-95%
      const percentage = Math.floor(Math.random() * 25) + 5; // 5-30%
      
      // Generate timestamps in the last 6 hours
      const minutesAgo = Math.floor(Math.random() * 360); // 0-6 hours
      const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();
      
      return {
        id: `insight_${Date.now()}_${index}`,
        type: template.type,
        title: template.titles[titleIndex],
        description: template.descriptions[descIndex]
          .replace('{confidence}', Math.floor(confidence).toString())
          .replace('{percentage}', percentage.toString()),
        confidence: Math.floor(confidence),
        impact: impacts[Math.floor(Math.random() * impacts.length)],
        category: template.category,
        timestamp
      };
    });
  };

  const generatePredictions = () => {
    const symbols = ["ALPHA", "BETA", "GAMMA", "DELTA", "EPSILON"];
    const factors = [
      ["Volume surge", "RSI oversold", "Whale accumulation"],
      ["Resistance level", "Market correlation", "Options flow"],
      ["Technical breakout", "Social sentiment", "News catalyst"],
      ["Support retest", "DeFi integration", "Tokenomics update"],
      ["Cross-chain bridge", "Yield farming", "Governance proposal"]
    ];

    return Array.from({ length: 3 }, (_, index) => {
      const symbol = symbols[index % symbols.length];
      const basePrice = 0.5 + Math.random() * 3; // $0.50 - $3.50
      const priceChange = (Math.random() - 0.5) * 0.4; // ±20% max change
      const predictedPrice = basePrice + priceChange;
      
      return {
        symbol,
        currentPrice: Number(basePrice.toFixed(3)),
        predictedPrice: Number(predictedPrice.toFixed(3)),
        timeframe: selectedTimeframe as '1h' | '4h' | '1d' | '1w',
        confidence: Math.floor(60 + Math.random() * 35), // 60-95%
        factors: factors[index % factors.length]
      };
    });
  };

    // Initialize data and set up real-time updates
  useEffect(() => {
    const updateData = () => {
      setIsUpdating(true);
      setInsights(generateInsights());
      setPredictions(generatePredictions());
      setLastUpdate(new Date());
      
      // Show updating indicator for a brief moment
      setTimeout(() => setIsUpdating(false), 1000);
    };

    // Initial load
    updateData();

    // Update every 30 seconds for real-time feel
    const interval = setInterval(updateData, 30000);

    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="h-5 w-5" />
      case 'recommendation': return <Lightbulb className="h-5 w-5" />
      case 'alert': return <AlertCircle className="h-5 w-5" />
      case 'optimization': return <Target className="h-5 w-5" />
      default: return <Brain className="h-5 w-5" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-500"
    if (confidence >= 60) return "text-yellow-500"
    return "text-orange-500"
  }

  const getImpactVariant = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      default: return 'secondary'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now.getTime() - time.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  const calculatePriceChange = (current: number, predicted: number) => {
    return ((predicted - current) / current * 100).toFixed(2)
  }

  return (
    <>
      <SEOHead
        title="Advanced AI Insights - ML-Powered Trading Analytics"
        description="Get cutting-edge AI insights with machine learning predictions, market analysis, and intelligent trading recommendations powered by advanced algorithms."
        keywords="AI trading insights, machine learning predictions, algorithmic analysis, AI recommendations, advanced trading AI"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Advanced{" "}
            <span className="text-white">
              AI Insights
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Harness the power of machine learning for intelligent trading decisions and market predictions
          </p>
        </div>

        {/* AI Performance Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">94.2%</div>
              <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <Cpu className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">847</div>
              <div className="text-sm text-muted-foreground">Models Running</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">2.3TB</div>
              <div className="text-sm text-muted-foreground">Data Processed</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">12ms</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold">Real-time AI Insights</h2>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`} />
                  <span className="text-sm text-muted-foreground">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technical">Technical Analysis</SelectItem>
                  <SelectItem value="portfolio">Portfolio Management</SelectItem>
                  <SelectItem value="risk">Risk Management</SelectItem>
                  <SelectItem value="market">Market Anomaly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getInsightIcon(insight.type)}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{insight.title}</h3>
                            <p className="text-muted-foreground mt-1">{insight.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getImpactVariant(insight.impact)}>
                              {insight.impact} impact
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatTimeAgo(insight.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{insight.category}</Badge>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Confidence:</span>
                              <span className={`font-medium ${getConfidenceColor(insight.confidence)}`}>
                                {insight.confidence}%
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                        
                        <Progress value={insight.confidence} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">ML Price Predictions</h2>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="1w">1 Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {predictions.map((prediction, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{prediction.symbol}</CardTitle>
                      <Badge variant="outline">{prediction.timeframe}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Price</span>
                        <span className="font-medium">${prediction.currentPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Predicted Price</span>
                        <span className="font-medium">${prediction.predictedPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expected Change</span>
                        <span className={`font-medium ${
                          Number(calculatePriceChange(prediction.currentPrice, prediction.predictedPrice)) > 0 
                            ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {calculatePriceChange(prediction.currentPrice, prediction.predictedPrice)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Confidence</span>
                        <span className={`font-medium ${getConfidenceColor(prediction.confidence)}`}>
                          {prediction.confidence}%
                        </span>
                      </div>
                      <Progress value={prediction.confidence} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Key Factors:</span>
                      <div className="flex flex-wrap gap-1">
                        {prediction.factors.map((factor, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Market Sentiment Analysis</CardTitle>
                <CardDescription>
                  AI-powered sentiment analysis from multiple data sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center p-6 bg-card/50 border border-border/50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">Bullish</div>
                    <div className="text-sm text-muted-foreground">Overall Market</div>
                    <div className="text-xs text-muted-foreground mt-1">Confidence: 76%</div>
                  </div>
                  <div className="text-center p-6 bg-card/50 border border-border/50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">Neutral</div>
                    <div className="text-sm text-muted-foreground">Social Media</div>
                    <div className="text-xs text-muted-foreground mt-1">Confidence: 82%</div>
                  </div>
                  <div className="text-center p-6 bg-card/50 border border-border/50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-2">Cautious</div>
                    <div className="text-sm text-muted-foreground">Institutional</div>
                    <div className="text-xs text-muted-foreground mt-1">Confidence: 89%</div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="font-medium mb-4">Sentiment Drivers</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Regulatory News</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-green-500" style={{ width: '70%' }} />
                        </div>
                        <span className="text-sm text-green-500">+70%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Market Volume</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-blue-500" style={{ width: '45%' }} />
                        </div>
                        <span className="text-sm text-blue-500">+45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fear & Greed Index</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="h-2 rounded-full bg-orange-500" style={{ width: '30%' }} />
                        </div>
                        <span className="text-sm text-orange-500">-30%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Active ML Models</CardTitle>
                  <CardDescription>
                    Currently deployed machine learning models
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "LSTM Price Predictor", accuracy: "94.2%", status: "Active" },
                    { name: "Sentiment Analyzer", accuracy: "87.5%", status: "Active" },
                    { name: "Volume Anomaly Detector", accuracy: "91.8%", status: "Active" },
                    { name: "Portfolio Optimizer", accuracy: "89.3%", status: "Training" }
                  ].map((model, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">Accuracy: {model.accuracy}</div>
                      </div>
                      <Badge variant={model.status === "Active" ? "default" : "secondary"}>
                        {model.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Model Performance</CardTitle>
                  <CardDescription>
                    Real-time performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <LineChart className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <div className="text-2xl font-bold">847</div>
                      <div className="text-sm text-muted-foreground">Models Deployed</div>
                    </div>
                    
                    <div className="grid gap-4 grid-cols-2">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold text-green-500">↑ 12.3%</div>
                        <div className="text-xs text-muted-foreground">Avg Accuracy</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold text-blue-500">2.1s</div>
                        <div className="text-xs text-muted-foreground">Training Time</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default AdvancedAI