import { AgentMarketplace } from "@/components/sections/AgentMarketplace"
import { SEOHead } from "@/components/seo/SEOHead"

const Marketplace = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="AI Agent Marketplace - HyperCognition"
        description="Discover and trade AI agents in the most advanced marketplace. View trending agents, fundamental analysis, and real-time data."
        keywords="AI agents marketplace, trading agents, cryptocurrency trading, DeFi agents, AI trading bots"
      />
      <AgentMarketplace />
    </div>
  );
};

export default Marketplace;