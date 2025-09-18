import { Navigation } from "@/components/layout/Navigation"
import { Hero } from "@/components/sections/Hero"
import { Features } from "@/components/sections/Features"
import { CTA } from "@/components/sections/CTA"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
    </div>
  );
};

export default Index;
