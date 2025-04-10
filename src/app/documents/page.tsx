'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { useStudentVisaSystem } from '@/hooks/useStudentVisaSystem'
import DocumentUploader from '@/components/documents/DocumentUploader'
import NotificationBanner from '@/components/common/NotificationBanner'

enum DocumentType {
  PASSPORT = 0,
  ADMISSION_LETTER = 1,
  FINANCIAL_PROOF = 2,
  ACADEMIC_RECORDS = 3,
  HEALTH_CERTIFICATE = 4
}

export default function Documents() {
  const { address } = useAccount()
  const router = useRouter()
  const { hasApplication, submitDocument } = useStudentVisaSystem()
  
  const [documentHash, setDocumentHash] = useState('')
  const [docType, setDocType] = useState<DocumentType>(DocumentType.PASSPORT)
  const [expiryDate, setExpiryDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [uploadingDoc, setUploadingDoc] = useState<DocumentType | null>(null)
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'warning' | 'error' | 'info',
    message: ''
  })
  
  const hasApplicationResult = hasApplication()

  // Handle form submit for manual hash submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!documentHash) {
      setError('Please enter a document hash')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // Convert date string to Unix timestamp (seconds)
      const expiryTimestamp = expiryDate 
        ? Math.floor(new Date(expiryDate).getTime() / 1000)
        : Math.floor(new Date().setFullYear(new Date().getFullYear() + 10) / 1000) // Default to 10 years
      
      if (!address) {
        throw new Error('Wallet not connected')
      }
      
      await submitDocument({
        args: [
          address,
          BigInt(docType),
          documentHash,
          BigInt(expiryTimestamp)
        ]
      })
      
      setSuccess(true)
      setDocumentHash('')
      
      setNotification({
        show: true,
        type: 'success',
        message: 'Document submitted successfully!'
      })
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error('Document submission failed:', err)
      setError('Failed to submit document. Please try again.')
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to submit document: ' + err.message
      })
    } finally {
      setLoading(false)
    }
  }

  // New function to handle document upload completion
  const handleDocumentUploaded = async (cid: string) => {
    if (!uploadingDoc) return
    
    setLoading(true)
    setError('')
    
    try {
      // Convert date string to Unix timestamp (seconds)
      const expiryTimestamp = expiryDate 
        ? Math.floor(new Date(expiryDate).getTime() / 1000)
        : Math.floor(new Date().setFullYear(new Date().getFullYear() + 10) / 1000) // Default to 10 years
      
      if (!address) {
        throw new Error('Wallet not connected')
      }
      
      await submitDocument({
        args: [
          address,
          BigInt(uploadingDoc),
          cid,
          BigInt(expiryTimestamp)
        ]
      })
      
      setSuccess(true)
      setDocumentHash('')
      setUploadingDoc(null)
      
      setNotification({
        show: true,
        type: 'success',
        message: `${getDocumentTypeName(uploadingDoc)} uploaded successfully!`
      })
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error('Document submission failed:', err)
      setError('Failed to submit document. Please try again.')
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to submit document: ' + err.message
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get document type name
  const getDocumentTypeName = (docType: DocumentType): string => {
    const docTypes = {
      [DocumentType.PASSPORT]: 'Passport',
      [DocumentType.ADMISSION_LETTER]: 'Admission Letter',
      [DocumentType.FINANCIAL_PROOF]: 'Financial Proof',
      [DocumentType.ACADEMIC_RECORDS]: 'Academic Records',
      [DocumentType.HEALTH_CERTIFICATE]: 'Health Certificate'
    }
    return docTypes[docType]
  }

  // Redirect to application page if no application exists
  if (hasApplicationResult.isSuccess && !hasApplicationResult.data) {
    router.push('/application')
    return null
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto pb-12">
        {notification.show && (
          <div className="mb-4">
            <NotificationBanner
              type={notification.type}
              message={notification.message}
              show={notification.show}
              onClose={() => setNotification({ ...notification, show: false })}
            />
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-lg leading-6 font-medium text-gray-900">Document Submission</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Upload your documents for visa application verification
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    All documents will be stored on IPFS with their hash recorded on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Quick Document Upload</h3>
            <p className="mt-1 text-sm text-gray-500">Upload your documents directly to IPFS and submit them for verification</p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <DocumentUploader 
                documentType={DocumentType.PASSPORT}
                documentTypeName="Passport"
                onUploadComplete={(cid) => {
                  setDocumentHash(cid)
                  setDocType(DocumentType.PASSPORT)
                  setUploadingDoc(DocumentType.PASSPORT)
                  handleDocumentUploaded(cid)
                }}
              />
              
              <DocumentUploader 
                documentType={DocumentType.ADMISSION_LETTER}
                documentTypeName="Admission Letter"
                onUploadComplete={(cid) => {
                  setDocumentHash(cid)
                  setDocType(DocumentType.ADMISSION_LETTER)
                  setUploadingDoc(DocumentType.ADMISSION_LETTER)
                  handleDocumentUploaded(cid)
                }}
              />
              
              <DocumentUploader 
                documentType={DocumentType.FINANCIAL_PROOF}
                documentTypeName="Financial Proof"
                onUploadComplete={(cid) => {
                  setDocumentHash(cid)
                  setDocType(DocumentType.FINANCIAL_PROOF)
                  setUploadingDoc(DocumentType.FINANCIAL_PROOF)
                  handleDocumentUploaded(cid)
                }}
              />
              
              <DocumentUploader 
                documentType={DocumentType.ACADEMIC_RECORDS}
                documentTypeName="Academic Records"
                onUploadComplete={(cid) => {
                  setDocumentHash(cid)
                  setDocType(DocumentType.ACADEMIC_RECORDS)
                  setUploadingDoc(DocumentType.ACADEMIC_RECORDS)
                  handleDocumentUploaded(cid)
                }}
              />
              
              <DocumentUploader 
                documentType={DocumentType.HEALTH_CERTIFICATE}
                documentTypeName="Health Certificate"
                onUploadComplete={(cid) => {
                  setDocumentHash(cid)
                  setDocType(DocumentType.HEALTH_CERTIFICATE)
                  setUploadingDoc(DocumentType.HEALTH_CERTIFICATE)
                  handleDocumentUploaded(cid)
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Manual IPFS Hash Submission</h3>
            <p className="mt-1 text-sm text-gray-500">Already have a document on IPFS? Enter its hash directly</p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="doc-type" className="block text-sm font-medium text-gray-700">
                  Document Type
                </label>
                <select
                  id="doc-type"
                  value={docType}
                  onChange={(e) => setDocType(Number(e.target.value) as DocumentType)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value={DocumentType.PASSPORT}>Passport</option>
                  <option value={DocumentType.ADMISSION_LETTER}>Admission Letter</option>
                  <option value={DocumentType.FINANCIAL_PROOF}>Financial Proof</option>
                  <option value={DocumentType.ACADEMIC_RECORDS}>Academic Records</option>
                  <option value={DocumentType.HEALTH_CERTIFICATE}>Health Certificate</option>
                </select>
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700">
                  Document Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  id="expiry-date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="col-span-6">
                <label htmlFor="document-hash" className="block text-sm font-medium text-gray-700">
                  IPFS Document Hash
                </label>
                <input
                  type="text"
                  id="document-hash"
                  placeholder="QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX"
                  value={documentHash}
                  onChange={(e) => setDocumentHash(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="mt-5">
              <button
                type="submit"
                disabled={loading || !documentHash}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  loading || !documentHash
                    ? 'bg-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Document'}
              </button>
            </div>
            
            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mt-2 text-sm text-green-600">
                Document submitted successfully!
              </div>
            )}
          </form>
        </div>
      </div>
    </MainLayout>
  )
}