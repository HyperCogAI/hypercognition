import { Navigation } from "@/components/layout/Navigation"
import { Hero } from "@/components/sections/Hero"
import { AgentMarketplace } from "@/components/sections/AgentMarketplace"
import { HyperFeatures } from "@/components/sections/HyperFeatures"
import { HyperCTA } from "@/components/sections/HyperCTA"

const Index = () => {
  console.log("Index component is rendering");
  
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">HyperCognition AI DEX</h1>
        <p className="text-muted-foreground mb-8">Welcome to the AI agent marketplace</p>
        <AgentMarketplace />
      </div>
    </div>
  );
};

export default Index;
