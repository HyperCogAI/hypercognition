import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FallbackComponentProps {
  error?: Error
  resetError?: () => void
  title?: string
  description?: string
}

export const FallbackComponent = ({
  error,
  resetError,
  title = "Something went wrong",
  description = "We're having trouble loading this section. Please try again."
}: FallbackComponentProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card/30 border border-border/50 rounded-xl backdrop-blur-sm">
      <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      
      {process.env.NODE_ENV === 'development' && error && (
        <details className="text-sm bg-muted p-3 rounded-md mb-4 w-full max-w-md">
          <summary className="cursor-pointer font-medium">Error Details</summary>
          <pre className="mt-2 text-xs overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
      
      {resetError && (
        <Button onClick={resetError} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}