import { Navigation } from "@/components/layout/Navigation"
import { Hero } from "@/components/sections/Hero"
import { AgentMarketplace } from "@/components/sections/AgentMarketplace"
import { HyperFeatures } from "@/components/sections/HyperFeatures"
import { HyperCTA } from "@/components/sections/HyperCTA"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <AgentMarketplace />
        <HyperFeatures />
        <HyperCTA />
      </main>
    </div>
  );
};

export default Index;
