import React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface MobileOptimizedLayoutProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  sidebar?: React.ReactNode
  isLoading?: boolean
}

export function MobileOptimizedLayout({ 
  children, 
  className, 
  header, 
  sidebar,
  isLoading = false 
}: MobileOptimizedLayoutProps) {
  if (isLoading) {
    return <MobileLayoutSkeleton />
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Mobile Header */}
      {header && (
        <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          {header}
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        {sidebar && (
          <div className="hidden lg:block">
            {sidebar}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function MobileLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header Skeleton */}
      <div className="lg:hidden sticky top-0 z-40 bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Desktop Sidebar Skeleton */}
        <div className="hidden lg:block w-64 border-r bg-card/50 p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <main className="flex-1 p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  title?: string
  isLoading?: boolean
}

export function MobileCard({ 
  children, 
  className, 
  collapsible = false,
  defaultCollapsed = false,
  title,
  isLoading = false
}: MobileCardProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  if (isLoading) {
    return (
      <div className={cn("p-4 border rounded-lg bg-card space-y-3", className)}>
        {title && <Skeleton className="h-5 w-32" />}
        <Skeleton className="h-20 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("border rounded-lg bg-card overflow-hidden", className)}>
      {title && (
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isCollapsed ? '↓' : '↑'}
            </button>
          )}
        </div>
      )}
      
      {(!collapsible || !isCollapsed) && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  )
}

interface MobileGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
  isLoading?: boolean
  skeletonCount?: number
}

export function MobileGrid({ 
  children, 
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  isLoading = false,
  skeletonCount = 6
}: MobileGridProps) {
  const gridCols = `grid-cols-${cols.mobile} md:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`
  const gridGap = `gap-${gap}`

  if (isLoading) {
    return (
      <div className={cn("grid", gridCols, gridGap, className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid", gridCols, gridGap, className)}>
      {children}
    </div>
  )
}

interface MobileTableProps {
  data: Array<Record<string, any>>
  columns: Array<{
    key: string
    label: string
    render?: (value: any, row: any) => React.ReactNode
    mobileHidden?: boolean
  }>
  className?: string
  isLoading?: boolean
  rowCount?: number
}

export function MobileTable({ 
  data, 
  columns, 
  className,
  isLoading = false,
  rowCount = 5
}: MobileTableProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="lg:hidden space-y-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {data.map((row, index) => (
          <div key={index} className="p-4 border rounded-lg bg-card space-y-2">
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{column.label}:</span>
                <span className="font-medium">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((column) => (
                <th key={column.key} className="text-left p-4 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b hover:bg-muted/50">
                {columns.map((column) => (
                  <td key={column.key} className="p-4">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}