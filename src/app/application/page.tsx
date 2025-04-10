'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { useStudentVisaSystem } from '@/hooks/useStudentVisaSystem'
import { useFeeManager } from '@/hooks/useFeeManager'
import { parseEther } from 'viem'

export default function ApplicationForm() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const { createApplication, hasApplication } = useStudentVisaSystem()
  const hasApplicationResult = hasApplication()
  
  const [formData, setFormData] = useState({
    universityId: '',
    programId: '',
    enrollmentDate: '',
    priority: '0', // Standard priority
    previousVisaCountries: [''],
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Redirect if not connected
  if (!isConnected) {
    router.push('/')
    return null
  }

  // Redirect if user already has an application
  if (hasApplicationResult.data) {
    router.push('/dashboard')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCountryChange = (index: number, value: string) => {
    const newCountries = [...formData.previousVisaCountries]
    newCountries[index] = value
    setFormData(prev => ({
      ...prev,
      previousVisaCountries: newCountries
    }))
  }

  const addCountryField = () => {
    setFormData(prev => ({
      ...prev,
      previousVisaCountries: [...prev.previousVisaCountries, '']
    }))
  }

  const removeCountryField = (index: number) => {
    const newCountries = [...formData.previousVisaCountries]
    newCountries.splice(index, 1)
    setFormData(prev => ({
      ...prev,
      previousVisaCountries: newCountries
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Convert date string to Unix timestamp (seconds)
      const enrollmentTimestamp = Math.floor(new Date(formData.enrollmentDate).getTime() / 1000)
      
      // Filter out empty country fields
      const countries = formData.previousVisaCountries.filter(country => country.trim() !== '')
      
      // Calculate fee based on priority
      const priorityLevel = parseInt(formData.priority)
      let fee = '0.05' // Standard fee in ETH
      if (priorityLevel === 1) fee = '0.1' // Expedited
      if (priorityLevel === 2) fee = '0.2' // Emergency
      
      await createApplication(
        formData.universityId,
        formData.programId,
        enrollmentTimestamp,
        priorityLevel,
        countries,
        { value: parseEther(fee) }
      )
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      console.error('Application creation failed:', err)
      setError('Failed to create application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto pb-12">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Student Visa Application</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Please fill out all required information accurately.
            </p>
          </div>
          
          {success ? (
            <div className="px-4 py-12 sm:px-6 text-center">
              <svg 
                className="mx-auto h-12 w-12 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Application Successfully Submitted</h3>
              <p className="mt-1 text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="border-t border-gray-200">
              <div className="px-4 py-5 bg-white sm:p-6">
                {error && (
                  <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="universityId" className="block text-sm font-medium text-gray-700">
                      University ID
                    </label>
                    <input
                      type="text"
                      name="universityId"
                      id="universityId"
                      required
                      value={formData.universityId}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="programId" className="block text-sm font-medium text-gray-700">
                      Program ID
                    </label>
                    <input
                      type="text"
                      name="programId"
                      id="programId"
                      required
                      value={formData.programId}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="enrollmentDate" className="block text-sm font-medium text-gray-700">
                      Enrollment Date
                    </label>
                    <input
                      type="date"
                      name="enrollmentDate"
                      id="enrollmentDate"
                      required
                      value={formData.enrollmentDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Processing Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="0">Standard (0.05 ETH)</option>
                      <option value="1">Expedited (0.1 ETH)</option>
                      <option value="2">Emergency (0.2 ETH)</option>
                    </select>
                  </div>

                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Visa Countries (if any)
                    </label>
                    
                    {formData.previousVisaCountries.map((country, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => handleCountryChange(index, e.target.value)}
                          placeholder="Country name"
                          className="flex-1 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeCountryField(index)}
                            className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addCountryField}
                      className="mt-2 py-1 px-3 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      + Add Another Country
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 ${
                    loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

// // Helper function to parse ETH values
// function parseEther(etherString: string): bigint {
//   return BigInt(Math.floor(parseFloat(etherString) * 1e18))
// }