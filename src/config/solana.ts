import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { Connection, clusterApiUrl } from '@solana/web3.js'

// Configure the network (can be 'devnet', 'testnet', or 'mainnet-beta')
export const network = WalletAdapterNetwork.Mainnet
export const endpoint = clusterApiUrl(network)

// Create connection
export const connection = new Connection(endpoint)

// Configure supported wallets
export const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new TorusWalletAdapter(),
  new LedgerWalletAdapter(),
]

export { WalletAdapterNetwork, ConnectionProvider, WalletProvider, WalletModalProvider }