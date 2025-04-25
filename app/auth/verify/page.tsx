'use client'

import Link from 'next/link'

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Check your email
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          We sent you an email with a verification link. Please check your inbox and click the link to verify your account.
        </p>
        <div className="mt-4">
          <Link 
            href="/auth/signin"
            className="text-blue-600 hover:text-blue-500"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}