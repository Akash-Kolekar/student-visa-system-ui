'use client'

import React from 'react'
import Link from 'next/link'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { usePathname } from 'next/navigation'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const pathname = usePathname()

  const handleConnect = async () => {
    connect({ connector: injected() })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                  Student Visa System
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  href="/"
                  className={`${
                    pathname === '/' 
                      ? 'border-indigo-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Home
                </Link>
                {isConnected && (
                  <>
                    <Link 
                      href="/dashboard"
                      className={`${
                        pathname === '/dashboard' 
                          ? 'border-indigo-500 text-gray-900' 
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/application"
                      className={`${
                        pathname === '/application' 
                          ? 'border-indigo-500 text-gray-900' 
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Apply for Visa
                    </Link>
                    <Link 
                      href="/documents"
                      className={`${
                        pathname === '/documents' 
                          ? 'border-indigo-500 text-gray-900' 
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Documents
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700 truncate max-w-[150px]">
                    {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                  </span>
                  <button
                    onClick={() => disconnect()}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Student Visa Blockchain System
          </p>
        </div>
      </footer>
    </div>
  )
}