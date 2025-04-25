'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addWarehouse } from '@/app/actions/warehouse'
import Navbar from '@/app/components/navbar'

interface FormErrors {
  warehousename?: string;
  status?: string;
  address?: string;
  city?: string;
}

export default function AddWarehouse() {
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const router = useRouter()

  async function validateForm(formData: FormData): Promise<boolean> {
    const errors: FormErrors = {}

    const warehousename = formData.get('warehousename') as string
    if (warehousename.length > 20) {
      errors.warehousename = 'Warehouse name must be 20 characters or less'
    }

    const status = formData.get('status') as string
    if (status.length > 10) {
      errors.status = 'Status must be 10 characters or less'
    }

    const address = formData.get('address') as string
    if (address.length > 50) {
      errors.address = 'Address must be 50 characters or less'
    }

    const city = formData.get('city') as string
    if (city.length > 20) {
      errors.city = 'City must be 20 characters or less'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function onSubmit(formData: FormData) {
    const isValid = await validateForm(formData)
    if (!isValid) return

    const result = await addWarehouse(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      router.push('/warehouse')
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-start mb-8">
            <Link 
              href="/warehouse"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Warehouses
            </Link>
          </div>

          <form action={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Add New Warehouse</h2>

            <div>
              <label htmlFor="warehousename" className="block text-sm font-medium text-gray-700">
                Warehouse Name
              </label>
              <input
                type="text"
                name="warehousename"
                id="warehousename"
                required
                maxLength={20}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  formErrors.warehousename ? 'border-red-500' : ''
                }`}
              />
              {formErrors.warehousename && (
                <p className="mt-1 text-sm text-red-500">{formErrors.warehousename}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                id="status"
                required
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  formErrors.status ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select status...</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="full">Full</option>
              </select>
              {formErrors.status && (
                <p className="mt-1 text-sm text-red-500">{formErrors.status}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                required
                maxLength={50}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  formErrors.address ? 'border-red-500' : ''
                }`}
              />
              {formErrors.address && (
                <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
              )}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                id="city"
                required
                maxLength={20}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  formErrors.city ? 'border-red-500' : ''
                }`}
              />
              {formErrors.city && (
                <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Warehouse
            </button>
          </form>
        </div>
      </div>
    </>
  )
}