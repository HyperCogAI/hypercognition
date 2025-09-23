import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 bg-[length:200%_100%] animate-shimmer",
        className
      )}
      {...props}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card/50">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-4 p-4 border-b">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 p-4">
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <div className="grid grid-cols-7 gap-2 h-64">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col justify-end">
            <Skeleton className={`w-full bg-primary/20`} style={{ height: `${Math.random() * 100 + 20}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export { Skeleton, CardSkeleton, TableSkeleton, ChartSkeleton }