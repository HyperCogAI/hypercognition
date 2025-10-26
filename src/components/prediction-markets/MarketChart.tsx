import { useState } from 'react'
import { PredictionMarket } from '@/types/predictionMarket'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Button } from '@/components/ui/button'

interface MarketChartProps {
  market: PredictionMarket
}

export function MarketChart({ market }: MarketChartProps) {
  const [timeRange, setTimeRange] = useState<'1H' | '1D' | '1W' | '1M' | 'ALL'>('1D')

  // Mock historical data
  const generateMockData = () => {
    const data = []
    const now = new Date()
    const points = timeRange === '1H' ? 12 : timeRange === '1D' ? 24 : timeRange === '1W' ? 7 : 30
    
    for (let i = points; i >= 0; i--) {
      const timestamp = new Date(now)
      if (timeRange === '1H') {
        timestamp.setMinutes(timestamp.getMinutes() - (i * 5))
      } else if (timeRange === '1D') {
        timestamp.setHours(timestamp.getHours() - i)
      } else {
        timestamp.setDate(timestamp.getDate() - i)
      }

      const dataPoint: any = {
        time: timestamp.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: timeRange === '1H' || timeRange === '1D' ? 'numeric' : undefined,
        }),
      }

      market.outcomes.forEach((outcome, index) => {
        // Add some randomness to simulate price movement
        const variance = (Math.random() - 0.5) * 0.1
        dataPoint[outcome.label] = Math.max(
          0.05,
          Math.min(0.95, outcome.price + variance)
        )
      })

      data.push(dataPoint)
    }

    return data
  }

  const data = generateMockData()

  const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))']

  return (
    <div className="space-y-4">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['1H', '1D', '1W', '1M', 'ALL'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              domain={[0, 1]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
            />
            <Legend />
            {market.outcomes.map((outcome, index) => (
              <Line
                key={outcome.id}
                type="monotone"
                dataKey={outcome.label}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
