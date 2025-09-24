import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { mainnet, arbitrum, polygon, optimism, base, bsc } from 'wagmi/chains'

// 1. Resolve WalletConnect projectId (public key)
const resolveProjectId = (): string => {
  try {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const fromQuery = url.searchParams.get('wc_pid') || url.searchParams.get('walletconnect_project_id')
      if (fromQuery && fromQuery.trim()) {
        window.localStorage.setItem('walletconnect_project_id', fromQuery.trim())
        return fromQuery.trim()
      }
      const stored = window.localStorage.getItem('walletconnect_project_id')
      if (stored && stored.trim()) return stored.trim()
    }
  } catch {}
  // Fallback demo placeholder (safe/public). Replace via ?wc_pid=YOUR_ID
  return '2d6a1b2f8c4e6a7b9d3e5f7g8h9i0j1k'
}

export const WALLETCONNECT_PROJECT_ID = resolveProjectId()

// 2. Create wagmiConfig
const metadata = {
  name: 'HyperCognition',
  description: 'AI Agent Trading Marketplace',
  url: 'https://hypercognition.io', // Your production domain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, arbitrum, polygon, optimism, base, bsc] as const

export const config = defaultWagmiConfig({
  chains,
  projectId: WALLETCONNECT_PROJECT_ID,
  metadata,
  enableWalletConnect: true, // Optional - true by default
  enableInjected: true, // Optional - true by default
  enableEIP6963: true, // Optional - true by default
  enableCoinbase: true, // Optional - true by default
})