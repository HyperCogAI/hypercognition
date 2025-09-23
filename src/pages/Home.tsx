import { EnhancedHero } from "@/components/sections/EnhancedHero"
import { Stats } from "@/components/sections/Stats"
import { HyperFeatures } from "@/components/sections/HyperFeatures"
import { HyperCTA } from "@/components/sections/HyperCTA"
import { Footer } from "@/components/sections/Footer"
import EnhancedMarketNews from "@/components/news/EnhancedMarketNews"
import { AgentMarketplace } from "@/components/sections/AgentMarketplace"
import { SEOHead } from "@/components/seo/SEOHead"
import { generateWebsiteStructuredData, generateOrganizationStructuredData } from "@/components/seo/StructuredData"
import { useState, useEffect } from "react"

const Home = () => {
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  useEffect(() => {
    const isNewUser = !localStorage.getItem('onboarding_completed')
    if (isNewUser) {
      const timer = setTimeout(() => setShowOnboarding(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true')
    setShowOnboarding(false)
  }

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
        <EnhancedHero />
        <div className="container mx-auto px-4 py-8 space-y-12">
          <section className="mb-8">
            <EnhancedMarketNews />
          </section>
          <section id="marketplace" className="scroll-mt-16">
            <AgentMarketplace />
          </section>
        </div>
        <Stats />
        <HyperFeatures />
        <HyperCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;