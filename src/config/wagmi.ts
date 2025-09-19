import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { mainnet, arbitrum, polygon, optimism, base, bsc } from 'wagmi/chains'

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = 'your-project-id' // You'll need to get this from WalletConnect

// 2. Create wagmiConfig
const metadata = {
  name: 'HyperCognition AI DEX',
  description: 'Next-Gen AI Trading Platform',
  url: 'https://hypercognition.ai', // origin must match your domain & subdomain
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