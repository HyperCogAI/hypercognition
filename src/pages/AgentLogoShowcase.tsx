import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useAgentLogo } from '@/hooks/useAgentLogo'
import { Loader2, Sparkles, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { generateLogosForPlaceholderAgents } from '@/utils/generateAgentLogos'

interface Agent {
  id: string
  name: string
  symbol: string
  description: string
  price: number
  market_cap: number
  volume_24h: number
  change_24h: number
  chain: string
  avatar_url: string | null
  logo_generated: boolean
  logo_style: string | null
}

const AgentLogoShowcase = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const { generateLogo } = useAgentLogo()

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('market_cap', { ascending: false })

      if (error) throw error
      setAgents(data || [])
    } catch (error) {
      console.error('Error fetching agents:', error)
      toast.error('Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateLogo = async (agent: Agent) => {
    setGeneratingId(agent.id)
    
    try {
      const result = await generateLogo(
        agent.name, 
        agent.symbol, 
        agent.logo_style || 'modern minimalist',
        agent.id
      )
      
      if (result) {
        await fetchAgents()
        toast.success(`Logo generated for ${agent.name}!`)
      }
    } catch (error) {
      console.error('Error generating logo:', error)
      toast.error('Failed to generate logo')
    } finally {
      setGeneratingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Logo Showcase</h1>
          <p className="text-muted-foreground">
            AI-generated logos for trading agents via Edge Function
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAgents} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={async () => { await generateLogosForPlaceholderAgents(); await fetchAgents(); }} variant="default">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate All Logos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{agent.symbol}</p>
                </div>
                <Badge variant="secondary">{agent.chain}</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Logo Display */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-lg border border-border/50 flex items-center justify-center bg-card/50">
                  {agent.avatar_url && !agent.avatar_url.includes('placeholder') ? (
                    <img 
                      src={agent.avatar_url} 
                      alt={`${agent.name} logo`}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">
                      {agent.symbol.substring(0, 2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span>${agent.price.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap:</span>
                  <span>${(agent.market_cap / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Change:</span>
                  <span className={agent.change_24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {agent.change_24h >= 0 ? '+' : ''}{agent.change_24h.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Generate Logo Button */}
              <Button 
                onClick={() => handleGenerateLogo(agent)}
                disabled={generatingId === agent.id}
                className="w-full"
                variant={agent.logo_generated ? "outline" : "default"}
              >
                {generatingId === agent.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {agent.logo_generated ? 'Regenerate Logo' : 'Generate Logo'}
                  </>
                )}
              </Button>

              {agent.logo_style && (
                <p className="text-xs text-muted-foreground text-center">
                  Style: {agent.logo_style}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AgentLogoShowcase