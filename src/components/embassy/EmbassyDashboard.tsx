'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useStudentVisaSystem } from '@/hooks/useStudentVisaSystem'
import { useEmbassyGateway } from '@/hooks/useEmbassyGateway'
import NotificationBanner from '@/components/common/NotificationBanner'

enum ApplicationTab {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ALL = 'all',
}

export default function EmbassyDashboard() {
  const { address } = useAccount()
  const router = useRouter()
  const { requestAdditionalDocuments, overrideDecision } = useEmbassyGateway()
  const { getTotalApplications } = useStudentVisaSystem()
  
  const [activeTab, setActiveTab] = useState<ApplicationTab>(ApplicationTab.PENDING)
  const [approveLoading, setApproveLoading] = useState<string | null>(null)
  const [rejectLoading, setRejectLoading] = useState<string | null>(null)
  const [requestDocsLoading, setRequestDocsLoading] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [additionalDocuments, setAdditionalDocuments] = useState('')
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [showRequestDocsModal, setShowRequestDocsModal] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null)
  const [notification, setNotification] = useState({
    show: false,
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
    message: ''
  })
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Query for total applications
  const totalApplicationsResult = getTotalApplications()
  
  // Mock applications for demonstration
  useEffect(() => {
    // In a real app, you would fetch this data from your contract
    const mockApplications = [
      {
        id: '1',
        applicant: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        name: 'John Smith',
        university: 'Cambridge University',
        program: 'Computer Science',
        enrollmentDate: '2025-09-01',
        credibilityScore: 85,
        documentsVerified: 5,
        documentsTotal: 5,
        status: 5, // Under Final Approval - ready for embassy decision
        createdAt: Date.now() / 1000 - 86400 * 10 // 10 days ago
      },
      {
        id: '2',
        applicant: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        name: 'Alice Johnson',
        university: 'Oxford University',
        program: 'Mathematics',
        enrollmentDate: '2025-08-15',
        credibilityScore: 78,
        documentsVerified: 4,
        documentsTotal: 5,
        status: 3, // Verification in Progress
        createdAt: Date.now() / 1000 - 86400 * 7 // 7 days ago
      }
    ];
    
    // Filter applications based on active tab
    let filteredApps = [...mockApplications];
    if (activeTab === ApplicationTab.PENDING) {
      filteredApps = mockApplications.filter(app => app.status < 6);
    } else if (activeTab === ApplicationTab.APPROVED) {
      filteredApps = mockApplications.filter(app => app.status === 6);
    } else if (activeTab === ApplicationTab.REJECTED) {
      filteredApps = mockApplications.filter(app => app.status === 7);
    }
    
    setApplications(filteredApps);
    setLoading(false);
  }, [activeTab]);

  // Handle visa approval
  const handleApproveVisa = async (applicant: string) => {
    setApproveLoading(applicant)
    try {
      await overrideDecision(applicant as `0x${string}`, true, "Approved by embassy")
      
      // Update local state
      setApplications(apps => apps.filter(app => app.applicant !== applicant))
      
      setNotification({
        show: true,
        type: 'success',
        message: 'Visa application approved successfully!'
      })
    } catch (error) {
      console.error('Error approving visa:', error)
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to approve visa application.'
      })
    } finally {
      setApproveLoading(null)
    }
  }
  
  // Handle visa rejection
  const handleRejectVisa = async () => {
    if (!selectedApplicant || !rejectionReason) return
    
    setRejectLoading(selectedApplicant)
    setShowReasonModal(false)
    
    try {
      await overrideDecision(selectedApplicant as `0x${string}`, false, rejectionReason)
      
      // Update local state
      setApplications(apps => apps.filter(app => app.applicant !== selectedApplicant))
      
      setRejectionReason('')
      setNotification({
        show: true,
        type: 'info',
        message: 'Visa application rejected successfully'
      })
    } catch (error) {
      console.error('Error rejecting visa:', error)
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to reject visa application.'
      })
    } finally {
      setRejectLoading(null)
    }
  }
  
  // Handle requesting additional documents
  const handleRequestDocuments = async () => {
    if (!selectedApplicant || !additionalDocuments) return
    
    setRequestDocsLoading(selectedApplicant)
    setShowRequestDocsModal(false)
    
    try {
      await requestAdditionalDocuments(selectedApplicant as `0x${string}`, additionalDocuments)
      
      setAdditionalDocuments('')
      setNotification({
        show: true,
        type: 'success',
        message: 'Additional documents requested successfully'
      })
    } catch (error) {
      console.error('Error requesting documents:', error)
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to request additional documents'
      })
    } finally {
      setRequestDocsLoading(null)
    }
  }
  
  // Open rejection modal
  const openRejectModal = (applicant: string) => {
    setSelectedApplicant(applicant)
    setShowReasonModal(true)
  }
  
  // Open request docs modal
  const openRequestDocsModal = (applicant: string) => {
    setSelectedApplicant(applicant)
    setShowRequestDocsModal(true)
  }
  
  // View application details
  const viewApplicationDetails = (applicant: string) => {
    router.push(`/applications/${applicant}?role=embassy`)
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }
  
  // Placeholder for embassy statistics
  const embassyStats = {
    totalProcessed: 98,
    approvalRate: 76,
    averageProcessingDays: 18,
    pendingApprovals: 12
  }

  return (
    <div className="space-y-6">
      {/* Notification banner */}
      {notification.show && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          show={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
      
      {/* Embassy Statistics */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Embassy Statistics</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Overview of visa application processing metrics
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="py-4 sm:py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Applications</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {totalApplicationsResult.isLoading 
                      ? 'Loading...' 
                      : Number(totalApplicationsResult.data || 0)}
                  </dd>
                </div>
                
                <div className="py-4 sm:py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Applications Processed</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{embassyStats.totalProcessed}</dd>
                </div>
                
                <div className="py-4 sm:py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Approval Rate</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{embassyStats.approvalRate}%</dd>
                </div>
                
                <div className="py-4 sm:py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Average Processing</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{embassyStats.averageProcessingDays} days</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Visa Applications */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Visa Applications</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Review and process student visa applications
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          {/* Tabs */}
          <div className="px-4 py-3 border-b border-gray-200">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab(ApplicationTab.PENDING)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === ApplicationTab.PENDING
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending Approval
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {embassyStats.pendingApprovals}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab(ApplicationTab.APPROVED)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === ApplicationTab.APPROVED
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Approved
              </button>
              
              <button
                onClick={() => setActiveTab(ApplicationTab.REJECTED)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === ApplicationTab.REJECTED
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Rejected
              </button>
              
              <button
                onClick={() => setActiveTab(ApplicationTab.ALL)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === ApplicationTab.ALL
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Applications
              </button>
            </nav>
          </div>
          
          {/* Application List */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="mt-2 text-sm text-gray-500">Loading applications...</p>
              </div>
            ) : applications.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      University & Program
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credibility Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-700">{app.name.split(' ').map((n: string) => n[0]).join('')}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {app.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatAddress(app.applicant)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.university}</div>
                        <div className="text-sm text-gray-500">{app.program}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{app.credibilityScore}</span>
                          <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                app.credibilityScore > 80 ? 'bg-green-500' : 
                                app.credibilityScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${app.credibilityScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          app.documentsVerified === app.documentsTotal ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.documentsVerified}/{app.documentsTotal} Verified
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveVisa(app.applicant)}
                            className={`text-green-600 hover:text-green-900 ${
                              approveLoading === app.applicant ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={approveLoading === app.applicant || app.status !== 5}
                          >
                            {approveLoading === app.applicant ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => openRejectModal(app.applicant)}
                            className={`text-red-600 hover:text-red-900 ${
                              rejectLoading === app.applicant ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={rejectLoading === app.applicant || app.status !== 5}
                          >
                            {rejectLoading === app.applicant ? 'Rejecting...' : 'Reject'}
                          </button>
                          <button
                            onClick={() => openRequestDocsModal(app.applicant)}
                            className={`text-blue-600 hover:text-blue-900 ${
                              requestDocsLoading === app.applicant ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={requestDocsLoading === app.applicant || app.status >= 6}
                          >
                            {requestDocsLoading === app.applicant ? 'Requesting...' : 'Request Docs'}
                          </button>
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => viewApplicationDetails(app.applicant)}
                          >
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
                <p className="text-gray-500">No applications found for this filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Rejection Modal */}
      {showReasonModal && (
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
                      Reject Visa Application
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Please provide a reason for rejecting this visa application. This information will be shared with the student.
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
                  onClick={handleRejectVisa}
                >
                  Reject Application
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
      
      {/* Request Documents Modal */}
      {showRequestDocsModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Request Additional Documents
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Specify the additional documents required from the applicant.
                      </p>
                      <div className="mt-4">
                        <textarea
                          rows={4}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="e.g. Updated financial statements, Police clearance certificate"
                          value={additionalDocuments}
                          onChange={(e) => setAdditionalDocuments(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleRequestDocuments}
                >
                  Send Request
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowRequestDocsModal(false)}
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
