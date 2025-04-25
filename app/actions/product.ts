'use server'

import { createClient } from '@/lib/supabase'
import { Product } from '@/types'

export async function addProduct(formData: FormData, userEmail: string) {
  const supabase = await createClient()

  try {
    // First get the customerid from customer table
    const { data: customer, error: customerError } = await supabase
      .from('customer')
      .select('customerid')
      .eq('email', userEmail)
      .single()

    if (customerError) {
      return { error: 'Customer not found' }
    }

    // Get the highest product ID and increment by 1
    const { data: maxId } = await supabase
      .from('product')
      .select('productid')
      .order('productid', { ascending: false })
      .limit(1)
      .single()

    const newProductId = maxId ? maxId.productid + 1 : 1

    // Insert new product with the customer's ID
    const { error: productError } = await supabase
      .from('product')
      .insert([{
        productid: newProductId,
        customerid: customer.customerid,
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        weightperunit: parseInt(formData.get('weightperunit') as string),
        volumeperunit: parseInt(formData.get('volumeperunit') as string),
      }])

    if (productError) {
      return { error: productError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Add product error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getCustomerProducts(customerId: number) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('product')
      .select('*')
      .eq('customerid', customerId)

    if (error) {
      return { error: error.message }
    }

    return { products: data as Product[] }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}