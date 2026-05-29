'use client'

import { useEffect, useRef } from 'react'

const MEDIA_PIPE_SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
]

export default function MotorSenseDetector({ onComplete }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const waveformRef = useRef(null)
  const tapChartRef = useRef(null)
  const startBtnRef = useRef(null)
  const resetBtnRef = useRef(null)
  const cameraPlaceholderRef = useRef(null)
  const handBadgeRef = useRef(null)
  const statusDotRef = useRef(null)
  const statusTextRef = useRef(null)
  const tapCountRef = useRef(null)
  const mvFreqRef = useRef(null)
  const mvAmpRef = useRef(null)
  const mvRhythmRef = useRef(null)
  const resultsCardRef = useRef(null)
  const riskBannerRef = useRef(null)
  const riskIconRef = useRef(null)
  const riskTitleRef = useRef(null)
  const riskSubRef = useRef(null)
  const rTapsRef = useRef(null)
  const rFreqRef = useRef(null)
  const rAmpRef = useRef(null)
  const rDecayRef = useRef(null)
  const rRhythmRef = useRef(null)
  const rBradyRef = useRef(null)
  const timerArcRef = useRef(null)
  const timerNumberRef = useRef(null)

  useEffect(() => {
    let isRunning = false
    let testDone = false
    let timeLeft = 10
    let timerInterval = null
    let handDetected = false

    let tapEvents = []
    let distanceHistory = []
    let wasOpen = true
    let tapCooldown = false
    const CIRCUMFERENCE = 2 * Math.PI * 54
    const WAVE_BARS = 40
    let waveBuffer = new Array(WAVE_BARS).fill(0)
    let hands = null
    let camera = null

    const videoEl = videoRef.current
    const canvasEl = canvasRef.current
    const waveformEl = waveformRef.current
    const tapChartCanvas = tapChartRef.current
    const startBtn = startBtnRef.current
    const resetBtn = resetBtnRef.current
    const cameraPlaceholder = cameraPlaceholderRef.current
    const handBadge = handBadgeRef.current
    const statusDot = statusDotRef.current
    const statusText = statusTextRef.current
    const tapCount = tapCountRef.current
    const mvFreq = mvFreqRef.current
    const mvAmp = mvAmpRef.current
    const mvRhythm = mvRhythmRef.current
    const resultsCard = resultsCardRef.current
    const riskBanner = riskBannerRef.current
    const riskIcon = riskIconRef.current
    const riskTitle = riskTitleRef.current
    const riskSub = riskSubRef.current
    const rTaps = rTapsRef.current
    const rFreq = rFreqRef.current
    const rAmp = rAmpRef.current
    const rDecay = rDecayRef.current
    const rRhythm = rRhythmRef.current
    const rBrady = rBradyRef.current
    const timerArc = timerArcRef.current
    const timerNumber = timerNumberRef.current

    if (!videoEl || !canvasEl || !waveformEl || !tapChartCanvas) return

    function setStatus(dotClass, text) {
      if (statusDot) statusDot.className = dotClass
      if (statusText) statusText.textContent = text
    }

    function updateTimerRing(seconds) {
      const frac = seconds / 10
      const offset = CIRCUMFERENCE * (1 - frac)
      if (timerArc) {
        timerArc.style.strokeDashoffset = `${offset}`
        timerArc.style.stroke = frac > 0.5 ? '#7c6dfa' : frac > 0.2 ? '#fbbf24' : '#f87171'
      }
      if (timerNumber) timerNumber.textContent = String(seconds)
    }

    function resizeCharts() {
      const ctx = tapChartCanvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1
      tapChartCanvas.width = tapChartCanvas.offsetWidth * dpr
      tapChartCanvas.height = tapChartCanvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawTapChart()
    }

    function drawTapChart() {
      const ctx = tapChartCanvas.getContext('2d')
      const w = tapChartCanvas.offsetWidth
      const h = tapChartCanvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      if (distanceHistory.length < 2) return
      const data = distanceHistory.slice(-300)
      const maxVal = Math.max(...data, 1)

      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i += 1) {
        const y = (h / 4) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, 'rgba(124,109,250,0.35)')
      grad.addColorStop(1, 'rgba(124,109,250,0.02)')

      ctx.beginPath()
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * w
        const y = h - (v / maxVal) * h * 0.85 - 4
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.lineTo(w, h)
      ctx.lineTo(0, h)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()

      ctx.beginPath()
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * w
        const y = h - (v / maxVal) * h * 0.85 - 4
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.strokeStyle = 'rgba(167,139,250,0.9)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = '#7c6dfa'
      tapEvents.forEach((t) => {
        const idx = t.frameIdx
        if (idx == null) return
        const relIdx = idx - (distanceHistory.length - data.length)
        if (relIdx < 0 || relIdx >= data.length) return
        const x = (relIdx / (data.length - 1)) * w
        const y = h - (data[relIdx] / maxVal) * h * 0.85 - 4
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    function getLandmarks(results) {
      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return null
      return results.multiHandLandmarks[0]
    }

    function dist2D(a, b) {
      const dx = a.x - b.x
      const dy = a.y - b.y
      return Math.sqrt(dx * dx + dy * dy)
    }

    function showResults({ score, taps, freq, amp, decay, cv, brady }) {
      if (resultsCard) resultsCard.classList.remove('hidden')
      if (rTaps) rTaps.textContent = String(taps)
      if (rFreq) rFreq.textContent = `${freq.toFixed(2)} Hz`
      if (rAmp) rAmp.textContent = `${amp} (normalized)`
      if (rDecay) rDecay.textContent = `${decay.toFixed(1)}%`
      if (rRhythm) rRhythm.textContent = `${cv.toFixed(1)}%`
      if (rBrady) rBrady.textContent = `${brady} / 100`
      if (riskBanner) riskBanner.className = `risk-banner ${score}`
      if (riskIcon) riskIcon.textContent = ({ normal: '✓', mild: '⚠', elevated: '!' })[score]
      if (riskTitle) riskTitle.textContent = ({ normal: 'Within normal range', mild: 'Mildly irregular patterns', elevated: 'Notable motor irregularity' })[score]
      if (riskSub) riskSub.textContent = ({ normal: 'Tapping rate, amplitude, and rhythm appear typical.', mild: 'Some irregularity detected. Consider repeating the test or consult a clinician.', elevated: 'Significant bradykinesia indicators. This is not a diagnosis — please see a neurologist.' })[score]
      onComplete?.({ score, taps, freq, amp, decay, cv, brady })
    }

    function analyzeResults() {
      const n = tapEvents.length
      if (n < 2) {
        showResults({ score: 'normal', taps: n, freq: 0, amp: 0, decay: 0, cv: 0, brady: 0 })
        return
      }

      const freq = n / 10
      const amps = distanceHistory
      const meanAmp = amps.reduce((a, b) => a + b, 0) / amps.length
      const half = Math.floor(tapEvents.length / 2)
      const firstAmps = tapEvents.slice(0, half).map((t) => distanceHistory[t.frameIdx] || 0)
      const secondAmps = tapEvents.slice(half).map((t) => distanceHistory[t.frameIdx] || 0)
      const firstMean = firstAmps.length ? firstAmps.reduce((a, b) => a + b, 0) / firstAmps.length : 1
      const secondMean = secondAmps.length ? secondAmps.reduce((a, b) => a + b, 0) / secondAmps.length : 1
      const decayPct = firstMean > 0 ? ((firstMean - secondMean) / firstMean) * 100 : 0
      const intervals = []
      for (let i = 1; i < n; i += 1) intervals.push(tapEvents[i].time - tapEvents[i - 1].time)
      const meanIvl = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const std = Math.sqrt(intervals.reduce((a, b) => a + (b - meanIvl) ** 2, 0) / intervals.length)
      const cv = (std / meanIvl) * 100
      let brady = 0
      if (freq < 3) brady += 40
      else if (freq < 4.5) brady += 20
      else if (freq < 6) brady += 5
      if (decayPct > 30) brady += 30
      else if (decayPct > 15) brady += 15
      if (cv > 35) brady += 30
      else if (cv > 20) brady += 15
      brady = Math.min(brady, 100)
      let score = 'normal'
      if (brady > 55) score = 'elevated'
      else if (brady > 25) score = 'mild'
      showResults({ score, taps: n, freq, amp: Math.round(meanAmp), decay: decayPct, cv, brady })
    }

    function finishTest() {
      setStatus('status-dot active', 'Test complete')
      if (resetBtn) resetBtn.classList.remove('hidden')
      analyzeResults()
    }

    function startTest() {
      if (!handDetected || isRunning || testDone) return
      isRunning = true
      tapEvents = []
      timeLeft = 10
      if (startBtn) startBtn.classList.add('hidden')
      setStatus('status-dot recording', 'Recording…')
      if (resultsCard) resultsCard.classList.add('hidden')
      updateTimerRing(10)
      timerInterval = window.setInterval(() => {
        timeLeft -= 1
        updateTimerRing(timeLeft)
        if (timeLeft <= 0) {
          window.clearInterval(timerInterval)
          isRunning = false
          testDone = true
          finishTest()
        }
      }, 1000)
    }

    function resetTest() {
      testDone = false
      isRunning = false
      window.clearInterval(timerInterval)
      timeLeft = 10
      tapEvents = []
      distanceHistory = []
      wasOpen = true
      tapCooldown = false
      updateTimerRing(10)
      if (startBtn) {
        startBtn.classList.remove('hidden')
        startBtn.disabled = !handDetected
      }
      if (resetBtn) resetBtn.classList.add('hidden')
      if (resultsCard) resultsCard.classList.add('hidden')
      if (tapCount) tapCount.textContent = '0 taps'
      if (mvFreq) mvFreq.innerHTML = '—<span class="metric-unit">Hz</span>'
      if (mvAmp) mvAmp.innerHTML = '—<span class="metric-unit">px</span>'
      if (mvRhythm) mvRhythm.innerHTML = '—<span class="metric-unit">%</span>'
      if (timerArc) timerArc.style.stroke = '#7c6dfa'
      setStatus('status-dot active', 'Ready — hand detected')
      waveBuffer = new Array(WAVE_BARS).fill(0)
    }

    function onResults(results) {
      if (!canvasEl || !videoEl) return
      canvasEl.width = videoEl.videoWidth
      canvasEl.height = videoEl.videoHeight
      const ctx = canvasEl.getContext('2d')
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
      const lm = getLandmarks(results)
      if (lm) {
        if (!handDetected) {
          handDetected = true
          if (handBadge) handBadge.classList.add('show')
          if (cameraPlaceholder) cameraPlaceholder.style.display = 'none'
          if (startBtn) startBtn.disabled = false
          setStatus('status-dot active', 'Hand detected — ready')
        }
        const drawConnectors = window.drawConnectors ?? window.drawConnectors
        const drawLandmarks = window.drawLandmarks ?? window.drawLandmarks
        const HAND_CONNECTIONS = window.HAND_CONNECTIONS
        if (drawConnectors && drawLandmarks && HAND_CONNECTIONS) {
          drawConnectors(ctx, lm, HAND_CONNECTIONS, { color: 'rgba(124,109,250,0.4)', lineWidth: 1.5 })
          drawLandmarks(ctx, lm, { color: 'rgba(167,139,250,0.9)', fillColor: 'rgba(124,109,250,0.4)', lineWidth: 1, radius: 4 })
        }
        const thumb = lm[4]
        const index = lm[8]
        const cw = canvasEl.width
        const ch = canvasEl.height
        ;[[thumb, '#34d399'], [index, '#fbbf24']].forEach(([pt, col]) => {
          ctx.beginPath()
          ctx.arc(pt.x * cw, pt.y * ch, 8, 0, Math.PI * 2)
          ctx.strokeStyle = col
          ctx.lineWidth = 2.5
          ctx.stroke()
        })
        ctx.beginPath()
        ctx.moveTo(thumb.x * cw, thumb.y * ch)
        ctx.lineTo(index.x * cw, index.y * ch)
        ctx.strokeStyle = 'rgba(251,191,36,0.5)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.setLineDash([])
        const wrist = lm[0]
        const midBase = lm[9]
        const handScale = dist2D(wrist, midBase) * cw
        const rawDist = dist2D(thumb, index)
        const normDist = handScale > 10 ? (rawDist * cw) / handScale : rawDist * cw
        distanceHistory.push(normDist)
        if (distanceHistory.length > 600) distanceHistory.shift()
        waveBuffer.shift()
        waveBuffer.push(normDist)
        const wMax = Math.max(...waveBuffer, 1)
        waveformEl.querySelectorAll('.wave-bar').forEach((b, i) => {
          const h = Math.round((waveBuffer[i] / wMax) * 36)
          b.style.height = `${h}px`
          b.style.opacity = isRunning ? '0.8' : '0.3'
        })
        const TAP_CLOSE_THRESH = 0.25
        const TAP_OPEN_THRESH = 0.35
        if (isRunning) {
          if (mvAmp) mvAmp.innerHTML = `${Math.round(normDist)}<span class="metric-unit">px</span>`
          if (!tapCooldown) {
            if (wasOpen && normDist < TAP_CLOSE_THRESH) {
              const tNow = performance.now()
              tapEvents.push({ time: tNow, amplitude: normDist, frameIdx: distanceHistory.length - 1 })
              wasOpen = false
              tapCooldown = true
              if (tapCount) tapCount.textContent = `${tapEvents.length} tap${tapEvents.length !== 1 ? 's' : ''}`
              window.setTimeout(() => { tapCooldown = false }, 80)
            } else if (!wasOpen && normDist > TAP_OPEN_THRESH) {
              wasOpen = true
            }
          }
          const now = performance.now()
          const recent = tapEvents.filter((t) => now - t.time < 3000)
          const freq = recent.length / 3
          if (mvFreq) mvFreq.innerHTML = `${freq.toFixed(1)}<span class="metric-unit">Hz</span>`
          if (mvFreq) mvFreq.parentElement?.classList.add('active')
          if (tapEvents.length >= 4) {
            const intervals = []
            for (let i = 1; i < tapEvents.length; i += 1) intervals.push(tapEvents[i].time - tapEvents[i - 1].time)
            const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length
            const std = Math.sqrt(intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length)
            const cv = (std / mean) * 100
            if (mvRhythm) mvRhythm.innerHTML = `${Math.round(cv)}<span class="metric-unit">%</span>`
            if (mvRhythm) mvRhythm.parentElement?.classList.add('active')
          }
        }
      } else {
        if (handDetected) handBadge?.classList.remove('show')
        handDetected = false
        waveBuffer.shift()
        waveBuffer.push(0)
        waveformEl.querySelectorAll('.wave-bar').forEach((b) => {
          b.style.height = '3px'
          b.style.opacity = '0.2'
        })
      }
      drawTapChart()
    }

    function createWaveformBars() {
      waveformEl.innerHTML = ''
      for (let i = 0; i < WAVE_BARS; i += 1) {
        const bar = document.createElement('div')
        bar.className = 'wave-bar'
        waveformEl.appendChild(bar)
      }
    }

    async function loadScript(src) {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`)
        if (existing) {
          if (existing.getAttribute('data-loaded') === 'true') return resolve()
          existing.addEventListener('load', () => resolve())
          existing.addEventListener('error', reject)
          return
        }
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.onload = () => {
          script.setAttribute('data-loaded', 'true')
          resolve()
        }
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    async function initMediaPipe() {
      try {
        hands = new window.Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` })
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.6,
        })
        hands.onResults(onResults)
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } })
        videoEl.srcObject = stream
        camera = new window.Camera(videoEl, {
          onFrame: async () => { await hands.send({ image: videoEl }) },
          width: 640,
          height: 480,
        })
        camera.start()
        if (cameraPlaceholder) cameraPlaceholder.style.display = 'none'
        setStatus('status-dot', 'Searching for hand…')
      } catch (error) {
        console.error(error)
        setStatus('status-dot', 'Camera error — check permissions')
        if (cameraPlaceholder) cameraPlaceholder.querySelector('p').textContent = 'Camera access denied'
      }
    }

    async function setup() {
      createWaveformBars()
      if (startBtn) startBtn.disabled = true
      if (resetBtn) resetBtn.classList.add('hidden')
      if (resultsCard) resultsCard.classList.add('hidden')
      for (const src of MEDIA_PIPE_SCRIPTS) {
        await loadScript(src)
      }
      await initMediaPipe()
      resizeCharts()
    }

    setup()

    const handleResize = () => { window.setTimeout(resizeCharts, 100) }
    window.addEventListener('resize', handleResize)
    if (startBtn) startBtn.addEventListener('click', startTest)
    if (resetBtn) resetBtn.addEventListener('click', resetTest)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (startBtn) startBtn.removeEventListener('click', startTest)
      if (resetBtn) resetBtn.removeEventListener('click', resetTest)
      window.clearInterval(timerInterval)
      if (camera && typeof camera.stop === 'function') camera.stop()
      if (videoEl && videoEl.srcObject) {
        videoEl.srcObject.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="motor-sense-shell">
      <header>
        <div className="logo">
          <div className="logo-dot" />
          MotorSense
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="status-dot" ref={statusDotRef} />
          <span id="statusText" ref={statusTextRef}>Initializing camera…</span>
        </div>
        <div className="badge">Research Prototype</div>
      </header>

      <div className="motor-sense-content">
        <div className="camera-section">
          <div className="camera-container">
            <div className="camera-placeholder" ref={cameraPlaceholderRef}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <p>Starting camera…</p>
            </div>
            <video id="video" ref={videoRef} playsInline autoPlay muted />
            <canvas id="canvas" ref={canvasRef} />
            <div className="corner-tl" />
            <div className="corner-tr" />
            <div className="corner-bl" />
            <div className="corner-br" />
            <div className="hand-detected-badge" ref={handBadgeRef}>Hand detected</div>
          </div>

          <div className="live-metrics">
            <div className="metric-card" id="mcFreq">
              <div className="metric-label">Tap frequency</div>
              <div className="metric-value" ref={mvFreqRef}>—<span className="metric-unit">Hz</span></div>
            </div>
            <div className="metric-card" id="mcAmp">
              <div className="metric-label">Amplitude</div>
              <div className="metric-value" ref={mvAmpRef}>—<span className="metric-unit">px</span></div>
            </div>
            <div className="metric-card" id="mcRhythm">
              <div className="metric-label">Rhythm CV</div>
              <div className="metric-value" ref={mvRhythmRef}>—<span className="metric-unit">%</span></div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <span className="section-title">Tap distance trace</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text3)' }} ref={tapCountRef}>0 taps</span>
            </div>
            <div className="chart-area">
              <canvas id="tapChart" ref={tapChartRef} />
            </div>
            <div className="waveform" ref={waveformRef} />
          </div>
        </div>

        <div className="panel">
          <div className="section-card">
            <div className="section-header">
              <span className="section-title">Finger Tapping Test</span>
            </div>
            <div className="timer-section">
              <div className="timer-ring-container">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle className="timer-bg" cx="60" cy="60" r="54" />
                  <circle className="timer-arc" id="timerArc" ref={timerArcRef} cx="60" cy="60" r="54" />
                </svg>
                <div className="timer-center">
                  <div className="timer-number" id="timerNumber" ref={timerNumberRef}>10</div>
                  <div className="timer-label">seconds</div>
                </div>
              </div>

              <div className="instructions">
                <div className="step"><div className="step-num">1</div><span>Position your hand in front of the camera, palm facing you.</span></div>
                <div className="step"><div className="step-num">2</div><span>Tap your <strong>index finger</strong> to your <strong>thumb</strong> as fast as possible.</span></div>
                <div className="step"><div className="step-num">3</div><span>Keep going for the full 10 seconds without stopping.</span></div>
              </div>

              <button className="btn btn-primary" id="startBtn" ref={startBtnRef} disabled>Start Test</button>
              <button className="btn btn-secondary hidden" id="resetBtn" ref={resetBtnRef}>Reset</button>
            </div>
          </div>

          <div className="section-card hidden" id="resultsCard" ref={resultsCardRef}>
            <div className="section-header">
              <span className="section-title">Analysis Results</span>
            </div>
            <div className="risk-banner" id="riskBanner" ref={riskBannerRef}>
              <div className="risk-icon" ref={riskIconRef} />
              <div>
                <div className="risk-title" ref={riskTitleRef} />
                <div className="risk-sub" ref={riskSubRef} />
              </div>
            </div>
            <div className="results-section">
              <div className="result-row">
                <span className="result-key">Total taps</span>
                <span className="result-val" ref={rTapsRef}>—</span>
              </div>
              <div className="result-row">
                <span className="result-key">Mean frequency</span>
                <span className="result-val" ref={rFreqRef}>—</span>
              </div>
              <div className="result-row">
                <span className="result-key">Mean amplitude</span>
                <span className="result-val" ref={rAmpRef}>—</span>
              </div>
              <div className="result-row">
                <span className="result-key">Amplitude decay</span>
                <span className="result-val" ref={rDecayRef}>—</span>
              </div>
              <div className="result-row">
                <span className="result-key">Rhythm irregularity (CV)</span>
                <span className="result-val" ref={rRhythmRef}>—</span>
              </div>
              <div className="result-row">
                <span className="result-key">Bradykinesia score</span>
                <span className="result-val" ref={rBradyRef}>—</span>
              </div>
            </div>
            <div className="disclaimer">⚕ This is a research prototype only. Results are not a clinical diagnosis. Always consult a neurologist for medical assessment.</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .motor-sense-shell {
          background: #0a0a0f;
          color: #f0effe;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          padding: 2rem;
        }

        .motor-sense-shell::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: linear-gradient(rgba(124,109,250,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,109,250,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .motor-sense-shell header {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          background: rgba(10,10,15,0.8);
          margin-bottom: 1.5rem;
        }

        .motor-sense-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 1.5rem;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
        }

        .logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.2rem;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-dot {
          width: 8px;
          height: 8px;
          background: #7c6dfa;
          border-radius: 50%;
          box-shadow: 0 0 12px #7c6dfa;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .badge {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          padding: 3px 10px;
          border-radius: 100px;
          background: rgba(124,109,250,0.15);
          color: #a78bfa;
          border: 1px solid rgba(124,109,250,0.2);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .camera-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .camera-container {
          position: relative;
          background: #12121a;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
          aspect-ratio: 4/3;
        }

        #video,
        #canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }

        .camera-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: #5a5478;
        }

        .camera-placeholder svg {
          width: 64px;
          height: 64px;
          opacity: 0.3;
        }

        .camera-placeholder p {
          font-size: 0.9rem;
          font-family: 'DM Mono', monospace;
        }

        .corner-tl,
        .corner-tr,
        .corner-bl,
        .corner-br {
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: #7c6dfa;
          border-style: solid;
          border-width: 0;
          opacity: 0.6;
        }

        .corner-tl { top: 12px; left: 12px; border-top-width: 2px; border-left-width: 2px; border-radius: 3px 0 0 0; }
        .corner-tr { top: 12px; right: 12px; border-top-width: 2px; border-right-width: 2px; border-radius: 0 3px 0 0; }
        .corner-bl { bottom: 12px; left: 12px; border-bottom-width: 2px; border-left-width: 2px; border-radius: 0 0 0 3px; }
        .corner-br { bottom: 12px; right: 12px; border-bottom-width: 2px; border-right-width: 2px; border-radius: 0 0 3px 0; }

        .live-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .metric-card {
          background: #12121a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          padding: 0.875rem 1rem;
          transition: border-color 0.3s;
        }

        .metric-card.active {
          border-color: rgba(124,109,250,0.35);
        }

        .metric-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          color: #5a5478;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
        }

        .metric-value {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          line-height: 1;
          color: #f0effe;
        }

        .metric-unit {
          font-size: 0.75rem;
          color: #9b93c8;
          font-family: 'DM Mono', monospace;
          margin-left: 3px;
        }

        .panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-card {
          background: #12121a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          overflow: hidden;
        }

        .section-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9b93c8;
        }

        .timer-section {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .timer-ring-container {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .timer-ring-container svg {
          transform: rotate(-90deg);
        }

        .timer-bg { fill: none; stroke: #1a1a26; stroke-width: 6; }
        .timer-arc { fill: none; stroke: #7c6dfa; stroke-width: 6; stroke-linecap: round; stroke-dasharray: 339.3; stroke-dashoffset: 0; transition: stroke-dashoffset 0.5s linear, stroke 0.3s; }

        .timer-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .timer-number {
          font-family: 'Syne', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1;
          color: #f0effe;
        }

        .timer-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.6rem;
          color: #5a5478;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .instructions {
          background: #1a1a26;
          border-radius: 8px;
          padding: 1rem;
          width: 100%;
        }

        .step {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.85rem;
          color: #9b93c8;
          line-height: 1.5;
        }

        .step + .step { margin-top: 10px; }

        .step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(124,109,250,0.15);
          border: 1px solid rgba(124,109,250,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          color: #a78bfa;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .btn {
          width: 100%;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          transition: all 0.2s;
        }

        .btn-primary { background: #7c6dfa; color: white; }
        .btn-primary:hover:not(:disabled) { background: #a78bfa; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-secondary { background: transparent; color: #9b93c8; border: 1px solid rgba(255,255,255,0.13); }
        .btn-secondary:hover { background: #1a1a26; color: #f0effe; }

        .chart-area { padding: 1rem 1.25rem; }
        #tapChart { width: 100%; height: 100px; display: block; }

        .results-section { padding: 1.25rem; }
        .result-row { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.07); font-size: 0.85rem; }
        .result-row:last-child { border-bottom: none; }
        .result-key { color: #9b93c8; font-family: 'DM Mono', monospace; font-size: 0.78rem; }
        .result-val { font-weight: 500; font-family: 'DM Mono', monospace; font-size: 0.85rem; }

        .risk-banner { margin: 1rem 1.25rem; border-radius: 8px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 12px; }
        .risk-banner.normal { background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.2); }
        .risk-banner.mild { background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.2); }
        .risk-banner.elevated { background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.2); }
        .risk-icon { font-size: 1.5rem; }
        .risk-title { font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700; }
        .risk-sub { font-size: 0.75rem; color: #9b93c8; margin-top: 2px; line-height: 1.4; }
        .risk-banner.normal .risk-title { color: #34d399; }
        .risk-banner.mild .risk-title { color: #fbbf24; }
        .risk-banner.elevated .risk-title { color: #f87171; }

        .disclaimer { font-size: 0.7rem; color: #5a5478; text-align: center; padding: 0 1.25rem 1.25rem; line-height: 1.6; }
        .waveform { display: flex; align-items: flex-end; gap: 3px; height: 40px; padding: 0 1.25rem 0.5rem; }
        .wave-bar { flex: 1; background: #7c6dfa; border-radius: 2px 2px 0 0; opacity: 0.3; transition: height 0.1s, opacity 0.1s; min-height: 3px; }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #5a5478; transition: background 0.3s; }
        .status-dot.active { background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,0.6); animation: blink 1s ease-in-out infinite; }
        .status-dot.recording { background: #f87171; box-shadow: 0 0 8px rgba(248,113,113,0.6); animation: blink 0.7s ease-in-out infinite; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .hidden { display: none !important; }
        #statusText { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #5a5478; }
        .hand-detected-badge { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.3); color: #34d399; font-family: 'DM Mono', monospace; font-size: 0.65rem; padding: 4px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0; transition: opacity 0.3s; }
        .hand-detected-badge.show { opacity: 1; }

        @media (max-width: 1080px) {
          .motor-sense-content { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
