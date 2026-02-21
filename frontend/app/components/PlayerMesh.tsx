'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from '../types'

type Props = { player: Player }

function FlagPole() {
  return (
    <group position={[0.3, 1.2, 0]}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 5]} />
        <meshLambertMaterial color="#cccccc" />
      </mesh>
      <mesh position={[0.25, 1.15, 0]}>
        <boxGeometry args={[0.5, 0.28, 0.04]} />
        <meshLambertMaterial color="#dc2626" />
      </mesh>
    </group>
  )
}

export function PlayerMesh({ player }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const legLRef  = useRef<THREE.Mesh>(null)
  const legRRef  = useRef<THREE.Mesh>(null)
  const armLRef  = useRef<THREE.Mesh>(null)
  const armRRef  = useRef<THREE.Mesh>(null)
  const walkRef  = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Smooth position lerp
    const k = 1 - Math.exp(-18 * delta)
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, player.x, k)
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, player.z, k)
    groupRef.current.position.y = player.yPos

    // Smooth rotation lerp — shortest angular path
    let diff = player.angle - groupRef.current.rotation.y
    while (diff >  Math.PI) diff -= 2 * Math.PI
    while (diff < -Math.PI) diff += 2 * Math.PI
    groupRef.current.rotation.y += diff * (1 - Math.exp(-16 * delta))

    // Walk cycle
    if (player.alive) {
      walkRef.current += delta * 8
      const sw = Math.sin(walkRef.current) * 0.4
      if (legLRef.current) legLRef.current.rotation.x =  sw
      if (legRRef.current) legRRef.current.rotation.x = -sw
      if (armLRef.current) armLRef.current.rotation.x = -sw * 0.6
      if (armRRef.current) armRRef.current.rotation.x =  sw * 0.6
    }
  })

  const op = player.alive ? 1 : 0.28

  return (
    <group ref={groupRef} position={[player.x, player.yPos, player.z]}>
      {/* Head */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshLambertMaterial color={player.color} transparent opacity={op} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.42, 0.55, 0.26]} />
        <meshLambertMaterial color={player.color} transparent opacity={op} />
      </mesh>
      {/* Arms */}
      <mesh ref={armLRef} position={[-0.32, 1.1, 0]} castShadow>
        <boxGeometry args={[0.14, 0.44, 0.14]} />
        <meshLambertMaterial color={player.color} transparent opacity={op} />
      </mesh>
      <mesh ref={armRRef} position={[0.32, 1.1, 0]} castShadow>
        <boxGeometry args={[0.14, 0.44, 0.14]} />
        <meshLambertMaterial color={player.color} transparent opacity={op} />
      </mesh>
      {/* Legs */}
      <mesh ref={legLRef} position={[-0.14, 0.52, 0]} castShadow>
        <boxGeometry args={[0.16, 0.5, 0.16]} />
        <meshLambertMaterial color="#1a1a2e" transparent opacity={op} />
      </mesh>
      <mesh ref={legRRef} position={[0.14, 0.52, 0]} castShadow>
        <boxGeometry args={[0.16, 0.5, 0.16]} />
        <meshLambertMaterial color="#1a1a2e" transparent opacity={op} />
      </mesh>
      {/* Flag pole if carrier */}
      {player.role === 'carrier' && <FlagPole />}
      {/* Ground ring indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <ringGeometry args={[0.55, 0.7, 16]} />
        <meshLambertMaterial color={player.color} transparent opacity={0.55} />
      </mesh>
    </group>
  )
}