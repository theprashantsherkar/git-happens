'use client'
import React from 'react'
import { Obstacle } from '../types'
import { getPathPosition, getPathYaw } from '../utils/path'
import { LANE_WIDTH } from '../constants'

type Props = { obstacles: Obstacle[] }

function TreeObstacle() {
  return (
    <group>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1.4, 6]} />
        <meshLambertMaterial color="#6B4226" />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <coneGeometry args={[0.75, 1.6, 7]} />
        <meshLambertMaterial color="#166534" />
      </mesh>
    </group>
  )
}

function RockObstacle() {
  return (
    <mesh position={[0, 0.35, 0]} castShadow>
      <dodecahedronGeometry args={[0.55, 0]} />
      <meshLambertMaterial color="#7a7a7a" />
    </mesh>
  )
}

function LogObstacle() {
  return (
    <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.25, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.22, 1.2, 8]} />
      <meshLambertMaterial color="#8B5E3C" />
    </mesh>
  )
}

function BarrelObstacle() {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.9, 10]} />
        <meshLambertMaterial color="#c0392b" />
      </mesh>
      {/* Stripe */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.285, 0.285, 0.12, 10]} />
        <meshLambertMaterial color="#f1c40f" />
      </mesh>
    </group>
  )
}

const OBSTACLE_MAP: Record<string, () => React.ReactElement> = {
  tree:   () => <TreeObstacle />,
  rock:   () => <RockObstacle />,
  log:    () => <LogObstacle />,
  barrel: () => <BarrelObstacle />,
}

function SingleObstacle({ obstacle }: { obstacle: Obstacle }) {
  const pos = getPathPosition(obstacle.pathT, obstacle.side, 0, LANE_WIDTH)
  const yaw = getPathYaw(obstacle.pathT)
  const Model = OBSTACLE_MAP[obstacle.type] ?? (() => <RockObstacle />)

  return (
    <group position={pos} rotation={[0, yaw, 0]}>
      <Model />
    </group>
  )
}

export function ObstacleMesh({ obstacles }: Props) {
  return (
    <>
      {obstacles.map(o => (
        <SingleObstacle key={o.id} obstacle={o} />
      ))}
    </>
  )
}