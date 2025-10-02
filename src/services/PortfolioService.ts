import { supabase } from '@/integrations/supabase/client'

export interface PortfolioHolding {
  id: string
  user_id: string
  asset_id: string
  asset_type: 'crypto' | 'agent'
  asset_name: string
  asset_symbol: string
  quantity: number
  average_buy_price: number
  total_invested: number
  current_value: number
  realized_pnl: number
  unrealized_pnl: number
  last_updated: string
  created_at: string
  updated_at: string
}

export interface PortfolioTransaction {
  id: string
  user_id: string
  holding_id?: string
  transaction_type: 'buy' | 'sell' | 'transfer'
  asset_id: string
  asset_name: string
  asset_symbol: string
  quantity: number
  price: number
  total_amount: number
  fees: number
  exchange?: string
  notes?: string
  transaction_date: string
  created_at: string
}

export class PortfolioService {
  /**
   * Get all holdings for a user
   */
  async getHoldings(userId: string): Promise<PortfolioHolding[]> {
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', userId)
      .order('current_value', { ascending: false })

    if (error) {
      console.error('Error fetching holdings:', error)
      return []
    }

    return (data || []) as PortfolioHolding[]
  }

  /**
   * Get a specific holding
   */
  async getHolding(userId: string, assetId: string, assetType: 'crypto' | 'agent'): Promise<PortfolioHolding | null> {
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('asset_id', assetId)
      .eq('asset_type', assetType)
      .maybeSingle()

    if (error) {
      console.error('Error fetching holding:', error)
      return null
    }

    return data as PortfolioHolding | null
  }

  /**
   * Add or update a holding (buy)
   */
  async addHolding(params: {
    userId: string
    assetId: string
    assetType: 'crypto' | 'agent'
    assetName: string
    assetSymbol: string
    quantity: number
    price: number
    fees?: number
    exchange?: string
    notes?: string
  }): Promise<{ success: boolean; holding?: PortfolioHolding; error?: string }> {
    try {
      const { userId, assetId, assetType, assetName, assetSymbol, quantity, price, fees = 0, exchange, notes } = params
      
      // Get existing holding if any
      const existing = await this.getHolding(userId, assetId, assetType)
      
      let holding: PortfolioHolding
      
      if (existing) {
        // Update existing holding with new average
        const newQuantity = existing.quantity + quantity
        const newTotalInvested = existing.total_invested + (quantity * price) + fees
        const newAverageBuyPrice = newTotalInvested / newQuantity
        
        const { data, error } = await supabase
          .from('portfolio_holdings')
          .update({
            quantity: newQuantity,
            average_buy_price: newAverageBuyPrice,
            total_invested: newTotalInvested,
            last_updated: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single()
        
        if (error) throw error
        holding = data as PortfolioHolding
      } else {
        // Create new holding
        const { data, error } = await supabase
          .from('portfolio_holdings')
          .insert({
            user_id: userId,
            asset_id: assetId,
            asset_type: assetType,
            asset_name: assetName,
            asset_symbol: assetSymbol,
            quantity,
            average_buy_price: price,
            total_invested: (quantity * price) + fees,
            current_value: quantity * price,
            unrealized_pnl: 0,
            realized_pnl: 0
          })
          .select()
          .single()
        
        if (error) throw error
        holding = data as PortfolioHolding
      }

      // Record transaction
      await supabase.from('portfolio_transactions').insert({
        user_id: userId,
        holding_id: holding.id,
        transaction_type: 'buy',
        asset_id: assetId,
        asset_name: assetName,
        asset_symbol: assetSymbol,
        quantity,
        price,
        total_amount: quantity * price,
        fees,
        exchange,
        notes
      })

      return { success: true, holding }
    } catch (error: any) {
      console.error('Error adding holding:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Remove or reduce a holding (sell)
   */
  async reduceHolding(params: {
    userId: string
    assetId: string
    assetType: 'crypto' | 'agent'
    quantity: number
    price: number
    fees?: number
    exchange?: string
    notes?: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { userId, assetId, assetType, quantity, price, fees = 0, exchange, notes } = params
      
      const existing = await this.getHolding(userId, assetId, assetType)
      if (!existing) {
        return { success: false, error: 'Holding not found' }
      }

      if (existing.quantity < quantity) {
        return { success: false, error: 'Insufficient quantity' }
      }

      const newQuantity = existing.quantity - quantity
      const proportionSold = quantity / existing.quantity
      const costBasis = existing.total_invested * proportionSold
      const saleProceeds = (quantity * price) - fees
      const realizedPnl = saleProceeds - costBasis
      
      if (newQuantity === 0) {
        // Remove holding completely
        await supabase
          .from('portfolio_holdings')
          .delete()
          .eq('id', existing.id)
      } else {
        // Update holding
        await supabase
          .from('portfolio_holdings')
          .update({
            quantity: newQuantity,
            total_invested: existing.total_invested - costBasis,
            realized_pnl: existing.realized_pnl + realizedPnl,
            last_updated: new Date().toISOString()
          })
          .eq('id', existing.id)
      }

      // Record transaction
      await supabase.from('portfolio_transactions').insert({
        user_id: userId,
        holding_id: existing.id,
        transaction_type: 'sell',
        asset_id: assetId,
        asset_name: existing.asset_name,
        asset_symbol: existing.asset_symbol,
        quantity,
        price,
        total_amount: quantity * price,
        fees,
        exchange,
        notes
      })

      return { success: true }
    } catch (error: any) {
      console.error('Error reducing holding:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update current values for all holdings based on current market prices
   */
  async updateHoldingsValue(userId: string, prices: Record<string, number>): Promise<void> {
    const holdings = await this.getHoldings(userId)
    
    for (const holding of holdings) {
      const currentPrice = prices[holding.asset_id]
      if (currentPrice) {
        const currentValue = holding.quantity * currentPrice
        const unrealizedPnl = currentValue - holding.total_invested
        
        await supabase
          .from('portfolio_holdings')
          .update({
            current_value: currentValue,
            unrealized_pnl: unrealizedPnl,
            last_updated: new Date().toISOString()
          })
          .eq('id', holding.id)
      }
    }
  }

  /**
   * Get transaction history for a user
   */
  async getTransactions(userId: string, limit: number = 50): Promise<PortfolioTransaction[]> {
    const { data, error } = await supabase
      .from('portfolio_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }

    return (data || []) as PortfolioTransaction[]
  }

  /**
   * Calculate portfolio summary
   */
  async getPortfolioSummary(userId: string): Promise<{
    totalValue: number
    totalInvested: number
    totalPnL: number
    totalPnLPercent: number
    realizedPnL: number
    unrealizedPnL: number
    holdingsCount: number
  }> {
    const holdings = await this.getHoldings(userId)
    
    const totalValue = holdings.reduce((sum, h) => sum + h.current_value, 0)
    const totalInvested = holdings.reduce((sum, h) => sum + h.total_invested, 0)
    const realizedPnL = holdings.reduce((sum, h) => sum + h.realized_pnl, 0)
    const unrealizedPnL = holdings.reduce((sum, h) => sum + h.unrealized_pnl, 0)
    const totalPnL = realizedPnL + unrealizedPnL
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

    return {
      totalValue,
      totalInvested,
      totalPnL,
      totalPnLPercent,
      realizedPnL,
      unrealizedPnL,
      holdingsCount: holdings.length
    }
  }

  /**
   * Migrate legacy crypto_portfolio data to new structure
   */
  async migrateLegacyPortfolio(userId: string): Promise<void> {
    try {
      // Get legacy data
      const { data: legacyData, error } = await supabase
        .from('crypto_portfolio')
        .select('*')
        .eq('user_id', userId)

      if (error || !legacyData || legacyData.length === 0) return

      // Migrate each entry
      for (const item of legacyData) {
        await this.addHolding({
          userId,
          assetId: item.crypto_id,
          assetType: 'crypto',
          assetName: item.crypto_name,
          assetSymbol: item.crypto_symbol,
          quantity: item.amount,
          price: item.purchase_price,
          exchange: item.exchange,
          notes: item.notes
        })
      }

      console.log(`Migrated ${legacyData.length} legacy portfolio items`)
    } catch (error) {
      console.error('Error migrating legacy portfolio:', error)
    }
  }
}

export const portfolioService = new PortfolioService()