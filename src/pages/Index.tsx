import { Navigation } from "@/components/layout/Navigation"
import { Hero } from "@/components/sections/Hero"
import { Stats } from "@/components/sections/Stats"
import { HyperFeatures } from "@/components/sections/HyperFeatures"
import { AgentMarketplace } from "@/components/sections/AgentMarketplace"
import { Testimonials } from "@/components/sections/Testimonials"
import { HyperCTA } from "@/components/sections/HyperCTA"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <Stats />
        <HyperFeatures />
        <AgentMarketplace />
        <Testimonials />
        <HyperCTA />
      </main>
    </div>
  );
};

export default Index;
