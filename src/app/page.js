'use client'

import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import Card3D from '@/components/Card3D'

const STEPS = [
  {
    num: '01',
    icon: '🎙️',
    title: 'Record Voice Samples',
    desc: 'Speak nine short acoustic samples — breathing patterns, cough sounds, counting sequences, and sustained vowels. Takes about 2 minutes.',
  },
  {
    num: '02',
    icon: '✋',
    title: 'Finger Tap Test',
    desc: 'Hold your hand in front of your webcam and tap your index finger to your thumb as fast as you can for 10 seconds. No extra hardware needed.',
  },
  {
    num: '03',
    icon: '📊',
    title: 'Combined Assessment',
    desc: 'Auarlis analyzes your vocal biomarkers and motor patterns together to produce a bradykinesia and acoustic risk report.',
  },
]

const FEATURES = [
  {
    icon: '🧠',
    title: 'Bradykinesia Detection',
    desc: 'Computer vision tracks your finger-tap frequency, amplitude decay, and rhythm irregularity — the same markers clinicians assess manually.',
  },
  {
    icon: '🫁',
    title: 'Acoustic Biomarkers',
    desc: 'Nine audio samples capture respiratory patterns, cough quality, counting cadence, and vocal resonance — all measurable Parkinson\'s indicators.',
  },
  {
    icon: '⚡',
    title: 'Runs In Your Browser',
    desc: 'The motor analysis runs 100% client-side via MediaPipe. No video ever leaves your device. Voice samples are processed by a local classifier.',
  },
  {
    icon: '📋',
    title: 'Clinician-Grade Metrics',
    desc: 'Reports include tap frequency (Hz), amplitude decay (%), coefficient of variation (CV), and per-disease acoustic confidence scores.',
  },
  {
    icon: '🔒',
    title: 'Private by Design',
    desc: 'No account required to run an assessment. Audio samples are submitted to your local backend and not stored. Camera feed never leaves your machine.',
  },
  {
    icon: '🕐',
    title: 'Under 5 Minutes',
    desc: 'The full assessment — both voice and motor — completes in under five minutes. Results appear immediately with no waiting period.',
  },
]

const METRICS = [
  { val: '< 5 min', label: 'Full assessment time' },
  { val: '9', label: 'Acoustic biomarkers' },
  { val: '100%', label: 'Browser-based motor test' },
  { val: '0', label: 'Hardware required' },
]

export default function HomePage() {
  return (
    <div style={{ background: 'var(--background)' }}>
      {/* ── HERO ── */}
      <section
        className="min-h-[90vh] flex items-center px-6 py-24 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #fff9f0 0%, #e6f7fb 100%)',
        }}
      >
        {/* decorative blobs */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            right: '5%',
            top: '10%',
            width: 420,
            height: 420,
            borderRadius: '60% 40% 70% 30% / 40% 60% 30% 70%',
            background: 'radial-gradient(circle, rgba(0,151,178,0.12) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            left: '2%',
            bottom: '10%',
            width: 280,
            height: 280,
            borderRadius: '30% 70% 50% 50% / 60% 40% 60% 40%',
            background: 'radial-gradient(circle, rgba(0,188,212,0.09) 0%, transparent 70%)',
            animation: 'float 11s ease-in-out infinite reverse',
          }}
        />

        <div className="max-w-5xl mx-auto w-full relative z-10">
          <ScrollReveal delay={0}>
            <div className="landing-badge">
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'inline-block',
                  animation: 'pulseRing 2s ease-in-out infinite',
                }}
              />
              Non-invasive neurological screening
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <h1 className="landing-hero-title">
              Detect Parkinson&apos;s Early.{' '}
              <span className="accent">From Your Browser.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={240}>
            <p className="landing-hero-desc">
              Auarlis combines acoustic voice analysis and computer-vision motor
              assessment to screen for early Parkinson&apos;s indicators. No clinic,
              no specialist appointment, no waiting. Just open the tool and follow
              the prompts.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={360}>
            <div className="flex flex-wrap gap-4">
              <Link href="/detect" className="landing-btn-primary">
                Start Free Assessment →
              </Link>
              <a href="#how-it-works" className="landing-btn-secondary">
                How it works
              </a>
            </div>
          </ScrollReveal>

          {/* Mini trust strip */}
          <ScrollReveal delay={480}>
            <div className="mt-12 flex flex-wrap gap-6 text-sm" style={{ color: 'var(--muted)' }}>
              {['Runs in-browser', 'No data stored', 'MediaPipe + ML classifiers', 'Research prototype'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span style={{ color: 'var(--primary)' }}>✓</span> {t}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="landing-badge">How it works</div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <h2 className="landing-section-title">Three steps to your report.</h2>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="landing-section-desc">
              The full assessment takes under five minutes and runs entirely in your
              browser — no downloads, no accounts, no hardware.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <ScrollReveal key={s.num} delay={i * 120}>
                <Card3D style={{ padding: '32px' }}>
                  <div
                    className="text-3xl mb-4"
                    style={{ animation: 'float 4s ease-in-out infinite', animationDelay: `${i * 0.6}s` }}
                  >
                    {s.icon}
                  </div>
                  <div
                    className="text-xs font-bold tracking-widest mb-2"
                    style={{ color: 'var(--primary)', fontFamily: "'DM Mono', monospace" }}
                  >
                    STEP {s.num}
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </Card3D>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
            <div className="mt-10 text-center">
              <Link href="/detect" className="landing-btn-primary">
                Begin Assessment →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── WHAT WE DETECT ── */}
      <section
        className="py-24 px-6"
        style={{ background: 'linear-gradient(180deg, var(--background) 0%, #e8f6f9 100%)' }}
      >
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="landing-badge">Capabilities</div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <h2 className="landing-section-title">What Auarlis measures.</h2>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="landing-section-desc">
              Every metric is derived from the same clinical literature used by
              neurologists during Parkinson&apos;s assessments — adapted for
              in-browser use.
            </p>
          </ScrollReveal>

          <div className="bento-grid">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80} className="col-span-12 md:col-span-4">
                <Card3D>
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </Card3D>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── METRICS ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <h2 className="landing-section-title text-center">Built for speed.</h2>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <p className="landing-section-desc text-center mx-auto">
              The assessment is designed to be completed in one sitting with
              nothing more than a laptop microphone and webcam.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
            {METRICS.map((m, i) => (
              <ScrollReveal key={m.label} delay={i * 100}>
                <div className="landing-metric">
                  <div className="landing-metric-val">{m.val}</div>
                  <div className="landing-metric-label">{m.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-24 px-6"
        style={{
          background: 'linear-gradient(135deg, rgba(0,151,178,0.06) 0%, var(--background) 100%)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="landing-section-title" style={{ maxWidth: '100%' }}>
              Ready to get your assessment?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <p className="landing-section-desc mx-auto">
              The tool is free, takes under five minutes, and requires only the
              microphone and camera already built into your device.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={240}>
            <Link href="/detect" className="landing-btn-primary">
              Start Free Assessment →
            </Link>
          </ScrollReveal>
          <ScrollReveal delay={360}>
            <p className="mt-6 text-sm" style={{ color: 'var(--muted)' }}>
              ⚕ Research prototype only. Results are not a clinical diagnosis.
              Always consult a neurologist for medical assessment.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="py-8 px-6 text-center text-sm"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: 'var(--primary)' }}>
            Auarlis
          </span>
          <span>Research prototype · Not for clinical use</span>
        </div>
      </footer>
    </div>
  )
}
