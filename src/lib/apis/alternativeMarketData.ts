import { coinGeckoApi } from './coinGeckoApi'

// Alternative market data sources for redundancy
interface AlternativeTokenData {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap: number
  price_change_percentage_24h: number
  total_volume: number
}

interface LivePriceData {
  symbol: string
  price: number
  change_24h: number
  volume_24h: number
  market_cap?: number
  timestamp: string
}

class AlternativeMarketDataAPI {
  private coinCapBaseUrl = 'https://api.coincap.io/v2'
  private cryptoCompareBaseUrl = 'https://min-api.cryptocompare.com/data'
  
  // Fallback to CoinCap API for crypto data
  async getCryptoDataFromCoinCap(limit: number = 100): Promise<AlternativeTokenData[]> {
    try {
      const response = await fetch(`${this.coinCapBaseUrl}/assets?limit=${limit}`)
      if (!response.ok) throw new Error(`CoinCap API error: ${response.status}`)
      
      const data = await response.json()
      return data.data.map((asset: any) => ({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        current_price: parseFloat(asset.priceUsd) || 0,
        market_cap: parseFloat(asset.marketCapUsd) || 0,
        price_change_percentage_24h: parseFloat(asset.changePercent24Hr) || 0,
        total_volume: parseFloat(asset.volumeUsd24Hr) || 0
      }))
    } catch (error) {
      console.error('CoinCap API failed:', error)
      return []
    }
  }

  // Get live prices from multiple sources with fallbacks
  async getLivePrices(symbols: string[]): Promise<LivePriceData[]> {
    const results: LivePriceData[] = []
    
    try {
      // Try CoinGecko first
      const coinGeckoData = await coinGeckoApi.getTopCryptos(100)
      const symbolsLower = symbols.map(s => s.toLowerCase())
      
      for (const symbol of symbolsLower) {
        const coinData = coinGeckoData.find(coin => 
          coin.symbol.toLowerCase() === symbol || 
          coin.id.toLowerCase() === symbol
        )
        
        if (coinData) {
          results.push({
            symbol: coinData.symbol.toUpperCase(),
            price: coinData.current_price,
            change_24h: coinData.price_change_percentage_24h,
            volume_24h: coinData.total_volume,
            market_cap: coinData.market_cap,
            timestamp: new Date().toISOString()
          })
        }
      }
      
      // If we didn't get all symbols, try CoinCap
      const missingSymbols = symbols.filter(symbol => 
        !results.some(result => result.symbol.toLowerCase() === symbol.toLowerCase())
      )
      
      if (missingSymbols.length > 0) {
        const coinCapData = await this.getCryptoDataFromCoinCap(200)
        
        for (const symbol of missingSymbols) {
          const coinData = coinCapData.find(coin => 
            coin.symbol.toLowerCase() === symbol.toLowerCase()
          )
          
          if (coinData) {
            results.push({
              symbol: coinData.symbol.toUpperCase(),
              price: coinData.current_price,
              change_24h: coinData.price_change_percentage_24h,
              volume_24h: coinData.total_volume,
              market_cap: coinData.market_cap,
              timestamp: new Date().toISOString()
            })
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch live prices:', error)
    }
    
    return results
  }

  // Get aggregated market data from multiple sources
  async getAggregatedMarketData(): Promise<{
    crypto: AlternativeTokenData[]
    timestamp: string
    sources: string[]
  }> {
    const sources: string[] = []
    let cryptoData: AlternativeTokenData[] = []
    
    try {
      // Try CoinGecko first
      const coinGeckoData = await coinGeckoApi.getTopCryptos(100)
      cryptoData = coinGeckoData.map(coin => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        total_volume: coin.total_volume
      }))
      sources.push('CoinGecko')
    } catch (error) {
      console.error('CoinGecko failed, trying CoinCap:', error)
      
      try {
        cryptoData = await this.getCryptoDataFromCoinCap(100)
        sources.push('CoinCap')
      } catch (coinCapError) {
        console.error('All crypto data sources failed:', coinCapError)
        cryptoData = this.getFallbackCryptoData()
        sources.push('Fallback')
      }
    }
    
    return {
      crypto: cryptoData,
      timestamp: new Date().toISOString(),
      sources
    }
  }

  private getFallbackCryptoData(): AlternativeTokenData[] {
    // Realistic bearish/neutral fallback data to avoid misleading sentiment
    return [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: 67500,
        market_cap: 1330000000000,
        price_change_percentage_24h: -3.5,
        total_volume: 28000000000
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: 3800,
        market_cap: 456000000000,
        price_change_percentage_24h: -2.1,
        total_volume: 15000000000
      },
      {
        id: 'solana',
        symbol: 'SOL',
        name: 'Solana',
        current_price: 150,
        market_cap: 65000000000,
        price_change_percentage_24h: -6.8,
        total_volume: 2500000000
      },
      {
        id: 'bnb',
        symbol: 'BNB',
        name: 'BNB',
        current_price: 620,
        market_cap: 90000000000,
        price_change_percentage_24h: -1.0,
        total_volume: 1800000000
      },
      {
        id: 'usd-coin',
        symbol: 'USDC',
        name: 'USDC',
        current_price: 1.0,
        market_cap: 32000000000,
        price_change_percentage_24h: 0.0,
        total_volume: 5500000000
      }
    ]
  }
}

export const alternativeMarketDataApi = new AlternativeMarketDataAPI()
export type { AlternativeTokenData, LivePriceData }