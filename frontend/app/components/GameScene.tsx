'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { GameState } from '../hooks/useGameState'
import { SceneLighting } from './SceneLighting'
import { Track } from './Track'
import { ObstacleMesh } from './ObstacleMesh'
import { CameraRig } from './CameraRig'
import { PlayerMesh, BulletMesh } from './PlayerMesh'

// ─── Flag mesh in world ───────────────────────────────────────────────────────
function FlagObject({ x, z, carrierId }: { x: number; z: number; carrierId: number | string | null }) {
  const poleRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (poleRef.current && carrierId === null) {
      poleRef.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.15 + 0.8
    }
  })

  if (carrierId !== null) return null

  return (
    <group position={[x, 0, z]}>
      {/* Pole */}
      <mesh ref={poleRef} position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.6, 6]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Flag cloth */}
      <mesh position={[0.3, 1.55, 0]}>
        <boxGeometry args={[0.6, 0.35, 0.05]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      {/* Glow ring on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.5, 0.75, 24]} />
        <meshStandardMaterial color="#ffd700" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

// ─── Sky + Clouds ─────────────────────────────────────────────────────────────
function SkyAndClouds() {
  const cloudGroup = useRef<THREE.Group>(null)

  const skyTexture = useMemo(() => {
    if (typeof window === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0,   '#0f4fff')
    gradient.addColorStop(0.5, '#1e90ff')
    gradient.addColorStop(1,   '#87ceeb')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  const clouds = useMemo(() => {
    const arr: { x: number; y: number; z: number; scale: number }[] = []
    for (let i = 0; i < 20; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 120,
        y: 30 + Math.random() * 20,
        z: (Math.random() - 0.5) * 120,
        scale: 3 + Math.random() * 2,
      })
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (cloudGroup.current) {
      cloudGroup.current.position.x += delta * 0.3
    }
  })

  return (
    <>
      {skyTexture && (
        <mesh>
          <sphereGeometry args={[300, 32, 32]} />
          <meshBasicMaterial map={skyTexture} side={THREE.BackSide} />
        </mesh>
      )}

      {/* Drifting clouds */}
      <group ref={cloudGroup}>
        {clouds.map((c, i) => (
          <group key={i} position={[c.x, c.y, c.z]} scale={c.scale}>
            <mesh>
              <sphereGeometry args={[1.6, 12, 12]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.85} />
            </mesh>
            <mesh position={[1.4, 0.3, 0]}>
              <sphereGeometry args={[1.2, 12, 12]} />
              <meshStandardMaterial color="#f0f6ff" transparent opacity={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  )
}

// ─── Main scene export ────────────────────────────────────────────────────────
type Props = { state: GameState; mySocketId?: string }

export function GameScene({ state, mySocketId }: Props) {
  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      style={{ width: '100%', height: '100%' }}
      camera={{ fov: 60, near: 0.1, far: 400 }}
      gl={{ antialias: true }}
    >
      <SceneLighting />
      <SkyAndClouds />
      <Track />

      {/* Flag */}
      <FlagObject
        x={state.flag?.x ?? 0}
        z={state.flag?.z ?? 0}
        carrierId={state.flag?.carrierId ?? null}
      />

      {/* Players */}
      <PlayerMesh players={state.players ?? []} />

      {/* Bullets */}
      <BulletMesh bullets={state.bullets ?? []} />

      {/* Obstacles */}
      <ObstacleMesh obstacles={state.obstacles ?? []} />

      {/* Camera */}
      <CameraRig players={state.players ?? []} mySocketId={mySocketId} />
    </Canvas>
  )
}