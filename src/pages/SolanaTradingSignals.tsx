import { SolanaTradingSignals } from "@/components/trading/SolanaTradingSignals"
import { SEOHead } from "@/components/seo/SEOHead"

const SolanaTradingSignalsPage = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <SEOHead 
        title="Solana Trading Signals - HyperCognition"
        description="AI-powered trading signals for Solana tokens. Get real-time buy/sell recommendations with confidence scores and technical analysis."
        keywords="Solana trading signals, SOL trading, SPL token signals, crypto trading alerts, AI trading"
      />
      <SolanaTradingSignals />
    </div>
  )
}

export default SolanaTradingSignalsPage