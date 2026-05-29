'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr: false })

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [sent, setSent] = useState(false)

  const handleMagicLink = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage({ text: error.message, type: 'error' })
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <>
      <ParticleField />

      <div className="fixed inset-0 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4" style={{ zIndex: 10 }}>
        <div className="w-full max-w-md my-12" style={{ position: 'relative', zIndex: 20 }}>

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] backdrop-blur-xl mb-4 shadow-[0_4px_14px_rgba(255,255,255,0.1)]">
              <span className="text-2xl font-bold text-white">⚡</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-[rgba(255,255,255,0.6)] mt-2">
              {sent ? 'Check your inbox' : 'Sign in with a magic link — no password needed'}
            </p>
          </div>

          {/* Card */}
          <div className="glass-card !h-auto">
            {sent ? (
              <div className="text-center space-y-4 py-2">
                <div className="text-4xl">✉️</div>
                <p className="text-[var(--foreground)] font-medium">Magic link sent!</p>
                <p className="text-[var(--muted)] text-sm">
                  We sent a link to <span className="text-white font-medium">{email}</span>. Click it to sign in — it expires in 1 hour.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="btn-secondary w-full mt-2"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input"
                  />
                </div>

                {message.text && (
                  <div className="text-sm p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Sending…' : '✉️ Send Magic Link'}
                </button>
              </form>
            )}
          </div>

          {/* Footer link */}
          <p className="text-center text-sm text-[rgba(255,255,255,0.6)] mt-6 relative z-10">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-white hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}