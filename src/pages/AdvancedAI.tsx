import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, MessageSquare, TrendingUp, Zap } from "lucide-react"
import { SEOHead } from "@/components/seo/SEOHead"
import AITradingAssistant from "@/components/ai/AITradingAssistant"
import { useAITradingAssistant } from "@/hooks/useAITradingAssistant"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { RealTimeTicker } from "@/components/trading/RealTimeTicker"
import { WalletSection } from "@/components/wallet/WalletSection"
interface Agent {
  id: string
  symbol: string
  name: string
  price: number
  change_24h: number
}

const AdvancedAI = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>()
  const [agents, setAgents] = useState<Agent[]>([])
  const [portfolio, setPortfolio] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("assistant")
  const { toast } = useToast()
  
  const {
    loading,
    getMarketAnalysis,
    getPortfolioAdvice,
    getTradingSignals,
    getRiskAssessment
  } = useAITradingAssistant()

  // Load real agents from database
  useEffect(() => {
    const loadAgents = async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('id, symbol, name, price, change_24h')
        .order('market_cap', { ascending: false })
        .limit(10)

      if (data && !error) {
        setAgents(data)
      }
    }

    loadAgents()
  }, [])

  // Portfolio insights require connected wallet; we show WalletSection when not connected

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'market':
          if (agents.length > 0) {
            await getMarketAnalysis(agents.slice(0, 5).map(a => a.id))
          }
          break
        case 'portfolio':
          if (portfolio) {
            await getPortfolioAdvice(portfolio)
          }
          break
        case 'signals':
          if (selectedAgent) {
            await getTradingSignals(selectedAgent)
          } else if (agents.length > 0) {
            await getTradingSignals(agents[0].id)
          }
          break
        case 'risk':
          if (portfolio?.holdings) {
            await getRiskAssessment(portfolio.holdings)
          }
          break
      }
      // Show results in the Assistant tab
      setActiveTab('assistant')
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not complete AI analysis. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <SEOHead
        title="Advanced AI Trading - Real-Time Insights & Analysis"
        description="Get real-time AI-powered trading insights, market analysis, and intelligent recommendations using advanced machine learning."
        keywords="AI trading, machine learning, market analysis, trading insights, real-time AI"
      />
      
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-2 md:mb-4">
            Advanced AI Trading
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Get real-time insights powered by advanced machine learning and natural language processing
          </p>
        </div>

        <div className="mb-6">
          <RealTimeTicker />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="assistant">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="market">
              <TrendingUp className="h-4 w-4 mr-2" />
              Market Analysis
            </TabsTrigger>
            <TabsTrigger value="portfolio">
              <Brain className="h-4 w-4 mr-2" />
              Portfolio Insights
            </TabsTrigger>
            <TabsTrigger value="signals">
              <Zap className="h-4 w-4 mr-2" />
              Trading Signals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assistant" className="space-y-6">
            <AITradingAssistant
              selectedAgent={selectedAgent}
              portfolio={portfolio}
              marketData={{ agents }}
            />
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Get comprehensive AI-powered analysis of current market conditions, trends, and opportunities.
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {agents.slice(0, 6).map((agent) => (
                    <Card key={agent.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{agent.symbol}</h3>
                          <span className={agent.change_24h >= 0 ? "text-green-500" : "text-red-500"}>
                            {agent.change_24h >= 0 ? "+" : ""}{agent.change_24h?.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{agent.name}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setSelectedAgent(agent.id)
                            handleQuickAction('signals')
                          }}
                          disabled={loading}
                        >
                          Analyze {agent.symbol}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button 
                  onClick={() => handleQuickAction('market')}
                  disabled={loading || agents.length === 0}
                  className="w-full"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {loading ? "Analyzing..." : "Analyze All Markets"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolio ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="bg-card/50">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                          <p className="text-2xl font-bold">${portfolio.total_value.toFixed(2)}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-card/50">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground mb-1">Holdings</p>
                          <p className="text-2xl font-bold">{portfolio.holdings.length}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <Button 
                      onClick={() => handleQuickAction('portfolio')}
                      disabled={loading}
                      className="w-full"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      {loading ? "Analyzing..." : "Get AI Portfolio Analysis"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Connect your wallet to get personalized portfolio insights
                    </p>
                    <div className="max-w-sm mx-auto">
                      <WalletSection />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Get AI-generated trading signals with precise entry/exit points and risk management recommendations.
                </p>
                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Agent for Signals</label>
                  <div className="grid gap-2">
                    {agents.slice(0, 5).map((agent) => (
                      <Button
                        key={agent.id}
                        variant={selectedAgent === agent.id ? "default" : "outline"}
                        onClick={() => setSelectedAgent(agent.id)}
                        className="justify-start"
                      >
                        <span className="font-semibold mr-2">{agent.symbol}</span>
                        <span className="text-muted-foreground">${agent.price?.toFixed(4)}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={() => handleQuickAction('signals')}
                  disabled={loading || !selectedAgent}
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {loading ? "Generating..." : "Generate Trading Signals"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                onClick={() => handleQuickAction('market')}
                disabled={loading}
                className="h-auto py-4 flex-col gap-2"
              >
                <TrendingUp className="h-5 w-5" />
                <span>Market Overview</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleQuickAction('portfolio')}
                disabled={loading || !portfolio}
                className="h-auto py-4 flex-col gap-2"
              >
                <Brain className="h-5 w-5" />
                <span>Portfolio Review</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleQuickAction('signals')}
                disabled={loading || !selectedAgent}
                className="h-auto py-4 flex-col gap-2"
              >
                <Zap className="h-5 w-5" />
                <span>Get Signals</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleQuickAction('risk')}
                disabled={loading || !portfolio}
                className="h-auto py-4 flex-col gap-2"
              >
                <Brain className="h-5 w-5" />
                <span>Risk Assessment</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default AdvancedAI
