'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ServerPlayer, ServerFlag } from '../hooks/useGameState'
import { SceneLighting } from './SceneLighting'
import { Track } from './Track'
import { ObstacleMesh } from './ObstacleMesh'
import { CameraRig } from './CameraRig'
import { PlayerMesh, BulletMesh } from './PlayerMesh'

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  players: ServerPlayer[]
  flag: ServerFlag | null
  myPlayerId: string | null
}

// ─── Flag mesh ────────────────────────────────────────────────────────────────
function FlagObject({ flag }: { flag: ServerFlag }) {
  const poleRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (poleRef.current && flag.holderId === null) {
      poleRef.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.15 + 0.8
    }
  })

  // Don't render when carried — PlayerMesh shows it on the carrier
  if (flag.holderId !== null) return null

  return (
    <group position={[flag.x, 0, flag.y ?? 0]}>
      <mesh ref={poleRef} position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.6, 6]} />
        <meshLambertMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[0.3, 1.55, 0]}>
        <boxGeometry args={[0.6, 0.35, 0.05]} />
        <meshLambertMaterial color="#dc2626" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.5, 0.75, 24]} />
        <meshLambertMaterial color="#ffd700" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

// ─── Sky + Clouds ─────────────────────────────────────────────────────────────
function SkyAndClouds() {
  const cloudGroup = useRef<THREE.Group>(null)

  const skyTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createLinearGradient(0, 0, 0, 1024)
    gradient.addColorStop(0,   '#0f4fff')
    gradient.addColorStop(0.5, '#1e90ff')
    gradient.addColorStop(1,   '#87ceeb')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1024, 1024)
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
    if (cloudGroup.current) cloudGroup.current.position.x += delta * 0.3
  })

  return (
    <>
      <mesh>
        <sphereGeometry args={[300, 64, 64]} />
        <meshBasicMaterial map={skyTexture} side={THREE.BackSide} />
      </mesh>
      <group ref={cloudGroup}>
        {clouds.map((c, i) => (
          <group key={i} position={[c.x, c.y, c.z]} scale={c.scale}>
            <mesh><sphereGeometry args={[1.6, 16, 16]} /><meshLambertMaterial color="#ffffff" transparent opacity={0.85} /></mesh>
            <mesh position={[1.4, 0.3, 0]}><sphereGeometry args={[1.2, 16, 16]} /><meshLambertMaterial color="#f0f6ff" transparent opacity={0.8} /></mesh>
            <mesh position={[-1.3, 0.2, 0]}><sphereGeometry args={[1.1, 16, 16]} /><meshLambertMaterial color="#e6f2ff" transparent opacity={0.8} /></mesh>
          </group>
        ))}
      </group>
    </>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function GameScene({ players, flag, myPlayerId }: Props) {
  // Find the local player to follow with camera
  const myPlayer = players.find(p => p.id === myPlayerId) ?? players[0] ?? null

  return (
    <Canvas
      shadows
      style={{ width: '100%', height: '100%' }}
      camera={{ fov: 60, near: 0.1, far: 400 }}
      gl={{ antialias: true }}
    >
      <SceneLighting />
      <SkyAndClouds />
      <Track />

      {flag && <FlagObject flag={flag} />}

      {/* PlayerMesh and BulletMesh need to handle ServerPlayer shape —
          see note below if you get type errors there */}
      <PlayerMesh players={players} myPlayerId={myPlayerId} />
      <BulletMesh bullets={[]} />

      <ObstacleMesh obstacles={[]} />

      {/* Camera follows the local player */}
      <CameraRig player={myPlayer} />
    </Canvas>
  )
}