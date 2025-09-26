import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export const useSolanaWallet = () => {
  const { 
    publicKey, 
    connected, 
    connecting, 
    disconnecting,
    disconnect,
    wallet
  } = useWallet()
  
  const { setVisible } = useWalletModal()

  const connectWallet = () => {
    console.log('Connect wallet clicked, setVisible:', setVisible)
    try {
      setVisible(true)
    } catch (error) {
      console.error('Error opening wallet modal:', error)
    }
  }

  const disconnectWallet = () => {
    disconnect()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return {
    address: publicKey?.toString(),
    isConnected: connected,
    isConnecting: connecting,
    isDisconnecting: disconnecting,
    connectWallet,
    disconnectWallet,
    formatAddress,
    walletName: wallet?.adapter.name,
  }
}