'use client'

import { useRef, useState } from 'react'

export default function Card3D({ children, className = '', onClick, style, ...rest }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState('')

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rx = -(y / rect.height) * 8
    const ry = (x / rect.width) * 8
    setTilt(`perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`)
  }

  const handleMouseLeave = () => {
    setTilt('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)')
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`glass-card ${className}`}
      style={{
        transform: tilt,
        transition: 'transform 0.3s ease-out, border-color 0.3s',
        transformStyle: 'preserve-3d',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
