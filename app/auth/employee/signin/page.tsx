'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { handleEmployeeSignIn } from '@/app/actions/employeeAuth'

export default function EmployeeSignIn() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    const result = await handleEmployeeSignIn(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-start">
          <Link 
            href="/auth/signin"
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <span>← Back</span>
          </Link>
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Employee Sign In
          </h2>
        </div>
        <form action={onSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="email"
                type="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <Link 
            href="/auth/employee/register" 
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            New employee? Register
          </Link>
        </div>
      </div>
    </div>
  )
}