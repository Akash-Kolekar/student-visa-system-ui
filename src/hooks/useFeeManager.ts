import { useReadContract, useWriteContract } from 'wagmi'
import { contractAddresses } from '@/config/contracts'
import FeeManagerABI from '@/app/abis/FeeManager.json'
import { parseEther } from 'viem'

export function useFeeManager() {
  const { writeContract } = useWriteContract()

  // Get total paid fees for an applicant
  const getTotalPaid = (applicant: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.FeeManager,
      abi: FeeManagerABI.abi,
      functionName: 'getTotalPaid',
      args: [applicant],
    })
  }

  // Pay application fees with ETH
  const payFees = async (applicant: `0x${string}`, amount: string) => {
    return writeContract({
      address: contractAddresses.FeeManager,
      abi: FeeManagerABI.abi,
      functionName: 'payWithETH',
      args: [applicant],
      value: parseEther(amount),
    })
  }

  return {
    getTotalPaid,
    payFees,
  }
}