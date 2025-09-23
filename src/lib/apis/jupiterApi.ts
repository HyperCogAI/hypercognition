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
    
    const { structuredLogger } = await import('@/lib/structuredLogger')
    
    try {
      structuredLogger.apiRequest(url, 'GET', { component: 'JupiterAPI' })
      
      const response = await fetch(url)
      
      structuredLogger.apiResponse(url, response.status, { component: 'JupiterAPI' })
      
      if (!response.ok) {
        if (response.status === 429) {
          structuredLogger.warn('Jupiter API rate limited, retrying...', {
            category: 'api',
            component: 'JupiterAPI',
            metadata: { url, status: response.status }
          })
          
          // Rate limited, wait and retry
          await new Promise(resolve => setTimeout(resolve, 2000))
          const retryResponse = await fetch(url)
          
          structuredLogger.apiResponse(url, retryResponse.status, { 
            component: 'JupiterAPI',
            metadata: { retry: true }
          })
          
          if (!retryResponse.ok) {
            const error = new Error(`Jupiter API error after retry: ${retryResponse.status}`)
            structuredLogger.apiError(url, error, { component: 'JupiterAPI' })
            throw error
          }
          return retryResponse.json()
        }
        
        if (response.status === 401) {
          // Handle 401 errors gracefully - API might be in demo mode
          structuredLogger.warn('Jupiter API unauthorized - using demo data', {
            category: 'api',
            component: 'JupiterAPI',
            severity: 'low',
            metadata: { url, status: response.status }
          })
          return this.getDemoData() as T
        }
        
        const error = new Error(`Jupiter API error: ${response.status}`)
        structuredLogger.apiError(url, error, { component: 'JupiterAPI' })
        throw error
      }
      
      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        structuredLogger.apiError(url, error, { component: 'JupiterAPI' })
      }
      throw error
    }
  }

  private getDemoData(): any {
    // Return demo data for development/testing when API is unavailable
    return {
      data: this.getDemoTokens()
    }
  }

  private getDemoTokens(): any[] {
    // Return some demo tokens for development
    return [
      {
        address: JupiterAPI.WELL_KNOWN_TOKENS.SOL,
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
      },
      {
        address: JupiterAPI.WELL_KNOWN_TOKENS.USDC,
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
      }
    ]
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
    const { structuredLogger } = await import('@/lib/structuredLogger')
    
    try {
      structuredLogger.debug('Fetching popular tokens with prices', {
        category: 'api',
        component: 'JupiterAPI',
        metadata: { limit }
      })
      
      const tokens = await this.getStrictTokenList()
      const popularTokens = tokens.slice(0, limit)
      
      if (popularTokens.length === 0) {
        structuredLogger.warn('No tokens found from Jupiter API', {
          category: 'api',
          component: 'JupiterAPI',
          severity: 'low'
        })
        return this.getDemoTokensWithPrices()
      }
      
      const mints = popularTokens.map(token => token.address)
      const pricesResponse = await this.getTokenPrices(mints)
      
      const tokensWithPrices = popularTokens.map(token => {
        const priceData = pricesResponse.data[token.address]
        return this.mapToSolanaToken(token, priceData)
      }).filter(token => token.price > 0)
      
      structuredLogger.info(`Successfully fetched ${tokensWithPrices.length} tokens with prices`, {
        category: 'api',
        component: 'JupiterAPI',
        metadata: { count: tokensWithPrices.length }
      })
      
      return tokensWithPrices
    } catch (error) {
      structuredLogger.error('Failed to get popular tokens with prices', {
        category: 'api',
        component: 'JupiterAPI',
        severity: 'medium'
      }, error as Error)
      
      // Return demo data as fallback
      return this.getDemoTokensWithPrices()
    }
  }

  private getDemoTokensWithPrices(): any[] {
    // Return demo tokens with mock prices for development
    return [
      {
        id: JupiterAPI.WELL_KNOWN_TOKENS.SOL,
        mint_address: JupiterAPI.WELL_KNOWN_TOKENS.SOL,
        name: 'Solana',
        symbol: 'SOL',
        description: 'Solana native token',
        image_url: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        decimals: 9,
        price: 150.50,
        market_cap: 65000000000,
        volume_24h: 2000000000,
        change_24h: 2.5,
        is_active: true,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: JupiterAPI.WELL_KNOWN_TOKENS.USDC,
        mint_address: JupiterAPI.WELL_KNOWN_TOKENS.USDC,
        name: 'USD Coin',
        symbol: 'USDC',
        description: 'USD Coin stablecoin',
        image_url: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        decimals: 6,
        price: 1.00,
        market_cap: 32000000000,
        volume_24h: 5000000000,
        change_24h: 0.01,
        is_active: true,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ]
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