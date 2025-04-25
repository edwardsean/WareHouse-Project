'use server'

import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import bcrypt from 'bcrypt'

export async function handleEmployeeSignIn(formData: FormData) {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Get employee from database
    const { data: employee, error: fetchError } = await supabase
      .from('employee')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (fetchError || !employee) {
      return { error: 'Invalid credentials' }
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, employee.password)
    if (!passwordMatch) {
      return { error: 'Invalid credentials' }
    }

    // Create auth session
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return { error: authError.message }
    }

    return { success: true }
  } catch (error) {
    return { error: 'An unexpected error occurred' }
  }
}

export async function handleEmployeeSignUp(formData: FormData) {
  const supabase = await createClient()

  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const bankNumber = formData.get('bankNumber') as string
    const position = formData.get('position') as string
    const salary = formData.get('salary') as string

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate a unique employee ID (you might want to implement a better strategy)
    const { data: maxId } = await supabase
      .from('employee')
      .select('employeeid')
      .order('employeeid', { ascending: false })
      .limit(1)
      .single()

    const newEmployeeId = maxId ? maxId.employeeid + 1 : 1

    // Create employee record
    const { error: employeeError } = await supabase
      .from('employee')
      .insert([
        {
          employeeid: newEmployeeId,
          firstname: firstName,
          lastname: lastName,
          email: email.toLowerCase(),
          phonenumber: phoneNumber ? parseInt(phoneNumber) : null,
          password: hashedPassword,
          banknumber: bankNumber ? parseInt(bankNumber) : null,
          joindate: new Date().toISOString(),
          position: position,
          salary: salary ? parseInt(salary) : null
        }
      ])

    if (employeeError) {
      return { error: employeeError.message }
    }

    // Create auth user
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          type: 'employee'  // Add user type to auth metadata
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      }
    })

    if (authError) {
      // Rollback employee creation if auth fails
      await supabase
        .from('employee')
        .delete()
        .eq('employeeid', newEmployeeId)
      return { error: authError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'An unexpected error occurred' }
  }
}