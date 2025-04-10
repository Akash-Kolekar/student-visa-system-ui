import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { contractAddresses } from '@/config/contracts'
import EmbassyGatewayABI from '@/app/abis/EmbassyGateway.json'

export function useEmbassyGateway() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Get document requests for an applicant
  const getDocumentRequests = (applicant: `0x${string}`) => {
    return useReadContract({
      address: contractAddresses.EmbassyGateway,
      abi: EmbassyGatewayABI.abi,
      functionName: 'getDocumentRequests',
      args: [applicant],
    })
  }

  // Request additional documents (embassy only)
  const requestAdditionalDocuments = async (applicant: `0x${string}`, docs: string) => {
    return writeContract({
      address: contractAddresses.EmbassyGateway,
      abi: EmbassyGatewayABI.abi,
      functionName: 'requestAdditionalDocuments',
      args: [applicant, docs],
    })
  }

  // Override visa decision (admin only)
  const overrideDecision = async (applicant: `0x${string}`, approve: boolean, reason: string) => {
    return writeContract({
      address: contractAddresses.EmbassyGateway,
      abi: EmbassyGatewayABI.abi,
      functionName: 'overrideDecision',
      args: [applicant, approve, reason],
    })
  }

  // Register a new embassy official (admin only)
  const registerEmbassyOfficial = async (official: `0x${string}`) => {
    return writeContract({
      address: contractAddresses.EmbassyGateway,
      abi: EmbassyGatewayABI.abi,
      functionName: 'registerEmbassyOfficial',
      args: [official],
    })
  }

  // Check if address has embassy role
  const hasEmbassyRole = (account: `0x${string}`) => {
    // return useReadContract({
    //   address: contractAddresses.EmbassyGateway,
    //   abi: EmbassyGatewayABI.abi,
    //   functionName: 'hasRole',
    //   args: [EmbassyGatewayABI.abi.find(x => x.name === 'EMBASSY_ROLE')?.outputs?.[0]?.value || '0x0', account],
    // })
    // Define the role hash directly or try to find it in the ABI
    const EMBASSY_ROLE = '0x79e724db6f0eb37fb2d54a6469bf9ac714c4c2b8c4894ef65dd60beb1673a762'; // Replace with actual hash if known
  
    return useReadContract({
      address: contractAddresses.EmbassyGateway,
      abi: EmbassyGatewayABI.abi,
      functionName: 'hasRole',
      args: [EMBASSY_ROLE, account],
    })
  }
  
  return {
    getDocumentRequests,
    requestAdditionalDocuments,
    overrideDecision,
    registerEmbassyOfficial,
    hasEmbassyRole,
  }
}