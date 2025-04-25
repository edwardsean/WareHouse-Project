'use server'

import { createClient } from '@/lib/supabase'
import { Warehouse, WarehouseZone } from '@/types'

export async function addWarehouse(formData: FormData) {
  const supabase = await createClient()

  try {
    // Get the highest warehouse ID and increment by 1
    const { data: maxId } = await supabase
      .from('warehouse')
      .select('warehouseid')
      .order('warehouseid', { ascending: false })
      .limit(1)
      .single()

    const newWarehouseId = maxId ? maxId.warehouseid + 1 : 1

    const { error } = await supabase
      .from('warehouse')
      .insert([{
        warehouseid: newWarehouseId,
        warehousename: formData.get('warehousename') as string,
        status: formData.get('status') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
      }])

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}

export async function addWarehouseZone(formData: FormData) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('warehousezone')
      .insert([{
        warehouseid: parseInt(formData.get('warehouseid') as string),
        zoneid: formData.get('zoneid') as string,
        subzoneid: parseInt(formData.get('subzoneid') as string),
        spaceoccupied: formData.get('spaceoccupied') ? parseInt(formData.get('spaceoccupied') as string) : null,
        spaceavailability: formData.get('spaceavailability') === 'true'
      }])

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}

export async function getWarehouses() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('warehouse')
      .select('*')
      .order('warehouseid')

    if (error) {
      return { error: error.message }
    }

    return { warehouses: data as Warehouse[] }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}

export async function getWarehouseZones(warehouseId: number) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('warehousezone')
      .select('*')
      .eq('warehouseid', warehouseId)
      .order('zoneid')
      .order('subzoneid')

    if (error) {
      return { error: error.message }
    }

    return { zones: data as WarehouseZone[] }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}