export interface BirdeyeTokenPrice {
  value: number;
  updateUnixTime: number;
  updateHumanTime: string;
  priceChange24h?: number;
}

export interface BirdeyeHistoricalData {
  unixTime: number;
  value: number;
}

export interface BirdeyeTokenOverview {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  logoURI?: string;
  mc?: number; // market cap
  v24hUSD?: number; // 24h volume
  priceChange24h?: number;
}

export class BirdeyeAPI {
  private baseUrl = 'https://xdinlkmqmjlrmunsjswf.supabase.co/functions/v1/birdeye-proxy';

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(this.baseUrl);
    url.searchParams.append('endpoint', endpoint);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async getTokenPrice(address: string): Promise<BirdeyeTokenPrice | null> {
    try {
      return await this.request<BirdeyeTokenPrice>('/defi/price', { address });
    } catch (error) {
      console.error('Error fetching token price:', error);
      return null;
    }
  }

  async getMultipleTokenPrices(addresses: string[]): Promise<Record<string, BirdeyeTokenPrice> | null> {
    try {
      const list_address = addresses.join(',');
      return await this.request<Record<string, BirdeyeTokenPrice>>('/defi/multi_price', { list_address });
    } catch (error) {
      console.error('Error fetching multiple token prices:', error);
      return null;
    }
  }

  async getTokenOverview(address: string): Promise<BirdeyeTokenOverview | null> {
    try {
      return await this.request<BirdeyeTokenOverview>('/defi/token_overview', { address });
    } catch (error) {
      console.error('Error fetching token overview:', error);
      return null;
    }
  }

  async getPriceHistory(address: string, type: '1H' | '4H' | '1D' | '1W' | '1M' = '1D'): Promise<BirdeyeHistoricalData[] | null> {
    try {
      const data = await this.request<{ items: BirdeyeHistoricalData[] }>('/defi/history_price', { 
        address, 
        address_type: 'token',
        type 
      });
      return data.items || [];
    } catch (error) {
      console.error('Error fetching price history:', error);
      return null;
    }
  }

  async getTokenList(sort_by = 'v24hUSD', sort_type = 'desc', offset = 0, limit = 50): Promise<BirdeyeTokenOverview[] | null> {
    try {
      const data = await this.request<{ tokens: BirdeyeTokenOverview[] }>('/defi/tokenlist', {
        sort_by,
        sort_type,
        offset: offset.toString(),
        limit: limit.toString(),
      });
      return data.tokens || [];
    } catch (error) {
      console.error('Error fetching token list:', error);
      return null;
    }
  }
}

// Well-known Solana token addresses
export const SOLANA_TOKEN_ADDRESSES = {
  SOL: 'So11111111111111111111111111111111111111112', // Wrapped SOL
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  PYTH: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
  ORCA: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
  SRM: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
  FIDA: 'EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp',
  MANGO: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac',
};

export const birdeyeApi = new BirdeyeAPI();