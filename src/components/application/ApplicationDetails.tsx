'use client'

import { useState } from 'react'

type Document = {
  docType: number;
  documentHash: string;
  verified: boolean;
  rejected: boolean;
  verificationDate?: number;
}

type ApplicationDetailsProps = {
  applicant: string;
  universityId: string;
  programId: string;
  enrollmentDate: number;
  status: number;
  createdAt: number;
  updatedAt: number;
  documents: Document[];
  role: 'university' | 'embassy' | 'verifier' | 'student';
  onVerifyDocument?: (applicant: string, docType: number) => void;
  onRejectDocument?: (applicant: string, docType: number, reason: string) => void;
}

export default function ApplicationDetails({
  applicant,
  universityId,
  programId,
  enrollmentDate,
  status,
  createdAt,
  updatedAt,
  documents,
  role,
  onVerifyDocument,
  onRejectDocument
}: ApplicationDetailsProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<number | null>(null)

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Get document type name
  const getDocumentTypeName = (docType: number) => {
    const docTypes = ['Passport', 'Admission Letter', 'Financial Proof', 'Academic Records', 'Health Certificate']
    return docTypes[docType] || 'Unknown'
  }

  // Get status text
  const getStatusText = (status: number) => {
    const statuses = [
      'Pending',
      'Under Review',
      'Additional Documents Requested',
      'Verification In Progress',
      'Interview Scheduled',
      'Under Final Approval',
      'Approved',
      'Rejected',
      'Conditionally Approved'
    ]
    return statuses[status] || 'Unknown'
  }

  // Open reject modal
  const openRejectModal = (docType: number) => {
    setSelectedDocType(docType)
    setShowRejectModal(true)
  }

  // Handle document rejection
  const handleRejectDocument = () => {
    if (selectedDocType === null || !rejectionReason) return
    
    if (onRejectDocument) {
      onRejectDocument(applicant, selectedDocType, rejectionReason)
    }
    
    setRejectionReason('')
    setShowRejectModal(false)
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Application Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Student: {formatAddress(applicant)}
          </p>
        </div>
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
          status === 6 ? 'bg-green-100 text-green-800' : 
          status === 7 ? 'bg-red-100 text-red-800' : 
          'bg-yellow-100 text-yellow-800'
        }`}>
          {getStatusText(status)}
        </span>
      </div>
      
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">University</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{universityId}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Program</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{programId}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Enrollment Date</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {new Date(enrollmentDate * 1000).toLocaleDateString()}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Application Date</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {new Date(createdAt * 1000).toLocaleDateString()}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {new Date(updatedAt * 1000).toLocaleDateString()}
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 mb-3">Documents</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {documents.map((doc) => (
                  <li key={doc.docType} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-2 flex-1 w-0 truncate">
                        {getDocumentTypeName(doc.docType)}
                      </span>
                    </div>
                    <div className="ml-4 flex items-center space-x-4">
                      {doc.verified && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                      {doc.rejected && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Rejected
                        </span>
                      )}
                      {!doc.verified && !doc.rejected && role !== 'student' && (
                        <>
                          {(role === 'university' || role === 'verifier') && onVerifyDocument && (
                            <button
                              onClick={() => onVerifyDocument(applicant, doc.docType)}
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              Verify
                            </button>
                          )}
                          {(role === 'university' || role === 'verifier') && onRejectDocument && (
                            <button
                              onClick={() => openRejectModal(doc.docType)}
                              className="font-medium text-red-600 hover:text-red-500"
                            >
                              Reject
                            </button>
                          )}
                        </>
                      )}
                      <a
                        href={`https://ipfs.io/ipfs/${doc.documentHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-600 hover:text-gray-500"
                      >
                        View
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>
      
      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Reject Document
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Please provide a reason for rejecting this document.
                      </p>
                      <div className="mt-4">
                        <textarea
                          rows={4}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Rejection reason"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleRejectDocument}
                >
                  Reject Document
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
