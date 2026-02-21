'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { Player } from '../types'
import { SIDE_OFFSET } from '../constants'
import { getPathPosition, getPathYaw } from '../utils/path'

type Props = { player: Player }

export function PlayerMesh({ player }: Props) {
  const groupRef = useRef<THREE.Group>(null!)
  const legLRef = useRef<THREE.Mesh>(null!)
  const legRRef = useRef<THREE.Mesh>(null!)
  const t = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    if (!player.alive || !groupRef.current) return
    t.current += delta * 7

    // Leg animation
    if (legLRef.current) legLRef.current.rotation.x = Math.sin(t.current) * 0.55
    if (legRRef.current) legRRef.current.rotation.x = -Math.sin(t.current) * 0.55

    // Compute world position from path
    const worldPos = getPathPosition(player.pathT, player.side, player.yPos, SIDE_OFFSET)
    const yaw = getPathYaw(player.pathT)

    groupRef.current.position.lerp(worldPos, 0.22)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      yaw + Math.PI,
      0.18
    )
  })

  if (!player.alive) return null

  const isCarrier = player.role === 'carrier'
  const ei = isCarrier ? 0.6 : 0.1

  // Initial position
  const initPos = getPathPosition(player.pathT, player.side, player.yPos, SIDE_OFFSET)

  return (
    <group ref={groupRef} position={initPos}>
      {/* Shadow */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -player.yPos + 0.02, 0]} scale={[1, 0.6, 1]}>
        <circleGeometry args={[0.32, 10]} />
        <meshBasicMaterial color="black" transparent opacity={0.28 - player.yPos * 0.04} />
      </mesh>

      {/* Body */}
      <mesh castShadow position={[0, 0.82, 0]}>
        <capsuleGeometry args={[0.27, 0.5, 8, 16]} />
        <meshStandardMaterial color={player.color} emissive={player.color} emissiveIntensity={ei} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.21, 16, 16]} />
        <meshStandardMaterial color={player.color} emissive={player.color} emissiveIntensity={ei * 0.6} roughness={0.4} />
      </mesh>

      {/* Eyes */}
      {[-0.09, 0.09].map((x, i) => (
        <mesh key={i} position={[x, 1.55, 0.19]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.9} />
        </mesh>
      ))}

      {/* Legs */}
      <mesh ref={legLRef} castShadow position={[-0.12, 0.28, 0]}>
        <capsuleGeometry args={[0.09, 0.4, 6, 8]} />
        <meshStandardMaterial color={player.color} roughness={0.6} />
      </mesh>
      <mesh ref={legRRef} castShadow position={[0.12, 0.28, 0]}>
        <capsuleGeometry args={[0.09, 0.4, 6, 8]} />
        <meshStandardMaterial color={player.color} roughness={0.6} />
      </mesh>

      {/* Flag pole (carrier) */}
      {isCarrier && (
        <group position={[0.32, 1.0, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.1, 6]} />
            <meshStandardMaterial color="#CCC" metalness={0.8} />
          </mesh>
          <mesh position={[0.27, 0.95, 0]}>
            <planeGeometry args={[0.5, 0.32]} />
            <meshStandardMaterial color="#FFD700" side={THREE.DoubleSide} emissive="#FFD700" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      {/* Weapon (chasers) */}
      {!isCarrier && (
        <mesh position={[0.36, 0.82, 0.08]} rotation={[0, 0, -0.35]}>
          <boxGeometry args={[0.46, 0.09, 0.07]} />
          <meshStandardMaterial color="#FF6600" emissive="#FF3300" emissiveIntensity={0.4} metalness={0.85} />
        </mesh>
      )}

      {/* Crown (carrier) */}
      {isCarrier && (
        <mesh position={[0, 1.78, 0]}>
          <coneGeometry args={[0.14, 0.22, 5]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1.2} />
        </mesh>
      )}

      {/* Name tag */}
      <Billboard position={[0, 2.1, 0]}>
        <Text fontSize={0.26} color={player.color} anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="black">
          {player.name}
        </Text>
      </Billboard>
    </group>
  )
}