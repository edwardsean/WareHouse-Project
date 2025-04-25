'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { handleEmployeeSignUp } from '@/app/actions/employeeAuth'

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  bankNumber?: string;
  position?: string;
  salary?: string;
  code?: string;  // Add this
}

export default function EmployeeRegister() {
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const router = useRouter()

  async function validateForm(formData: FormData): Promise<boolean> {
    const errors: FormErrors = {}
    
    // Validate phone number (optional, but must be valid if provided)
    const phoneNumber = formData.get('phoneNumber') as string
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits'
    }

    // Validate bank number (optional, but must be valid if provided)
    const bankNumber = formData.get('bankNumber') as string
    if (bankNumber && !/^\d+$/.test(bankNumber)) {
      errors.bankNumber = 'Bank number must contain only digits'
    }

    // Validate password
    const password = formData.get('password') as string
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    // Validate salary (optional, but must be valid if provided)
    const salary = formData.get('salary') as string
    if (salary && !/^\d+$/.test(salary)) {
      errors.salary = 'Salary must be a valid number'
    }

    // Validate required position
    const position = formData.get('position') as string
    if (!position) {
      errors.position = 'Position is required'
    }

    // Validate employee registration code
    const code = formData.get('code') as string
    if (!code) {
      errors.code = 'Registration code is required'
    } else if (code !== '123') { // You might want to store this in an environment variable
      errors.code = 'Invalid registration code'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function onSubmit(formData: FormData) {
    const isValid = await validateForm(formData)
    if (!isValid) return

    // Create a new FormData without the code field
    const formDataToSend = new FormData()
    for (const [key, value] of formData.entries()) {
      if (key !== 'code') {
        formDataToSend.append(key, value)
      }
    }

    const result = await handleEmployeeSignUp(formDataToSend)
    if (result?.error) {
      setError(result.error)
    } else {
      router.push('/auth/verify')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-start">
          <Link 
            href="/auth/employee/signin"
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <span>← Back</span>
          </Link>
        </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register as Employee
          </h2>
        </div>
        <form action={onSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-3">
            <div>
              <label htmlFor="firstName" className="sr-only">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="First Name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="sr-only">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Last Name (optional)"
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                className={`appearance-none rounded relative block w-full px-3 py-2 border ${
                  formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Phone Number (optional)"
              />
              {formErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="bankNumber" className="sr-only">Bank Account</label>
              <input
                id="bankNumber"
                name="bankNumber"
                type="text"
                className={`appearance-none rounded relative block w-full px-3 py-2 border ${
                  formErrors.bankNumber ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Bank Account Number (optional)"
              />
              {formErrors.bankNumber && (
                <p className="mt-1 text-sm text-red-500">{formErrors.bankNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="position" className="sr-only">Position</label>
              <input
                id="position"
                name="position"
                type="text"
                required
                className={`appearance-none rounded relative block w-full px-3 py-2 border ${
                  formErrors.position ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Position"
              />
              {formErrors.position && (
                <p className="mt-1 text-sm text-red-500">{formErrors.position}</p>
              )}
            </div>

            <div>
              <label htmlFor="salary" className="sr-only">Salary</label>
              <input
                id="salary"
                name="salary"
                type="number"
                className={`appearance-none rounded relative block w-full px-3 py-2 border ${
                  formErrors.salary ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Salary (optional)"
              />
              {formErrors.salary && (
                <p className="mt-1 text-sm text-red-500">{formErrors.salary}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded relative block w-full px-3 py-2 border ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Password"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="code" className="sr-only">Registration Code</label>
              <input
                id="code"
                name="code"
                type="password"
                required
                className={`appearance-none rounded relative block w-full px-3 py-2 border ${
                  formErrors.code ? 'border-red-500' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Employee Registration Code"
              />
              {formErrors.code && (
                <p className="mt-1 text-sm text-red-500">{formErrors.code}</p>
              )}
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
              Register
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <Link 
            href="/auth/employee/signin" 
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}