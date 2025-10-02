# Kaito Integration Architecture

## Overview
This document outlines the integration architecture for pulling Kaito AI data into HyperCognition's analytics platform.

## Research Summary

### Kaito API Access
1. **Yaps API (Public)** - Available now
   - Endpoint: `https://api.kaito.ai/api/v1/yaps`
   - Rate limit: 100 calls per 5 minutes
   - No authentication required
   - Returns attention scores for X (Twitter) users
   - Licensing: Open protocol, permissionless use

2. **Full API (Enterprise)** - Requires sales contact
   - Sentiment analysis
   - Social engagement metrics
   - Market intelligence
   - Trend detection
   - Pricing: Custom enterprise pricing

### Data Points Available (Yaps)
```json
{
  "user_id": "295218901",
  "username": "VitalikButerin",
  "yaps_all": 3569.71215890904,
  "yaps_l24h": 0,
  "yaps_l48h": 0,
  "yaps_l7d": 0,
  "yaps_l30d": 3569.71215890904,
  "yaps_l3m": 3569.71215890904,
  "yaps_l6m": 3569.71215890904,
  "yaps_l12m": 3569.71215890904
}
```

## Integration Architecture

### Phase 1: Yaps Integration (Free API)
```
┌─────────────────────────────────────────────────────────────┐
│                    HyperCognition Frontend                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Analytics  │  │ Agent Detail │  │  Social Signals  │   │
│  │  Dashboard  │  │     Page     │  │    Component     │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
└─────────┼─────────────────┼────────────────────┼─────────────┘
          │                 │                    │
          └─────────────────┼────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Function Layer                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         kaito-sync (Scheduled/On-demand)              │  │
│  │  • Fetch Yaps for tracked users/agents                │  │
│  │  • Store in social_sentiment_data table               │  │
│  │  • Rate limit management (100/5min)                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Kaito Public API                          │
│              https://api.kaito.ai/api/v1/yaps                │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Database                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  kaito_attention_scores                               │  │
│  │  • agent_id, user_id, username                        │  │
│  │  • yaps_24h, yaps_7d, yaps_30d, yaps_all             │  │
│  │  • timestamp, metadata                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  social_sentiment_data (Enhanced)                     │  │
│  │  • Add kaito_attention_score field                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: Full API Integration (Enterprise)
```
┌─────────────────────────────────────────────────────────────┐
│              Additional Edge Functions                       │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ kaito-sentiment  │  │  kaito-trends    │                │
│  │  • Social mood   │  │  • Narrative     │                │
│  │  • Engagement    │  │    detection     │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Kaito Enterprise API (Paid)                     │
│  • Sentiment Analysis  • Market Intelligence                 │
│  • Social Signals      • Trend Detection                     │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### New Table: kaito_attention_scores
```sql
CREATE TABLE kaito_attention_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  twitter_user_id TEXT,
  twitter_username TEXT,
  yaps_24h NUMERIC DEFAULT 0,
  yaps_48h NUMERIC DEFAULT 0,
  yaps_7d NUMERIC DEFAULT 0,
  yaps_30d NUMERIC DEFAULT 0,
  yaps_3m NUMERIC DEFAULT 0,
  yaps_6m NUMERIC DEFAULT 0,
  yaps_12m NUMERIC DEFAULT 0,
  yaps_all NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Implementation Plan

### Immediate (Phase 1 - Free API)
1. ✅ Create `kaito_attention_scores` table
2. ✅ Build `kaito-sync` edge function
3. ✅ Create `KaitoService` for frontend integration
4. ✅ Add Kaito attention scores to analytics dashboard
5. ✅ Display social influence metrics on agent pages

### Future (Phase 2 - Enterprise API)
1. Contact Kaito sales for enterprise API access
2. Implement sentiment analysis integration
3. Add market intelligence features
4. Build trend detection connectors
5. Create custom dashboards for premium features

## Rate Limiting Strategy
- **Yaps API**: 100 calls / 5 minutes
- **Strategy**: Batch requests, prioritize top agents
- **Caching**: Store results for 6-24 hours
- **Priority queue**: High-volume agents checked more frequently

## Benefits to HyperCognition
1. **Social Proof**: Real attention metrics for agents
2. **Influence Ranking**: Identify trending agents
3. **Community Engagement**: Track social momentum
4. **Market Signals**: Early indicators of interest
5. **No Additional Costs**: Phase 1 is completely free

## Cost Analysis
- **Phase 1 (Yaps)**: $0/month - Free forever
- **Phase 2 (Full API)**: Contact sales for pricing (likely $1k-10k/month for enterprise)

## Risk Mitigation
- Start with free API to validate integration
- Build abstraction layer for easy API swapping
- Cache aggressively to stay within rate limits
- Graceful degradation if API unavailable
