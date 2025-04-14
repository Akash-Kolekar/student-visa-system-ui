'use client'

import { useEffect, useState } from 'react'
import { useAccount, useClient } from 'wagmi'
import MainLayout from '@/components/layout/MainLayout'
import { useStudentVisaSystem } from '@/hooks/useStudentVisaSystem'
import { useRouter } from 'next/navigation'
import UniversityDashboard from '@/components/university/UniversityDashboard'
import EmbassyDashboard from '@/components/embassy/EmbassyDashboard'
import VerifierDashboard from '@/components/verifier/VerifierDashboard'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { readContract } from 'viem/actions' // Updated import
import { contractAddresses } from '@/config/contracts'
import StudentVisaSystemABI from '@/app/abis/StudentVisaSystem.json'
import ApplicationTimeline from '@/components/student/ApplicationTimeline'
import StudentApplicationStatus from '@/components/student/StudentApplicationStatus'
import { testAccounts } from '@/config/testAccounts'

// Placeholder for role-detection logic
const userRoles = {
  STUDENT: 'STUDENT',
  UNIVERSITY: 'UNIVERSITY',
  EMBASSY: 'EMBASSY',
  VERIFIER: 'VERIFIER',
  ADMIN: 'ADMIN',
}

export default function Dashboard() {
  const { isConnected, address } = useAccount()
  const client = useClient()
  const router = useRouter()
  const [userRole, setUserRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [devMode, setDevMode] = useState(false)
  const { hasApplication, getApplicationDetails } = useStudentVisaSystem()
  
  const hasApplicationResult = hasApplication()
  const applicationDetailsResult = getApplicationDetails(address || '0x0')
  
  useEffect(() => {
    if (!isConnected || !address) {
      router.push('/')
      return
    }
    
    // Check if the address matches any of our test accounts first
    if (address && testAccounts.getRoleFromAddress(address) !== 'student') {
      const detectedRole = testAccounts.getRoleFromAddress(address);
      console.log(`Detected test account with role: ${detectedRole}`);
      
      // Set role based on test account
      switch(detectedRole) {
        case 'verifier':
          setUserRole(userRoles.VERIFIER);
          break;
        case 'university':
          setUserRole(userRoles.UNIVERSITY);
          break;
        case 'embassy':
          setUserRole(userRoles.EMBASSY);
          break;
        case 'admin':
          setUserRole(userRoles.ADMIN);
          break;
        default:
          // Continue with regular role check
      }
      
      setLoading(false);
      return;
    }

    // Determine user role from smart contract
    const checkUserRole = async () => {
      try {
        if (!client) {
          console.error("Client not available")
          setUserRole(userRoles.STUDENT)
          setLoading(false)
          return
        }

        // Get role identifiers first
        const universityRole = await readContract(client, {
          address: contractAddresses.StudentVisaSystem,
          abi: StudentVisaSystemABI.abi,
          functionName: 'UNIVERSITY_ROLE'
        })
        
        const embassyRole = await readContract(client, {
          address: contractAddresses.StudentVisaSystem,
          abi: StudentVisaSystemABI.abi,
          functionName: 'EMBASSY_ROLE'
        })
        
        const adminRole = await readContract(client, {
          address: contractAddresses.StudentVisaSystem, 
          abi: StudentVisaSystemABI.abi,
          functionName: 'ADMIN_ROLE'
        })
        
        // Check user roles
        const isUniversity = await readContract(client, {
          address: contractAddresses.StudentVisaSystem,
          abi: StudentVisaSystemABI.abi,
          functionName: 'hasRole',
          args: [universityRole, address]
        })
        
        const isEmbassy = await readContract(client, {
          address: contractAddresses.StudentVisaSystem,
          abi: StudentVisaSystemABI.abi,
          functionName: 'hasRole',
          args: [embassyRole, address]
        })
        
        const isAdmin = await readContract(client, {
          address: contractAddresses.StudentVisaSystem,
          abi: StudentVisaSystemABI.abi,
          functionName: 'hasRole',
          args: [adminRole, address]
        })
        
        // Set role based on what we found
        if (isAdmin) {
          console.log("Found ADMIN role")
          setUserRole(userRoles.ADMIN)
        } else if (isEmbassy) {
          console.log("Found EMBASSY role")
          setUserRole(userRoles.EMBASSY)
        } else if (isUniversity) {
          console.log("Found UNIVERSITY role")
          setUserRole(userRoles.UNIVERSITY)
        } else {
          // Default is student
          console.log("No special roles found, setting as STUDENT")
          setUserRole(userRoles.STUDENT)
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Error checking user role:", error)
        // Default to student on error
        setUserRole(userRoles.STUDENT)
        setLoading(false)
      }
    }
    
    // For testing purposes - comment out checkUserRole() and uncomment one of these to switch roles
    // setUserRole(userRoles.UNIVERSITY)
    // setUserRole(userRoles.EMBASSY)
    // setUserRole(userRoles.STUDENT)
    // setLoading(false)
    
    checkUserRole()
  }, [isConnected, address, router, client])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </MainLayout>
    )
  }

  const applicationData = applicationDetailsResult.data;
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
  ] = Array.isArray(applicationData) ? applicationData : [];

  return (
    <MainLayout>
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Your visa application control center</p>
        
        {/* Development Mode: Role Switcher */}
        <div className="mt-2 py-2">
          <button
            onClick={() => setDevMode(!devMode)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
          >
            {devMode ? "Hide Dev Tools" : "Show Dev Tools"}
          </button>
          
          {devMode && (
            <div className="mt-2 p-3 bg-gray-100 rounded-md shadow-sm">
              <h3 className="text-sm font-medium text-gray-700">Development Mode: Role Switcher</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setUserRole(userRoles.STUDENT)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    userRole === userRoles.STUDENT
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => setUserRole(userRoles.UNIVERSITY)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    userRole === userRoles.UNIVERSITY
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  University
                </button>
                <button
                  onClick={() => setUserRole(userRoles.EMBASSY)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    userRole === userRoles.EMBASSY
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Embassy
                </button>
                <button
                  onClick={() => setUserRole(userRoles.VERIFIER)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    userRole === userRoles.VERIFIER
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Verifier
                </button>
                <button
                  onClick={() => setUserRole(userRoles.ADMIN)}
                  className={`px-2 py-1 text-xs rounded-md ${
                    userRole === userRoles.ADMIN
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">User Role</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{userRole}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{address}</dd>
          </div>
        </dl>
      </div>

      {userRole === userRoles.STUDENT && (
        <div className="mt-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Application Status</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5">
              {hasApplicationResult.isLoading ? (
                <p>Loading application status...</p>
              ) : hasApplicationResult.data ? (
                <div>
                  {applicationDetailsResult.isLoading ? (
                    <p className="mt-2">Loading details...</p>
                  ) : applicationDetailsResult.data ? (
                    <StudentApplicationStatus 
                      applicant={address as `0x${string}`}
                      applicationData={{
                        universityId,
                        programId,
                        enrollmentDate,
                        priority,
                        status,
                        credibilityScore,
                        createdAt,
                        updatedAt,
                        deadlineDate
                      }}
                    />
                  ) : (
                    <p className="text-red-500">Error loading application details</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-yellow-600">You don't have an active application</p>
                  <button
                    onClick={() => router.push('/application')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply for Visa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {userRole === userRoles.STUDENT && 
       Boolean(hasApplicationResult.data) && 
       Boolean(applicationDetailsResult.data) && (
        <div className="mt-6">
          <ApplicationTimeline 
            status={Number(status)}
            credibilityScore={Number(credibilityScore)}
            createdAt={Number(createdAt)}
            updatedAt={Number(updatedAt)}
            deadlineDate={Number(deadlineDate)}
          />
        </div>
      )}
      
      {/* University Dashboard */}
      {userRole === userRoles.UNIVERSITY && (
        <div className="mt-6">
          <UniversityDashboard />
        </div>
      )}
      
      {/* Embassy Dashboard */}
      {userRole === userRoles.EMBASSY && (
        <div className="mt-6">
          <EmbassyDashboard />
        </div>
      )}

      {/* Verifier Dashboard */}
      {userRole === userRoles.VERIFIER && (
        <div className="mt-6">
          <VerifierDashboard />
        </div>
      )}

      {/* Admin Dashboard */}
      {userRole === userRoles.ADMIN && (
        <div className="mt-6">
          <AdminDashboard />
        </div>
      )}
    </MainLayout>
  )
}

// Helper function to convert status code to text
function getStatusText(statusCode: number): string {
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