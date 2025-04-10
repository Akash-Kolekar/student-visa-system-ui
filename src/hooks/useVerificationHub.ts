import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { contractAddresses } from '@/config/contracts'
import VerificationHubABI from '@/app/abis/VerificationHub.json'

export function useVerificationHub() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Get verification history for an applicant
  const getVerificationHistory = (applicant: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.VerificationHub,
      abi: VerificationHubABI.abi,
      functionName: 'getVerificationHistory',
      args: [applicant],
    })
  }

  // Request document verification (for verifiers)
  const requestVerification = async (
    applicant: `0x${string}`, 
    verificationType: number, 
    proof: string
  ) => {
    return writeContract({
      address: contractAddresses.VerificationHub,
      abi: VerificationHubABI.abi,
      functionName: 'requestVerification',
      args: [applicant, verificationType, proof],
    })
  }

  // Process a verification request (for verifiers)
  const processVerification = async (requestId: `0x${string}`, isValid: boolean) => {
    return writeContract({
      address: contractAddresses.VerificationHub,
      abi: VerificationHubABI.abi,
      functionName: 'processVerification',
      args: [requestId, isValid],
    })
  }

  // Calculate trust score for a verifier
  const calculateTrustScore = (verifier: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.VerificationHub,
      abi: VerificationHubABI.abi,
      functionName: 'calculateTrustScore',
      args: [verifier],
    })
  }

  return {
    getVerificationHistory,
    requestVerification,
    processVerification,
    calculateTrustScore,
  }
}