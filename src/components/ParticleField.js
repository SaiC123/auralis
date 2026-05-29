'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Particles({ count = 2000, scrollProgress = 0 }) {
  const mesh = useRef()
  const light = useRef()

  const [positions, randoms] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const rng = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // Spread particles in a sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 3 + Math.random() * 5
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      rng[i] = Math.random()
    }
    return [pos, rng]
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime

    // Slow rotation that responds to scroll
    mesh.current.rotation.y = t * 0.05 + scrollProgress * Math.PI * 0.5
    mesh.current.rotation.x = Math.sin(t * 0.03) * 0.15 + scrollProgress * 0.3

    // Morph geometry based on scroll
    const geo = mesh.current.geometry
    const posAttr = geo.getAttribute('position')
    const arr = posAttr.array

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const rand = randoms[i]
      const baseR = 3 + rand * 5

      const theta = rand * Math.PI * 2 + t * 0.02 * (rand > 0.5 ? 1 : -1)
      const phi = Math.acos(2 * rand - 1) + Math.sin(t * 0.05 + rand * 10) * 0.1

      // Scroll morphs the sphere into a more spread-out shape
      const scrollMorph = 1 + scrollProgress * 1.5
      const r = baseR * scrollMorph + Math.sin(t * 0.3 + rand * 20) * 0.3

      arr[i3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) + Math.sin(t * 0.1 + rand * 5) * 0.5
      arr[i3 + 2] = r * Math.cos(phi)
    }
    posAttr.needsUpdate = true

    // Move light
    if (light.current) {
      light.current.position.x = Math.sin(t * 0.2) * 5
      light.current.position.y = Math.cos(t * 0.15) * 3
    }
  })

  return (
    <group>
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color="#ffffff"
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <pointLight ref={light} color="#6366f1" intensity={2} distance={20} />
      <ambientLight intensity={0.02} />
    </group>
  )
}

export default function ParticleField({ scrollProgress = 0 }) {
  return (
    <div className="fixed inset-0 z-0" style={{ background: '#000' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 8, 20]} />
        <Particles count={2000} scrollProgress={scrollProgress} />
      </Canvas>
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  )
}
