'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useStudentVisaSystem } from '@/hooks/useStudentVisaSystem'

export default function AdminDashboard() {
  const { address } = useAccount()
  const { getTotalApplications } = useStudentVisaSystem()
  
  const [activeTab, setActiveTab] = useState('system')
  const [newAddress, setNewAddress] = useState('')
  const [newRole, setNewRole] = useState('UNIVERSITY_ROLE')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const totalApplicationsResult = getTotalApplications()
  
  // Placeholder for system metrics
  const systemMetrics = {
    totalApplications: totalApplicationsResult.data ? Number(totalApplicationsResult.data) : 0,
    totalApproved: 68,
    totalRejected: 12,
    averageProcessingDays: 18,
    feeCollected: '14.5 ETH',
    activeVerifiers: 8,
    registeredUniversities: 15,
    systemUptime: '99.8%'
  }

  // Handle role assignment
  const handleRoleAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAddress || !newRole) {
      setError('Address and role are required')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      // This would call your contract's role assignment function
      // For now we'll just simulate with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
      setNewAddress('')
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      console.error('Error assigning role:', err)
      setError('Failed to assign role. Please check the address format and try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Admin Dashboard</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              System management and oversight
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('system')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'system' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              System Overview
            </button>
            <button 
              onClick={() => setActiveTab('roles')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'roles' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Role Management
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'settings' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              System Settings
            </button>
          </div>
        </div>
        
        {activeTab === 'system' && (
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-0">
              <h4 className="text-md font-medium text-gray-900 px-4 py-2">System Metrics</h4>
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="py-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Total Applications</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {totalApplicationsResult.isLoading ? 'Loading...' : systemMetrics.totalApplications}
                    </dd>
                  </div>
                  
                  <div className="py-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Applications Approved</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{systemMetrics.totalApproved}</dd>
                  </div>
                  
                  <div className="py-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Applications Rejected</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{systemMetrics.totalRejected}</dd>
                  </div>
                  
                  <div className="py-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Avg. Processing Time</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{systemMetrics.averageProcessingDays} days</dd>
                  </div>
                  
                  <div className="py-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fees Collected</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{systemMetrics.feeCollected}</dd>
                  </div>
                  
                  <div className="py-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Active Verifiers</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{systemMetrics.activeVerifiers}</dd>
                  </div>
                  
                  <div className="py-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Registered Universities</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{systemMetrics.registeredUniversities}</dd>
                  </div>
                  
                  <div className="py-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">System Uptime</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">{systemMetrics.systemUptime}</dd>
                  </div>
                </div>
              </dl>
              
              <h4 className="text-md font-medium text-gray-900 px-4 py-2 mt-6">System Controls</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 p-4">
                <button className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  Emergency Pause
                </button>
                <button className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Resume Operations
                </button>
                <button className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  System Diagnostics
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'roles' && (
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Assign Role to Address</h4>
                
                <form onSubmit={handleRoleAssignment} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                      Role successfully assigned!
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Wallet Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        value={newAddress}
                        onChange={e => setNewAddress(e.target.value)}
                        placeholder="0x..."
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        id="role"
                        value={newRole}
                        onChange={e => setNewRole(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="UNIVERSITY_ROLE">University</option>
                        <option value="EMBASSY_ROLE">Embassy</option>
                        <option value="VERIFIER_ROLE">Verifier</option>
                        <option value="ADMIN_ROLE">Admin</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 ${
                        loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      {loading ? 'Assigning...' : 'Assign Role'}
                    </button>
                  </div>
                </form>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Current Role Assignments</h4>
                
                <div className="overflow-x-auto shadow border rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned At
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                          {formatAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            University
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2023-06-01
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-red-600 hover:text-red-900">
                            Revoke
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                          {formatAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Embassy
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2023-05-15
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-red-600 hover:text-red-900">
                            Revoke
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Fee Settings</h4>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Standard Fee
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        defaultValue="0.05"
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        ETH
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Expedited Fee
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        defaultValue="0.1"
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        ETH
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Emergency Fee
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        defaultValue="0.2"
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        ETH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Processing Time Settings</h4>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Standard Processing
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        defaultValue="30"
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        days
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Expedited Processing
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        defaultValue="15"
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        days
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Emergency Processing
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        defaultValue="7"
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        days
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
