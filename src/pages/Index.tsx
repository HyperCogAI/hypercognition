import { Hero } from "@/components/sections/Hero"
import { Stats } from "@/components/sections/Stats"
import { HyperFeatures } from "@/components/sections/HyperFeatures"
import { AgentMarketplace } from "@/components/sections/AgentMarketplace"
import { HyperCTA } from "@/components/sections/HyperCTA"
import { Footer } from "@/components/sections/Footer"
import { SEOHead } from "@/components/seo/SEOHead"
import { generateWebsiteStructuredData, generateOrganizationStructuredData } from "@/components/seo/StructuredData"

const Index = () => {
  const structuredData = [
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData()
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="HyperCognition - AI Agent Trading Marketplace"
        description="Co-own next-gen AI trading agents with equal early access through Hyper Points. Enjoy a fair 24h bidding system and get a full refund if milestones aren't met."
        keywords="AI trading agents, autonomous trading, cryptocurrency, DeFi, blockchain, trading bots, AI marketplace, HyperCognition"
        structuredData={structuredData}
      />
      <main>
        <Hero />
        <Stats />
        <HyperFeatures />
        <AgentMarketplace />
        <HyperCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
