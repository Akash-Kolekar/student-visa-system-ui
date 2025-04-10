'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStudentVisaSystem } from '@/hooks/useStudentVisaSystem'
import { useVerificationHub } from '@/hooks/useVerificationHub'

type StudentApplicationStatusProps = {
  applicant: `0x${string}`
  applicationData: any
}

export default function StudentApplicationStatus({ applicant, applicationData }: StudentApplicationStatusProps) {
  const router = useRouter()
  const { getDocumentStatus } = useStudentVisaSystem()
  const { getVerificationHistory } = useVerificationHub()
  
  const [documentStatuses, setDocumentStatuses] = useState<any[]>([])
  const [verificationHistory, setVerificationHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Extract application details
  const {
    universityId,
    programId,
    enrollmentDate,
    priority,
    status,
    credibilityScore,
    createdAt,
    updatedAt,
    deadlineDate
  } = applicationData || {}

  // Fetch document statuses and verification history
  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        // Here we would normally fetch the document statuses
        // For demo purposes we'll use mock data
        const mockDocStatuses = [
          { docType: 0, name: 'Passport', isVerified: true, documentHash: 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX' },
          { docType: 1, name: 'Admission Letter', isVerified: true, documentHash: 'QmZpkULBWbmbnRpzJNKLfrKJyLx5Wcs3LCL5qVdcWcnqtw' },
          { docType: 2, name: 'Financial Proof', isVerified: false, documentHash: 'QmUVLxtYnSjbZzEHmmqXgETwNWDcRggkEKBZajHjhpnQQB' },
          { docType: 3, name: 'Academic Records', isVerified: false, documentHash: null },
          { docType: 4, name: 'Health Certificate', isVerified: false, documentHash: null }
        ]
        
        setDocumentStatuses(mockDocStatuses)
        
        // Mock verification history
        const mockHistory = [
          { timestamp: Date.now() - 86400000 * 5, action: 'Application Created', details: 'Your visa application was submitted' },
          { timestamp: Date.now() - 86400000 * 4, action: 'Document Uploaded', details: 'Passport uploaded and submitted for verification' },
          { timestamp: Date.now() - 86400000 * 3, action: 'Document Verified', details: 'Passport verified by university' },
          { timestamp: Date.now() - 86400000 * 2, action: 'Document Uploaded', details: 'Admission Letter uploaded and submitted for verification' },
          { timestamp: Date.now() - 86400000 * 1, action: 'Document Verified', details: 'Admission Letter verified by university' }
        ]
        
        setVerificationHistory(mockHistory)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching document data:', error)
        setLoading(false)
      }
    }
    
    if (applicant) {
      fetchDocumentData()
    }
  }, [applicant])

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (!documentStatuses.length) return 0
    
    const verified = documentStatuses.filter(doc => doc.isVerified).length
    return Math.round((verified / documentStatuses.length) * 100)
  }

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Not set'
    return new Date(Number(timestamp) * 1000).toLocaleDateString()
  }

  // Get status class based on application status
  const getStatusClass = () => {
    if (status === 6) return 'bg-green-100 text-green-800' // Approved
    if (status === 7) return 'bg-red-100 text-red-800' // Rejected
    if (status === 8) return 'bg-yellow-100 text-yellow-800' // Conditionally Approved
    return 'bg-blue-100 text-blue-800' // In progress
  }

  // Get priority text
  const getPriorityText = () => {
    switch (Number(priority)) {
      case 0: return 'Standard'
      case 1: return 'Express'
      case 2: return 'Emergency'
      default: return 'Standard'
    }
  }
  
  // Get priority class
  const getPriorityClass = () => {
    switch (Number(priority)) {
      case 0: return 'bg-gray-100 text-gray-800'
      case 1: return 'bg-yellow-100 text-yellow-800'
      case 2: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status text
  const getStatusText = (statusCode: number) => {
    const statuses = {
      0: 'Pending',
      1: 'Under Review',
      2: 'Additional Documents Requested',
      3: 'Verification In Progress',
      4: 'Interview Scheduled',
      5: 'Under Final Approval',
      6: 'Approved',
      7: 'Rejected',
      8: 'Conditionally Approved'
    }
    return statuses[statusCode as keyof typeof statuses] || 'Unknown'
  }
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Application Summary */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Application Summary</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Current status of your student visa application
            </p>
          </div>
          <span className={`px-2 py-1 text-sm rounded-full ${getStatusClass()}`}>
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
                {formatDate(enrollmentDate)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Application Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{formatDate(createdAt)}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Priority Level</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityClass()}`}>
                  {getPriorityText()}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Expected Completion</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{formatDate(deadlineDate)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Credibility Score */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Credibility Score</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your current application credibility rating
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">
                Score: {credibilityScore}/100
              </span>
              <span className={`text-sm font-medium ${
                credibilityScore >= 80 ? 'text-green-700' : 
                credibilityScore >= 60 ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {credibilityScore >= 80 ? 'Excellent' : 
                 credibilityScore >= 60 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  credibilityScore >= 80 ? 'bg-green-600' : 
                  credibilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-600'
                }`}
                style={{ width: `${credibilityScore}%` }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Your credibility score affects how quickly your application is processed. 
              Submit all required documents and respond promptly to increase your score.
            </p>
          </div>
        </div>
      </div>
      
      {/* Documents Status */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Documents Status</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Status of your submitted documents
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="px-4 py-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">
                Completion: {calculateCompletionPercentage()}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${calculateCompletionPercentage()}%` }}
              ></div>
            </div>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {documentStatuses.map(doc => (
              <li key={doc.docType} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      doc.isVerified ? 'bg-green-100' : doc.documentHash ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      {doc.isVerified ? (
                        <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : doc.documentHash ? (
                        <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        {doc.documentHash ? (
                          doc.isVerified ? 'Verified' : 'Awaiting verification'
                        ) : (
                          'Not submitted'
                        )}
                      </p>
                    </div>
                  </div>
                  <div>
                    {doc.documentHash ? (
                      <a
                        href={`https://ipfs.io/ipfs/${doc.documentHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        View Document
                      </a>
                    ) : (
                      <button
                        onClick={() => router.push('/documents')}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Upload
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="bg-gray-50 px-4 py-4 border-t border-gray-200">
            <button
              onClick={() => router.push('/documents')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Manage Documents
            </button>
          </div>
        </div>
      </div>
      
      {/* Application History */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Application History</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Recent activities on your application
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {verificationHistory.map((event, i) => (
              <li key={i} className="px-4 py-4">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.action}</p>
                    <p className="text-sm text-gray-500">{event.details}</p>
                  </div>
                  <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
