import React from 'react'
import { ExchangeConnector } from '@/components/trading/ExchangeConnector'
import { AdvancedOrderForm } from '@/components/trading/AdvancedOrderForm'
import { RealTimeOrderBook } from '@/components/trading/RealTimeOrderBook'
import { PortfolioManager } from '@/components/trading/PortfolioManager'
import { RiskManager } from '@/components/trading/RiskManager'
import { TradingAnalytics } from '@/components/trading/TradingAnalytics'
import { MarketDataFeed } from '@/components/trading/MarketDataFeed'
import { LiquidityAnalyzer } from '@/components/trading/LiquidityAnalyzer'
import { OrderManagementDashboard } from '@/components/trading/OrderManagementDashboard'
import { ExecutionEngine } from '@/components/trading/ExecutionEngine'
import { ArbitrageDetector } from '@/components/trading/ArbitrageDetector'
import { PositionTracker } from '@/components/trading/PositionTracker'
import { TradingSignalsManager } from '@/components/trading/TradingSignalsManager'
import { SEOHead } from '@/components/seo/SEOHead'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const ExchangeTrading = () => {
  return (
    <>
      <SEOHead 
        title="Exchange Trading Platform - HyperCognition"
        description="Professional cryptocurrency trading platform with advanced order types, risk management, and real-time market data across multiple exchanges."
        keywords="crypto trading, exchange trading, order book, portfolio management, risk management"
      />
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
            Exchange{" "}
            <span className="text-white">
              Trading
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Professional trading tools and analytics</p>
        </div>

        <Tabs defaultValue="trading" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="arbitrage">Arbitrage</TabsTrigger>
            <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="market">Market Data</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
          </TabsList>

          <TabsContent value="trading">
            <AdvancedOrderForm />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagementDashboard />
          </TabsContent>

          <TabsContent value="execution">
            <ExecutionEngine />
          </TabsContent>

          <TabsContent value="positions">
            <PositionTracker />
          </TabsContent>

          <TabsContent value="signals">
            <TradingSignalsManager />
          </TabsContent>

          <TabsContent value="arbitrage">
            <ArbitrageDetector />
          </TabsContent>

          <TabsContent value="exchanges">
            <ExchangeConnector />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioManager />
          </TabsContent>

          <TabsContent value="risk">
            <RiskManager />
          </TabsContent>

          <TabsContent value="analytics">
            <TradingAnalytics />
          </TabsContent>

          <TabsContent value="market">
            <MarketDataFeed />
          </TabsContent>

          <TabsContent value="liquidity">
            <LiquidityAnalyzer />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default ExchangeTrading