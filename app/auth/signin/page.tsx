'use client'

import Link from 'next/link'

export default function SignInSelect() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in as
        </h2>
        <div className="flex flex-col space-y-4">
          <Link 
            href="/auth/customer/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Customer
          </Link>
          <Link 
            href="/auth/employee/signin"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Employee
          </Link>
        </div>

        {/* Add return to home link */}
        <div className="text-center mt-4">
          <Link 
            href="/"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}