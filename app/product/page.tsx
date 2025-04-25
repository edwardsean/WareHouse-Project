'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Product } from '@/types'
import Navbar from '@/app/components/navbar'

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [userType, setUserType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function loadProducts() {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.user) return

      // Get user type from metadata
      setUserType(session.session.user.user_metadata.type)

      if (session.session.user.user_metadata.type === 'customer') {
        // For customers, get only their products
        const { data: customer, error: customerError } = await supabase
          .from('customer')
          .select('customerid')
          .eq('email', session.session.user.email)
          .single()

        if (customerError) {
          setError(customerError.message)
          setLoading(false)
          return
        }

        const { data: products, error: productsError } = await supabase
          .from('product')
          .select('*')
          .eq('customerid', customer.customerid)

        if (productsError) {
          setError(productsError.message)
        } else {
          setProducts(products || [])
        }
      } else {
        // For employees, get all products with customer information
        const { data: products, error: productsError } = await supabase
          .from('product')
          .select(`
            *,
            customer:customer!customerid (
              firstname,
              lastname,
              email
            )
          `)

        if (productsError) {
          setError(productsError.message)
        } else {
          setProducts(products || [])
        }
      }
      setLoading(false)
    }

    loadProducts()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">
              {userType === 'employee' ? 'All Products' : 'My Products'}
            </h1>
            {userType === 'customer' && (
              <Link
                href="/product/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add New Product
              </Link>
            )}
          </div>

          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume (m³)</th>
                    {userType === 'employee' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.productid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.productid}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.weightperunit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.volumeperunit}</td>
                      {userType === 'employee' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.customer ? (
                            <>
                              {`${product.customer.firstname} ${product.customer.lastname}`}
                              <br />
                              <span className="text-xs text-gray-400">{product.customer.email}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">No customer assigned</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}