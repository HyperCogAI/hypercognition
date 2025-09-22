import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Bar, Area, AreaChart, ReferenceLine
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, BarChart3, Layers, 
  Pencil, Minus, Square, Triangle, Zap, Eye, Trash2 
} from 'lucide-react';
import { useTechnicalAnalysis } from '@/hooks/useTechnicalAnalysis';
import { Skeleton } from '@/components/ui/skeleton';

interface TechnicalChartProps {
  agentId: string;
  agentSymbol: string;
  currentPrice: number;
}

export const TechnicalChart: React.FC<TechnicalChartProps> = ({
  agentId,
  agentSymbol,
  currentPrice
}) => {
  const [timeframe, setTimeframe] = useState('1h');
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('line');
  const [drawingMode, setDrawingMode] = useState<'none' | 'trendline' | 'support' | 'resistance'>('none');
  const [showPatterns, setShowPatterns] = useState(true);
  
  const {
    loading,
    chartData,
    indicators,
    drawingTools,
    selectedIndicators,
    setSelectedIndicators,
    addDrawingTool,
    removeDrawingTool,
    clearDrawingTools,
    detectPatterns,
    availableIndicators
  } = useTechnicalAnalysis(agentId, timeframe);

  const chartRef = useRef<HTMLDivElement>(null);
  const patterns = detectPatterns();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-96" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const formatChartData = () => {
    return chartData.map(item => ({
      timestamp: new Date(item.timestamp).toLocaleDateString(),
      price: item.close,
      volume: item.volume,
      high: item.high,
      low: item.low,
      open: item.open,
      ...indicators.reduce((acc, indicator) => {
        const dataPoint = indicator.data.find(d => d.timestamp === item.timestamp);
        if (dataPoint && indicator.type === 'overlay') {
          acc[indicator.name.toLowerCase().replace(/\s+/g, '_')] = dataPoint.value;
        }
        return acc;
      }, {} as Record<string, number>)
    }));
  };

  const oscillatorData = indicators
    .filter(indicator => indicator.type === 'oscillator')
    .map(indicator => ({
      name: indicator.name,
      data: chartData.map(item => {
        const dataPoint = indicator.data.find(d => d.timestamp === item.timestamp);
        return {
          timestamp: new Date(item.timestamp).toLocaleDateString(),
          value: dataPoint?.value || 0,
          signal: dataPoint?.signal
        };
      })
    }));

  const toggleIndicator = (indicatorId: string) => {
    setSelectedIndicators(prev => 
      prev.includes(indicatorId) 
        ? prev.filter(id => id !== indicatorId)
        : [...prev, indicatorId]
    );
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'uptrend': return 'text-green-400';
      case 'downtrend': return 'text-red-400';
      case 'support': return 'text-blue-400';
      case 'resistance': return 'text-orange-400';
      default: return 'text-muted-foreground';
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'uptrend': return <TrendingUp className="h-4 w-4" />;
      case 'downtrend': return <TrendingDown className="h-4 w-4" />;
      case 'support': return <Minus className="h-4 w-4" />;
      case 'resistance': return <Minus className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formattedData = formatChartData();

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Timeframe:</span>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1m</SelectItem>
              <SelectItem value="5m">5m</SelectItem>
              <SelectItem value="15m">15m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="4h">4h</SelectItem>
              <SelectItem value="1d">1d</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Chart Type:</span>
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="candlestick">Candlestick</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <Button
            variant={drawingMode === 'trendline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingMode(drawingMode === 'trendline' ? 'none' : 'trendline')}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Trend Line
          </Button>
          <Button
            variant={drawingMode === 'support' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingMode(drawingMode === 'support' ? 'none' : 'support')}
          >
            <Minus className="h-4 w-4 mr-1" />
            Support
          </Button>
          <Button
            variant={drawingMode === 'resistance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingMode(drawingMode === 'resistance' ? 'none' : 'resistance')}
          >
            <Minus className="h-4 w-4 mr-1" />
            Resistance
          </Button>
        </div>

        {drawingTools.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearDrawingTools}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Drawings
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{agentSymbol} Price Chart</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    ${currentPrice.toFixed(4)}
                  </Badge>
                  <Badge variant={patterns.some(p => p.type === 'uptrend') ? 'default' : 'secondary'}>
                    {timeframe}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartRef} className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart data={formattedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis domain={['dataMin', 'dataMax']} />
                      <Tooltip 
                        formatter={(value, name) => [
                          typeof value === 'number' ? `$${value.toFixed(4)}` : value,
                          name
                        ]}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                      {/* Overlay indicators */}
                      {indicators.filter(i => i.type === 'overlay' && i.name !== 'Volume').map((indicator, index) => (
                        <Line
                          key={indicator.name}
                          type="monotone"
                          dataKey={indicator.name.toLowerCase().replace(/\s+/g, '_')}
                          stroke={`hsl(${120 + index * 60}, 70%, 50%)`}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </AreaChart>
                  ) : (
                    <LineChart data={formattedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis domain={['dataMin', 'dataMax']} />
                      <Tooltip 
                        formatter={(value, name) => [
                          typeof value === 'number' ? `$${value.toFixed(4)}` : value,
                          name
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={false}
                      />
                      {/* Overlay indicators */}
                      {indicators.filter(i => i.type === 'overlay' && i.name !== 'Volume').map((indicator, index) => (
                        <Line
                          key={indicator.name}
                          type="monotone"
                          dataKey={indicator.name.toLowerCase().replace(/\s+/g, '_')}
                          stroke={`hsl(${120 + index * 60}, 70%, 50%)`}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Oscillator Indicators */}
          {oscillatorData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {oscillatorData.map((oscillator) => (
                <Card key={oscillator.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{oscillator.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        {oscillator.name === 'Volume' ? (
                          <AreaChart data={oscillator.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="hsl(var(--muted-foreground))" 
                              fill="hsl(var(--muted-foreground))"
                              fillOpacity={0.5}
                            />
                          </AreaChart>
                        ) : (
                          <LineChart data={oscillator.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            {oscillator.name === 'RSI' && (
                              <>
                                <ReferenceLine y={70} stroke="red" strokeDasharray="2 2" />
                                <ReferenceLine y={30} stroke="green" strokeDasharray="2 2" />
                              </>
                            )}
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="hsl(var(--chart-1))" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Technical Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableIndicators.map((indicator) => (
                <div key={indicator.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={indicator.id}
                    checked={selectedIndicators.includes(indicator.id)}
                    onCheckedChange={() => toggleIndicator(indicator.id)}
                  />
                  <label htmlFor={indicator.id} className="text-sm font-medium">
                    {indicator.name}
                  </label>
                  <Badge variant="outline" className="ml-auto">
                    {indicator.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pattern Recognition */}
          {showPatterns && patterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Patterns Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patterns.map((pattern, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={getPatternColor(pattern.type)}>
                        {getPatternIcon(pattern.type)}
                      </span>
                      <span className="font-medium capitalize">{pattern.type}</span>
                      <Badge variant="outline" className="ml-auto">
                        {Math.round(pattern.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pattern.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trend:</span>
                  <span className={patterns.some(p => p.type === 'uptrend') ? 'text-green-400' : 
                                 patterns.some(p => p.type === 'downtrend') ? 'text-red-400' : 'text-muted-foreground'}>
                    {patterns.some(p => p.type === 'uptrend') ? 'Bullish' : 
                     patterns.some(p => p.type === 'downtrend') ? 'Bearish' : 'Neutral'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Support:</span>
                  <span className="text-blue-400">
                    {patterns.find(p => p.type === 'support')?.description.match(/\$[\d.]+/)?.[0] || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resistance:</span>
                  <span className="text-orange-400">
                    {patterns.find(p => p.type === 'resistance')?.description.match(/\$[\d.]+/)?.[0] || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Points:</span>
                  <span>{chartData.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};