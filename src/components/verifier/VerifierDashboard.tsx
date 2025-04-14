'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { useVerificationHub } from '@/hooks/useVerificationHub'
import NotificationBanner from '@/components/common/NotificationBanner'
import { contractAddresses } from '@/config/contracts'
import VerificationHubABI from '@/app/abis/VerificationHub.json'

enum VerificationTab {
  PENDING = 'pending',
  COMPLETED = 'completed',
  ALL = 'all',
}

enum VerificationType {
  DOCUMENT = 0,
  BACKGROUND_CHECK = 1,
  BIOMETRIC = 2,
}

export default function VerifierDashboard() {
  const { address } = useAccount()
  const { processVerification, calculateTrustScore } = useVerificationHub()
  
  const [activeTab, setActiveTab] = useState<VerificationTab>(VerificationTab.PENDING)
  const [verifyLoading, setVerifyLoading] = useState<string | null>(null)
  const [rejectLoading, setRejectLoading] = useState<string | null>(null)
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<`0x${string}` | null>(null)
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'warning' | 'error' | 'info',
    message: ''
  })
  const [verificationRequests, setVerificationRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Get trust score for current verifier
  const trustScoreResult = calculateTrustScore(address as `0x${string}`)

  // Add function to get verification requests
  const getVerificationRequests = () => {
    return useReadContract({
      address: contractAddresses.VerificationHub,
      abi: VerificationHubABI.abi,
      functionName: 'getPendingVerifications',
      args: [address as `0x${string}`]
    })
  }

  // Get verification requests
  const verificationRequestsResult = getVerificationRequests()

  // Load verification requests
  useEffect(() => {
    const fetchVerificationRequests = async () => {
      setLoading(true);
      try {
        // Check if we have real verification requests
        if (verificationRequestsResult.data && Array.isArray(verificationRequestsResult.data) && 
            verificationRequestsResult.data.length > 0) {
          
          console.log("Real verification requests found:", verificationRequestsResult.data);
          
          // Process the verification requests
          // This would normally transform contract data to our UI format
          // For now, since the hook might not exist, we'll continue using mock data
          
          console.log("Loading verification requests from contract...");
        }
        
        // Use mock data as fallback or for development
        const mockRequests = [
          // ...existing mock requests...
          {
            id: '0xabcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234',
            applicant: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            name: 'Akash Kolekar',
            verificationType: VerificationType.DOCUMENT,
            documentName: 'Passport',
            submittedAt: '2023-06-15',
            priority: 'High'
          },
          {
            id: '0xefgh5678efgh5678efgh5678efgh5678efgh5678efgh5678efgh5678efgh5678',
            applicant: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            name: 'Soham Kokate',
            verificationType: VerificationType.BACKGROUND_CHECK,
            documentName: 'Criminal Records Check',
            submittedAt: '2023-06-18',
            priority: 'Medium'
          }
        ];
        
        // Filter based on activeTab
        let filteredRequests = [...mockRequests];
        if (activeTab === VerificationTab.COMPLETED) {
          // In a real app, we'd have completed requests to filter
          filteredRequests = [];
        }
        
        setVerificationRequests(filteredRequests);
      } catch (error) {
        console.error("Error fetching verification requests:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVerificationRequests();
  }, [activeTab, verificationRequestsResult.data]);
  
  // Handle approve verification
  const handleApproveVerification = async (requestId: `0x${string}`) => {
    setVerifyLoading(requestId)
    try {
      await processVerification(requestId, true)
      
      // Update local state
      setVerificationRequests(reqs => reqs.filter(req => req.id !== requestId))
      
      setNotification({
        show: true,
        type: 'success',
        message: 'Verification approved successfully!'
      })
    } catch (error) {
      console.error('Error approving verification:', error)
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to approve verification. Please try again.'
      })
    } finally {
      setVerifyLoading(null)
    }
  }
  
  // Handle reject verification
  const handleRejectVerification = async () => {
    if (!selectedRequest) return
    
    setRejectLoading(selectedRequest)
    setShowReasonModal(false)
    
    try {
      await processVerification(selectedRequest, false)
      
      // Update local state
      setVerificationRequests(reqs => reqs.filter(req => req.id !== selectedRequest))
      
      setRejectionReason('')
      setNotification({
        show: true,
        type: 'info',
        message: 'Verification rejected successfully'
      })
    } catch (error) {
      console.error('Error rejecting verification:', error)
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to reject verification. Please try again.'
      })
    } finally {
      setRejectLoading(null)
    }
  }
  
  // Open reject modal
  const openRejectModal = (requestId: `0x${string}`) => {
    setSelectedRequest(requestId)
    setShowReasonModal(true)
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }
  
  // Get verification type text
  const getVerificationTypeText = (type: VerificationType) => {
    const types = {
      [VerificationType.DOCUMENT]: 'Document',
      [VerificationType.BACKGROUND_CHECK]: 'Background Check',
      [VerificationType.BIOMETRIC]: 'Biometric'
    }
    return types[type]
  }
  
  // Placeholder data for verifier statistics
  const verifierStats = {
    totalVerifications: 57,
    successRate: 96,
    averageResponseTime: '4.2 hours',
    trustScore: trustScoreResult.data ? Number(trustScoreResult.data) : 85
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.show && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          show={notification.show}
          onClose={() => setNotification({...notification, show: false})}
        />
      )}
      
      {/* Verifier Statistics */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Verifier Statistics</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Overview of your verification performance
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="py-4 sm:py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Verifications</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{verifierStats.totalVerifications}</dd>
                </div>
                
                <div className="py-4 sm:py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{verifierStats.successRate}%</dd>
                </div>
                
                <div className="py-4 sm:py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Avg. Response Time</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{verifierStats.averageResponseTime}</dd>
                </div>
                
                <div className="py-4 sm:py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Trust Score</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    <div className="flex items-center">
                      <span>{verifierStats.trustScore}</span>
                      <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            verifierStats.trustScore > 80 ? 'bg-green-500' : 
                            verifierStats.trustScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${verifierStats.trustScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Verification Requests */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Verification Requests</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Process document and identity verification requests
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          {/* Tabs */}
          <div className="px-4 py-3 border-b border-gray-200">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab(VerificationTab.PENDING)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === VerificationTab.PENDING
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {verificationRequests.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab(VerificationTab.COMPLETED)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === VerificationTab.COMPLETED
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed
              </button>
              
              <button
                onClick={() => setActiveTab(VerificationTab.ALL)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === VerificationTab.ALL
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Requests
              </button>
            </nav>
          </div>
          
          {/* Request List */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="mt-2 text-sm text-gray-500">Loading verification requests...</p>
              </div>
            ) : verificationRequests.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {verificationRequests.map(request => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {formatAddress(request.id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-xs text-indigo-700">{request.name.split(' ').map((n: string) => n[0]).join('')}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatAddress(request.applicant)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getVerificationTypeText(request.verificationType)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.documentName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.submittedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.priority === 'High' ? 'bg-red-100 text-red-800' : 
                          request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveVerification(request.id as `0x${string}`)}
                            className={`text-green-600 hover:text-green-900 ${
                              verifyLoading === request.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={verifyLoading === request.id}
                          >
                            {verifyLoading === request.id ? 'Verifying...' : 'Verify'}
                          </button>
                          <button
                            onClick={() => openRejectModal(request.id as `0x${string}`)}
                            className={`text-red-600 hover:text-red-900 ${
                              rejectLoading === request.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={rejectLoading === request.id}
                          >
                            {rejectLoading === request.id ? 'Rejecting...' : 'Reject'}
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-900">
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No verification requests found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Rejection Modal */}
      {showReasonModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Reject Verification
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to reject this verification? This action will be recorded and may affect your trust score.
                      </p>
                      <div className="mt-4">
                        <textarea
                          rows={4}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Reason for rejection"
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
                  onClick={handleRejectVerification}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowReasonModal(false)}
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
