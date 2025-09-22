interface JupiterToken {
  address: string
  chainId: number
  decimals: number
  name: string
  symbol: string
  logoURI?: string
  tags?: string[]
}

interface JupiterPrice {
  id: string
  mintSymbol: string
  vsToken: string
  vsTokenSymbol: string
  price: number
}

interface JupiterSwapRoute {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee: any
  priceImpactPct: string
  routePlan: Array<{
    swapInfo: {
      ammKey: string
      label: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
      feeAmount: string
      feeMint: string
    }
    percent: number
  }>
  contextSlot: number
  timeTaken: number
}

class JupiterAPI {
  private baseUrl = 'https://api.jup.ag'
  private priceUrl = 'https://price.jup.ag/v6'
  private rateLimitDelay = 500 // 500ms between requests
  private lastRequestTime = 0

  private async rateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest))
    }
    this.lastRequestTime = Date.now()
  }

  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    await this.rateLimit()
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited, wait and retry
          await new Promise(resolve => setTimeout(resolve, 2000))
          const retryResponse = await fetch(url)
          if (!retryResponse.ok) {
            throw new Error(`Jupiter API error: ${retryResponse.status}`)
          }
          return retryResponse.json()
        }
        throw new Error(`Jupiter API error: ${response.status}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Jupiter API request failed:', error)
      throw error
    }
  }

  async getAllTokens(): Promise<JupiterToken[]> {
    const url = `${this.baseUrl}/tokens`
    return this.fetchWithErrorHandling<JupiterToken[]>(url)
  }

  async getStrictTokenList(): Promise<JupiterToken[]> {
    const url = `${this.baseUrl}/tokens?tags=strict`
    return this.fetchWithErrorHandling<JupiterToken[]>(url)
  }

  async getTokenPrices(mints: string[]): Promise<{ data: Record<string, JupiterPrice> }> {
    const mintsQuery = mints.join(',')
    const url = `${this.priceUrl}/price?ids=${mintsQuery}`
    return this.fetchWithErrorHandling<{ data: Record<string, JupiterPrice> }>(url)
  }

  async getTokenPrice(mint: string): Promise<JupiterPrice | null> {
    try {
      const response = await this.getTokenPrices([mint])
      return response.data[mint] || null
    } catch (error) {
      console.error(`Failed to get price for mint ${mint}:`, error)
      return null
    }
  }

  async getSwapRoute(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<JupiterSwapRoute[]> {
    const url = `${this.baseUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`
    const response = await this.fetchWithErrorHandling<{ data: JupiterSwapRoute[] }>(url)
    return response.data
  }

  // Get popular Solana tokens with market data
  async getPopularTokensWithPrices(limit: number = 50): Promise<any[]> {
    try {
      const tokens = await this.getStrictTokenList()
      const popularTokens = tokens.slice(0, limit)
      
      if (popularTokens.length === 0) return []
      
      const mints = popularTokens.map(token => token.address)
      const pricesResponse = await this.getTokenPrices(mints)
      
      return popularTokens.map(token => {
        const priceData = pricesResponse.data[token.address]
        return this.mapToSolanaToken(token, priceData)
      }).filter(token => token.price > 0)
    } catch (error) {
      console.error('Failed to get popular tokens with prices:', error)
      return []
    }
  }

  // Convert Jupiter data to our Solana token format
  mapToSolanaToken(tokenData: JupiterToken, priceData?: JupiterPrice): any {
    // Generate some mock market data based on price if available
    const price = priceData?.price || 0
    const volume24h = price > 0 ? Math.random() * 1000000 : 0
    const change24h = (Math.random() - 0.5) * 20 // Random change between -10% and +10%
    const marketCap = price > 0 ? price * (Math.random() * 10000000 + 1000000) : 0

    return {
      id: tokenData.address,
      mint_address: tokenData.address,
      name: tokenData.name,
      symbol: tokenData.symbol,
      description: `${tokenData.name} token on Solana`,
      image_url: tokenData.logoURI || null,
      decimals: tokenData.decimals,
      price,
      market_cap: marketCap,
      volume_24h: volume24h,
      change_24h: change24h,
      is_active: true,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  }

  // Well-known Solana token addresses
  static readonly WELL_KNOWN_TOKENS = {
    SOL: 'So11111111111111111111111111111111111111112',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    JTO: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
    PYTH: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
  }
}

export const jupiterApi = new JupiterAPI()
export type { JupiterToken, JupiterPrice, JupiterSwapRoute }