'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/detect', label: 'Detection Tool' },
]

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (pathname === '/login' || pathname === '/signup') return null

  return (
    <>
      <nav className="navbar" aria-label="Main navigation">
        {/* Brand */}
        <Link href="/" className="nav-brand">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="10" stroke="#0097b2" strokeWidth="2" />
            <path d="M7 14.5L11 7.5L15 14.5" stroke="#0097b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="8.5" y1="12" x2="13.5" y2="12" stroke="#0097b2" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Auarlis
        </Link>

        {/* Desktop links */}
        <div className="nav-links hidden md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href ? 'is-active' : ''}`}
              aria-current={pathname === href ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button onClick={handleLogout} className="nav-cta-secondary">Sign out</button>
          ) : (
            <>
              <Link href="/login" className="nav-cta-secondary">Sign in</Link>
              <Link href="/detect" className="nav-cta">Try Auarlis</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] p-2 rounded-lg hover:bg-[var(--surface)] transition-colors border-0 bg-transparent cursor-pointer"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span
            className="block w-5 h-0.5 rounded-full transition-all duration-200"
            style={{ background: 'var(--foreground)', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }}
          />
          <span
            className="block w-5 h-0.5 rounded-full transition-all duration-200"
            style={{ background: 'var(--foreground)', opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block w-5 h-0.5 rounded-full transition-all duration-200"
            style={{ background: 'var(--foreground)', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed top-16 left-0 right-0 z-50 flex flex-col gap-1 p-4 border-b"
          style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link py-2.5 text-base ${pathname === href ? 'is-active' : ''}`}
              aria-current={pathname === href ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 mt-1 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
            {user ? (
              <button onClick={handleLogout} className="btn-secondary w-full justify-center py-2.5">
                Sign out
              </button>
            ) : (
              <>
                <Link href="/login" className="btn-secondary w-full justify-center py-2.5 text-center">
                  Sign in
                </Link>
                <Link href="/detect" className="btn-primary w-full justify-center py-2.5 text-center">
                  Try Auarlis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
