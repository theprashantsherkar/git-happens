'use client'
import { Bullet, Player } from '../types'

type Props = { bullets: Bullet[]; players: Player[] }

export function BulletMesh({ bullets, players }: Props) {
  return (
    <>
      {bullets.map(b => {
        const owner = players.find(p => p.id === b.ownerId)
        const color = owner?.color ?? '#ffffff'
        return (
          <mesh key={b.id} position={[b.x, 0.8, b.z]}>
            <sphereGeometry args={[0.18, 6, 6]} />
            <meshLambertMaterial color={color} emissive={color} emissiveIntensity={0.8} />
          </mesh>
        )
      })}
    </>
  )
}