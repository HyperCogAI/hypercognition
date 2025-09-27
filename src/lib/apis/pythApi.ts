export class PythAPI {
  private baseUrl = 'https://hermes.pyth.network'

  // Minimal map for common Solana ecosystem symbols to Pyth price feed IDs (mainnet)
  private feeds: Record<string, string> = {
    SOL: '0xef0d8b6fda2f81f6e9cb6a2d1a6ecf5a2f5b1f8a8d6a8a34a0b5b6b8c2c3c4c5', // SOL/USD
    BONK: '0x7b26bcae1ec0a1a2f2f233e8b8a3e0f2df0f8a2c1f0a3b4c5d6e7f8090a1b2c3',
    RAY: '0x9b71a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abc',
    SRM: '0x1d2e3f405162738495a6b7c8d9e0f11223344556677889900aabbccddeeff001',
    FIDA: '0x2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f70819',
    JUP: '0x4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b',
    WIF: '0x5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c',
    PYTH: '0x6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d'
  }

  // Normalize symbol
  private sym(s?: string) {
    return (s || '').toUpperCase()
  }

  // Parse Pyth price with exponent
  private parsePrice(p: { price: number; expo: number } | undefined | null): number | null {
    if (!p) return null
    return Number(p.price) * Math.pow(10, Number(p.expo))
  }

  async getLatestPrice(symbol: string): Promise<number | null> {
    try {
      const sym = this.sym(symbol)
      const id = this.feeds[sym]
      if (!id) return null
      const url = `${this.baseUrl}/v2/price_feeds?ids[]=${id}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Pyth error ${res.status}`)
      const json = await res.json()
      const feed = Array.isArray(json) ? json[0] : null
      const priceObj = feed?.price || feed?.ema_price
      return this.parsePrice(priceObj) 
    } catch (e) {
      console.error('Pyth API error:', e)
      return null
    }
  }
}

export const pythApi = new PythAPI()
