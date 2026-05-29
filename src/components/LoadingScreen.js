'use client'

import { useEffect, useState } from 'react'

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    let frame
    let current = 0

    const tick = () => {
      // Simulate loading with easing — fast start, slow near the end
      const remaining = 100 - current
      const step = Math.max(0.5, remaining * 0.06)
      current = Math.min(100, current + step)
      setProgress(Math.round(current))

      if (current < 100) {
        frame = requestAnimationFrame(tick)
      } else {
        // Hold at 100% briefly, then dismiss
        setTimeout(() => {
          setHiding(true)
          setTimeout(() => onComplete?.(), 650)
        }, 400)
      }
    }

    // Start after a small delay so the user sees 0%
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(tick)
    }, 200)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [onComplete])

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: `
          radial-gradient(ellipse 100% 80% at 50% 0%, rgba(99, 102, 241, 0.12), transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 100%, rgba(167, 139, 250, 0.06), transparent 45%),
          #030304
        `,
        opacity: hiding ? 0 : 1,
        visibility: hiding ? 'hidden' : 'visible',
        transition: 'opacity 0.65s ease, visibility 0.65s ease',
      }}
    >
      {/* Subtle rotating conic gradient */}
      <div
        className="absolute inset-[-40%] pointer-events-none"
        style={{
          background: 'conic-gradient(from 120deg, transparent 0deg, rgba(255,255,255,0.03) 60deg, transparent 120deg)',
          animation: 'loaderSpin 14s linear infinite',
        }}
      />

      <div className="relative z-10 text-center max-w-xs">
        {/* Brand */}
        <div
          className="text-3xl font-extrabold mb-1"
          style={{
            letterSpacing: '-0.06em',
            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.55) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          HackApp
        </div>
        <p className="text-xs tracking-[0.12em] uppercase mb-9" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Enterprise Intelligence
        </p>

        {/* Percentage */}
        <div className="mb-5" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <span className="text-6xl font-extrabold text-white" style={{ letterSpacing: '-0.04em', textShadow: '0 0 60px rgba(255,255,255,0.12)' }}>
            {progress}
          </span>
          <span className="text-2xl ml-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>%</span>
        </div>

        {/* Progress bar */}
        <div className="w-[280px] h-1 mx-auto mb-3.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.85), #fff)',
              boxShadow: '0 0 24px rgba(255,255,255,0.35)',
              transition: 'width 0.12s ease-out',
            }}
          />
        </div>

        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Initializing experience…
        </p>

        {/* Animated dots */}
        <div className="flex gap-1 mt-5 justify-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.35)',
                animation: `loaderDot 1.2s ease-in-out infinite ${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
