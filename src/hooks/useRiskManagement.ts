import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RiskMetrics {
  portfolioValue: number;
  totalExposure: number;
  diversificationRatio: number;
  sharpeRatio: number;
  valueAtRisk: number;
  maxDrawdown: number;
  riskScore: number;
  concentrationRisk: number;
}

export interface PositionRisk {
  agentId: string;
  symbol: string;
  exposure: number;
  percentOfPortfolio: number;
  riskContribution: number;
  beta: number;
  volatility: number;
}

export interface RiskLimit {
  id: string;
  type: 'position_size' | 'daily_loss' | 'total_exposure' | 'concentration';
  limit: number;
  current: number;
  status: 'safe' | 'warning' | 'breach';
}

export const useRiskManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [positionRisks, setPositionRisks] = useState<PositionRisk[]>([]);
  const [riskLimits, setRiskLimits] = useState<RiskLimit[]>([]);

  // Fetch portfolio data
  useEffect(() => {
    if (!user) return;

    const fetchPortfolioData = async () => {
      try {
        const { data: holdings } = await supabase
          .from('user_holdings')
          .select(`
            *,
            agents:agent_id (
              name, symbol, price, market_cap, change_24h, volume_24h
            )
          `)
          .eq('user_id', user.id);

        if (holdings) {
          setPortfolio(holdings);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        toast({
          title: "Error",
          description: "Failed to fetch portfolio data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [user, toast]);

  // Calculate risk metrics
  const calculateRiskMetrics = useMemo(() => {
    if (!portfolio.length) return null;

    let totalValue = 0;
    let totalExposure = 0;
    const positions: PositionRisk[] = [];
    const weights: number[] = [];
    const returns: number[] = [];

    portfolio.forEach((holding) => {
      const agent = holding.agents;
      if (!agent) return;

      const positionValue = holding.amount * agent.price;
      totalValue += positionValue;
      totalExposure += Math.abs(positionValue);

      // Mock volatility and beta calculations (in real app, use historical data)
      const volatility = Math.abs(agent.change_24h || 0) * 0.1;
      const beta = 1.0; // Default market correlation, could be calculated from historical data

      positions.push({
        agentId: holding.agent_id,
        symbol: agent.symbol,
        exposure: positionValue,
        percentOfPortfolio: 0, // Will calculate after totalValue
        riskContribution: volatility * positionValue,
        beta,
        volatility
      });

      weights.push(positionValue);
      returns.push(agent.change_24h || 0);
    });

    // Update position percentages
    positions.forEach(pos => {
      pos.percentOfPortfolio = (pos.exposure / totalValue) * 100;
    });

    // Calculate portfolio metrics
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
    const valueAtRisk = totalValue * 0.05 * stdDev; // 5% VaR
    const maxDrawdown = Math.min(...returns) / 100 * totalValue;
    
    // Concentration risk (Herfindahl index)
    const concentrationRisk = weights.reduce((sum, weight) => {
      const w = weight / totalValue;
      return sum + w * w;
    }, 0);

    // Diversification ratio (simplified)
    const diversificationRatio = Math.max(0, 1 - concentrationRisk);
    
    // Overall risk score (0-100, lower is better)
    const riskScore = Math.min(100, 
      (concentrationRisk * 30) + 
      (Math.abs(maxDrawdown / totalValue) * 100 * 20) + 
      (stdDev * 25) + 
      ((1 - diversificationRatio) * 25)
    );

    return {
      portfolioValue: totalValue,
      totalExposure,
      diversificationRatio,
      sharpeRatio,
      valueAtRisk,
      maxDrawdown: Math.abs(maxDrawdown),
      riskScore,
      concentrationRisk
    };
  }, [portfolio]);

  // Calculate position risks
  useEffect(() => {
    if (!portfolio.length || !calculateRiskMetrics) return;

    const risks: PositionRisk[] = [];
    const totalValue = calculateRiskMetrics.portfolioValue;

    portfolio.forEach((holding) => {
      const agent = holding.agents;
      if (!agent) return;

      const positionValue = holding.amount * agent.price;
      const volatility = Math.abs(agent.change_24h || 0) * 0.1;
      const beta = 1.0; // Default market correlation

      risks.push({
        agentId: holding.agent_id,
        symbol: agent.symbol,
        exposure: positionValue,
        percentOfPortfolio: (positionValue / totalValue) * 100,
        riskContribution: volatility * positionValue,
        beta,
        volatility
      });
    });

    setPositionRisks(risks);
  }, [portfolio, calculateRiskMetrics]);

  // Generate risk limits
  useEffect(() => {
    if (!calculateRiskMetrics) return;

    const limits: RiskLimit[] = [
      {
        id: 'max_position',
        type: 'position_size',
        limit: 25, // Max 25% in single position
        current: Math.max(...positionRisks.map(p => p.percentOfPortfolio)),
        status: 'safe'
      },
      {
        id: 'daily_loss',
        type: 'daily_loss',
        limit: 5, // Max 5% daily loss
        current: Math.abs(Math.min(...portfolio.map(h => h.agents?.change_24h || 0))),
        status: 'safe'
      },
      {
        id: 'total_exposure',
        type: 'total_exposure',
        limit: 100, // Max 100% of portfolio value
        current: (calculateRiskMetrics.totalExposure / calculateRiskMetrics.portfolioValue) * 100,
        status: 'safe'
      },
      {
        id: 'concentration',
        type: 'concentration',
        limit: 0.3, // Max concentration index of 0.3
        current: calculateRiskMetrics.concentrationRisk,
        status: 'safe'
      }
    ];

    // Update status based on thresholds
    limits.forEach(limit => {
      const breachThreshold = limit.limit;
      const warningThreshold = limit.limit * 0.8;

      if (limit.current >= breachThreshold) {
        limit.status = 'breach';
      } else if (limit.current >= warningThreshold) {
        limit.status = 'warning';
      }
    });

    setRiskLimits(limits);
  }, [calculateRiskMetrics, positionRisks, portfolio]);

  // Update risk metrics
  useEffect(() => {
    setRiskMetrics(calculateRiskMetrics);
  }, [calculateRiskMetrics]);

  const calculatePositionSize = (
    targetRisk: number, // As percentage of portfolio
    stopLoss: number, // As percentage
    portfolioValue: number
  ) => {
    const riskAmount = portfolioValue * (targetRisk / 100);
    const positionSize = riskAmount / (stopLoss / 100);
    return Math.min(positionSize, portfolioValue * 0.25); // Max 25% position
  };

  const optimizePortfolio = (targetRisk: number = 5) => {
    if (!positionRisks.length) return [];

    // Simple mean reversion optimization
    const suggestions = positionRisks.map(position => {
      const currentWeight = position.percentOfPortfolio;
      let targetWeight = 100 / positionRisks.length; // Equal weight baseline
      
      // Adjust for risk
      if (position.volatility > 0.1) {
        targetWeight *= 0.8; // Reduce high-risk positions
      }
      
      // Adjust for concentration
      if (currentWeight > 20) {
        targetWeight = Math.min(targetWeight, 15); // Reduce concentrated positions
      }

      const action = currentWeight > targetWeight ? 'reduce' : 'increase';
      const change = Math.abs(currentWeight - targetWeight);

      return {
        symbol: position.symbol,
        currentWeight: currentWeight,
        targetWeight: targetWeight,
        action,
        change,
        reasoning: currentWeight > 20 ? 'Reduce concentration risk' : 
                  position.volatility > 0.1 ? 'High volatility position' : 
                  'Rebalance for diversification'
      };
    }).filter(s => s.change > 1); // Only significant changes

    return suggestions.sort((a, b) => b.change - a.change);
  };

  return {
    loading,
    portfolio,
    riskMetrics,
    positionRisks,
    riskLimits,
    calculatePositionSize,
    optimizePortfolio,
    refreshData: () => {
      setLoading(true);
      // Trigger data refetch
    }
  };
};