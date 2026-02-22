'use client'

import { Obstacle } from '../types'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

type Props = { obstacles: Obstacle[] }

/* ============================
   🌳 TREE (SOLID)
============================ */
function TreeObstacle() {
  return (
    <group>
      {/* Trunk */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.4, 6]} />
        <meshLambertMaterial color="#6B4226" />
      </mesh>

      {/* Leaves */}
      <mesh position={[0, 2.1, 0]} castShadow>
        <coneGeometry args={[0.9, 1.9, 7]} />
        <meshLambertMaterial color="#145214" />
      </mesh>
    </group>
  )
}

/* ============================
   🪨 ROCK
============================ */
function RockObstacle() {
  return (
    <mesh position={[0, 0.4, 0]} castShadow>
      <dodecahedronGeometry args={[0.6]} />
      <meshLambertMaterial color="#7d7d7d" />
    </mesh>
  )
}

/* ============================
   🪵 LOG
============================ */
function LogObstacle() {
  return (
    <mesh
      position={[0, 0.25, 0]}
      rotation={[0, 0, Math.PI / 2]}
      castShadow
    >
      <cylinderGeometry args={[0.25, 0.25, 1.6, 8]} />
      <meshLambertMaterial color="#8B5A2B" />
    </mesh>
  )
}

/* ============================
   🛢 BARREL
============================ */
function BarrelObstacle() {
  return (
    <mesh position={[0, 0.5, 0]} castShadow>
      <cylinderGeometry args={[0.3, 0.3, 1.0, 10]} />
      <meshLambertMaterial color="#c0392b" />
    </mesh>
  )
}

/* ============================
   🌊 RIVER
============================ */
function RiverObstacle() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]}
      receiveShadow
    >
      <planeGeometry args={[4, 8]} />
      <meshLambertMaterial
        color="#1e90ff"
        transparent
        opacity={0.75}
      />
    </mesh>
  )
}

/* ============================
   🐦 FLYING BIRDS
============================ */
function FlyingBirds() {
  const group = useRef<THREE.Group>(null)

  const birds = useMemo(() => {
    return new Array(6).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 100,
      y: 15 + Math.random() * 10,
      z: (Math.random() - 0.5) * 100,
    }))
  }, [])

  useFrame((_, delta) => {
    if (group.current) {
      group.current.position.x += delta * 5

      // Reset when too far
      if (group.current.position.x > 150) {
        group.current.position.x = -150
      }
    }
  })

  return (
    <group ref={group}>
      {birds.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]}>
          <coneGeometry args={[0.3, 0.8, 3]} />
          <meshBasicMaterial color="black" />
        </mesh>
      ))}
    </group>
  )
}

/* ============================
   MAIN EXPORT
============================ */
export function ObstacleMesh({ obstacles }: Props) {
  return (
    <>
      <FlyingBirds />

      {obstacles.map(obs => (
        <group key={obs.id} position={[obs.x, 0, obs.z]}>
          {obs.type === 'tree' && <TreeObstacle />}
          {obs.type === 'rock' && <RockObstacle />}
          {obs.type === 'log' && <LogObstacle />}
          {obs.type === 'barrel' && <BarrelObstacle />}
          {obs.type === 'river' && <RiverObstacle />}
        </group>
      ))}
    </>
  )
}