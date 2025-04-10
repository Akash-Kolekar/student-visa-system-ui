'use client'

import { useState, useEffect } from 'react'

type TimelineStep = {
  id: number;
  name: string;
  description: string;
  status: 'complete' | 'current' | 'upcoming';
  date?: string;
}

type ApplicationTimelineProps = {
  status: number;
  credibilityScore: number;
  createdAt: number;
  updatedAt: number;
  deadlineDate: number;
}

export default function ApplicationTimeline({ 
  status,
  credibilityScore,
  createdAt,
  updatedAt,
  deadlineDate
}: ApplicationTimelineProps) {
  const [steps, setSteps] = useState<TimelineStep[]>([])

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Pending'
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  // Set up timeline steps based on application status
  useEffect(() => {
    const newSteps: TimelineStep[] = [
      {
        id: 0,
        name: 'Application Submitted',
        description: 'Your application has been received and is being processed.',
        status: 'complete',
        date: formatDate(createdAt)
      },
      {
        id: 1,
        name: 'Document Verification',
        description: 'Your documents are being verified for authenticity.',
        status: status > 1 ? 'complete' : status === 1 ? 'current' : 'upcoming',
        date: status >= 1 ? formatDate(updatedAt) : undefined
      },
      {
        id: 2,
        name: 'Background Check',
        description: 'Security and background verification process.',
        status: status > 3 ? 'complete' : status === 3 ? 'current' : 'upcoming',
        date: status >= 3 ? formatDate(updatedAt) : undefined
      },
      {
        id: 4,
        name: 'Visa Interview',
        description: status === 4 ? 'Your interview has been scheduled.' : 'Interview with embassy officials.',
        status: status > 4 ? 'complete' : status === 4 ? 'current' : 'upcoming',
        date: status >= 4 ? formatDate(updatedAt) : undefined
      },
      {
        id: 5, 
        name: 'Final Decision',
        description: 'Final review and decision on your visa application.',
        status: status > 5 ? 'complete' : status === 5 ? 'current' : 'upcoming',
        date: status >= 6 ? formatDate(updatedAt) : undefined
      },
      {
        id: 6,
        name: status === 7 ? 'Visa Rejected' : 'Visa Approved',
        description: status === 7 
          ? 'Your visa application has been rejected.' 
          : status === 8 
            ? 'Your visa has been conditionally approved.'
            : 'Your visa application has been approved.',
        status: status >= 6 ? 'complete' : 'upcoming',
        date: status >= 6 ? formatDate(updatedAt) : undefined
      }
    ]

    setSteps(newSteps)
  }, [status, createdAt, updatedAt, deadlineDate])

  // Calculate progress percentage
  const progressPercentage = Math.min(Math.round((status / 6) * 100), 100)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Application Timeline</h2>
        <div className="text-sm text-gray-500">
          Target completion: {formatDate(deadlineDate)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-indigo-700">{progressPercentage}% Complete</span>
          <span className="text-sm font-medium text-gray-500">Deadline: {formatDate(deadlineDate)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Timeline steps */}
      <div className="flow-root">
        <ul className="-mb-8">
          {steps.map((step, stepIdx) => (
            <li key={step.id}>
              <div className="relative pb-8">
                {stepIdx !== steps.length - 1 ? (
                  <span
                    className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                      step.status === 'complete' ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-1 ring-white ${
                        step.status === 'complete'
                          ? 'bg-indigo-600'
                          : step.status === 'current'
                          ? 'bg-indigo-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      {step.status === 'complete' ? (
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className={`text-xs font-medium ${
                          step.status === 'current' ? 'text-indigo-600' : 'text-gray-500'
                        }`}>
                          {step.id + 1}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5">
                    <div>
                      <p className={`text-sm font-medium ${
                        step.status === 'complete' ? 'text-indigo-600' : 
                        step.status === 'current' ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                    </div>
                    {step.date && (
                      <div className="mt-1 text-xs text-gray-400">
                        {step.date}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
