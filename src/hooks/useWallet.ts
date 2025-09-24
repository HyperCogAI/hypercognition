import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'

export const useWallet = () => {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()

  const connectWallet = async () => {
    try {
      console.log('Web3Modal hook available:', !!open)
      console.log('Opening Web3Modal...')
      
      if (typeof open === 'function') {
        await open()
        console.log('Web3Modal opened successfully')
      } else {
        console.error('Web3Modal open function not available')
      }
    } catch (error) {
      console.error('Error opening wallet modal:', error)
    }
  }

  const disconnectWallet = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    connectWallet,
    disconnectWallet,
  }
}