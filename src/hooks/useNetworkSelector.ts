import { create } from 'zustand'

export type NetworkType = 'base' | 'ethereum' | 'bnb' | 'solana'

interface NetworkStore {
  selectedNetwork: NetworkType
  setNetwork: (network: NetworkType) => void
}

export const useNetworkSelector = create<NetworkStore>((set) => ({
  selectedNetwork: 'base',
  setNetwork: (network) => set({ selectedNetwork: network }),
}))
