'use client'

import { useState } from 'react'

type DocumentUploaderProps = {
  documentType: number;
  documentTypeName: string;
  onUploadComplete: (cid: string) => void;
}

export default function DocumentUploader({ 
  documentType, 
  documentTypeName,
  onUploadComplete 
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    // Reset states
    setError('')
    setProgress(0)
    
    // Validate file (size limit: 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size cannot exceed 10MB')
      return
    }
    
    setFile(selectedFile)
  }

  // Handle file upload to IPFS
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }
    
    setUploading(true)
    setProgress(10)
    
    try {
      // For demo purposes, we'll simulate an upload with a timeout
      // In production, you'd use a real IPFS client like ipfs-http-client
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProgress(30)
      
      // Simulate more progress
      await new Promise(resolve => setTimeout(resolve, 800))
      setProgress(60)
      
      // Generate a fake CID for demo purposes
      const fakeCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      
      await new Promise(resolve => setTimeout(resolve, 1200))
      setProgress(100)
      
      // Call the onUploadComplete callback with the CID
      onUploadComplete(fakeCid)
      
      // Reset form
      setFile(null)
      const fileInput = document.getElementById(`document-upload-${documentType}`) as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload document')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-900">{documentTypeName} Upload</h3>
        <p className="text-xs text-gray-500">PDF, JPG or PNG. Max 10MB.</p>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          id={`document-upload-${documentType}`}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
            !file || uploading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {file && !error && (
        <div className="mt-2 text-sm text-gray-600">
          Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      )}
      
      {uploading && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Uploading to IPFS...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-indigo-600 h-1 rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}