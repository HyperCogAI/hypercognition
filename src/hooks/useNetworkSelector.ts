import { create } from 'zustand'

type NetworkType = 'evm' | 'solana'

interface NetworkStore {
  selectedNetwork: NetworkType
  setNetwork: (network: NetworkType) => void
}

export const useNetworkSelector = create<NetworkStore>((set) => ({
  selectedNetwork: 'evm',
  setNetwork: (network) => set({ selectedNetwork: network }),
}))
