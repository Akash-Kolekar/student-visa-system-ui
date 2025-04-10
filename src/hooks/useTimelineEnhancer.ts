import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { contractAddresses } from '@/config/contracts'
import TimelineEnhancerABI from '@/app/abis/TimelineEnhancer.json'

export function useTimelineEnhancer() {
  const { writeContract } = useWriteContract()

  // Get previous predictions for an applicant
  const getApplicantPredictions = (applicant: `0x${string}`, index: number) => {
    return useReadContract({
      address: contractAddresses.TimelineEnhancer,
      abi: TimelineEnhancerABI.abi,
      functionName: 'applicantPredictions',
      args: [applicant, BigInt(index)],
    })
  }

  // Generate a new prediction (requires PREDICTOR_ROLE)
  const generatePrediction = async (applicant: `0x${string}`) => {
    return writeContract({
      address: contractAddresses.TimelineEnhancer,
      abi: TimelineEnhancerABI.abi,
      functionName: 'generatePrediction',
      args: [applicant],
    })
  }

  return {
    getApplicantPredictions,
    generatePrediction,
  }
}