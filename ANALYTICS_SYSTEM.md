# Enterprise Analytics System Documentation

## Overview

This project features a comprehensive, enterprise-grade analytics backend comparable to platforms like Kaito. The system provides real-time analytics, sentiment analysis, trend detection, anomaly detection, and market intelligence.

## Architecture

### Database Tables

1. **social_sentiment_data** - Social media engagement and sentiment tracking
   - Tracks mentions, likes, shares, comments, views
   - Calculates sentiment scores, viral scores, velocity
   - Supports multiple platforms: Twitter, Telegram, Discord, Reddit, YouTube

2. **market_correlations** - Market intelligence and correlations
   - BTC, ETH, SOL correlation tracking
   - Liquidity metrics, bid-ask spreads
   - Volatility tracking (1h, 24h, 7d)

3. **trading_analytics** - Advanced trading metrics
   - Volume, trades, PnL tracking
   - Win rates, Sharpe ratio, max drawdown
   - Holder analytics and smart money tracking

4. **trend_analysis** - Technical analysis and forecasting
   - RSI, MACD, moving averages
   - Support/resistance levels
   - Pattern detection and price predictions

5. **anomaly_alerts** - Real-time anomaly detection
   - Price spikes, volume spikes
   - Sentiment shifts, liquidity drains
   - Whale movements, unusual trading

6. **competitive_analysis** - Competitor intelligence
7. **user_behavior_analytics** - User engagement metrics
8. **analytics_cache** - Performance optimization cache
9. **analytics_events** - Real-time event stream

### Edge Functions

1. **sentiment-analyzer** (`/functions/sentiment-analyzer`)
   - Analyzes text sentiment (positive/negative/neutral)
   - Calculates engagement metrics
   - Tracks velocity and viral scores

2. **trend-detector** (`/functions/trend-detector`)
   - Technical indicator calculation (RSI, MACD, SMA)
   - Trend direction and strength analysis
   - Support/resistance detection
   - Price prediction using linear regression

3. **anomaly-detector** (`/functions/anomaly-detector`)
   - Statistical anomaly detection
   - Price spike detection (z-score based)
   - Volume and sentiment anomaly detection
   - Liquidity drain detection

4. **analytics-query** (`/functions/analytics-query`)
   - Cached query API for fast analytics
   - Top performers, trending agents
   - Market overview, sentiment trends
   - Volume leaders, anomaly alerts

5. **analytics-aggregator** (`/functions/analytics-aggregator`)
   - Batch analytics aggregation
   - Portfolio and trading metrics calculation
   - Agent performance metrics
   - Composite scoring (health, investment, risk)

## Frontend Integration

### Hooks

#### useAdvancedAnalytics
Main hook for accessing analytics data:

```typescript
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';

const MyComponent = () => {
  const analytics = useAdvancedAnalytics('daily');

  return (
    <div>
      <h3>Top Performers</h3>
      {analytics.topPerformers?.map(performer => (
        <div key={performer.agent_id}>
          {performer.agent_id}: {performer.total_pnl}
        </div>
      ))}

      <h3>Anomaly Alerts</h3>
      {analytics.anomalyAlerts?.map(alert => (
        <Alert key={alert.id} severity={alert.severity}>
          {alert.description}
        </Alert>
      ))}
    </div>
  );
};
```

#### useAnalyticsDemo
Demo hook with example usage patterns:

```typescript
import { useAnalyticsDemo } from '@/hooks/useAnalyticsDemo';

const AnalyticsDemo = () => {
  const demo = useAnalyticsDemo();

  const runDemo = async () => {
    const agentId = 'some-agent-uuid';

    // Sentiment analysis
    await demo.demoSentimentAnalysis(agentId);

    // Trend analysis
    await demo.demoTrendAnalysis(agentId);

    // Anomaly detection
    await demo.demoAnomalyDetection(agentId);

    // Market overview
    await demo.demoMarketAnalytics();

    // Comprehensive agent analytics
    await demo.demoAgentAnalytics(agentId);
  };

  return <button onClick={runDemo}>Run Analytics Demo</button>;
};
```

### Services

#### AnalyticsService
Central service for all analytics operations:

```typescript
import { AnalyticsService } from '@/services/AnalyticsService';

// Get agent analytics
const agentData = await AnalyticsService.getAgentAnalytics(
  agentId,
  ['sentiment', 'trading', 'trends'],
  '24h'
);

// Analyze sentiment
const sentimentResult = await AnalyticsService.analyzeSentiment(
  agentId,
  'twitter',
  ['Great project!', 'Bullish!'],
  '24h'
);

// Detect trends
const trendResult = await AnalyticsService.detectTrends(
  agentId,
  priceHistory
);

// Detect anomalies
const anomalies = await AnalyticsService.detectAnomalies(
  agentId,
  currentData,
  historicalData
);

// Get top performers
const topPerformers = await AnalyticsService.getTopPerformers('24h', 10);

// Get trending agents
const trending = await AnalyticsService.getTrendingAgents('24h', 10);

// Get market overview
const overview = await AnalyticsService.getMarketOverview('24h');
```

## Period Formats

### Frontend Periods
- `'hourly'` - 1 hour windows
- `'daily'` - 24 hour windows
- `'weekly'` - 7 day windows
- `'monthly'` - 30 day windows

### Backend Database Periods
- `'1h'` - 1 hour
- `'4h'` - 4 hours
- `'24h'` - 24 hours (daily)
- `'7d'` - 7 days (weekly)
- `'30d'` - 30 days (monthly)

**Note**: When querying edge functions directly, use the backend period format ('24h', '7d', '30d').

## Features

### 1. Social Sentiment Analysis
- Multi-platform tracking (Twitter, Telegram, Discord, Reddit, YouTube)
- Sentiment scoring (-100 to 100)
- Viral score calculation
- Velocity tracking (rate of change)
- Influencer mention tracking

### 2. Market Intelligence
- Real-time correlation analysis with major assets
- Liquidity scoring and depth analysis
- Volatility tracking across multiple timeframes
- Volume-to-market-cap ratios

### 3. Trading Analytics
- P&L tracking and performance metrics
- Win rate and Sharpe ratio calculation
- Holder analytics and concentration metrics
- Smart money and whale activity tracking

### 4. Trend Detection
- Technical indicators (RSI, MACD, SMA, EMA)
- Support and resistance level detection
- Chart pattern recognition
- Price prediction models

### 5. Anomaly Detection
- Statistical anomaly detection (z-score based)
- Price and volume spike detection
- Sentiment shift detection
- Liquidity drain alerts

### 6. Performance Optimization
- Intelligent caching system (5-minute default TTL)
- Batch query processing
- Realtime subscriptions
- Automated cleanup processes

## Security & RLS Policies

All analytics tables have Row-Level Security enabled:

- **Public Read Access**: Most analytics data is publicly viewable
- **System Write Access**: Only system can insert/update analytics data
- **User Behavior**: Private to user and admins
- **Anomaly Alerts**: Sensitive alerts visible only to admins

## Maintenance Functions

### Cleanup Old Data
```sql
SELECT cleanup_old_analytics();
```

Automatically removes:
- Social sentiment > 90 days old
- Market correlations > 90 days old
- Trading analytics > 180 days old
- Resolved anomalies > 30 days old
- Expired cache entries
- Processed events > 7 days old

### Cache Management
```sql
-- Get cached analytics
SELECT get_or_compute_analytics('key', 300);

-- Update cache
SELECT update_analytics_cache('key', 'type', data_json, 300);
```

## Performance Considerations

1. **Caching Strategy**
   - Default 5-minute cache TTL
   - Configurable per-query
   - Automatic cache invalidation

2. **Query Optimization**
   - Indexed queries for fast retrieval
   - Batch processing for aggregations
   - Materialized analytics for common queries

3. **Real-time Updates**
   - Realtime subscriptions on key tables
   - Incremental updates via triggers
   - Event-driven architecture

## Monitoring & Logging

All edge functions include comprehensive logging:
- Query execution time tracking
- Error logging with context
- Cache hit/miss tracking
- Anomaly detection events

Check logs:
```bash
# View analytics-query logs
supabase functions logs analytics-query

# View sentiment-analyzer logs
supabase functions logs sentiment-analyzer

# View trend-detector logs
supabase functions logs trend-detector
```

## Testing

Use the `useAnalyticsDemo` hook to test all features:

```typescript
const demo = useAnalyticsDemo();

// Test individual features
await demo.demoSentimentAnalysis('agent-id');
await demo.demoTrendAnalysis('agent-id');
await demo.demoAnomalyDetection('agent-id');
await demo.demoMarketAnalytics();
```

## Troubleshooting

### No Data Showing
1. Check if analytics aggregator has run
2. Verify RLS policies allow access
3. Check edge function logs for errors
4. Ensure correct period format is used

### Slow Queries
1. Check cache hit rate
2. Verify indexes are present
3. Review query complexity
4. Consider adjusting cache TTL

### Missing Analytics
1. Run cleanup function to remove stale data
2. Trigger aggregator manually
3. Check data insertion errors in logs
4. Verify edge function permissions

## API Reference

See individual files for detailed API documentation:
- `src/services/AnalyticsService.ts` - Main service API
- `src/hooks/useAdvancedAnalytics.ts` - React hooks API
- `src/hooks/useAnalyticsDemo.ts` - Usage examples
