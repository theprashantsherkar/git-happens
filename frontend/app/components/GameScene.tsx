'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { GameState } from '../hooks/useGameState'
import { PlayerMesh } from './PlayerMesh'
import { ObstacleMesh } from './ObstacleMesh'
import { BulletMesh } from './BulletMesh'
import { Track } from './Track'
import { CameraRig } from './CameraRig'
import { SceneLighting } from './SceneLighting'

type Props = { state: GameState }

export function GameScene({ state }: Props) {
  const carrier = state.players.find(p => p.role === 'carrier' && p.alive)
  const colorMap = Object.fromEntries(state.players.map(p => [p.id, p.color]))

  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ fov: 55, near: 0.1, far: 300 }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#1a0a30']} />

      <CameraRig carrier={carrier} />
      <SceneLighting carrier={carrier} />

      <Suspense fallback={null}>
        <Track />

        {state.obstacles.map(obs => (
          <ObstacleMesh key={obs.id} obstacle={obs} />
        ))}

        {state.players.map(p => (
          <PlayerMesh key={p.id} player={p} />
        ))}

        {state.bullets.map(b => (
          <BulletMesh key={b.id} bullet={b} shooterColor={colorMap[b.ownerId] ?? '#FF6600'} />
        ))}
      </Suspense>
    </Canvas>
  )
}