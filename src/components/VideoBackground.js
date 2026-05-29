'use client'

import { useEffect, useRef, useState } from 'react'

export default function VideoBackground({ src, poster }) {
  const videoRef = useRef(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  useEffect(() => {
    // Attempt to auto-play if it doesn't immediately
    if (videoRef.current) {
      videoRef.current.play().catch(e => {
        console.warn("Video auto-play was prevented by the browser.", e)
      })
    }
  }, [src])

  return (
    <>
      {/* Black fallback / base layer */}
      <div className="fixed inset-0 -z-50 bg-black" />
      
      {/* The Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setIsVideoLoaded(true)}
        className={`fixed inset-0 w-full h-full object-cover -z-40 transition-opacity duration-1000 ${
          isVideoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Vignette Overlay for readability over bright videos */}
      <div 
        className="fixed inset-0 -z-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%), rgba(0, 0, 0, 0.2)'
        }}
      />
    </>
  )
}
