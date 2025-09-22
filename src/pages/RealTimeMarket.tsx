import React, { useState, useEffect } from 'react';
import { RealTimeMarketDashboard } from '@/components/trading/RealTimeMarketDashboard';
import { SEOHead } from '@/components/seo/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Agent {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  change_percent_24h: number;
  volume_24h: number;
}

export const RealTimeMarketPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // Fetch agents data
        const { data: agentsData, error } = await supabase
          .from('agents')
          .select('id, symbol, name, price, change_24h, volume_24h')
          .order('market_cap', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (agentsData) {
          const formattedAgents: Agent[] = agentsData.map(agent => ({
            id: agent.id,
            symbol: agent.symbol,
            name: agent.name,
            price: parseFloat(agent.price.toString()),
            change_24h: parseFloat(agent.change_24h.toString()),
            change_percent_24h: parseFloat(agent.change_24h.toString()) / parseFloat(agent.price.toString()) * 100,
            volume_24h: parseFloat(agent.volume_24h.toString())
          }));

          setAgents(formattedAgents);
          
          // Select first agent by default
          if (formattedAgents.length > 0) {
            setSelectedAgentId(formattedAgents[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        
        // Fallback to mock data
        const mockAgents: Agent[] = [
          {
            id: 'agent-1',
            symbol: 'AGENT-1',
            name: 'AI Trading Bot Alpha',
            price: 2.45,
            change_24h: 0.12,
            change_percent_24h: 5.14,
            volume_24h: 125430
          },
          {
            id: 'agent-2',
            symbol: 'AGENT-2',
            name: 'DeFi Arbitrage Agent',
            price: 1.87,
            change_24h: -0.03,
            change_percent_24h: -1.58,
            volume_24h: 89650
          },
          {
            id: 'agent-3',
            symbol: 'AGENT-3',
            name: 'Smart Portfolio Manager',
            price: 3.21,
            change_24h: 0.18,
            change_percent_24h: 5.94,
            volume_24h: 201300
          },
          {
            id: 'agent-4',
            symbol: 'AGENT-4',
            name: 'Yield Optimizer Pro',
            price: 0.95,
            change_24h: 0.05,
            change_percent_24h: 5.56,
            volume_24h: 67890
          },
          {
            id: 'agent-5',
            symbol: 'AGENT-5',
            name: 'Risk Management AI',
            price: 4.12,
            change_24h: -0.08,
            change_percent_24h: -1.90,
            volume_24h: 156780
          },
          {
            id: 'agent-6',
            symbol: 'AGENT-6',
            name: 'Liquidity Hunter',
            price: 1.56,
            change_24h: 0.09,
            change_percent_24h: 6.12,
            volume_24h: 98450
          },
          {
            id: 'agent-7',
            symbol: 'AGENT-7',
            name: 'Market Maker Bot',
            price: 2.89,
            change_24h: 0.14,
            change_percent_24h: 5.09,
            volume_24h: 187650
          },
          {
            id: 'agent-8',
            symbol: 'AGENT-8',
            name: 'Sentiment Analyzer',
            price: 1.23,
            change_24h: -0.02,
            change_percent_24h: -1.60,
            volume_24h: 76540
          }
        ];
        
        setAgents(mockAgents);
        setSelectedAgentId(mockAgents[0].id);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <>
        <SEOHead 
          title="Real-Time Market Data | HyperCognition"
          description="Monitor live market data, order books, and trading activity for AI agents in real-time."
          keywords="real-time market data, live trading, order book, market feeds"
        />
        
        <div className="container mx-auto p-6 space-y-8">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Real-Time Market Data | HyperCognition"
        description="Monitor live market data, order books, and trading activity for AI agents in real-time. Get instant access to price feeds, trading volumes, and market depth."
        keywords="real-time market data, live trading, order book, market feeds, trading dashboard, live prices"
      />
      
      <div className="container mx-auto p-6">
        <RealTimeMarketDashboard
          agents={agents}
          selectedAgentId={selectedAgentId}
          onAgentSelect={setSelectedAgentId}
        />
      </div>
    </>
  );
};