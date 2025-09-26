import React from 'react'
import { 
  DashboardSkeleton, 
  TradingPanelSkeleton, 
  PortfolioSkeleton,
  AgentCardSkeleton,
  MarketOverviewSkeleton
} from '@/components/ui/loading-skeletons'
import { MobileOptimizedLayout, MobileCard, MobileGrid, MobileTable } from '@/components/mobile/MobileOptimizedComponents'

// Enhanced Trading Dashboard with better mobile UX and loading states
export function EnhancedTradingDashboard() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState('overview')

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'trading', label: 'Trading' },
    { id: 'agents', label: 'AI Agents' }
  ]

  const mobileHeader = (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Trading Dashboard</h1>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg bg-card border">
            🔔
          </button>
          <div className="h-8 w-8 rounded-full bg-primary" />
        </div>
      </div>
      
      {/* Mobile Tab Navigation */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />
      case 'portfolio':
        return <PortfolioView />
      case 'trading':
        return <TradingView />
      case 'agents':
        return <AgentsView />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <MobileOptimizedLayout header={mobileHeader}>
      <div className="p-4 space-y-6">
        {/* Desktop Tab Navigation */}
        <div className="hidden lg:flex space-x-1 bg-muted rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {renderTabContent()}
      </div>
    </MobileOptimizedLayout>
  )
}

function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <MobileGrid cols={{ mobile: 2, tablet: 2, desktop: 4 }}>
        <MobileCard title="Portfolio Value">
          <div className="space-y-1">
            <div className="text-2xl font-bold">$24,567.89</div>
            <div className="text-sm text-green-500">+2.34% (24h)</div>
          </div>
        </MobileCard>
        <MobileCard title="Total P&L">
          <div className="space-y-1">
            <div className="text-2xl font-bold">+$1,234.56</div>
            <div className="text-sm text-green-500">+5.29%</div>
          </div>
        </MobileCard>
        <MobileCard title="Active Agents">
          <div className="space-y-1">
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-muted-foreground">Running</div>
          </div>
        </MobileCard>
        <MobileCard title="Win Rate">
          <div className="space-y-1">
            <div className="text-2xl font-bold">89.4%</div>
            <div className="text-sm text-muted-foreground">Last 30 days</div>
          </div>
        </MobileCard>
      </MobileGrid>

      {/* Market Overview */}
      <MobileCard title="Market Overview" collapsible>
        <MarketOverviewSkeleton />
      </MobileCard>
    </div>
  )
}

function PortfolioView() {
  return (
    <div className="space-y-6">
      <PortfolioSkeleton />
    </div>
  )
}

function TradingView() {
  return (
    <div className="space-y-6">
      <TradingPanelSkeleton />
    </div>
  )
}

function AgentsView() {
  return (
    <div className="space-y-6">
      <MobileGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <AgentCardSkeleton key={i} />
        ))}
      </MobileGrid>
    </div>
  )
}