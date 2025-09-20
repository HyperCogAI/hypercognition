import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useWallet } from '@/hooks/useWallet'

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x123456789',
    isConnected: true,
    isConnecting: false,
    isDisconnected: false
  }),
  useDisconnect: () => ({
    disconnect: vi.fn()
  })
}))

// Mock web3modal
vi.mock('@web3modal/wagmi/react', () => ({
  useWeb3Modal: () => ({
    open: vi.fn()
  })
}))

describe('useWallet Hook', () => {
  it('returns wallet connection state', () => {
    const { result } = renderHook(() => useWallet())
    
    expect(result.current.address).toBe('0x123456789')
    expect(result.current.isConnected).toBe(true)
    expect(result.current.isConnecting).toBe(false)
    expect(result.current.isDisconnected).toBe(false)
  })

  it('provides connect and disconnect functions', () => {
    const { result } = renderHook(() => useWallet())
    
    expect(typeof result.current.connectWallet).toBe('function')
    expect(typeof result.current.disconnectWallet).toBe('function')
  })
})