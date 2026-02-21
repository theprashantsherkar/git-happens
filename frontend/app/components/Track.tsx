'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { PATH_SPLINE } from '../utils/path'
import { TRACK_RADIUS, LANE_WIDTH } from '../constants'

// ─── Ground plane ─────────────────────────────────────────────────────────────
function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshLambertMaterial color="#2d5a1b" />
    </mesh>
  )
}

// ─── Track tube ───────────────────────────────────────────────────────────────
function TrackTube() {
  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(PATH_SPLINE, 500, 0.2, 8, true)
  }, [])

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshLambertMaterial color="#8B7355" side={THREE.DoubleSide} />
    </mesh>
  )
}

// ─── Lane stripe (centre line) ───────────────────────────────────────────────
function LaneStripes() {
  const line = useMemo(() => {
    const points = PATH_SPLINE.getPoints(300)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ color: '#ffffff', opacity: 0.18, transparent: true })
    return new THREE.Line(geometry, material)
  }, [])

  return <primitive object={line} />
}

// ─── Decorative trees scattered around the path ───────────────────────────────
function SceneryTrees() {
  const trees = useMemo(() => {
    const t: { x: number; z: number; scale: number }[] = []
    // Scatter deterministically around the world
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2
      const r = 18 + ((i * 7919) % 12)
      t.push({
        x: Math.cos(angle) * r + ((i * 1031) % 6) - 3,
        z: Math.sin(angle) * r + ((i * 2053) % 6) - 3,
        scale: 0.6 + ((i * 3571) % 10) / 20,
      })
    }
    return t
  }, [])

  return (
    <>
      {trees.map((tr, i) => (
        <group key={i} position={[tr.x, 0, tr.z]} scale={tr.scale}>
          {/* Trunk */}
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 1.4, 6]} />
            <meshLambertMaterial color="#6B4226" />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 2.0, 0]} castShadow>
            <coneGeometry args={[0.85, 1.8, 7]} />
            <meshLambertMaterial color="#1a4d1a" />
          </mesh>
          <mesh position={[0, 2.9, 0]} castShadow>
            <coneGeometry args={[0.55, 1.4, 7]} />
            <meshLambertMaterial color="#1f5c1f" />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function Track() {
  return (
    <group>
      <GroundPlane />
      <TrackTube />
      <LaneStripes />
      <SceneryTrees />
    </group>
  )
}