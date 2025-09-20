import { Navigation } from "@/components/layout/Navigation"
import { Hero } from "@/components/sections/Hero"
import { Stats } from "@/components/sections/Stats"
import { HyperFeatures } from "@/components/sections/HyperFeatures"
import { AgentMarketplace } from "@/components/sections/AgentMarketplace"
import { HyperCTA } from "@/components/sections/HyperCTA"
import { Footer } from "@/components/sections/Footer"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
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
