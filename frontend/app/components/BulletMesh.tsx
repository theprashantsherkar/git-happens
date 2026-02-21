'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Bullet } from '../types'
import { SIDE_OFFSET } from '../constants'
import { getPathPosition } from '../utils/path'

export function BulletMesh({ bullet, shooterColor }: { bullet: Bullet; shooterColor: string }) {
  const trailRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (trailRef.current) {
      trailRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.3
    }
  })

  const pos = getPathPosition(bullet.pathT, bullet.side, 0.9, SIDE_OFFSET)

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      <mesh castShadow>
        <sphereGeometry args={[0.13, 8, 8]} />
        <meshStandardMaterial color={shooterColor} emissive={shooterColor} emissiveIntensity={3} />
      </mesh>
      <mesh ref={trailRef} position={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.04, 0.01, 0.7, 6]} />
        <meshStandardMaterial color={shooterColor} emissive={shooterColor} emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}