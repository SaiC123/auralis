'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/auth/callback', '/detect']
const AUTH_ONLY_ROUTES = ['/login', '/signup']
const PROTECTED_PREFIXES = ['/dashboard']

export default function AuthGuard({ children }) {
  const [state, setState] = useState('loading')
  const router = useRouter()
  const pathname = usePathname()

  const isPublic = PUBLIC_ROUTES.some((r) =>
    r === '/' ? pathname === '/' : pathname.startsWith(r)
  )
  const isAuthOnly = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))
  const isProtected = PROTECTED_PREFIXES.some((r) => pathname.startsWith(r))

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const authed = !!data.user
      setState(authed ? 'authenticated' : 'unauthenticated')
      if (authed && isAuthOnly) router.replace('/dashboard')
      if (!authed && isProtected) router.replace('/login')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authed = !!session?.user
      setState(authed ? 'authenticated' : 'unauthenticated')
      if (authed && isAuthOnly) router.replace('/dashboard')
      if (!authed && isProtected) router.replace('/login')
    })

    return () => subscription.unsubscribe()
  }, [pathname])

  if (state === 'loading' && isProtected) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (state === 'unauthenticated' && isProtected) return null

  return children
}
