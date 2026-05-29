'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr: false })

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage({ text: error.message, type: 'error' })
    } else {
      setMessage({
        text: 'Account created! Check your email to confirm your account.',
        type: 'success',
      })
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
            <h1 className="text-3xl font-bold text-white tracking-tight">Create account</h1>
            <p className="text-[rgba(255,255,255,0.6)] mt-2">Get started in seconds</p>
          </div>

          {/* Card */}
          <div className="glass-card !h-auto">
          <form onSubmit={handleSignup} className="space-y-5">
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input"
              />
            </div>

            {message.text && (
              <div
                className={`text-sm p-3 rounded-lg ${
                  message.type === 'error'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-green-500/10 text-green-400 border border-green-500/20'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

          {/* Footer link */}
          <p className="text-center text-sm text-[rgba(255,255,255,0.6)] mt-6 relative z-10">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
