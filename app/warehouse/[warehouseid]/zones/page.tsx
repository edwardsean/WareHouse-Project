'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { WarehouseZone } from '@/types'
import Navbar from '@/app/components/navbar'
import { useParams } from 'next/navigation'

export default function WarehouseZones() {
  const [zones, setZones] = useState<WarehouseZone[]>([])
  const [userType, setUserType] = useState<string | null>(null)
  const [warehouseName, setWarehouseName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

      // Get warehouse name
      const { data: warehouse, error: warehouseError } = await supabase
        .from('warehouse')
        .select('warehousename')
        .eq('warehouseid', warehouseId)
        .single()

      if (warehouseError) {
        setError(warehouseError.message)
        setLoading(false)
        return
      }

      setWarehouseName(warehouse.warehousename)

      // Get warehouse zones
      const { data: zones, error: zonesError } = await supabase
        .from('warehousezone')
        .select('*')
        .eq('warehouseid', warehouseId)
        .order('zoneid')
        .order('subzoneid')

      if (zonesError) {
        setError(zonesError.message)
      } else {
        setZones(zones || [])
      }
      setLoading(false)
    }

    loadData()
  }, [warehouseId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Link 
                href="/warehouse"
                className="text-gray-600 hover:text-gray-900 mb-4 block"
              >
                ← Back to Warehouses
              </Link>
              <h1 className="text-2xl font-bold">
                Zones in {warehouseName}
              </h1>
            </div>
            {userType === 'employee' && (
              <Link
                href={`/warehouse/${warehouseId}/zones/add`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add New Zone
              </Link>
            )}
          </div>

          {zones.length === 0 ? (
            <p>No zones found in this warehouse.</p>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subzone ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Space Occupied</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {zones.map((zone) => (
                    <tr key={`${zone.zoneid}-${zone.subzoneid}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{zone.zoneid}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{zone.subzoneid}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{zone.spaceoccupied || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          zone.spaceavailability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {zone.spaceavailability ? 'Available' : 'Full'}
                        </span>
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