import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useAITradingAssistant } from '@/hooks/useAITradingAssistant'
import { VoiceAssistantModal } from './VoiceAssistantModal'
import { Bot, User, Send, TrendingUp, TrendingDown, AlertTriangle, Loader2, Brain, Target, Shield, Zap, Mic } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AITradingAssistantProps {
  selectedAgent?: string
  portfolio?: any
  marketData?: any
}

export function AITradingAssistant({ selectedAgent, portfolio, marketData }: AITradingAssistantProps) {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const {
    loading,
    chatHistory,
    sendMessage,
    clearHistory,
    getMarketAnalysis,
    getPortfolioAdvice,
    getTradingSignals,
    getRiskAssessment,
    getMarketNews
  } = useAITradingAssistant()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return
    
    try {
      const context = {
        selectedAgent,
        portfolio,
        marketData
      }
      await sendMessage(message.trim(), context)
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'market-analysis':
          const agentIds = selectedAgent ? [selectedAgent] : (portfolio?.holdings?.map((h: any) => h.agent_id) || [])
          await getMarketAnalysis(agentIds)
          break
        case 'portfolio-advice':
          await getPortfolioAdvice(portfolio)
          break
        case 'trading-signals':
          if (selectedAgent) {
            await getTradingSignals(selectedAgent)
          } else {
            await sendMessage('Generate trading signals for the current market conditions')
          }
          break
        case 'risk-assessment':
          await getRiskAssessment(portfolio?.holdings || [])
          break
        case 'market-news':
          await getMarketNews()
          break
        default:
          await sendMessage(action)
      }
    } catch (error) {
      console.error('Quick action failed:', error)
    }
  }

  const renderRecommendation = (rec: any, idx: number) => (
    <div key={idx} className="p-3 bg-card rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge 
            variant={rec.action === 'buy' ? 'default' : rec.action === 'sell' ? 'destructive' : 'secondary'}
            className="font-medium"
          >
            {rec.action.toUpperCase()}
          </Badge>
          <span className="font-medium">{rec.agent_symbol}</span>
          <Badge variant="outline" className="text-xs">
            {rec.risk_level} risk
          </Badge>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{rec.confidence}% confidence</div>
          {rec.suggested_price && (
            <div className="text-xs text-muted-foreground">
              Target: ${rec.suggested_price.toFixed(4)}
            </div>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
    </div>
  )

  const renderMarketAnalysis = (analysis: any) => (
    <div className="p-3 bg-card rounded-lg border space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Market Analysis
        </h4>
        <Badge 
          variant={analysis.trend === 'bullish' ? 'default' : analysis.trend === 'bearish' ? 'destructive' : 'secondary'}
        >
          {analysis.trend}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Sentiment</div>
          <div className="flex items-center gap-2">
            <Progress value={analysis.sentiment} className="flex-1" />
            <span className="text-sm font-medium">{analysis.sentiment}%</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Volatility</div>
          <div className="flex items-center gap-2">
            <Progress value={analysis.volatility} className="flex-1" />
            <span className="text-sm font-medium">{analysis.volatility}%</span>
          </div>
        </div>
      </div>
      
      {analysis.key_factors && analysis.key_factors.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-2">Key Factors</div>
          <ul className="space-y-1">
            {analysis.key_factors.map((factor: string, idx: number) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {(analysis.support_levels || analysis.resistance_levels) && (
        <div className="grid grid-cols-2 gap-4 text-xs">
          {analysis.support_levels && (
            <div>
              <div className="text-muted-foreground mb-1">Support Levels</div>
              {analysis.support_levels.map((level: number, idx: number) => (
                <div key={idx} className="text-green-600">${level.toFixed(4)}</div>
              ))}
            </div>
          )}
          {analysis.resistance_levels && (
            <div>
              <div className="text-muted-foreground mb-1">Resistance Levels</div>
              {analysis.resistance_levels.map((level: number, idx: number) => (
                <div key={idx} className="text-red-600">${level.toFixed(4)}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="px-4 md:px-6 py-3 md:py-4 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Bot className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline">AI Trading Assistant</span>
            <span className="sm:hidden">AI Assistant</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {loading ? 'Analyzing...' : 'Ready'}
            </Badge>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearHistory}
            disabled={loading || chatHistory.length === 0}
            className="self-start sm:self-auto"
          >
            Clear Chat
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Actions */}
        <div className="px-4 md:px-6 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('market-analysis')}
              disabled={loading}
              className="flex flex-col items-center gap-1 h-14 md:h-auto md:flex-row"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs md:text-sm">Market</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('portfolio-advice')}
              disabled={loading}
              className="flex flex-col items-center gap-1 h-14 md:h-auto md:flex-row"
            >
              <Target className="h-4 w-4" />
              <span className="text-xs md:text-sm">Portfolio</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('trading-signals')}
              disabled={loading}
              className="flex flex-col items-center gap-1 h-14 md:h-auto md:flex-row"
            >
              <Zap className="h-4 w-4" />
              <span className="text-xs md:text-sm">Signals</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('risk-assessment')}
              disabled={loading}
              className="flex flex-col items-center gap-1 h-14 md:h-auto md:flex-row"
            >
              <Shield className="h-4 w-4" />
              <span className="text-xs md:text-sm">Risk</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('market-news')}
              disabled={loading}
              className="flex flex-col items-center gap-1 h-14 md:h-auto md:flex-row col-span-2 sm:col-span-1"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs md:text-sm">News</span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Chat Messages */}
        <ScrollArea className="flex-1 px-4 md:px-6 py-4">
          <div className="space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">AI Trading Assistant Ready</p>
                <p className="text-sm max-w-md mx-auto">
                  I analyze real-time market data to provide trading recommendations, 
                  risk assessments, and portfolio optimization insights. Try the quick 
                  actions above or ask me anything about trading.
                </p>
              </div>
            )}
            
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[85%] ${msg.type === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      msg.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  
                  {/* Render additional data for assistant messages */}
                  {msg.type === 'assistant' && msg.data && (
                    <div className="mt-3 space-y-3">
                      {/* Trading Recommendations */}
                      {msg.data.recommendations && msg.data.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Trading Recommendations
                          </p>
                          {msg.data.recommendations.map(renderRecommendation)}
                        </div>
                      )}
                      
                      {/* Market Analysis */}
                      {msg.data.market_analysis && renderMarketAnalysis(msg.data.market_analysis)}
                      
                      {/* Portfolio Insights */}
                      {msg.data.portfolio_insights && (
                        <div className="p-3 bg-card rounded-lg border">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Portfolio Insights
                          </h4>
                          <div className="grid grid-cols-3 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Total Value</div>
                              <div className="font-medium">${msg.data.portfolio_insights.total_value?.toFixed(2)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Risk Score</div>
                              <div className="font-medium">{msg.data.portfolio_insights.risk_score}/10</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Diversification</div>
                              <div className="font-medium">{msg.data.portfolio_insights.diversification_score}/10</div>
                            </div>
                          </div>
                          {msg.data.portfolio_insights.suggestions && (
                            <ul className="space-y-1">
                              {msg.data.portfolio_insights.suggestions.map((suggestion: string, idx: number) => (
                                <li key={idx} className="text-sm flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                  </p>
                </div>
                
                {msg.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Analyzing market data and generating insights...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator />

        {/* Message Input */}
        <div className="p-4 md:p-6">
          <div className="flex gap-2 mb-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about trading strategies, market analysis, risk management, or portfolio optimization..."
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !message.trim()}
              size="icon"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Voice Interface Toggle */}
          <VoiceAssistantModal selectedAgent={selectedAgent} portfolio={portfolio} marketData={marketData}>
            <Button
              variant="outline"
              size="default"
              className="w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              <Mic className="h-4 w-4" />
              Switch to Voice Mode
            </Button>
          </VoiceAssistantModal>
        </div>
      </CardContent>
    </Card>
  )
}

export default AITradingAssistant