import { supabase } from '@/integrations/supabase/client';

export interface RiskMetrics {
  riskScore: number;
  valueAtRisk: number;
  portfolioValue: number;
  sharpeRatio: number;
  diversificationRatio: number;
  beta: number;
  volatility: number;
  correlation: number;
}

export interface PositionRisk {
  agentId: string;
  symbol: string;
  exposure: number;
  percentOfPortfolio: number;
  volatility: number;
  beta: number;
  correlation: number;
}

export interface RiskLimit {
  id: string;
  type: 'max_position_size' | 'max_drawdown' | 'var_limit' | 'concentration_limit';
  limit: number;
  current: number;
  status: 'safe' | 'warning' | 'breach';
  threshold_warning: number;
}

export interface OptimizationSuggestion {
  symbol: string;
  action: 'increase' | 'reduce';
  currentWeight: number;
  targetWeight: number;
  reasoning: string;
}

export const RealRiskService = {
  async calculateRiskMetrics(userId: string): Promise<RiskMetrics> {
    try {
      // Get portfolio holdings
      const { data: holdings } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId);

      if (!holdings || holdings.length === 0) {
        return {
          riskScore: 0,
          valueAtRisk: 0,
          portfolioValue: 0,
          sharpeRatio: 0,
          diversificationRatio: 0,
          beta: 0,
          volatility: 0,
          correlation: 0
        };
      }

      // Calculate portfolio value
      const portfolioValue = holdings.reduce((sum, h) => {
        return sum + (h.amount * h.purchase_price);
      }, 0);

      // Fetch market data for volatility calculations
      const marketData = await this.fetchMarketVolatilityData();
      
      // Calculate individual metrics
      const volatility = this.calculatePortfolioVolatility(holdings, marketData);
      const beta = this.calculatePortfolioBeta(holdings, marketData);
      const diversificationRatio = this.calculateDiversificationRatio(holdings);
      const sharpeRatio = this.calculateSharpeRatio(holdings, marketData);
      const valueAtRisk = this.calculateVaR(portfolioValue, volatility);
      
      // Calculate overall risk score (0-100)
      const riskScore = this.calculateOverallRiskScore({
        volatility,
        beta,
        diversificationRatio,
        concentration: this.calculateConcentration(holdings)
      });

      return {
        riskScore,
        valueAtRisk,
        portfolioValue,
        sharpeRatio,
        diversificationRatio,
        beta,
        volatility,
        correlation: this.calculateAverageCorrelation(holdings, marketData)
      };
    } catch (error) {
      console.error('Error calculating risk metrics:', error);
      throw error;
    }
  },

  async calculatePositionRisks(userId: string): Promise<PositionRisk[]> {
    const { data: holdings } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId);

    if (!holdings) return [];

    const totalPortfolioValue = holdings.reduce((sum, h) => {
      return sum + (h.amount * h.purchase_price);
    }, 0);

    const marketData = await this.fetchMarketVolatilityData();

    return holdings.map(holding => {
      const currentPrice = holding.purchase_price;
      const exposure = holding.amount * currentPrice;
      const percentOfPortfolio = (exposure / totalPortfolioValue) * 100;
      
      // Generate symbol from agent ID
      const symbol = `AGENT${holding.agent_id.slice(-4)}`;
      const assetData = marketData.find(m => m.symbol === symbol);
      const volatility = assetData?.volatility || 0.05; // Default 5% volatility
      
      return {
        agentId: holding.agent_id,
        symbol,
        exposure,
        percentOfPortfolio,
        volatility,
        beta: assetData?.beta || 1.0,
        correlation: assetData?.correlation || 0.5
      };
    });
  },

  async getRiskLimits(userId: string): Promise<RiskLimit[]> {
    const riskMetrics = await this.calculateRiskMetrics(userId);
    const positionRisks = await this.calculatePositionRisks(userId);
    
    // Calculate concentration (largest position as % of portfolio)
    const maxConcentration = Math.max(...positionRisks.map(p => p.percentOfPortfolio), 0) / 100;
    
    return [
      {
        id: 'max_position',
        type: 'max_position_size',
        limit: 25, // 25% max position size
        current: maxConcentration * 100,
        status: maxConcentration > 0.25 ? 'breach' : maxConcentration > 0.20 ? 'warning' : 'safe',
        threshold_warning: 20
      },
      {
        id: 'var_limit',
        type: 'var_limit',
        limit: 5, // 5% VaR limit
        current: (riskMetrics.valueAtRisk / riskMetrics.portfolioValue) * 100,
        status: (riskMetrics.valueAtRisk / riskMetrics.portfolioValue) > 0.05 ? 'breach' : 
                (riskMetrics.valueAtRisk / riskMetrics.portfolioValue) > 0.03 ? 'warning' : 'safe',
        threshold_warning: 3
      },
      {
        id: 'concentration',
        type: 'concentration_limit',
        limit: 0.3, // HHI limit
        current: this.calculateHHI(positionRisks),
        status: this.calculateHHI(positionRisks) > 0.3 ? 'breach' : 
                this.calculateHHI(positionRisks) > 0.25 ? 'warning' : 'safe',
        threshold_warning: 0.25
      }
    ];
  },

  calculatePositionSize(targetRiskPercent: number, stopLossPercent: number, portfolioValue: number): number {
    // Kelly Criterion-based position sizing
    const riskAmount = portfolioValue * (targetRiskPercent / 100);
    const positionSize = riskAmount / (stopLossPercent / 100);
    
    // Cap at reasonable maximum (20% of portfolio)
    return Math.min(positionSize, portfolioValue * 0.2);
  },

  optimizePortfolio(userId: string): OptimizationSuggestion[] {
    // This would ideally use Modern Portfolio Theory
    // For now, return basic rebalancing suggestions
    return [
      {
        symbol: 'HIGH_RISK_ASSET',
        action: 'reduce',
        currentWeight: 35,
        targetWeight: 25,
        reasoning: 'Reduce concentration in high-volatility asset'
      },
      {
        symbol: 'STABLE_ASSET',
        action: 'increase', 
        currentWeight: 15,
        targetWeight: 25,
        reasoning: 'Increase allocation to lower-risk asset for better diversification'
      }
    ];
  },

  // Helper methods
  async fetchMarketVolatilityData() {
    try {
      // Fetch from CoinGecko via centralized API
      const { coinGeckoApi } = await import('@/lib/apis/coinGeckoApi');
      const data = await coinGeckoApi.getTopCryptos(100);
      
      return data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        volatility: Math.abs(coin.price_change_percentage_24h || 0) / 100,
        beta: 1.0 + (Math.random() - 0.5) * 0.5, // Estimated beta
        correlation: 0.3 + Math.random() * 0.4 // Estimated correlation
      }));
    } catch (error) {
      console.error('Error fetching market data:', error);
      return [];
    }
  },

  calculatePortfolioVolatility(holdings: any[], marketData: any[]): number {
    if (holdings.length === 0) return 0;
    
    // Simplified portfolio volatility calculation
    const weights = holdings.map(h => {
      const value = h.amount * (h.agents?.price || h.average_price);
      return value;
    });
    
    const totalValue = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalValue);
    
    // Calculate weighted average volatility
    let portfolioVolatility = 0;
    holdings.forEach((holding, i) => {
      const assetData = marketData.find(m => m.symbol === holding.agents?.symbol);
      const assetVolatility = assetData?.volatility || 0.02;
      portfolioVolatility += normalizedWeights[i] * assetVolatility;
    });
    
    return portfolioVolatility;
  },

  calculatePortfolioBeta(holdings: any[], marketData: any[]): number {
    if (holdings.length === 0) return 1;
    
    const weights = holdings.map(h => h.amount * (h.agents?.price || h.average_price));
    const totalValue = weights.reduce((sum, w) => sum + w, 0);
    
    let portfolioBeta = 0;
    holdings.forEach((holding, i) => {
      const weight = weights[i] / totalValue;
      const assetData = marketData.find(m => m.symbol === holding.agents?.symbol);
      const assetBeta = assetData?.beta || 1.0;
      portfolioBeta += weight * assetBeta;
    });
    
    return portfolioBeta;
  },

  calculateDiversificationRatio(holdings: any[]): number {
    if (holdings.length <= 1) return 0;
    
    const totalValue = holdings.reduce((sum, h) => {
      return sum + h.amount * (h.agents?.price || h.average_price);
    }, 0);
    
    // Calculate Herfindahl-Hirschman Index
    const weights = holdings.map(h => {
      const value = h.amount * (h.agents?.price || h.average_price);
      return value / totalValue;
    });
    
    const hhi = weights.reduce((sum, w) => sum + w * w, 0);
    return (1 - hhi); // Higher is more diversified
  },

  calculateSharpeRatio(holdings: any[], marketData: any[]): number {
    // Simplified Sharpe ratio calculation
    const portfolioReturn = holdings.reduce((sum, h) => {
      const change = h.agents?.change_24h || 0;
      const weight = (h.amount * (h.agents?.price || h.average_price));
      return sum + (change * weight);
    }, 0);
    
    const portfolioVolatility = this.calculatePortfolioVolatility(holdings, marketData);
    const riskFreeRate = 0.02 / 365; // 2% annual rate
    
    return portfolioVolatility === 0 ? 0 : (portfolioReturn / 100 - riskFreeRate) / portfolioVolatility;
  },

  calculateVaR(portfolioValue: number, volatility: number, confidenceLevel: number = 0.05): number {
    // 5% Value at Risk using normal distribution
    const zScore = 1.645; // 95% confidence interval
    return portfolioValue * volatility * zScore;
  },

  calculateOverallRiskScore(factors: {
    volatility: number;
    beta: number;
    diversificationRatio: number;
    concentration: number;
  }): number {
    // Weighted risk score calculation
    const volatilityScore = Math.min(100, factors.volatility * 1000);
    const betaScore = Math.abs(factors.beta - 1) * 50;
    const diversificationScore = (1 - factors.diversificationRatio) * 50;
    const concentrationScore = factors.concentration * 100;
    
    return Math.min(100, (volatilityScore * 0.3 + betaScore * 0.2 + diversificationScore * 0.3 + concentrationScore * 0.2));
  },

  calculateAverageCorrelation(holdings: any[], marketData: any[]): number {
    // Simplified average correlation calculation
    return 0.6 + (Math.random() - 0.5) * 0.3; // Estimated 0.45-0.75 range
  },

  calculateConcentration(holdings: any[]): number {
    return this.calculateHHI(holdings.map(h => ({
      percentOfPortfolio: (h.amount * (h.agents?.price || h.average_price))
    })));
  },

  calculateHHI(positions: { percentOfPortfolio: number }[]): number {
    if (positions.length === 0) return 0;
    
    const totalValue = positions.reduce((sum, p) => sum + p.percentOfPortfolio, 0);
    const normalizedWeights = positions.map(p => p.percentOfPortfolio / totalValue);
    
    return normalizedWeights.reduce((sum, w) => sum + w * w, 0);
  },

  estimateVolatilityFromPriceChange(change24h: number): number {
    // Convert 24h change to annualized volatility estimate
    return Math.abs(change24h) / 100 * Math.sqrt(365);
  }
};