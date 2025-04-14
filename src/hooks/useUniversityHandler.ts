import { useAccount } from 'wagmi'
import { useReadContract, useWriteContract } from 'wagmi'
import { contractAddresses } from '@/config/contracts'
import UniversityHandlerABI from '@/app/abis/UniversityHandler.json'
import StudentVisaSystemABI from '@/app/abis/StudentVisaSystem.json'

export function useUniversityHandler() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Get applications assigned to this university
  const getUniversityApplications = (filter = 'all') => {
    return useReadContract({
      address: contractAddresses.UniversityHandler,
      abi: UniversityHandlerABI.abi,
      functionName: 'getUniversityApplications',
      args: [address as `0x${string}`]
    })
  }

  // Get application details
  const getApplicationDetails = (applicant: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.StudentVisaSystem,
      abi: StudentVisaSystemABI.abi,
      functionName: 'getApplicationDetails',
      args: [applicant]
    })
  }

  // Verify document
  const verifyDocument = async (
    applicant: string,
    docType: number,
    reason: string,
    isRejection = false
  ) => {
    try {
      if (isRejection) {
        return await writeContract({
          address: contractAddresses.UniversityHandler,
          abi: UniversityHandlerABI.abi,
          functionName: 'rejectDocument',
          args: [applicant as `0x${string}`, BigInt(docType), reason]
        })
      } else {
        return await writeContract({
          address: contractAddresses.UniversityHandler,
          abi: UniversityHandlerABI.abi,
          functionName: 'verifyDocument',
          args: [applicant as `0x${string}`, BigInt(docType), reason]
        })
      }
    } catch (error) {
      console.error('Document verification error:', error)
      throw error
    }
  }

  return {
    getUniversityApplications,
    getApplicationDetails,
    verifyDocument
  }
}