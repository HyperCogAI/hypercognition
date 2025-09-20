import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-card/50 border border-border/30",
        className
      )}
      {...props}
    />
  )
}

export function AgentCardSkeleton() {
  return (
    <div className="glass-card rounded-lg p-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Skeleton className="h-10 w-10 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-gradient-to-r from-blue-500/50 to-blue-400/50 rounded-full border-2 border-background animate-bounce-subtle" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-gradient-to-r from-primary/10 to-accent/10" />
            <Skeleton className="h-3 w-12 bg-muted/50" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-4 w-16 bg-gradient-to-r from-primary/10 to-accent/10" />
          <Skeleton className="h-3 w-12 bg-green-400/20 animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

export function AgentDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in">
      <div className="border-b border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card/30 border-border/50 rounded-lg p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card/30 border-border/50 rounded-lg p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-card/30 border-border/50 rounded-lg p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}