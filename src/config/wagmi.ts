import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { mainnet, arbitrum, polygon, optimism, base, bsc } from 'wagmi/chains'

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '2d6a1b2f8c4e6a7b9d3e5f7g8h9i0j1k'

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
  projectId,
  metadata,
  enableWalletConnect: true, // Optional - true by default
  enableInjected: true, // Optional - true by default
  enableEIP6963: true, // Optional - true by default
  enableCoinbase: true, // Optional - true by default
})