import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { contractAddresses } from '@/config/contracts'
import StudentVisaSystemABI from '@/app/abis/StudentVisaSystem.json'
import { parseEther } from 'viem'

export function useStudentVisaSystem() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Create a new visa application
  const createApplication = async (
    universityId: string,
    programId: string,
    enrollmentDate: number,
    priority: number,
    previousVisaCountries: string[],
    options: { value: bigint }
  ) => {
    return writeContract({
      address: contractAddresses.StudentVisaSystem,
      abi: StudentVisaSystemABI.abi,
      functionName: 'createApplication',
      args: [
        universityId,
        programId,
        BigInt(enrollmentDate),
        BigInt(priority),
        previousVisaCountries
      ],
      value: options.value
    })
  }

  // Check if user has an existing application
  const hasApplication = () => {
    return useReadContract({
      address: contractAddresses.StudentVisaSystem,
      abi: StudentVisaSystemABI.abi,
      functionName: 'hasApplication',
      args: [address]
    })
  }

  // Get application details
  const getApplicationDetails = (applicant: `0x${string}` | undefined) => {
    return useReadContract({
      address: contractAddresses.StudentVisaSystem,
      abi: StudentVisaSystemABI.abi,
      functionName: 'getApplicationDetails',
      args: [applicant || '0x0']
    })
  }

  // Get document status
  const getDocumentStatus = (applicant: `0x${string}` | undefined, docType: number) => {
    return useReadContract({
      address: contractAddresses.StudentVisaSystem,
      abi: StudentVisaSystemABI.abi,
      functionName: 'getDocumentStatus',
      args: [applicant || '0x0', docType]
    })
  }

  // Submit document
  const submitDocument = async (params: {
    args: [`0x${string}`, bigint, string, bigint]
  }) => {
    try {
      return await writeContract({
        address: contractAddresses.StudentVisaSystem,
        abi: StudentVisaSystemABI.abi,
        functionName: 'submitDocument',
        args: params.args
      })
    } catch (error: any) {
      // Extract error message from blockchain error
      const errorMessage = error.message || 'Transaction failed';
      console.error('Document submission error:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get total applications count
const getTotalApplications = () => {
  return useReadContract({
    address: contractAddresses.StudentVisaSystem,
    abi: StudentVisaSystemABI.abi,
    functionName: 'totalApplications',
  })
}

  return {
    createApplication,
    hasApplication,
    getApplicationDetails,
    getDocumentStatus,
    submitDocument,
    getTotalApplications
  }
}