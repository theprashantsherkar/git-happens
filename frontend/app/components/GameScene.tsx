'use client'
import { Canvas } from '@react-three/fiber'
import { GameState } from '../hooks/useGameState'
import { SceneLighting } from './SceneLighting'
import { Track } from './Track'
import { PlayerMesh } from './PlayerMesh'
import { BulletMesh } from './BulletMesh'
import { ObstacleMesh } from './ObstacleMesh'
import { CameraRig } from './CameraRig'

type Props = { state: GameState }

export function GameScene({ state }: Props) {
  return (
    <Canvas
      shadows
      style={{ width: '100%', height: '100%' }}
      camera={{ fov: 60, near: 0.1, far: 300 }}
      gl={{ antialias: true }}
    >
      <SceneLighting />
      <Track />

      {/* Players */}
      {state.players.map(p => (
        <PlayerMesh key={p.id} player={p} />
      ))}

      {/* Bullets */}
      <BulletMesh bullets={state.bullets} players={state.players} />

      {/* Obstacles */}
      <ObstacleMesh obstacles={state.obstacles} />

      {/* Camera follows carrier */}
      <CameraRig players={state.players} />
    </Canvas>
  )
}