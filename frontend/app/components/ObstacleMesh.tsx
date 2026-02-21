'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Obstacle } from '../types'
import { SIDE_OFFSET } from '../constants'
import { getPathPosition } from '../utils/path'

function TreeObs() {
  return (
    <group>
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.18, 0.26, 2.4, 7]} />
        <meshStandardMaterial color="#5C3D1E" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 2.8, 0]}>
        <coneGeometry args={[1.0, 2.2, 7]} />
        <meshStandardMaterial color="#1A5C2A" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 3.8, 0]}>
        <coneGeometry args={[0.7, 1.6, 7]} />
        <meshStandardMaterial color="#236B33" roughness={0.8} />
      </mesh>
    </group>
  )
}

function RockObs() {
  return (
    <mesh castShadow position={[0, 0.5, 0]}>
      <dodecahedronGeometry args={[0.75, 0]} />
      <meshStandardMaterial color="#5A5A5A" roughness={0.95} />
    </mesh>
  )
}

function LogObs() {
  return (
    <mesh castShadow position={[0, 0.3, 0]} rotation={[0, Math.PI * 0.3, Math.PI / 2]}>
      <cylinderGeometry args={[0.32, 0.32, 2.2, 10]} />
      <meshStandardMaterial color="#6B4226" roughness={0.9} />
    </mesh>
  )
}

function BarrelObs() {
  return (
    <group>
      <mesh castShadow position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.95, 12]} />
        <meshStandardMaterial color="#CC4400" roughness={0.6} metalness={0.3} />
      </mesh>
      {[0.14, -0.14].map((y, i) => (
        <mesh key={i} position={[0, 0.48 + y, 0]}>
          <torusGeometry args={[0.39, 0.04, 6, 16]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export function ObstacleMesh({ obstacle }: { obstacle: Obstacle }) {
  const pos = getPathPosition(obstacle.pathT, obstacle.side, 0, SIDE_OFFSET)
  return (
    <group position={[pos.x, pos.y, pos.z]}>
      {obstacle.type === 'tree'   && <TreeObs />}
      {obstacle.type === 'rock'   && <RockObs />}
      {obstacle.type === 'log'    && <LogObs />}
      {obstacle.type === 'barrel' && <BarrelObs />}
    </group>
  )
}