'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { addWarehouseZone } from '@/app/actions/warehouse'
import Navbar from '@/app/components/navbar'

interface FormErrors {
  zoneid?: string;
  subzoneid?: string;
  spaceoccupied?: string;
}

export default function AddWarehouseZone() {
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [warehouseName, setWarehouseName] = useState<string>('')
  const [userType, setUserType] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const warehouseId = parseInt(params.warehouseid as string)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function loadData() {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.user) return
      
      setUserType(session.session.user.user_metadata.type)
      if (session.session.user.user_metadata.type !== 'employee') {
        router.push(`/warehouse/${warehouseId}/zones`)
        return
      }

      const { data: warehouse } = await supabase
        .from('warehouse')
        .select('warehousename')
        .eq('warehouseid', warehouseId)
        .single()

      if (warehouse) {
        setWarehouseName(warehouse.warehousename)
      }
    }

    loadData()
  }, [warehouseId, router])

  async function validateForm(formData: FormData): Promise<boolean> {
    const errors: FormErrors = {}

    const zoneid = formData.get('zoneid') as string
    if (zoneid.length > 20) {
      errors.zoneid = 'Zone ID must be 20 characters or less'
    }

    const subzoneid = parseInt(formData.get('subzoneid') as string)
    if (isNaN(subzoneid) || subzoneid <= 0) {
      errors.subzoneid = 'Subzone ID must be a positive number'
    }

    const spaceoccupied = parseInt(formData.get('spaceoccupied') as string)
    if (spaceoccupied && (isNaN(spaceoccupied) || spaceoccupied < 0)) {
      errors.spaceoccupied = 'Space occupied must be a non-negative number'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function onSubmit(formData: FormData) {
    if (userType !== 'employee') {
      setError('Only employees can add warehouse zones')
      return
    }

    const isValid = await validateForm(formData)
    if (!isValid) return

    formData.append('warehouseid', warehouseId.toString())
    const result = await addWarehouseZone(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      router.push(`/warehouse/${warehouseId}/zones`)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-start mb-8">
            <Link 
              href={`/warehouse/${warehouseId}/zones`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Zones
            </Link>
          </div>

          <form action={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Add New Zone to {warehouseName}</h2>

            <div>
              <label htmlFor="zoneid" className="block text-sm font-medium text-gray-700">
                Zone ID
              </label>
              <input
                type="text"
                name="zoneid"
                id="zoneid"
                required
                maxLength={20}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  formErrors.zoneid ? 'border-red-500' : ''
                }`}
              />
              {formErrors.zoneid && (
                <p className="mt-1 text-sm text-red-500">{formErrors.zoneid}</p>
              )}
            </div>

            <div>
              <label htmlFor="subzoneid" className="block text-sm font-medium text-gray-700">
                Subzone ID
              </label>
              <input
                type="number"
                name="subzoneid"
                id="subzoneid"
                required
                min="1"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  formErrors.subzoneid ? 'border-red-500' : ''
                }`}
              />
              {formErrors.subzoneid && (
                <p className="mt-1 text-sm text-red-500">{formErrors.subzoneid}</p>
              )}
            </div>

            <div>
              <label htmlFor="spaceoccupied" className="block text-sm font-medium text-gray-700">
                Space Occupied
              </label>
              <input
                type="number"
                name="spaceoccupied"
                id="spaceoccupied"
                min="0"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  formErrors.spaceoccupied ? 'border-red-500' : ''
                }`}
              />
              {formErrors.spaceoccupied && (
                <p className="mt-1 text-sm text-red-500">{formErrors.spaceoccupied}</p>
              )}
            </div>

            <div>
              <label htmlFor="spaceavailability" className="block text-sm font-medium text-gray-700">
                Space Availability
              </label>
              <select
                name="spaceavailability"
                id="spaceavailability"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="true">Available</option>
                <option value="false">Full</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Zone
            </button>
          </form>
        </div>
      </div>
    </>
  )
}