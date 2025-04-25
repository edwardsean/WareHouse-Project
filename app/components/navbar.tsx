'use client'

import { useState, useEffect } from 'react' // Add useEffect to imports
import { useRouter } from 'next/navigation'
import { handleSignOut } from '@/app/actions/auth'
import Image from 'next/image'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

export default function Navbar() {
  const [session, setSession] = useState<any>(undefined)
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        // Get user type from auth metadata
        setUserType(session.user.user_metadata.type)
      }
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        setUserType(session.user.user_metadata.type)
      } else {
        setUserType(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function onSignOut() {
    const result = await handleSignOut()
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      // Reset session and redirect
      setSession(null)
      router.push('/auth/signin')
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <header className="px-5 py-3 bg-white shadow-sm font-work-san">
      <nav className="flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={144} height={30}/>
        </Link>

        <div className='flex items-center gap-5 text-black'>
          {session ? (
            <>
              {userType && (
                <span className={`px-2 py-1 rounded text-sm ${
                  userType === 'Employee' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {userType}
                </span>
              )}
              <Link href="/product">
                <span>Product</span>
              </Link>

              <Link href="/warehouse">
                <span>Warehouse</span>
              </Link>

              <form action={onSignOut}>
                <button 
                  type='submit'
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Sign Out
                </button>
              </form>
              {error && <span className="text-red-500 text-sm">{error}</span>}

              <Link href={`/user/${session.user.id}`}>
                <span>{session.user.email}</span>
              </Link>
            </>
          ) : (
            <Link 
              href="/auth/signin" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

