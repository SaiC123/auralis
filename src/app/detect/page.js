'use client'

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const MotorSenseDetector = dynamic(
  () => import('@/components/MotorSenseDetector'),
  { ssr: false }
)

const BACKEND_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL) ||
  'http://172.20.10.7:9200'

const AUDIO_SLOTS = [
  { key: 'breathing_deep', label: 'Deep Breathing', hint: 'Breathe in deeply and out slowly for 3 seconds.' },
  { key: 'breathing_shallow', label: 'Shallow Breathing', hint: 'Breathe gently through your nose for 3 seconds.' },
  { key: 'cough_heavy', label: 'Heavy Cough', hint: 'Cough forcefully from your chest once or twice.' },
  { key: 'cough_shallow', label: 'Shallow Cough', hint: 'Give a light, gentle cough.' },
  { key: 'counting_fast', label: 'Fast Counting (1–10)', hint: 'Count from 1 to 10 as quickly as possible.' },
  { key: 'counting_normal', label: 'Normal Counting (1–10)', hint: 'Count from 1 to 10 at a comfortable pace.' },
  { key: 'vowel_a', label: "Vowel 'Ahh'", hint: "Say 'Ahh' and hold it for 3 seconds." },
  { key: 'vowel_e', label: "Vowel 'Eee'", hint: "Say 'Eee' and hold it for 3 seconds." },
  { key: 'vowel_o', label: "Vowel 'Ohh'", hint: "Say 'Ohh' and hold it for 3 seconds." },
]

const SCORE_META = {
  normal: { label: 'Within Normal Range', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '✓' },
  mild: { label: 'Mildly Irregular Patterns', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '⚠' },
  elevated: { label: 'Notable Motor Irregularity', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '!' },
}

/* ─── Step 1: Voice Recording ─── */
function VoiceStep({ onComplete }) {
  const [audioFiles, setAudioFiles] = useState({})
  const [recording, setRecording] = useState({})
  const [activeSlot, setActiveSlot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const recorders = useRef({})
  const chunks = useRef({})

  const filled = Object.keys(audioFiles).length
  const allFilled = filled === AUDIO_SLOTS.length

  const handleFile = (key, file) => {
    if (!file) return
    setAudioFiles((p) => ({ ...p, [key]: file }))
  }

  const startRec = async (key) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      recorders.current[key] = mr
      chunks.current[key] = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current[key].push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunks.current[key], { type: 'audio/webm' })
        const file = new File([blob], `${key}.webm`, { type: 'audio/webm' })
        setAudioFiles((p) => ({ ...p, [key]: file }))
        stream.getTracks().forEach((t) => t.stop())
        setActiveSlot(null)
      }
      mr.start()
      setRecording((p) => ({ ...p, [key]: true }))
      setActiveSlot(key)
    } catch {
      setError('Microphone access denied. Please allow mic permission and try again.')
    }
  }

  const stopRec = (key) => {
    const mr = recorders.current[key]
    if (mr && mr.state !== 'inactive') {
      mr.stop()
      setRecording((p) => ({ ...p, [key]: false }))
    }
  }

  const handleSubmit = async () => {
    const missing = AUDIO_SLOTS.filter((s) => !audioFiles[s.key])
    if (missing.length) {
      setError(`Still missing: ${missing.map((m) => m.label).join(', ')}`)
      return
    }
    setError(null)
    setLoading(true)
    try {
      const fd = new FormData()
      AUDIO_SLOTS.forEach(({ key }) => fd.append(key, audioFiles[key]))
      const res = await fetch(`${BACKEND_BASE}/predict_all`, { method: 'POST', body: fd })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.detail || `Server error ${res.status}`)
      }
      const data = await res.json()
      onComplete(data.results ?? data)
    } catch (err) {
      setError(err.message || 'Could not reach the analysis server. Check your backend connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: 6 }}>
          Voice Analysis
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Record or upload each of the nine acoustic samples below. Click{' '}
          <strong style={{ color: 'var(--primary)' }}>Record</strong> and follow
          the prompt, then click <strong style={{ color: 'var(--primary)' }}>Stop</strong> when done.
          Each sample should be 2–4 seconds.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          <span>{filled} / {AUDIO_SLOTS.length} samples recorded</span>
          <span style={{ color: allFilled ? '#059669' : 'var(--primary)', fontWeight: 600 }}>
            {allFilled ? 'All done ✓' : `${AUDIO_SLOTS.length - filled} remaining`}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 6, background: 'var(--border)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              borderRadius: 6,
              background: allFilled ? '#059669' : 'var(--primary)',
              width: `${(filled / AUDIO_SLOTS.length) * 100}%`,
              transition: 'width 0.4s ease, background 0.3s',
            }}
          />
        </div>
      </div>

      {/* Slots grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {AUDIO_SLOTS.map(({ key, label, hint }) => {
          const hasFile = !!audioFiles[key]
          const isRec = !!recording[key]
          const isActive = activeSlot === key

          return (
            <div
              key={key}
              style={{
                padding: '16px',
                borderRadius: 12,
                border: `1.5px solid ${hasFile ? '#a7f3d0' : isRec ? 'var(--primary)' : 'var(--border)'}`,
                background: hasFile ? '#f0fdf4' : isRec ? 'rgba(0,151,178,0.04)' : '#fff',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>
                {hint}
              </div>

              <div className="flex gap-2">
                {!isRec ? (
                  <button
                    onClick={() => startRec(key)}
                    disabled={!!activeSlot && activeSlot !== key}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 8,
                      border: '1.5px solid var(--primary)',
                      background: 'rgba(0,151,178,0.06)',
                      color: 'var(--primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: (!!activeSlot && activeSlot !== key) ? 0.4 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    🎤 Record
                  </button>
                ) : (
                  <button
                    onClick={() => stopRec(key)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--primary)',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      animation: 'pulseRing 1.5s ease-in-out infinite',
                      fontFamily: 'inherit',
                    }}
                  >
                    ⏹ Stop
                  </button>
                )}

                <label
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: 8,
                    border: '1.5px solid var(--border)',
                    background: '#fff',
                    color: 'var(--muted)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontFamily: 'inherit',
                  }}
                >
                  📂 File
                  <input
                    type="file"
                    accept="audio/*"
                    aria-label={`Upload ${label}`}
                    className="sr-only"
                    onChange={(e) => handleFile(key, e.target.files?.[0])}
                  />
                </label>
              </div>

              {hasFile && (
                <div style={{ marginTop: 8, fontSize: '0.72rem', color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>✓</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {audioFiles[key].name}
                  </span>
                  <button
                    onClick={() => setAudioFiles((p) => { const n = { ...p }; delete n[key]; return n })}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.75rem', padding: 0, fontFamily: 'inherit' }}
                    aria-label={`Remove ${label}`}
                  >
                    ✕
                  </button>
                </div>
              )}
              {isRec && !hasFile && (
                <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--primary)' }}>
                  Recording…
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: '12px 16px',
            borderRadius: 10,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '0.875rem',
          }}
        >
          ⚠ {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !allFilled}
        className="btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: '0.95rem', borderRadius: 12 }}
      >
        {loading ? (
          <><span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Analyzing voice samples…</>
        ) : (
          `Analyze Voice Samples →`
        )}
      </button>

      {!allFilled && (
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: '0.8rem', color: 'var(--muted)' }}>
          Record all {AUDIO_SLOTS.length} samples to continue
        </p>
      )}
    </div>
  )
}


/* ─── Step indicator ─── */
function StepIndicator({ step }) {
  const steps = [
    { id: 'voice', label: 'Voice Analysis' },
    { id: 'motor', label: 'Motor Test' },
    { id: 'results', label: 'Results' },
  ]
  const idx = steps.findIndex((s) => s.id === step)

  return (
    <div className="flex items-center gap-0 mb-10" role="list" aria-label="Assessment progress">
      {steps.map((s, i) => {
        const state = i < idx ? 'done' : i === idx ? 'active' : 'pending'
        return (
          <div key={s.id} className="flex items-center" role="listitem" style={{ flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div className="flex flex-col items-center" style={{ minWidth: 80 }}>
              <div className={`step-dot ${state}`} aria-label={`${s.label}: ${state}`}>
                {state === 'done' ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: 6, color: state === 'pending' ? 'var(--muted)' : 'var(--foreground)', textAlign: 'center', lineHeight: 1.3 }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: i < idx ? 'var(--primary)' : 'var(--border)',
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

/* ─── Motor step wrapper ─── */
function MotorStep({ onComplete }) {
  const [done, setDone] = useState(false)
  const [results, setResults] = useState(null)

  const handleComplete = useCallback((data) => {
    setResults(data)
    setDone(true)
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: 6 }}>
          Finger Tap Motor Test
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Hold your hand in front of the camera. Once your hand is detected, click{' '}
          <strong style={{ color: 'var(--primary)' }}>Start Test</strong> and tap your index
          finger to your thumb as quickly as possible for 10 seconds.
        </p>
      </div>

      <div
        style={{
          borderRadius: 16,
          border: '1.5px solid var(--border)',
          overflow: 'hidden',
          background: '#fff',
          marginBottom: 20,
        }}
      >
        <MotorSenseDetector onComplete={handleComplete} />
      </div>

      {done && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onComplete(results)}
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.95rem', borderRadius: 12 }}
          >
            view combined results
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─── */
export default function DetectPage() {
  const [step, setStep] = useState('voice')
  const voiceResultsRef = useRef(null)

  const handleVoiceDone = (results) => {
    voiceResultsRef.current = results
    setStep('motor')
  }

  const handleMotorDone = (results) => {
    try {
      window.sessionStorage.setItem('voiceResults', JSON.stringify(voiceResultsRef.current))
      window.sessionStorage.setItem('motorResults', JSON.stringify(results))
    } catch (e) {
      console.error('Failed to save results:', e)
    }
    window.location.href = '/results'
  }

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
            Complete both the voice recording and the finger-tap test to receive your combined report.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator step={step} />

        {/* Active step content */}
        <div
          style={{
            background: '#fff',
            border: '1.5px solid var(--border)',
            borderRadius: 20,
            padding: 'clamp(20px, 4vw, 36px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          }}
        >
          {step === 'voice' && <VoiceStep onComplete={handleVoiceDone} />}
          {step === 'motor' && <MotorStep onComplete={handleMotorDone} />}
        </div>

        {/* Skip motor step link (if voice failed / backend down) */}
        {step === 'motor' && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              onClick={() => {
                try {
                  window.sessionStorage.setItem('voiceResults', JSON.stringify(voiceResultsRef.current))
                  window.sessionStorage.removeItem('motorResults')
                } catch (e) {
                  console.error('Failed to save results:', e)
                }
                window.location.href = '/results'
              }}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
            >
              Skip motor test and view voice results only
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
