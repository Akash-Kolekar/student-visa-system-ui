'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import MainLayout from '@/components/layout/MainLayout'
import { useStudentVisaSystem } from '@/hooks/useStudentVisaSystem'
import { useUniversityHandler } from '@/hooks/useUniversityHandler'
import { useEmbassyGateway } from '@/hooks/useEmbassyGateway'
import { useVerificationHub } from '@/hooks/useVerificationHub'
import ApplicationDetails from '@/components/application/ApplicationDetails'
import NotificationBanner from '@/components/common/NotificationBanner'

export default function ApplicationDetailsPage({ params }: { params: { address: string } }) {
  const { isConnected, address } = useAccount()
  const router = useRouter()
  const { getApplicationDetails } = useStudentVisaSystem()
  const { verifyDocument: universityVerifyDocument } = useUniversityHandler()
  const { overrideDecision } = useEmbassyGateway()
  const { processVerification } = useVerificationHub()
  
  const [loading, setLoading] = useState(true)
  const [applicationData, setApplicationData] = useState<any>(null)
  const [userRole, setUserRole] = useState<'university' | 'embassy' | 'verifier' | 'student'>('student')
  const [notification, setNotification] = useState({
    show: false,
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
    message: ''
  })
  
  const applicantAddress = params.address as `0x${string}`
  const applicationDetailsResult = getApplicationDetails(applicantAddress)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }

    // For demo purposes, determine role from URL or query param
    // In production, you'd get this from your role checking logic
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    if (role === 'embassy') setUserRole('embassy');
    else if (role === 'verifier') setUserRole('verifier');
    else if (role === 'university') setUserRole('university');
    else setUserRole('student');
    
    setLoading(false)
  }, [isConnected, router])

  useEffect(() => {
    if (applicationDetailsResult.data) {
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
      ] = Array.isArray(applicationDetailsResult.data) ? applicationDetailsResult.data : [];

      // Mock document data (in production would come from contract)
      const mockDocuments = [
        {
          docType: 0,
          documentHash: 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX',
          verified: status > 1,
          rejected: false
        },
        {
          docType: 1,
          documentHash: 'QmZpkULBWbmbnRpzJNKLfrKJyLx5Wcs3LCL5qVdcWcnqtw',
          verified: status > 2,
          rejected: false
        },
        {
          docType: 2,
          documentHash: 'QmUVLxtYnSjbZzEHmmqXgETwNWDcRggkEKBZajHjhpnQQB',
          verified: false,
          rejected: false
        }
      ];

      setApplicationData({
        applicant: applicantAddress,
        universityId,
        programId,
        enrollmentDate,
        priority,
        status,
        credibilityScore,
        createdAt,
        updatedAt,
        deadlineDate,
        documents: mockDocuments
      });
    }
  }, [applicationDetailsResult.data, applicantAddress]);

  const handleVerifyDocument = async (applicant: string, docType: number) => {
    try {
      await universityVerifyDocument(applicant, docType, 'Verified through review')
      setNotification({
        show: true,
        type: 'success',
        message: 'Document verified successfully!'
      })
      
      // Update document status locally
      if (applicationData && applicationData.documents) {
        const updatedDocs = applicationData.documents.map((doc: any) => {
          if (doc.docType === docType) {
            return { ...doc, verified: true, rejected: false };
          }
          return doc;
        });
        setApplicationData({
          ...applicationData,
          documents: updatedDocs
        });
      }
    } catch (error) {
      console.error('Error verifying document:', error)
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to verify document.'
      })
    }
  }

  const handleRejectDocument = async (applicant: string, docType: number, reason: string) => {
    try {
      if (userRole === 'university') {
        await universityVerifyDocument(applicant, docType, reason, true)
      } else if (userRole === 'verifier') {
        // For demo purposes we're using a mock request ID
        const mockRequestId = `0x${Math.random().toString(16).substring(2, 30)}` as `0x${string}`
        await processVerification(mockRequestId, false)
      }
      
      setNotification({
        show: true,
        type: 'info',
        message: 'Document rejected successfully'
      })
      
      // Update document status locally
      if (applicationData && applicationData.documents) {
        const updatedDocs = applicationData.documents.map((doc: any) => {
          if (doc.docType === docType) {
            return { ...doc, verified: false, rejected: true };
          }
          return doc;
        });
        setApplicationData({
          ...applicationData,
          documents: updatedDocs
        });
      }
    } catch (error) {
      console.error('Error rejecting document:', error)
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to reject document.'
      })
    }
  }

  if (loading || applicationDetailsResult.isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </MainLayout>
    )
  }

  if (!applicationData) {
    return (
      <MainLayout>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <p className="text-red-500">No application found for this address.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Dashboard
          </button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {notification.show && (
        <div className="mb-6">
          <NotificationBanner
            type={notification.type}
            message={notification.message}
            show={notification.show}
            onClose={() => setNotification({...notification, show: false})}
          />
        </div>
      )}
      
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <ApplicationDetails
        {...applicationData}
        role={userRole}
        onVerifyDocument={userRole === 'university' || userRole === 'verifier' ? handleVerifyDocument : undefined}
        onRejectDocument={userRole === 'university' || userRole === 'verifier' ? handleRejectDocument : undefined}
      />
    </MainLayout>
  )
}
