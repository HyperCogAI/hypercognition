import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export const useSolanaWallet = () => {
  const {
    publicKey,
    connected,
    connecting,
    disconnecting,
    disconnect,
    wallet,
    wallets,
    select,
    connect,
  } = useWallet()

  const { setVisible } = useWalletModal()

  const connectWallet = async () => {
    try {
      // If a wallet is already selected, try to connect directly
      if (wallet) {
        await connect()
        return
      }

      // Try preferred wallets automatically if available (only when detected or loadable)
      const preferred = ['Phantom', 'Solflare']
      for (const name of preferred) {
        const found = wallets.find(
          (w) => w.adapter.name === name && (w.readyState === 'Installed' || w.readyState === 'Loadable')
        )
        if (found) {
          await select(found.adapter.name)
          try {
            await connect()
            return
          } catch (_) {
            // fall through to next option / modal
          }
        }
      }

      // Fallback: open the wallet selection modal
      setVisible(true)
    } catch (error) {
      console.error('Error opening or connecting wallet:', error)
      // Last resort: try opening the modal
      try { setVisible(true) } catch {}
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
