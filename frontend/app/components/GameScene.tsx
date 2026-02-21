'use client'
import { Canvas } from '@react-three/fiber'
import { GameState } from '../hooks/useGameState'
import { SceneLighting } from './SceneLighting'
import { Track } from './Track'
import { PlayerMesh } from './PlayerMesh'
import { BulletMesh } from './BulletMesh'
import { ObstacleMesh } from './ObstacleMesh'
import { CameraRig } from './CameraRig'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

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

export function GameScene({ state }: Props) {
  return (
    <Canvas
      shadows
      style={{ width: '100%', height: '100%' }}
      camera={{ fov: 60, near: 0.1, far: 400 }}
      gl={{ antialias: true }}
    >
      <SceneLighting />
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