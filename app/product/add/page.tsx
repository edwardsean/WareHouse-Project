'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { addProduct } from '@/app/actions/product'

interface FormErrors {
  name?: string;
  category?: string;
  weightperunit?: string;
  volumeperunit?: string;
}

export default function AddProduct() {
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get user email on component mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email)
      }
    })
  }, [])

  async function validateForm(formData: FormData): Promise<boolean> {
    const errors: FormErrors = {}

    const name = formData.get('name') as string
    if (name.length > 20) {
      errors.name = 'Name must be 20 characters or less'
    }

    const category = formData.get('category') as string
    if (category.length > 20) {
      errors.category = 'Category must be 20 characters or less'
    }

    const weightperunit = parseInt(formData.get('weightperunit') as string)
    if (isNaN(weightperunit) || weightperunit <= 0) {
      errors.weightperunit = 'Weight must be a positive number'
    }

    const volumeperunit = parseInt(formData.get('volumeperunit') as string)
    if (isNaN(volumeperunit) || volumeperunit <= 0) {
      errors.volumeperunit = 'Volume must be a positive number'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function onSubmit(formData: FormData) {
    if (!userEmail) {
      setError('Please sign in to add a product')
      return
    }

    const isValid = await validateForm(formData)
    if (!isValid) return

    const result = await addProduct(formData, userEmail)
    if (result?.error) {
      setError(result.error)
    } else {
      router.push('/product')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-start mb-8">
          <Link 
            href="/product"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Products
          </Link>
        </div>

        <form action={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              maxLength={20}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                formErrors.name ? 'border-red-500' : ''
              }`}
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              name="category"
              id="category"
              required
              maxLength={20}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                formErrors.category ? 'border-red-500' : ''
              }`}
            />
            {formErrors.category && (
              <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="weightperunit" className="block text-sm font-medium text-gray-700">
              Weight per Unit (kg)
            </label>
            <input
              type="number"
              name="weightperunit"
              id="weightperunit"
              required
              min="1"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                formErrors.weightperunit ? 'border-red-500' : ''
              }`}
            />
            {formErrors.weightperunit && (
              <p className="mt-1 text-sm text-red-500">{formErrors.weightperunit}</p>
            )}
          </div>

          <div>
            <label htmlFor="volumeperunit" className="block text-sm font-medium text-gray-700">
              Volume per Unit (m³)
            </label>
            <input
              type="number"
              name="volumeperunit"
              id="volumeperunit"
              required
              min="1"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                formErrors.volumeperunit ? 'border-red-500' : ''
              }`}
            />
            {formErrors.volumeperunit && (
              <p className="mt-1 text-sm text-red-500">{formErrors.volumeperunit}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  )
}