import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="h-64 flex items-end space-x-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="flex-1 bg-primary/20" 
                  style={{ height: `${Math.random() * 80 + 20}%` }} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="p-4 border rounded-lg space-y-4">
            <Skeleton className="h-5 w-24" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TradingPanelSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
      {/* Order Book */}
      <div className="lg:col-span-3 space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-8" />
            ))}
          </div>
        </div>
        <div className="h-96 border rounded-lg p-4">
          <div className="h-full flex items-end justify-between">
            {Array.from({ length: 50 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="w-1 bg-primary/20" 
                style={{ height: `${Math.random() * 100}%` }} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Trading Form */}
      <div className="lg:col-span-3 space-y-4">
        <Skeleton className="h-6 w-20" />
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex space-x-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}

export function PortfolioSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Portfolio Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-32" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Chart */}
      <div className="p-4 border rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-12" />
            ))}
          </div>
        </div>
        <div className="h-64 flex items-end space-x-1">
          {Array.from({ length: 30 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="flex-1 bg-primary/20" 
              style={{ height: `${Math.random() * 100}%` }} 
            />
          ))}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AgentCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  )
}

export function MarketOverviewSkeleton() {
  return (
    <div className="space-y-4">
      {/* Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3 border rounded-lg space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>

      {/* Token List */}
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}