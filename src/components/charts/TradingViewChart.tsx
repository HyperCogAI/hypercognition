import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TradingViewChartProps {
  symbol: string
  height?: number
  theme?: 'light' | 'dark'
  interval?: string
}

export function TradingViewChart({ 
  symbol, 
  height = 500, 
  theme = 'dark',
  interval = '1H'
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create script element for TradingView widget
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          width: '100%',
          height: height,
          symbol: symbol,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerRef.current?.id || 'tradingview_chart',
          studies: [
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'BB@tv-basicstudies'
          ],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
          no_referral_id: true,
          hide_legend: false,
          save_image: true,
          hideideas: true
        })
      }
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup script when component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [symbol, height, theme, interval])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Advanced Chart - {symbol}</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            TradingView
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          id="tradingview_chart"
          className="w-full rounded-lg overflow-hidden"
          style={{ height: `${height}px` }}
        />
      </CardContent>
    </Card>
  )
}

// Extend window interface for TradingView
declare global {
  interface Window {
    TradingView: any
  }
}