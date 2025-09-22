import { LiveTradingDashboard } from '@/components/trading/LiveTradingDashboard'
import { SEOHead } from '@/components/seo/SEOHead'

export function RealTimeMarketPage() {
  return (
    <>
      <SEOHead
        title="Real-Time Market Trading | AI Agent Trading Platform"
        description="Trade AI agents with real-time market data, live order books, and advanced trading tools. Experience professional-grade trading with live price feeds."
        keywords="real-time trading, live market data, order book, AI agent trading, cryptocurrency trading"
        url="https://hypercognition.lovable.app/real-time-market"
      />
      <LiveTradingDashboard />
    </>
  )
}