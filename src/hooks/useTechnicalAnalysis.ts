import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ChartData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  name: string;
  type: 'overlay' | 'oscillator';
  data: Array<{ timestamp: string; value: number; signal?: string }>;
  settings: Record<string, any>;
}

export interface DrawingTool {
  id: string;
  type: 'trendline' | 'support' | 'resistance' | 'fibonacci' | 'rectangle';
  points: Array<{ x: number; y: number; timestamp: string; price: number }>;
  style: {
    color: string;
    width: number;
    dash?: boolean;
  };
}

export const useTechnicalAnalysis = (agentId: string, timeframe: string = '1h') => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [drawingTools, setDrawingTools] = useState<DrawingTool[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['sma_20', 'volume']);

  // Fetch price data for charting
  useEffect(() => {
    if (!agentId) return;

    const fetchChartData = async () => {
      try {
        setLoading(true);
        
        // Get historical price data
        const { data: priceData } = await supabase
          .from('price_history')
          .select('*')
          .eq('agent_id', agentId)
          .order('timestamp', { ascending: true })
          .limit(1000);

        if (priceData && priceData.length > 0) {
          // Convert to OHLC format (simplified - in real app, aggregate by timeframe)
          const ohlcData: ChartData[] = priceData.map((item, index) => {
            const prevPrice = index > 0 ? priceData[index - 1].price : item.price;
            const nextPrice = index < priceData.length - 1 ? priceData[index + 1].price : item.price;
            
            return {
              timestamp: item.timestamp,
              open: prevPrice,
              high: Math.max(prevPrice, item.price, nextPrice),
              low: Math.min(prevPrice, item.price, nextPrice),
              close: item.price,
              volume: item.volume || 0
            };
          });

          setChartData(ohlcData);
        } else {
          // Generate mock data if no historical data available
          generateMockData();
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
        generateMockData();
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [agentId, timeframe]);

  // Generate mock OHLC data for demonstration
  const generateMockData = () => {
    const data: ChartData[] = [];
    let price = 100;
    const now = new Date();

    for (let i = 99; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();
      
      // Random walk with some volatility
      const change = (Math.random() - 0.5) * 4;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      const volume = Math.random() * 1000000;

      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });

      price = close;
    }

    setChartData(data);
  };

  // Calculate technical indicators
  const technicalIndicators = useMemo(() => {
    if (chartData.length === 0) return [];

    const indicators: TechnicalIndicator[] = [];

    // Simple Moving Average (SMA)
    if (selectedIndicators.includes('sma_20')) {
      const smaData = calculateSMA(chartData, 20);
      indicators.push({
        name: 'SMA 20',
        type: 'overlay',
        data: smaData,
        settings: { period: 20 }
      });
    }

    if (selectedIndicators.includes('sma_50')) {
      const smaData = calculateSMA(chartData, 50);
      indicators.push({
        name: 'SMA 50',
        type: 'overlay',
        data: smaData,
        settings: { period: 50 }
      });
    }

    // Exponential Moving Average (EMA)
    if (selectedIndicators.includes('ema_12')) {
      const emaData = calculateEMA(chartData, 12);
      indicators.push({
        name: 'EMA 12',
        type: 'overlay',
        data: emaData,
        settings: { period: 12 }
      });
    }

    // RSI
    if (selectedIndicators.includes('rsi')) {
      const rsiData = calculateRSI(chartData, 14);
      indicators.push({
        name: 'RSI',
        type: 'oscillator',
        data: rsiData,
        settings: { period: 14, overbought: 70, oversold: 30 }
      });
    }

    // MACD
    if (selectedIndicators.includes('macd')) {
      const macdData = calculateMACD(chartData);
      indicators.push({
        name: 'MACD',
        type: 'oscillator',
        data: macdData,
        settings: { fast: 12, slow: 26, signal: 9 }
      });
    }

    // Bollinger Bands
    if (selectedIndicators.includes('bollinger')) {
      const bbData = calculateBollingerBands(chartData, 20, 2);
      indicators.push({
        name: 'Bollinger Bands',
        type: 'overlay',
        data: bbData,
        settings: { period: 20, deviation: 2 }
      });
    }

    // Volume
    if (selectedIndicators.includes('volume')) {
      const volumeData = chartData.map(item => ({
        timestamp: item.timestamp,
        value: item.volume
      }));
      indicators.push({
        name: 'Volume',
        type: 'oscillator',
        data: volumeData,
        settings: {}
      });
    }

    return indicators;
  }, [chartData, selectedIndicators]);

  // Update indicators when calculated
  useEffect(() => {
    setIndicators(technicalIndicators);
  }, [technicalIndicators]);

  // Calculate Simple Moving Average
  const calculateSMA = (data: ChartData[], period: number) => {
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.close, 0);
      const average = sum / period;
      
      result.push({
        timestamp: data[i].timestamp,
        value: average
      });
    }
    
    return result;
  };

  // Calculate Exponential Moving Average
  const calculateEMA = (data: ChartData[], period: number) => {
    const result = [];
    const multiplier = 2 / (period + 1);
    let ema = data[0].close;

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        ema = data[i].close;
      } else {
        ema = (data[i].close * multiplier) + (ema * (1 - multiplier));
      }
      
      result.push({
        timestamp: data[i].timestamp,
        value: ema
      });
    }
    
    return result;
  };

  // Calculate RSI
  const calculateRSI = (data: ChartData[], period: number) => {
    const result = [];
    const gains = [];
    const losses = [];

    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      
      let signal = '';
      if (rsi > 70) signal = 'overbought';
      else if (rsi < 30) signal = 'oversold';
      
      result.push({
        timestamp: data[i + 1].timestamp,
        value: rsi,
        signal
      });
    }
    
    return result;
  };

  // Calculate MACD
  const calculateMACD = (data: ChartData[]) => {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    const macdLine = [];

    for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
      macdLine.push({
        timestamp: ema12[i].timestamp,
        value: ema12[i].value - ema26[i].value
      });
    }

    // Signal line (9-period EMA of MACD line)
    const signalLine = calculateEMA(macdLine.map(item => ({ 
      timestamp: item.timestamp, 
      close: item.value, 
      open: item.value, 
      high: item.value, 
      low: item.value, 
      volume: 0 
    })), 9);

    return macdLine.map((item, index) => ({
      timestamp: item.timestamp,
      value: item.value,
      signal: signalLine[index] ? (item.value > signalLine[index].value ? 'bullish' : 'bearish') : ''
    }));
  };

  // Calculate Bollinger Bands
  const calculateBollingerBands = (data: ChartData[], period: number, deviation: number) => {
    const sma = calculateSMA(data, period);
    const result = [];

    for (let i = 0; i < sma.length; i++) {
      const dataSlice = data.slice(i, i + period);
      const variance = dataSlice.reduce((acc, item) => acc + Math.pow(item.close - sma[i].value, 2), 0) / period;
      const stdDev = Math.sqrt(variance);

      result.push({
        timestamp: sma[i].timestamp,
        value: sma[i].value, // Middle band
        upper: sma[i].value + (stdDev * deviation),
        lower: sma[i].value - (stdDev * deviation)
      });
    }

    return result;
  };

  // Drawing tools management
  const addDrawingTool = (tool: Omit<DrawingTool, 'id'>) => {
    const newTool: DrawingTool = {
      ...tool,
      id: crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
    };
    setDrawingTools(prev => [...prev, newTool]);
    return newTool.id;
  };

  const removeDrawingTool = (id: string) => {
    setDrawingTools(prev => prev.filter(tool => tool.id !== id));
  };

  const updateDrawingTool = (id: string, updates: Partial<DrawingTool>) => {
    setDrawingTools(prev => prev.map(tool => 
      tool.id === id ? { ...tool, ...updates } : tool
    ));
  };

  const clearDrawingTools = () => {
    setDrawingTools([]);
  };

  // Pattern recognition (simplified)
  const detectPatterns = () => {
    if (chartData.length < 20) return [];

    const patterns = [];
    const recent = chartData.slice(-20);

    // Simple trend detection
    const firstPrice = recent[0].close;
    const lastPrice = recent[recent.length - 1].close;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;

    if (change > 5) {
      patterns.push({ type: 'uptrend', confidence: 0.7, description: 'Strong upward trend detected' });
    } else if (change < -5) {
      patterns.push({ type: 'downtrend', confidence: 0.7, description: 'Strong downward trend detected' });
    }

    // Support/Resistance levels
    const prices = recent.map(item => item.close);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    if (prices.filter(p => Math.abs(p - maxPrice) / maxPrice < 0.01).length >= 3) {
      patterns.push({ type: 'resistance', confidence: 0.8, description: `Resistance level at $${maxPrice.toFixed(2)}` });
    }

    if (prices.filter(p => Math.abs(p - minPrice) / minPrice < 0.01).length >= 3) {
      patterns.push({ type: 'support', confidence: 0.8, description: `Support level at $${minPrice.toFixed(2)}` });
    }

    return patterns;
  };

  return {
    loading,
    chartData,
    indicators,
    drawingTools,
    selectedIndicators,
    setSelectedIndicators,
    addDrawingTool,
    removeDrawingTool,
    updateDrawingTool,
    clearDrawingTools,
    detectPatterns,
    timeframe,
    availableIndicators: [
      { id: 'sma_20', name: 'SMA 20', type: 'overlay' },
      { id: 'sma_50', name: 'SMA 50', type: 'overlay' },
      { id: 'ema_12', name: 'EMA 12', type: 'overlay' },
      { id: 'rsi', name: 'RSI', type: 'oscillator' },
      { id: 'macd', name: 'MACD', type: 'oscillator' },
      { id: 'bollinger', name: 'Bollinger Bands', type: 'overlay' },
      { id: 'volume', name: 'Volume', type: 'oscillator' }
    ]
  };
};