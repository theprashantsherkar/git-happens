'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Bullet, Player } from '../types'
import { getPathPosition } from '../utils/path'
import { LANE_WIDTH } from '../constants'

type Props = {
  bullets: Bullet[]
  players: Player[]
}

export function BulletMesh({ bullets, players }: Props) {
  return (
    <>
      {bullets.map(b => (
        <SingleBullet key={b.id} bullet={b} players={players} />
      ))}
    </>
  )
}

function SingleBullet({ bullet, players }: { bullet: Bullet; players: Player[] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const owner   = players.find(p => p.id === bullet.ownerId)
  const color   = owner ? new THREE.Color(owner.color) : new THREE.Color('#ffffff')

  useFrame(() => {
    if (!meshRef.current) return
    const pos = getPathPosition(bullet.pathT, bullet.side, 0.9, LANE_WIDTH)
    meshRef.current.position.copy(pos)
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.12, 7, 7]} />
      <meshBasicMaterial color={color} />
      {/* Glow sprite behind bullet */}
      <sprite scale={[0.55, 0.55, 1]}>
        <spriteMaterial color={color} opacity={0.45} transparent />
      </sprite>
    </mesh>
  )
}