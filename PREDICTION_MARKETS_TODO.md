# Prediction Markets - Backend Integration TODO

## Current Status
✅ Complete frontend UI with mock data
✅ All pages and components created
✅ Navigation integrated
✅ Responsive design

## Backend Integration Points

### 1. Smart Contract Integration (Phase 1)
**Files to update:**
- `src/hooks/useEvmTransactions.ts` - Add prediction market contract methods
- `src/config/networks.ts` - Add prediction market contract addresses

**Required contract functions:**
- `createMarket(question, outcomes, resolutionDate, initialLiquidity)`
- `buyShares(marketId, outcomeId, amount)`
- `sellShares(marketId, outcomeId, shares)`
- `resolveMarket(marketId, winningOutcomeId)`
- `claimWinnings(marketId)`

### 2. Database Tables Needed
```sql
-- prediction_markets table
CREATE TABLE prediction_markets (
  id UUID PRIMARY KEY,
  question TEXT,
  description TEXT,
  category TEXT,
  status TEXT,
  outcome_type TEXT,
  total_liquidity DECIMAL,
  total_volume DECIMAL,
  resolution_date TIMESTAMP,
  created_at TIMESTAMP,
  creator_address TEXT,
  oracle_source TEXT,
  image_url TEXT,
  contract_address TEXT,
  network TEXT
);

-- market_outcomes table
CREATE TABLE market_outcomes (
  id UUID PRIMARY KEY,
  market_id UUID REFERENCES prediction_markets(id),
  label TEXT,
  shares DECIMAL,
  price DECIMAL
);

-- user_positions table
CREATE TABLE user_positions (
  id UUID PRIMARY KEY,
  market_id UUID REFERENCES prediction_markets(id),
  outcome_id UUID REFERENCES market_outcomes(id),
  user_id UUID,
  wallet_address TEXT,
  shares DECIMAL,
  average_price DECIMAL
);

-- market_trades table
CREATE TABLE market_trades (
  id UUID PRIMARY KEY,
  market_id UUID REFERENCES prediction_markets(id),
  outcome_id UUID REFERENCES market_outcomes(id),
  type TEXT,
  shares DECIMAL,
  price DECIMAL,
  total_cost DECIMAL,
  user_address TEXT,
  tx_hash TEXT,
  timestamp TIMESTAMP
);
```

### 3. Replace Mock Data
**Files to update:**
- `src/hooks/usePredictionMarkets.ts` - Replace mock data with API calls
- Add Supabase queries for markets, positions, trades

### 4. Smart Contract ABI
Add to `src/contracts/PredictionMarket.json`:
```json
{
  "abi": [
    // Contract ABI from deployed contract
  ]
}
```

### 5. Edge Functions Needed
- `create-market` - Validate and record market creation
- `record-trade` - Verify and record blockchain trades
- `resolve-market` - Handle market resolution with oracle
- `sync-blockchain-data` - Periodic sync of on-chain data

## Smart Contract Deployment
Contracts to deploy:
- `PredictionMarket.sol` (Base + BNB Chain)
- Cost: ~$20-50

## Testing Checklist
- [ ] Create market flow
- [ ] Buy shares transaction
- [ ] Sell shares transaction
- [ ] Real-time price updates
- [ ] Position tracking
- [ ] Market resolution
- [ ] Claiming winnings
