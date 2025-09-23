import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, XCircle, Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { apiErrorHandler } from '@/lib/apiErrorHandler'

interface HealthIndicatorProps {
  service: string
  endpoint?: string
  className?: string
}

type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown'

export const HealthIndicator = ({ service, endpoint, className }: HealthIndicatorProps) => {
  const [status, setStatus] = useState<HealthStatus>('unknown')
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  useEffect(() => {
    const checkHealth = () => {
      if (endpoint) {
        const isHealthy = apiErrorHandler.isEndpointHealthy(endpoint)
        setStatus(isHealthy ? 'healthy' : 'degraded')
      } else {
        // Check general connectivity
        setStatus(navigator.onLine ? 'healthy' : 'down')
      }
      setLastCheck(new Date())
    }

    // Initial check
    checkHealth()

    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000)

    // Listen for online/offline events
    const handleOnline = () => setStatus('healthy')
    const handleOffline = () => setStatus('down')
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [endpoint])

  const getStatusConfig = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          text: 'Operational',
          variant: 'secondary' as const
        }
      case 'degraded':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          text: 'Degraded',
          variant: 'outline' as const
        }
      case 'down':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          text: 'Down',
          variant: 'destructive' as const
        }
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          text: 'Unknown',
          variant: 'outline' as const
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  const tooltipContent = (
    <div className="text-xs space-y-1">
      <div>Service: {service}</div>
      <div>Status: {config.text}</div>
      {lastCheck && (
        <div>Last checked: {lastCheck.toLocaleTimeString()}</div>
      )}
      {endpoint && (
        <div>Endpoint: {endpoint}</div>
      )}
    </div>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={config.variant}
            className={`flex items-center gap-1 ${config.bgColor} ${className}`}
          >
            <Icon className={`h-3 w-3 ${config.color}`} />
            <span className="text-xs">{service}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Network status indicator
export const NetworkIndicator = ({ className }: { className?: string }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return (
      <div className={`flex items-center gap-1 text-green-500 ${className}`}>
        <Wifi className="h-4 w-4" />
        <span className="text-xs">Online</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 text-red-500 ${className}`}>
      <WifiOff className="h-4 w-4" />
      <span className="text-xs">Offline</span>
    </div>
  )
}

// System health dashboard
export const SystemHealthPanel = () => {
  const services = [
    { name: 'Jupiter API', endpoint: 'https://api.jup.ag' },
    { name: 'CoinGecko', endpoint: 'https://api.coingecko.com' },
    { name: 'Supabase', endpoint: '' }, // Will check general connectivity
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">System Status</h3>
      <div className="grid grid-cols-2 gap-2">
        <NetworkIndicator />
        {services.map((service) => (
          <HealthIndicator
            key={service.name}
            service={service.name}
            endpoint={service.endpoint}
          />
        ))}
      </div>
    </div>
  )
}