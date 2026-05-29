'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * 3D Reveal wrapper.
 * Elements float up from bottom, rotate from an angle, and fade in
 * with staggered delays when they enter the viewport.
 *
 * Props:
 *  - delay: ms delay before animation starts (use for stagger)
 *  - className: extra classes
 *  - children: content
 */
export default function ScrollReveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? 'translate3d(0, 0, 0) rotateX(0deg)'
          : 'translate3d(0, 60px, -80px) rotateX(12deg)',
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'transform, opacity',
        perspective: '1200px',
      }}
    >
      {children}
    </div>
  )
}
