import { useReadContract, useAccount, useBalance } from 'wagmi'
import { NETWORKS } from '@/config/networks'
import USDCABI from '@/config/abis/USDC.json'
import { formatUnits } from 'viem'

export const useWalletBalance = () => {
  const { address, isConnected } = useAccount()

  const usdcAddress = NETWORKS.base.contracts.usdc as `0x${string}`

  // Get USDC balance
  const { data: usdcBalance, isLoading, refetch } = useReadContract({
    address: usdcAddress,
    abi: USDCABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  })

  // Get ETH balance (for gas)
  const { data: ethBalance } = useBalance({
    address: address,
    query: {
      enabled: !!address && isConnected,
    },
  })

  const formattedUSDC = usdcBalance 
    ? parseFloat(formatUnits(usdcBalance as bigint, 6))
    : 0

  const formattedETH = ethBalance
    ? parseFloat(formatUnits(ethBalance.value, 18))
    : 0

  return {
    usdcBalance: formattedUSDC,
    ethBalance: formattedETH,
    isLoading,
    refetch,
    address,
    isConnected,
  }
}
