import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { mainnet, arbitrum, bsc, optimism, base } from 'wagmi/chains'

// 1. Get WalletConnect Project ID
const getProjectId = (): string => {
  // Use the Project ID from environment variable or fallback
  const projectId = '089da49c593aacde18802acaacbdf911'
  console.log('Using WalletConnect Project ID:', projectId)
  return projectId
}

export const WALLETCONNECT_PROJECT_ID = getProjectId()

// 2. Create wagmiConfig
const metadata = {
  name: 'HyperCognition',
  description: 'AI Agent Trading Marketplace',
  url: 'https://hypercognition.io', // Your production domain
  icons: ['https://gxgmqrtsbqmpngbpuuxx.supabase.co/storage/v1/object/public/images/Hyper_Cognition_logo3large-7.png']
}

const chains = [mainnet, arbitrum, bsc, optimism, base] as const

export const config = defaultWagmiConfig({
  chains,
  projectId: WALLETCONNECT_PROJECT_ID,
  metadata,
  enableWalletConnect: true, // Optional - true by default
  enableInjected: true, // Optional - true by default
  enableEIP6963: true, // Optional - true by default
  // enableCoinbase: true, // Removed for regulatory compliance
})