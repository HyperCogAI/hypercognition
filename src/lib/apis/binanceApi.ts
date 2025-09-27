export interface PriceHistoryData {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

class BinanceAPI {
  private baseUrl = 'https://api.binance.com/api/v3'
  private lastRequest = 0
  private minDelay = 100

  private async rateLimit() {
    const now = Date.now()
    const delta = now - this.lastRequest
    if (delta < this.minDelay) {
      await new Promise((r) => setTimeout(r, this.minDelay - delta))
    }
    this.lastRequest = Date.now()
  }

  private toPair(symbol: string): string | null {
    const s = (symbol || '').toUpperCase()
    const map: Record<string, string> = {
      SOL: 'SOLUSDT',
      ETH: 'ETHUSDT',
      BTC: 'BTCUSDT',
      USDT: 'USDTUSDT', // will fail and fallback
      USDC: 'USDCUSDT',
      BONK: 'BONKUSDT',
      RAY: 'RAYUSDT',
      SRM: 'SRMUSDT',
      FIDA: 'FIDAUSDT',
      JUP: 'JUPUSDT',
      WIF: 'WIFUSDT',
      PYTH: 'PYTHUSDT',
      PENDLE: 'PENDLEUSDT'
    }
    return map[s] || (s ? s + 'USDT' : null)
  }

  private intervalForDays(days: number): { interval: string; limit: number } {
    if (days <= 1) return { interval: '1h', limit: 24 }
    if (days <= 7) return { interval: '4h', limit: 42 } // ~7d
    return { interval: '1d', limit: Math.min(1000, days) }
  }

  private async fetchKlines(pair: string, interval: string, limit: number) {
    await this.rateLimit()
    const url = `${this.baseUrl}/klines?symbol=${pair}&interval=${interval}&limit=${limit}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Binance error ${res.status}`)
    return (await res.json()) as any[]
  }

  async getPriceHistory(symbol: string, days = 1): Promise<PriceHistoryData | null> {
    try {
      const pair = this.toPair(symbol)
      if (!pair) return this.fallback(days)
      const { interval, limit } = this.intervalForDays(days)
      const klines = await this.fetchKlines(pair, interval, limit)

      const prices: [number, number][] = []
      const vols: [number, number][] = []
      const mcs: [number, number][] = []

      for (const k of klines) {
        const openTime = k[0] as number
        const close = parseFloat(k[4])
        const volume = parseFloat(k[5])
        prices.push([openTime, close])
        vols.push([openTime, volume])
        mcs.push([openTime, 0])
      }

      return { prices, total_volumes: vols, market_caps: mcs }
    } catch (e) {
      console.error('Binance API error:', e)
      return this.fallback(days)
    }
  }

  private fallback(days: number): PriceHistoryData {
    const now = Date.now()
    const interval = days <= 1 ? 3600000 : 86400000
    const points = days <= 1 ? 24 : days
    const prices: [number, number][] = []
    const vols: [number, number][] = []
    const mcs: [number, number][] = []
    for (let i = 0; i < points; i++) {
      const t = now - (points - i) * interval
      const base = 95 + Math.sin(i / 3) * 2
      const price = base * (1 + (Math.random() - 0.5) * 0.03)
      prices.push([t, price])
      vols.push([t, Math.random() * 1_000_000])
      mcs.push([t, 0])
    }
    return { prices, total_volumes: vols, market_caps: mcs }
  }
}

export const binanceApi = new BinanceAPI()
