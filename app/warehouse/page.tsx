'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Warehouse } from '@/types'
import Navbar from '@/app/components/navbar'

export default function WarehouseList() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [userType, setUserType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function loadData() {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session?.user) return

      // Check if user exists in employee table
      const { data: employee } = await supabase
        .from('employee')
        .select('email')
        .eq('email', session.session.user.email)
        .single()

      setUserType(employee ? 'employee' : 'customer')

      const { data: warehouses, error: warehousesError } = await supabase
        .from('warehouse')
        .select('*')
        .order('warehouseid')

      if (warehousesError) {
        setError(warehousesError.message)
      } else {
        setWarehouses(warehouses || [])
      }
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Warehouses</h1>
            {userType === 'employee' && (
              <Link
                href="/warehouse/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add New Warehouse
              </Link>
            )}
          </div>

          {warehouses.length === 0 ? (
            <p>No warehouses found.</p>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {warehouses.map((warehouse) => (
                    <tr key={warehouse.warehouseid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{warehouse.warehouseid}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warehouse.warehousename}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          warehouse.status === 'active' ? 'bg-green-100 text-green-800' :
                          warehouse.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {warehouse.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warehouse.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warehouse.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link
                          href={`/warehouse/${warehouse.warehouseid}/zones`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Zones
                        </Link>
                        {userType === 'employee' && (
                          <Link
                            href={`/warehouse/${warehouse.warehouseid}/zones/add`}
                            className="ml-4 text-green-600 hover:text-green-900"
                          >
                            Add Zone
                          </Link>
                        )}
                      </td>
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