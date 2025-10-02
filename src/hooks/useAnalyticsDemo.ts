import { useEffect } from 'react';
import { AnalyticsService } from '@/services/AnalyticsService';
import { useAdvancedAnalytics } from './useAdvancedAnalytics';

/**
 * Demo hook showing how to use the enterprise analytics system
 * 
 * Features:
 * - Social sentiment analysis
 * - Trading analytics with top performers
 * - Trend detection with technical indicators
 * - Anomaly detection for unusual patterns
 * - Market correlation analysis
 * - Real-time analytics caching
 */
export const useAnalyticsDemo = () => {
  const analytics = useAdvancedAnalytics('daily');

  useEffect(() => {
    // Example: Track a page view event
    analytics.trackEvent({
      event_type: 'page_view',
      event_category: 'analytics',
      event_name: 'analytics_dashboard_viewed',
      event_data: {
        timestamp: new Date().toISOString(),
      },
    });
  }, []);

  // Example functions demonstrating analytics capabilities
  const demoSentimentAnalysis = async (agentId: string) => {
    try {
      // Analyze sentiment from social media texts
      const result = await AnalyticsService.analyzeSentiment(
        agentId,
        'twitter',
        [
          'This agent is amazing! Great returns!',
          'Bullish on this project',
          'To the moon! 🚀',
        ],
        '24h'
      );
      console.log('Sentiment Analysis Result:', result);
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
    }
  };

  const demoTrendAnalysis = async (agentId: string) => {
    try {
      // Generate mock price history (in production, fetch real data)
      const priceHistory = Array.from({ length: 100 }, (_, i) => ({
        price: 100 + Math.sin(i / 10) * 10 + Math.random() * 5,
        volume: Math.random() * 10000,
        timestamp: new Date(Date.now() - (100 - i) * 3600000).toISOString(),
      }));

      const trendResult = await AnalyticsService.detectTrends(
        agentId,
        priceHistory
      );
      console.log('Trend Analysis Result:', trendResult);
    } catch (error) {
      console.error('Trend analysis failed:', error);
    }
  };

  const demoAnomalyDetection = async (agentId: string) => {
    try {
      const currentData = {
        price: 150,
        volume: 50000,
        sentiment: 75,
        liquidity: 100000,
      };

      const historicalData = Array.from({ length: 50 }, () => ({
        price: 100 + Math.random() * 10,
        volume: 10000 + Math.random() * 5000,
        sentiment: 50 + Math.random() * 20,
        liquidity: 80000 + Math.random() * 20000,
      }));

      const anomalyResult = await AnalyticsService.detectAnomalies(
        agentId,
        currentData,
        historicalData
      );
      console.log('Anomaly Detection Result:', anomalyResult);
    } catch (error) {
      console.error('Anomaly detection failed:', error);
    }
  };

  const demoMarketAnalytics = async () => {
    try {
      // Get top performing agents
      const topPerformers = await analytics.topPerformers;
      console.log('Top Performers:', topPerformers);

      // Get trending agents
      const trending = await analytics.trendingAgents;
      console.log('Trending Agents:', trending);

      // Get market overview
      const overview = await analytics.marketOverview;
      console.log('Market Overview:', overview);

      // Get anomaly alerts
      const anomalies = await analytics.anomalyAlerts;
      console.log('Anomaly Alerts:', anomalies);
    } catch (error) {
      console.error('Market analytics failed:', error);
    }
  };

  const demoAgentAnalytics = async (agentId: string) => {
    try {
      // Get comprehensive agent analytics
      const agentData = await AnalyticsService.getAgentAnalytics(
        agentId,
        ['all'], // or specific: ['sentiment', 'trading', 'trends', 'correlations', 'anomalies']
        '24h'
      );
      console.log('Agent Analytics:', agentData);
    } catch (error) {
      console.error('Agent analytics failed:', error);
    }
  };

  return {
    // Analytics data
    analytics,
    
    // Demo functions
    demoSentimentAnalysis,
    demoTrendAnalysis,
    demoAnomalyDetection,
    demoMarketAnalytics,
    demoAgentAnalytics,
  };
};

/**
 * Period Format Mapping:
 * 
 * Frontend (useAdvancedAnalytics):
 * - 'hourly' | 'daily' | 'weekly' | 'monthly'
 * 
 * Backend (database tables):
 * - '1h', '4h', '24h', '7d', '30d'
 * 
 * For queries, use:
 * - '24h' for daily
 * - '7d' for weekly  
 * - '30d' for monthly
 */
