'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useStudentVisaSystem } from '@/hooks/useStudentVisaSystem'
import { useUniversityHandler } from '@/hooks/useUniversityHandler'
import NotificationBanner from '@/components/common/NotificationBanner'

enum ApplicationTab {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  ALL = 'all',
}

export default function UniversityDashboard() {
  const { address } = useAccount()
  const router = useRouter()
  const { getUniversityApplications, verifyDocument, getApplicationDetails } = useUniversityHandler()
  const { getTotalApplications } = useStudentVisaSystem()
  
  const [activeTab, setActiveTab] = useState<ApplicationTab>(ApplicationTab.PENDING)
  const [verifyLoading, setVerifyLoading] = useState<string | null>(null)
  const [rejectLoading, setRejectLoading] = useState<string | null>(null)
  const [verificationReason, setVerificationReason] = useState('')
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [selectedDocType, setSelectedDocType] = useState<number | null>(null)
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'warning' | 'error' | 'info',
    message: ''
  })
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Query for university applications
  const applicationsResult = getUniversityApplications(activeTab)
  const totalApplicationsResult = getTotalApplications()

  // Inside UniversityDashboard.tsx, modify the useEffect hook
useEffect(() => {
  const fetchApplications = async () => {
    setLoading(true)
    try {
      // First, try to get real applications from the blockchain
      const contractApplications = applicationsResult.data;
      
      if (contractApplications && Array.isArray(contractApplications) && contractApplications.length > 0) {
        console.log("Real application data loaded:", contractApplications);
        
        // Transform contract data to our application format
        const processedApplications = await Promise.all(
          contractApplications.map(async (applicantAddress: `0x${string}`) => {
            try {
              // For each applicant address, get full application details
              const appDetailsResult = await getApplicationDetails(applicantAddress);
              const appDetails = appDetailsResult.data;
              
              if (appDetails && Array.isArray(appDetails)) {
                const [
                  universityId = 'Not available',
                  programId = 'Not available',
                  enrollmentDate = 0,
                  priority = 0,
                  status = 0,
                  credibilityScore = 0,
                  createdAt = 0,
                  updatedAt = 0,
                  deadlineDate = 0
                ] = appDetails;
                
                // For each applicant, get their documents
                // In a real implementation, you'd have a contract call to get documents
                // For now, using example document data
                const documents = [
                  { docType: 0, documentHash: 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX', verified: status > 1, rejected: false },
                  { docType: 1, documentHash: 'QmZpkULBWbmbnRpzJNKLfrKJyLx5Wcs3LCL5qVdcWcnqtw', verified: status > 2, rejected: false }
                ];
                
                return {
                  applicant: applicantAddress,
                  studentName: `Student ${formatAddress(applicantAddress)}`,
                  universityId,
                  programId,
                  enrollmentDate,
                  status,
                  createdAt,
                  documents
                };
              }
              return null;
            } catch (err) {
              console.error(`Error fetching details for ${applicantAddress}:`, err);
              return null;
            }
          })
        );
        
        // Filter out any nulls from failed fetches
        const validApplications = processedApplications.filter(app => app !== null);
        
        // Apply tab filtering
        let filteredApps = [...validApplications];
        if (activeTab === ApplicationTab.PENDING) {
          filteredApps = validApplications.filter(app => 
            app.documents.some(doc => !doc.verified && !doc.rejected)
          );
        } else if (activeTab === ApplicationTab.VERIFIED) {
          filteredApps = validApplications.filter(app => 
            app.documents.every(doc => doc.verified)
          );
        } else if (activeTab === ApplicationTab.REJECTED) {
          filteredApps = validApplications.filter(app => 
            app.documents.some(doc => doc.rejected)
          );
        }
        
        setApplications(filteredApps);
      } else {
        // Fallback to mock data if no real applications found
        console.log("No real applications found, using mock data");
        
        // Use the existing mock data
        const mockApplications = [
          // ...your existing mock applications...
          {
            applicant: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            studentName: 'Akash Kolekar',
            universityId: 'Nalanda University, Bharat',
            programId: 'Computer Science',
            enrollmentDate: Date.now() / 1000 + 86400 * 30, // 30 days from now
            status: 0,
            createdAt: Date.now() / 1000 - 86400 * 5, // 5 days ago
            documents: [
              { docType: 0, documentHash: 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX', verified: false, rejected: false },
              { docType: 1, documentHash: 'QmZpkULBWbmbnRpzJNKLfrKJyLx5Wcs3LCL5qVdcWcnqtw', verified: false, rejected: false },
              { docType: 2, documentHash: 'QmUVLxtYnSjbZzEHmmqXgETwNWDcRggkEKBZajHjhpnQQB', verified: false, rejected: false }
            ]
          },
          {
            applicant: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            studentName: 'Soham Kokate',
            universityId: 'Takshashila University, Bharat',
            programId: 'Mathematics',
            enrollmentDate: Date.now() / 1000 + 86400 * 45, // 45 days from now
            status: 0,
            createdAt: Date.now() / 1000 - 86400 * 3, // 3 days ago
            documents: [
              { docType: 0, documentHash: 'QmYjtig6QbzsTXgPu6WHtYhSxV3LbYTkSULBe9JvzDmo5r', verified: true, rejected: false },
              { docType: 1, documentHash: 'QmZB9J1xyYjTUYrA5rFT5kNUkJbjxPUwTVVxox4B7kberM4', verified: false, rejected: false }
            ]
          }
        ];
        
        // Filter based on activeTab
        let filteredApps = [...mockApplications];
        if (activeTab === ApplicationTab.PENDING) {
          filteredApps = mockApplications.filter(app => !app.documents.every(doc => doc.verified || doc.rejected));
        } else if (activeTab === ApplicationTab.VERIFIED) {
          filteredApps = mockApplications.filter(app => app.documents.every(doc => doc.verified));
        } else if (activeTab === ApplicationTab.REJECTED) {
          filteredApps = mockApplications.filter(app => app.documents.some(doc => doc.rejected));
        }
        
        setApplications(filteredApps);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      // Fallback to the mock data in case of error
      // ...existing mock data logic...
    } finally {
      setLoading(false);
    }
  };
  
  fetchApplications();
}, [activeTab, applicationsResult.data])

  // // Generate mock applications to display
  // useEffect(() => {
  //   // In a real app, you would use applicationsResult.data here
  //   // For now, we'll use mock data to demonstrate functionality
  //   const mockApplications = [
  //     {
  //       applicant: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  //       studentName: 'Akash Kolekar',
  //       universityId: 'Nalanda University, Bharat',
  //       programId: 'Computer Science',
  //       enrollmentDate: Date.now() / 1000 + 86400 * 30, // 30 days from now
  //       status: 0,
  //       createdAt: Date.now() / 1000 - 86400 * 5, // 5 days ago
  //       documents: [
  //         { docType: 0, documentHash: 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX', verified: false, rejected: false },
  //         { docType: 1, documentHash: 'QmZpkULBWbmbnRpzJNKLfrKJyLx5Wcs3LCL5qVdcWcnqtw', verified: false, rejected: false },
  //         { docType: 2, documentHash: 'QmUVLxtYnSjbZzEHmmqXgETwNWDcRggkEKBZajHjhpnQQB', verified: false, rejected: false }
  //       ]
  //     },
  //     {
  //       applicant: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  //       studentName: 'Soham Kokate',
  //       universityId: 'Takshashila University, Bharat',
  //       programId: 'Mathematics',
  //       enrollmentDate: Date.now() / 1000 + 86400 * 45, // 45 days from now
  //       status: 0,
  //       createdAt: Date.now() / 1000 - 86400 * 3, // 3 days ago
  //       documents: [
  //         { docType: 0, documentHash: 'QmYjtig6QbzsTXgPu6WHtYhSxV3LbYTkSULBe9JvzDmo5r', verified: true, rejected: false },
  //         { docType: 1, documentHash: 'QmZB9J1xyYjTUYrA5rFT5kNUkJbjxPUwTVVxox4B7kberM4', verified: false, rejected: false }
  //       ]
  //     }
  //   ];
    
  //   setApplications(mockApplications);
  //   setLoading(false);
  // }, [activeTab]);

  // Handle document verification
  const handleVerifyDocument = async (applicant: string, docType: number) => {
    setVerifyLoading(applicant + '-' + docType)
    try {
      await verifyDocument(applicant, docType, 'Verified by university')
      
      // Update the local state to reflect the change
      setApplications(apps => 
        apps.map(app => {
          if (app.applicant === applicant) {
            const updatedDocuments = app.documents.map((doc: any) => {
              if (doc.docType === docType) {
                return { ...doc, verified: true };
              }
              return doc;
            });
            return { ...app, documents: updatedDocuments };
          }
          return app;
        })
      );
      
      setNotification({
        show: true,
        type: 'success',
        message: 'Document verified successfully!'
      })
    } catch (error) {
      console.error('Error verifying document:', error)
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to verify document. Please try again.'
      })
    } finally {
      setVerifyLoading(null)
    }
  }
  
  // Handle document rejection
  const handleRejectDocument = async () => {
    if (!selectedApplication || selectedDocType === null || !verificationReason) return
    
    setRejectLoading(selectedApplication + '-' + selectedDocType)
    setShowReasonModal(false)
    
    try {
      await verifyDocument(selectedApplication, selectedDocType, verificationReason, true)
      
      // Update the local state to reflect the change
      setApplications(apps => 
        apps.map(app => {
          if (app.applicant === selectedApplication) {
            const updatedDocuments = app.documents.map((doc: any) => {
              if (doc.docType === selectedDocType) {
                return { ...doc, rejected: true };
              }
              return doc;
            });
            return { ...app, documents: updatedDocuments };
          }
          return app;
        })
      );
      
      setVerificationReason('')
      setNotification({
        show: true,
        type: 'info',
        message: 'Document rejected successfully'
      })
    } catch (error) {
      console.error('Error rejecting document:', error)
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to reject document. Please try again.'
      })
    } finally {
      setRejectLoading(null)
    }
  }
  
  // Open rejection modal
  const openRejectModal = (applicant: string, docType: number) => {
    setSelectedApplication(applicant)
    setSelectedDocType(docType)
    setShowReasonModal(true)
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }
  
  // Get document type name
  const getDocumentTypeName = (docType: number) => {
    const docTypes = ['Passport', 'Admission Letter', 'Financial Proof', 'Academic Records', 'Health Certificate']
    return docTypes[docType] || 'Unknown'
  }
  
  // View application details
  const viewApplicationDetails = (applicant: string) => {
    router.push(`/applications/${applicant}?role=university`)
  }
  
  // Placeholder data for university statistics
  const universityStats = {
    totalStudents: 128,
    approvalRate: 92,
    averageProcessingDays: 14,
    pendingVerifications: 7
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
      
      {/* University Statistics */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">University Statistics</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Overview of your university's visa applications
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
                  <dt className="text-sm font-medium text-gray-500">Total Students</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{universityStats.totalStudents}</dd>
                </div>
                
                <div className="py-4 sm:py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Approval Rate</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{universityStats.approvalRate}%</dd>
                </div>
                
                <div className="py-4 sm:py-5 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Average Processing</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{universityStats.averageProcessingDays} days</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* University Applications */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Student Applications</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Review and verify student visa applications
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
                Pending Verification
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {universityStats.pendingVerifications}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab(ApplicationTab.VERIFIED)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === ApplicationTab.VERIFIED
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Verified
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
                      Program
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.applicant}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-700">
                              {app.studentName.split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {app.studentName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatAddress(app.applicant)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.programId}</div>
                        <div className="text-sm text-gray-500">{app.universityId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          {app.documents.map((doc: any) => (
                            <div key={doc.docType} className="flex items-center justify-between">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${doc.verified ? 'bg-green-100 text-green-800' : 
                                 doc.rejected ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                                {getDocumentTypeName(doc.docType)}
                              </span>
                              {!doc.verified && !doc.rejected && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleVerifyDocument(app.applicant, doc.docType)}
                                    className="text-xs text-green-600 hover:text-green-900"
                                  >
                                    Verify
                                  </button>
                                  <button
                                    onClick={() => openRejectModal(app.applicant, doc.docType)}
                                    className="text-xs text-red-600 hover:text-red-900"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(Number(app.createdAt) * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {app.status === 0 ? 'Pending' : 
                           app.status === 1 ? 'Under Review' : 
                           app.status === 6 ? 'Approved' :
                           app.status === 7 ? 'Rejected' : 'Processing'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => viewApplicationDetails(app.applicant)}
                        >
                          View Details
                        </button>
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
                      Reject Document
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Please provide a reason for rejecting this document. This information will be shared with the student.
                      </p>
                      <div className="mt-4">
                        <textarea
                          rows={4}
                          className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Rejection reason"
                          value={verificationReason}
                          onChange={(e) => setVerificationReason(e.target.value)}
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