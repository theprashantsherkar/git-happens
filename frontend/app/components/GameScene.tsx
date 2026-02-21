'use client'
import { Canvas } from '@react-three/fiber'
import { GameState } from '../hooks/useGameState'
import { SceneLighting } from './SceneLighting'
import { Track } from './Track'
import { PlayerMesh } from './PlayerMesh'
import { BulletMesh } from './BulletMesh'
import { ObstacleMesh } from './ObstacleMesh'
import { CameraRig } from './CameraRig'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'

// ─── Flag mesh in world ───────────────────────────────────────────────────────
function FlagObject({ x, z, carrierId }: { x: number; z: number; carrierId: number | null }) {
  const poleRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (poleRef.current) {
      // Gentle bobbing when on ground (not held)
      if (carrierId === null) {
        poleRef.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.15 + 0.8
      }
    }
  })

  // Don't render flag separately when it's being carried — PlayerMesh shows the pole
  if (carrierId !== null) return null

  return (
    <group position={[x, 0, z]}>
      {/* Pole */}
      <mesh ref={poleRef} position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.6, 6]} />
        <meshLambertMaterial color="#aaaaaa" />
      </mesh>
      {/* Flag cloth */}
      <mesh position={[0.3, 1.55, 0]}>
        <boxGeometry args={[0.6, 0.35, 0.05]} />
        <meshLambertMaterial color="#dc2626" />
      </mesh>
      {/* Glow ring on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.5, 0.75, 24]} />
        <meshLambertMaterial color="#ffd700" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

type Props = { state: GameState }


function SkyAndClouds() {
  const cloudGroup = useRef<THREE.Group>(null)

  // Strong blue sky gradient
  const skyTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createLinearGradient(0, 0, 0, 1024)

    gradient.addColorStop(0, '#0f4fff')   // deep sky blue (top)
    gradient.addColorStop(0.5, '#1e90ff') // bright mid blue
    gradient.addColorStop(1, '#87ceeb')   // light horizon blue

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
    if (cloudGroup.current) {
      cloudGroup.current.position.x += delta * 0.3
    }
  })

  return (
    <>
      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[300, 64, 64]} />
        <meshBasicMaterial
          map={skyTexture}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Soft clouds */}
      <group ref={cloudGroup}>
        {clouds.map((c, i) => (
          <group key={i} position={[c.x, c.y, c.z]} scale={c.scale}>
            <mesh>
              <sphereGeometry args={[1.6, 16, 16]} />
              <meshLambertMaterial color="#ffffff" transparent opacity={0.85} />
            </mesh>
            <mesh position={[1.4, 0.3, 0]}>
              <sphereGeometry args={[1.2, 16, 16]} />
              <meshLambertMaterial color="#f0f6ff" transparent opacity={0.8} />
            </mesh>
            <mesh position={[-1.3, 0.2, 0]}>
              <sphereGeometry args={[1.1, 16, 16]} />
              <meshLambertMaterial color="#e6f2ff" transparent opacity={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  )
}

export default SkyAndClouds

export function GameScene({ state }: Props) {
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

      {/* Flag in world */}
      <FlagObject x={state.flag.x} z={state.flag.z} carrierId={state.flag.carrierId} />

      {/* Players */}
      {state.players.map(p => (
        <PlayerMesh key={p.id} player={p} />
      ))}

      {/* Bullets */}
      <BulletMesh bullets={state.bullets} players={state.players} />

      {/* Obstacles */}
      <ObstacleMesh obstacles={state.obstacles} />

      {/* Camera follows Blue player */}
      <CameraRig players={state.players} />
    </Canvas>
  )
}