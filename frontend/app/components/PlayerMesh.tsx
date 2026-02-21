'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from '../types'
import { getPathPosition, getPathYaw } from '../utils/path'
import { LANE_WIDTH, PLAYER_HEIGHT } from '../constants'

type Props = { player: Player }

// ─── Flag pole attached to carrier ───────────────────────────────────────────
function FlagPole({ color }: { color: string }) {
  return (
    <group position={[0.3, PLAYER_HEIGHT * 0.6, 0]}>
      {/* Pole */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 5]} />
        <meshLambertMaterial color="#cccccc" />
      </mesh>
      {/* Flag cloth */}
      <mesh position={[0.25, 1.15, 0]}>
        <boxGeometry args={[0.5, 0.28, 0.04]} />
        <meshLambertMaterial color="#dc2626" />
      </mesh>
      {/* Star */}
      <mesh position={[0.25, 1.15, 0.03]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// ─── Player mesh ──────────────────────────────────────────────────────────────
export function PlayerMesh({ player }: Props) {
  const groupRef  = useRef<THREE.Group>(null)
  const legLRef   = useRef<THREE.Mesh>(null)
  const legRRef   = useRef<THREE.Mesh>(null)
  const armLRef   = useRef<THREE.Mesh>(null)
  const armRRef   = useRef<THREE.Mesh>(null)

  const color = useMemo(() => new THREE.Color(player.color), [player.color])

  useFrame(({ clock }) => {
    if (!groupRef.current) return

    // World position from spline
    const pos = getPathPosition(player.pathT, player.side, player.yPos, LANE_WIDTH)
    const yaw = getPathYaw(player.pathT)

    groupRef.current.position.copy(pos)
    groupRef.current.rotation.y = yaw

    // Walk cycle
    const t = clock.getElapsedTime() * 6
    const swing = player.alive && !player.isJumping ? Math.sin(t) * 0.35 : 0
    if (legLRef.current)  legLRef.current.rotation.x  =  swing
    if (legRRef.current)  legRRef.current.rotation.x  = -swing
    if (armLRef.current)  armLRef.current.rotation.x  = -swing * 0.6
    if (armRRef.current)  armRRef.current.rotation.x  =  swing * 0.6
  })

  const opacity = player.alive ? 1 : 0.25

  return (
    <group ref={groupRef}>
      {/* ── Body ── */}
      <mesh position={[0, PLAYER_HEIGHT * 0.48, 0]} castShadow>
        <boxGeometry args={[0.38, 0.55, 0.22]} />
        <meshLambertMaterial color={color} transparent opacity={opacity} />
      </mesh>

      {/* ── Head ── */}
      <mesh position={[0, PLAYER_HEIGHT * 0.82, 0]} castShadow>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshLambertMaterial color="#f5c5a3" transparent opacity={opacity} />
      </mesh>

      {/* ── Eyes ── */}
      <mesh position={[0.08, PLAYER_HEIGHT * 0.84, 0.21]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshLambertMaterial color="#111" />
      </mesh>
      <mesh position={[-0.08, PLAYER_HEIGHT * 0.84, 0.21]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshLambertMaterial color="#111" />
      </mesh>

      {/* ── Left leg ── */}
      <mesh ref={legLRef} position={[-0.1, PLAYER_HEIGHT * 0.18, 0]} castShadow>
        <boxGeometry args={[0.13, 0.5, 0.13]} />
        <meshLambertMaterial color={color} transparent opacity={opacity} />
      </mesh>

      {/* ── Right leg ── */}
      <mesh ref={legRRef} position={[0.1, PLAYER_HEIGHT * 0.18, 0]} castShadow>
        <boxGeometry args={[0.13, 0.5, 0.13]} />
        <meshLambertMaterial color={color} transparent opacity={opacity} />
      </mesh>

      {/* ── Left arm ── */}
      <mesh ref={armLRef} position={[-0.28, PLAYER_HEIGHT * 0.52, 0]} castShadow>
        <boxGeometry args={[0.11, 0.42, 0.11]} />
        <meshLambertMaterial color={color} transparent opacity={opacity} />
      </mesh>

      {/* ── Right arm (holds gun if chaser) ── */}
      <group ref={armRRef} position={[0.28, PLAYER_HEIGHT * 0.52, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.11, 0.42, 0.11]} />
          <meshLambertMaterial color={color} transparent opacity={opacity} />
        </mesh>
        {player.role === 'chaser' && player.alive && (
          <mesh position={[0.18, -0.08, 0]}>
            <boxGeometry args={[0.35, 0.1, 0.1]} />
            <meshLambertMaterial color="#444" />
          </mesh>
        )}
      </group>

      {/* ── Flag if carrier ── */}
      {player.role === 'carrier' && player.alive && (
        <FlagPole color={player.color} />
      )}

      {/* ── Name label (billboard via sprite) ── */}
      <sprite position={[0, PLAYER_HEIGHT + 0.5, 0]} scale={[1.6, 0.38, 1]}>
        <spriteMaterial color={player.color} opacity={0.85} transparent />
      </sprite>
    </group>
  )
}