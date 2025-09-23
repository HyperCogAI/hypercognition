# HyperCognition API Documentation

## Overview

HyperCognition provides a comprehensive API for AI-powered trading, portfolio management, and market analysis. Our API is built on Supabase with real-time capabilities and supports both REST and WebSocket connections.

## Base URL

```
Production: https://your-project.supabase.co
Development: http://localhost:54321
```

## Authentication

All API requests require authentication using Supabase Auth tokens.

### Getting an API Key

1. Sign up at [HyperCognition](https://hypercognition.ai)
2. Navigate to Settings > API Keys
3. Generate a new API key
4. Include the key in your request headers

### Headers

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
apikey: YOUR_SUPABASE_ANON_KEY
```

## Rate Limits

- **Free Tier**: 100 requests per minute
- **Pro Tier**: 1,000 requests per minute
- **Enterprise**: Custom limits

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Error Handling

All errors follow the standard HTTP status code conventions:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid parameters provided",
    "details": {
      "field": "amount",
      "reason": "Must be greater than 0"
    }
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `AUTHENTICATION_ERROR` | Invalid or missing API key |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `VALIDATION_ERROR` | Invalid request parameters |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `INTERNAL_ERROR` | Server error |

## Endpoints

### Market Data

#### Get Market Overview
```http
GET /api/v1/market/overview
```

Response:
```json
{
  "crypto": [
    {
      "id": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "current_price": 45000,
      "market_cap": 850000000000,
      "volume_24h": 25000000000,
      "price_change_percentage_24h": 2.5
    }
  ],
  "solana": [
    {
      "mint_address": "So11111111111111111111111111111111111111112",
      "symbol": "SOL",
      "name": "Solana",
      "price": 150.50,
      "market_cap": 65000000000,
      "volume_24h": 2000000000,
      "change_24h": 2.5
    }
  ]
}
```

#### Get Token Price
```http
GET /api/v1/market/price/{token_id}
```

Parameters:
- `token_id` (string): Token identifier or mint address
- `vs_currency` (string, optional): Currency to quote price in (default: usd)

#### Get Price History
```http
GET /api/v1/market/history/{token_id}
```

Parameters:
- `days` (number, optional): Number of days (default: 1)
- `interval` (string, optional): Data interval (1h, 4h, 1d)

### Trading

#### Create Order
```http
POST /api/v1/trading/orders
```

Request:
```json
{
  "type": "market",
  "side": "buy",
  "symbol": "SOL/USDC",
  "amount": 10,
  "price": 150.50,
  "stop_loss": 140.00,
  "take_profit": 160.00
}
```

#### Get Orders
```http
GET /api/v1/trading/orders
```

Parameters:
- `status` (string, optional): Filter by status (open, closed, cancelled)
- `symbol` (string, optional): Filter by trading pair
- `limit` (number, optional): Limit results (default: 50)

#### Cancel Order
```http
DELETE /api/v1/trading/orders/{order_id}
```

### Portfolio

#### Get Portfolio
```http
GET /api/v1/portfolio
```

Response:
```json
{
  "total_value": 12450.75,
  "holdings": [
    {
      "symbol": "SOL",
      "amount": 82.5,
      "value": 12400.75,
      "percentage": 99.6
    }
  ],
  "performance": {
    "total_pnl": 450.75,
    "total_pnl_percentage": 3.76,
    "daily_pnl": 35.50,
    "daily_pnl_percentage": 0.29
  }
}
```

#### Get Portfolio Analytics
```http
GET /api/v1/portfolio/analytics
```

Parameters:
- `period` (string): Time period (1d, 7d, 30d, 90d, 1y)

### AI Agents

#### List Agents
```http
GET /api/v1/agents
```

Parameters:
- `category` (string, optional): Filter by category
- `performance_min` (number, optional): Minimum performance percentage
- `limit` (number, optional): Limit results

#### Get Agent Details
```http
GET /api/v1/agents/{agent_id}
```

#### Subscribe to Agent
```http
POST /api/v1/agents/{agent_id}/subscribe
```

Request:
```json
{
  "allocation_percentage": 25,
  "max_risk_level": "medium"
}
```

### Notifications

#### Get Notifications
```http
GET /api/v1/notifications
```

#### Mark as Read
```http
PATCH /api/v1/notifications/{notification_id}/read
```

## WebSocket API

Real-time data is available via WebSocket connections.

### Connection

```javascript
const ws = new WebSocket('wss://your-project.supabase.co/socket');

ws.onopen = () => {
  // Subscribe to channels
  ws.send(JSON.stringify({
    event: 'phx_join',
    topic: 'realtime:public:market_data',
    payload: {},
    ref: '1'
  }));
};
```

### Channels

- `realtime:public:market_data` - Market price updates
- `realtime:public:trading_signals` - AI trading signals
- `user:{user_id}:portfolio` - Portfolio updates
- `user:{user_id}:orders` - Order status updates

## SDKs

### JavaScript/TypeScript

```bash
npm install @hypercognition/api-client
```

```javascript
import { HyperCognitionClient } from '@hypercognition/api-client';

const client = new HyperCognitionClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-project.supabase.co'
});

// Get market data
const market = await client.market.getOverview();

// Create an order
const order = await client.trading.createOrder({
  type: 'market',
  side: 'buy',
  symbol: 'SOL/USDC',
  amount: 10
});
```

### Python

```bash
pip install hypercognition-python
```

```python
from hypercognition import HyperCognitionClient

client = HyperCognitionClient(
    api_key='your-api-key',
    base_url='https://your-project.supabase.co'
)

# Get portfolio
portfolio = client.portfolio.get()
print(f"Total value: ${portfolio.total_value}")
```

## Webhooks

Receive real-time notifications about important events.

### Setup

1. Configure webhook URL in Settings > Webhooks
2. Choose events to receive
3. Verify webhook signature

### Events

- `order.filled` - Order executed
- `portfolio.risk_threshold` - Risk threshold exceeded
- `agent.signal` - New trading signal
- `price.alert` - Price alert triggered

### Payload

```json
{
  "event": "order.filled",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "order_id": "ord_123",
    "symbol": "SOL/USDC",
    "side": "buy",
    "amount": 10,
    "price": 150.50,
    "total": 1505.00
  }
}
```

## Examples

### Portfolio Rebalancing

```javascript
const portfolio = await client.portfolio.get();
const target_allocation = {
  'SOL': 60,
  'ETH': 30,
  'BTC': 10
};

for (const [symbol, target_pct] of Object.entries(target_allocation)) {
  const current = portfolio.holdings.find(h => h.symbol === symbol);
  const current_pct = current ? current.percentage : 0;
  
  if (Math.abs(current_pct - target_pct) > 5) {
    // Rebalance needed
    const amount = portfolio.total_value * (target_pct - current_pct) / 100;
    
    await client.trading.createOrder({
      type: 'market',
      side: amount > 0 ? 'buy' : 'sell',
      symbol: `${symbol}/USDC`,
      amount: Math.abs(amount)
    });
  }
}
```

### Real-time Price Monitoring

```javascript
const ws = new WebSocket('wss://your-project.supabase.co/socket');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.event === 'price_update') {
    const { symbol, price, change_24h } = data.payload;
    
    // Check for alerts
    if (Math.abs(change_24h) > 10) {
      console.log(`Alert: ${symbol} moved ${change_24h}% in 24h`);
    }
  }
};
```

## Support

- **Documentation**: [docs.hypercognition.ai](https://docs.hypercognition.ai)
- **API Reference**: [api.hypercognition.ai](https://api.hypercognition.ai)
- **Support**: [support@hypercognition.ai](mailto:support@hypercognition.ai)
- **Discord**: [discord.gg/hypercognition](https://discord.gg/hypercognition)

## Changelog

### v1.2.0 (2024-01-15)
- Added portfolio analytics endpoints
- Improved WebSocket stability
- New Python SDK

### v1.1.0 (2023-12-01)
- Added AI agent subscription API
- Enhanced error handling
- WebSocket API for real-time data

### v1.0.0 (2023-11-01)
- Initial API release
- Core trading and portfolio endpoints
- Authentication system