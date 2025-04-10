import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { contractAddresses } from '@/config/contracts'
import UniversityHandlerABI from '@/app/abis/UniversityHandler.json'

export function useUniversityHandler() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Get applications for a specific university with optional filter
  const getUniversityApplications = (filter = 'all') => {
    return useReadContract({
      address: contractAddresses.UniversityHandler,
      abi: UniversityHandlerABI.abi,
      functionName: 'getUniversityApplications',
      args: [address, filter],
    })
  }

  // Verify a document (can be verification or rejection)
  const verifyDocument = async (
    applicant: string, 
    docType: number, 
    verificationProof: string,
    isRejection = false
  ) => {
    const functionName = isRejection ? 'rejectDocument' : 'verifyDocument'
    
    return writeContract({
      address: contractAddresses.UniversityHandler,
      abi: UniversityHandlerABI.abi,
      functionName,
      args: [applicant, docType, verificationProof],
    })
  }

  // Register a university program
  const registerProgram = async (programId: string, programName: string, programData: string) => {
    return writeContract({
      address: contractAddresses.UniversityHandler,
      abi: UniversityHandlerABI.abi,
      functionName: 'registerProgram',
      args: [programId, programName, programData],
    })
  }

  // Verify student admission
  const verifyAdmission = async (studentAddress: string, programId: string, admissionData: string) => {
    return writeContract({
      address: contractAddresses.UniversityHandler,
      abi: UniversityHandlerABI.abi,
      functionName: 'verifyAdmission',
      args: [studentAddress, programId, admissionData],
    })
  }

  return {
    getUniversityApplications,
    verifyDocument,
    registerProgram,
    verifyAdmission,
  }
}