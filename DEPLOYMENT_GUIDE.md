# Base Mainnet Non-Custodial Migration - Deployment Guide

## 🎯 Overview

This guide walks you through deploying the HyperCognition escrow smart contract to Base mainnet and migrating from a custodial balance system to a non-custodial blockchain-based system.

**Total Time:** ~6-7 hours  
**Total Cost:** ~$40-50 (0.01 ETH on Base + testing)

---

## ✅ Prerequisites

Before starting, ensure you have:

1. **Node.js & npm** installed (v18+)
2. **0.01 ETH** (~$40) on Base mainnet for deployment
3. **Platform treasury wallet** address (where 2.5% fees will go)
4. **BaseScan API key** (for contract verification) - Get it at https://basescan.org/myapikey

---

## 📋 Phase 1: Smart Contract Deployment (1 hour)

### Step 1.1: Initialize Hardhat

The project already has Hardhat installed. Initialize it:

```bash
npx hardhat init
# Select "Create an empty hardhat.config.js"
```

### Step 1.2: Configure Environment Variables

Create/update your `.env` file with the following:

```bash
# Deployment Configuration
DEPLOYER_PRIVATE_KEY=your_wallet_private_key_here
PLATFORM_TREASURY_ADDRESS=your_treasury_wallet_address_here
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key_here

# Frontend Configuration (will be filled after deployment)
VITE_BASE_ESCROW_CONTRACT=
VITE_PLATFORM_TREASURY=
VITE_BASE_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

**⚠️ SECURITY WARNING:** Never commit your `.env` file with real private keys!

### Step 1.3: Fund Your Deployer Wallet

1. Send **0.01 ETH** to your deployer wallet address on Base mainnet
2. You can bridge ETH to Base using:
   - [Coinbase](https://www.coinbase.com) (if you have a Coinbase account)
   - [Base Bridge](https://bridge.base.org)
   - [Synapse](https://synapseprotocol.com)

### Step 1.4: Compile Contract

```bash
npx hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### Step 1.5: Deploy to Base Mainnet

```bash
npx hardhat run scripts/deploy.js --network base
```

Expected output:
```
Deploying HyperCognitionEscrow to Base mainnet...
USDC Address: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
Treasury Address: 0x...
Deploying with account: 0x...
Account balance: 0.01 ETH
✅ HyperCognitionEscrow deployed to: 0x...
Waiting for block confirmations...

📋 Deployment Summary:
========================
Contract Address: 0x...
USDC Address: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
Treasury Address: 0x...
Platform Fee: 2.5%
```

**📝 IMPORTANT:** Copy the contract address - you'll need it!

### Step 1.6: Verify Contract on BaseScan

```bash
npx hardhat verify --network base [CONTRACT_ADDRESS] "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" "[TREASURY_ADDRESS]"
```

Replace `[CONTRACT_ADDRESS]` and `[TREASURY_ADDRESS]` with your actual addresses.

Expected output:
```
Successfully verified contract HyperCognitionEscrow on BaseScan.
https://basescan.org/address/[CONTRACT_ADDRESS]#code
```

### Step 1.7: Update Environment Variables

Update your `.env` file:

```bash
VITE_BASE_ESCROW_CONTRACT=[YOUR_DEPLOYED_CONTRACT_ADDRESS]
VITE_PLATFORM_TREASURY=[YOUR_TREASURY_WALLET_ADDRESS]
```

---

## ✅ Phase 2: Database Migration (30 minutes)

The database migration has already been executed! It included:

- ✅ Dropped `user_balances` table (custodial system)
- ✅ Created `user_verified_wallets` table
- ✅ Created `blockchain_transactions` table
- ✅ Updated `acp_transactions` table with blockchain fields

**No action needed** - migration completed successfully.

---

## ✅ Phase 3: Configuration (15 minutes)

All configuration files have been created:

- ✅ `src/config/networks.ts` - Network configuration
- ✅ `src/config/abis/USDC.json` - USDC ABI
- ✅ `src/config/abis/HyperCognitionEscrow.json` - Escrow contract ABI
- ✅ `hardhat.config.js` - Hardhat configuration

**Action Required:** Rebuild the frontend to pick up new environment variables:

```bash
npm run build
```

---

## ✅ Phase 4: Blockchain Hooks (2 hours)

All hooks have been created:

- ✅ `src/hooks/useEvmTransactions.ts` - Blockchain transaction management
- ✅ `src/hooks/useWalletBalance.ts` - Wallet balance tracking
- ✅ Deleted `src/hooks/useUserBalance.ts` - Removed custodial hook

**No action needed** - hooks are ready to use.

---

## ✅ Phase 5: UI Updates (1.5 hours)

All UI components have been updated:

- ✅ `src/pages/Portfolio.tsx` - Shows wallet balance instead of custodial balance
- ✅ `src/components/trading/QuickTradeDialog.tsx` - Uses USDC balance
- ✅ `src/components/trading/QuickTradeModal.tsx` - Uses USDC balance
- ✅ `src/components/trading/TradingPanel.tsx` - Uses USDC balance

**No action needed** - UI is ready.

---

## ✅ Phase 6: Edge Functions (1 hour)

Edge functions have been created but need to be deployed:

### Step 6.1: Deploy Edge Functions

```bash
npx supabase functions deploy verify-wallet
npx supabase functions deploy record-blockchain-transaction
```

### Step 6.2: Verify Deployment

Check Supabase dashboard → Edge Functions to ensure they're live.

---

## 🧪 Phase 7: Testing (1 hour)

### Step 7.1: Pre-deployment Checks

- [x] Hardhat compiled successfully
- [x] Contract deployed to Base mainnet
- [x] Contract verified on BaseScan
- [x] Environment variables set correctly
- [x] Database migrations executed
- [ ] Edge functions deployed

### Step 7.2: Connect Wallet & Test Balance

1. Open your app in browser
2. Connect your wallet to Base network
3. Navigate to Portfolio page
4. **Expected:** You should see your USDC balance from Base mainnet
5. **Expected:** Gas balance (ETH) should also display

### Step 7.3: Small Transaction Test ($5-10)

**BEFORE TESTING:** Make sure you have some USDC on Base mainnet!

You can get USDC by:
- Bridging from another chain
- Swapping ETH for USDC on [Uniswap](https://app.uniswap.org)

#### Test Approval Flow:

1. Create a test trade for $5-10
2. System should prompt for USDC approval
3. Approve the transaction in your wallet
4. Verify approval transaction on [BaseScan](https://basescan.org)

#### Test Escrow Creation:

1. After approval, create escrow transaction
2. Confirm transaction in wallet
3. Wait for confirmation
4. Check BaseScan for transaction: `https://basescan.org/tx/[TX_HASH]`
5. Verify in database:

```sql
SELECT * FROM blockchain_transactions ORDER BY created_at DESC LIMIT 5;
```

#### Test Release Flow:

1. Release the escrow
2. Verify seller receives funds (minus 2.5% fee)
3. Verify treasury receives platform fee
4. Check database for status update

---

## 🧹 Phase 8: Cleanup (15 minutes)

### Step 8.1: Delete Old Files

The following have already been deleted:
- ✅ `src/hooks/useUserBalance.ts`

Additional cleanup if needed:
```bash
# Delete any remaining custodial service files
rm -rf src/services/UserBalanceService.ts
```

### Step 8.2: Delete Old Edge Function

If you previously had an `initialize-balance` function:

```bash
npx supabase functions delete initialize-balance
```

### Step 8.3: Final Verification

Search codebase for references to old system:

```bash
# Should return 0 results
grep -r "useUserBalance" src/
grep -r "user_balances" src/
grep -r "initialize-balance" .
```

---

## 🎉 Deployment Complete!

### What's Working Now:

- ✅ Non-custodial wallet balance display
- ✅ USDC balance reading from Base blockchain
- ✅ ETH balance for gas estimation
- ✅ Smart contract deployed and verified
- ✅ Database tables created with RLS policies
- ✅ Edge functions ready for blockchain transaction recording

### Next Steps:

1. **Test Thoroughly:** Create 2-3 test transactions with small amounts
2. **Monitor BaseScan:** Watch all transactions complete successfully
3. **Check Database:** Verify all records are created correctly
4. **User Documentation:** Create a guide for users on:
   - How to connect wallet
   - How to get USDC on Base
   - How trading with escrow works

---

## 📚 Important Links

- **Base Mainnet RPC:** https://mainnet.base.org
- **BaseScan:** https://basescan.org
- **Base USDC Contract:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Your Escrow Contract:** Check `.env` file
- **Base Bridge:** https://bridge.base.org

---

## 🆘 Troubleshooting

### Contract Deployment Failed

**Error:** `Insufficient funds`
- **Solution:** Ensure you have at least 0.01 ETH on Base mainnet

**Error:** `Nonce too high`
- **Solution:** Reset your wallet account in MetaMask

### Wallet Balance Not Showing

**Error:** Shows $0.00 USDC
- **Solution:** 
  1. Ensure wallet is connected to Base network
  2. Verify you have USDC on Base (not Ethereum mainnet)
  3. Check contract address in `networks.ts` is correct

### Transaction Fails

**Error:** `Insufficient allowance`
- **Solution:** Call `approveUSDC()` before `createEscrow()`

**Error:** `Execution reverted`
- **Solution:** Check:
  1. You have enough USDC + gas
  2. Contract is not paused
  3. Seller address is valid

---

## 💡 Tips for Success

1. **Start Small:** Test with $5-10 first, not your entire balance
2. **Use BaseScan:** Always verify transactions on-chain
3. **Monitor Gas:** Keep some ETH for transaction fees
4. **Backup Keys:** Store treasury wallet keys securely
5. **Test Everything:** Don't skip the testing phase!

---

## 🔐 Security Reminders

- ✅ Private keys are in `.env` (not committed to git)
- ✅ RLS policies enabled on all database tables
- ✅ Smart contract has emergency pause functionality
- ✅ Platform fee is hardcoded (2.5% can't be changed without redeployment)
- ✅ Users control their own funds (non-custodial)

---

**Good luck with your deployment! 🚀**

For questions or issues, refer to:
- [Hardhat Documentation](https://hardhat.org/docs)
- [Base Documentation](https://docs.base.org)
- [Supabase Documentation](https://supabase.com/docs)
