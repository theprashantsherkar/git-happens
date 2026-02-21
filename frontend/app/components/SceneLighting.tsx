'use client'

import * as THREE from 'three'
import { Player } from '../types'
import { SIDE_OFFSET } from '../constants'
import { getPathPosition } from '../utils/path'

export function SceneLighting({ carrier }: { carrier: Player | undefined }) {
  const carrierPos = carrier
    ? getPathPosition(carrier.pathT, carrier.side, 0, SIDE_OFFSET)
    : new THREE.Vector3(0, 0, 0)

  return (
    <>
      <ambientLight intensity={0.55} color="#b8d4ff" />
      <directionalLight
        position={[20, 35, 20]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        color="#fff8e0"
      />
      {/* Fill light from opposite side */}
      <directionalLight position={[-15, 20, -20]} intensity={0.4} color="#9090ff" />

      {/* Carrier spotlight */}
      {carrier && carrier.alive && (
        <pointLight
          position={[carrierPos.x, carrierPos.y + 6, carrierPos.z]}
          intensity={2}
          color="#FFD700"
          distance={10}
        />
      )}

      {/* Atmospheric fog matching the purple swamp */}
      <fog attach="fog" args={['#2a1450', 50, 120]} />
    </>
  )
}