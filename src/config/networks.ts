export const NETWORKS = {
  base: {
    id: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    contracts: {
      escrow: import.meta.env.VITE_BASE_ESCROW_CONTRACT || '',
      usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
  },
} as const;

export type NetworkId = keyof typeof NETWORKS;
