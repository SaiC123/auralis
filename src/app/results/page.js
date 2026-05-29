'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const SCORE_META = {
  normal: { label: 'Within Normal Range', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '✓' },
  mild: { label: 'Mildly Irregular Patterns', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '⚠' },
  elevated: { label: 'Notable Motor Irregularity', color: '#dc2626', bg: '#fecaca', icon: '!' },
}

/* ─── Step indicator ─── */
function StepIndicator() {
  const steps = [
    { id: 'voice', label: 'Voice Analysis' },
    { id: 'motor', label: 'Motor Test' },
    { id: 'results', label: 'Results' },
  ]

  return (
    <div className="flex items-center gap-0 mb-10" role="list" aria-label="Assessment progress">
      {steps.map((s, i) => {
        // Since we are on the results page, the first two steps are complete ('done') and results is 'active'
        const state = i < 2 ? 'done' : 'active'
        return (
          <div key={s.id} className="flex items-center" role="listitem" style={{ flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div className="flex flex-col items-center" style={{ minWidth: 80 }}>
              <div className={`step-dot ${state}`} aria-label={`${s.label}: ${state}`}>
                {state === 'done' ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: 6, color: 'var(--foreground)', textAlign: 'center', lineHeight: 1.3 }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: 'var(--primary)',
                  marginBottom: 20,
                  transition: 'background 0.4s',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ResultsPage() {
  const [voiceResults, setVoiceResults] = useState(null)
  const [motorResults, setMotorResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [noData, setNoData] = useState(false)

  useEffect(() => {
    try {
      const storedVoice = window.sessionStorage.getItem('voiceResults')
      const storedMotor = window.sessionStorage.getItem('motorResults')

      if (storedVoice) {
        setVoiceResults(JSON.parse(storedVoice))
      }
      if (storedMotor) {
        setMotorResults(JSON.parse(storedMotor))
      }

      if (!storedVoice && !storedMotor) {
        setNoData(true)
      }
    } catch (err) {
      console.error('Failed to parse results from sessionStorage', err)
      setNoData(true)
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          background: 'linear-gradient(160deg, var(--background) 0%, #e8f6f9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'rgba(0,151,178,0.1)' }} />
      </div>
    )
  }

  if (noData) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          background: 'linear-gradient(160deg, var(--background) 0%, #e8f6f9 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: 24,
        }}
      >
        <div style={{ fontSize: '3rem' }}>📋</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.5rem', color: 'var(--foreground)' }}>
          No Assessment Data Found
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', textAlign: 'center', maxWidth: 400, lineHeight: 1.6 }}>
          It looks like you haven&apos;t completed an assessment yet. Please run the full assessment first.
        </p>
        <Link href="/detect" className="btn-primary" style={{ padding: '12px 28px', borderRadius: 12, textDecoration: 'none' }}>
          Start Assessment
        </Link>
      </div>
    )
  }

  const motor = motorResults
  const motorMeta = motor ? SCORE_META[motor.score] : null

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(160deg, var(--background) 0%, #e8f6f9 100%)',
        padding: '40px 0 80px',
      }}
    >
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <Link
            href="/"
            style={{ fontSize: '0.85rem', color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}
          >
            ← Back to Home
          </Link>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--foreground)',
              marginBottom: 8,
            }}
          >
            Parkinson&apos;s Assessment
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6 }}>
            Assessment report generated from your voice biomarkers and motor signals.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator />

        {/* Results Box */}
        <div
          style={{
            background: '#fff',
            border: '1.5px solid var(--border)',
            borderRadius: 20,
            padding: 'clamp(20px, 4vw, 36px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          }}
        >
          <div>
            <div className="mb-8">
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: 6 }}>
                Your Assessment Results
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Below are your voice biomarker and motor assessment findings. This is a
                research prototype — results are not a clinical diagnosis.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Motor results */}
              <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.1rem' }}>✋</span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--foreground)' }}>Motor Assessment</span>
                </div>
                {motor ? (
                  <div style={{ padding: 20 }}>
                    {/* Risk banner */}
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        background: motorMeta.bg,
                        border: `1.5px solid ${motorMeta.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 16,
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: motorMeta.color,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          flexShrink: 0,
                        }}
                      >
                        {motorMeta.icon}
                      </span>
                      <span style={{ fontWeight: 600, color: motorMeta.color, fontSize: '0.9rem' }}>
                        {motorMeta.label}
                      </span>
                    </div>

                    {/* Metric rows */}
                    {[
                      ['Total taps', motor.taps],
                      ['Tap frequency', `${motor.freq?.toFixed(2)} Hz`],
                      ['Mean amplitude', `${motor.amp} (normalized)`],
                      ['Amplitude decay', `${motor.decay?.toFixed(1)}%`],
                      ['Rhythm irregularity (CV)', `${motor.cv?.toFixed(1)}%`],
                      ['Bradykinesia score', `${motor.brady} / 100`],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: '1px solid var(--border)',
                          fontSize: '0.875rem',
                        }}
                      >
                        <span style={{ color: 'var(--muted)', fontFamily: "'DM Mono', monospace", fontSize: '0.78rem' }}>{k}</span>
                        <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 20, color: 'var(--muted)', fontSize: '0.9rem' }}>
                    Motor assessment not completed.
                  </div>
                )}
              </div>

              {/* Voice results */}
              <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.1rem' }}>🎙️</span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--foreground)' }}>Voice Biomarker Analysis</span>
                </div>
                {voiceResults ? (
                  <div style={{ padding: 20 }}>
                    {Object.entries(voiceResults).map(([disease, info]) => {
                      const positive = info.prediction === 1
                      const confidence = Math.round((info.confidence ?? 0) * 100)
                      return (
                        <div
                          key={disease}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 0',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Classification
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)', marginTop: 2 }}>
                              {disease.replace(/_/g, ' ')}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 10px',
                                borderRadius: 100,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                fontFamily: "'DM Mono', monospace",
                                background: positive ? '#fef2f2' : '#ecfdf5',
                                color: positive ? '#dc2626' : '#059669',
                                border: `1px solid ${positive ? '#fecaca' : '#a7f3d0'}`,
                              }}
                            >
                              {positive ? 'POSITIVE' : 'NEGATIVE'}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                              {confidence}% confidence
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ padding: 20, color: 'var(--muted)', fontSize: '0.9rem' }}>
                    Voice analysis not completed.
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: 'rgba(0,151,178,0.05)',
                border: '1px solid rgba(0,151,178,0.2)',
                fontSize: '0.85rem',
                color: 'var(--muted)',
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              ⚕ <strong style={{ color: 'var(--foreground)' }}>Important:</strong> Auarlis is a research
              prototype and these results are not a clinical diagnosis. A positive indicator does not mean
              you have Parkinson&apos;s disease. Please consult a licensed neurologist for any medical concerns.
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/" className="btn-secondary" style={{ padding: '12px 24px', textDecoration: 'none' }}>
                ← Back to Home
              </Link>
              <button
                onClick={() => {
                  window.sessionStorage.removeItem('voiceResults')
                  window.sessionStorage.removeItem('motorResults')
                  window.location.href = '/detect'
                }}
                className="btn-primary"
                style={{ padding: '12px 24px' }}
              >
                Run New Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
