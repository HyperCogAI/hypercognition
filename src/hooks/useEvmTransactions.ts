import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { NETWORKS } from '@/config/networks'
import EscrowABI from '@/config/abis/HyperCognitionEscrow.json'
import USDCABI from '@/config/abis/USDC.json'
import { useToast } from '@/hooks/use-toast'

export const useEvmTransactions = () => {
  const { toast } = useToast()
  const { writeContractAsync, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const escrowAddress = NETWORKS.base.contracts.escrow as `0x${string}`
  const usdcAddress = NETWORKS.base.contracts.usdc as `0x${string}`

  // Approve USDC spending
  const approveUSDC = async (amount: number) => {
    const amountWei = parseUnits(amount.toString(), 6)
    return writeContractAsync({
      address: usdcAddress,
      abi: USDCABI as any,
      functionName: 'approve',
      args: [escrowAddress, amountWei],
    } as any)
  }

  // Create escrow
  const createEscrow = async (seller: string, amount: number) => {
    const amountWei = parseUnits(amount.toString(), 6)
    return writeContractAsync({
      address: escrowAddress,
      abi: EscrowABI as any,
      functionName: 'createEscrow',
      args: [seller as `0x${string}`, amountWei],
    } as any)
  }

  // Release escrow
  const releaseEscrow = async (escrowId: bigint) => {
    return writeContractAsync({
      address: escrowAddress,
      abi: EscrowABI as any,
      functionName: 'releaseEscrow',
      args: [escrowId],
    } as any)
  }

  // Refund escrow
  const refundEscrow = async (escrowId: bigint) => {
    return writeContractAsync({
      address: escrowAddress,
      abi: EscrowABI as any,
      functionName: 'refundEscrow',
      args: [escrowId],
    } as any)
  }

  return {
    approveUSDC,
    createEscrow,
    releaseEscrow,
    refundEscrow,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  }
}
