'use client'

/**
 * PlayerMesh.tsx
 *
 * Renders all players. Each player is a capsule-like body facing their angle.
 *
 * Visual language:
 *  - CARRIER  → flag pole + waving pennant on their back, no gun
 *  - CHASER   → gun barrel extending from right hand
 *  - All players show their colour, name label, and a subtle shadow disc
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from '../types'

type Props = { players: Player[] }

/* ── shared geometries/materials (created once) ── */
const _bodyGeo  = new THREE.CapsuleGeometry(0.45, 0.9, 6, 12)
const _headGeo  = new THREE.SphereGeometry(0.32, 12, 12)
const _gunGeo   = new THREE.BoxGeometry(0.1, 0.1, 0.7)
const _poleGeo  = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6)
const _pennantGeo = new THREE.ConeGeometry(0.28, 0.55, 3)  // triangular flag
const _shadowGeo = new THREE.CircleGeometry(0.55, 16)
const _shadowMat = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.18 })

/* ── aim reticle texture — created lazily on first client render ── */
let _reticleTexture: THREE.CanvasTexture | null = null

function getReticleTexture(): THREE.CanvasTexture {
  if (_reticleTexture) return _reticleTexture

  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2, cy = size / 2, r = 50

  // outer circle
  ctx.strokeStyle = 'rgba(255,60,60,0.92)'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()

  // inner dot
  ctx.fillStyle = 'rgba(255,60,60,0.85)'
  ctx.beginPath()
  ctx.arc(cx, cy, 5, 0, Math.PI * 2)
  ctx.fill()

  // X lines
  const arm = 18
  ctx.strokeStyle = 'rgba(255,60,60,0.92)'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(cx - arm, cy - arm); ctx.lineTo(cx + arm, cy + arm); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx + arm, cy - arm); ctx.lineTo(cx - arm, cy + arm); ctx.stroke()

  // cardinal tick marks
  const tickOuter = r + 10, tickInner = r + 2
  ;([[0,-1],[0,1],[1,0],[-1,0]] as [number,number][]).forEach(([dx, dy]) => {
    ctx.beginPath()
    ctx.moveTo(cx + dx * tickInner, cy + dy * tickInner)
    ctx.lineTo(cx + dx * tickOuter, cy + dy * tickOuter)
    ctx.stroke()
  })

  _reticleTexture = new THREE.CanvasTexture(canvas)
  _reticleTexture.needsUpdate = true
  return _reticleTexture
}

const _reticleGeo = new THREE.PlaneGeometry(2.2, 2.2)

/* ── single player ── */
function SinglePlayer({ player }: { player: Player }) {
  const groupRef = useRef<THREE.Group>(null)
  const pennantRef = useRef<THREE.Mesh>(null)

  // Animate flag pennant waving (rotation on Y)
  useFrame(({ clock }) => {
    if (pennantRef.current && player.role === 'carrier') {
      pennantRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 3.5) * 0.35
    }
  })

  if (!player.alive) return null

  const bodyColor  = player.color
  const isCarrier  = player.role === 'carrier'

  return (
    <group
      ref={groupRef}
      position={[player.x, player.yPos, player.z]}
      rotation={[0, player.angle, 0]}
    >
      {/* Shadow disc on ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -player.yPos + 0.02, 0]}
        geometry={_shadowGeo}
        material={_shadowMat}
      />

      {/* Body */}
      <mesh position={[0, 1.05, 0]} geometry={_bodyGeo} castShadow>
        <meshLambertMaterial color={bodyColor} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.85, 0]} geometry={_headGeo} castShadow>
        <meshLambertMaterial color={bodyColor} />
      </mesh>

      {/* Eyes — two tiny white spheres so you can tell which way they face */}
      <mesh position={[0.13, 1.92, 0.28]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[-0.13, 1.92, 0.28]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[0.13, 1.92, 0.31]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[-0.13, 1.92, 0.31]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color="#111" />
      </mesh>

      {/* ── GUN (chasers only) ── */}
      {!isCarrier && (
        <group position={[0.5, 1.1, 0.2]}>
          {/* barrel */}
          <mesh geometry={_gunGeo} castShadow>
            <meshLambertMaterial color="#222" />
          </mesh>
          {/* grip */}
          <mesh position={[0, -0.1, -0.15]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.1, 0.25, 0.1]} />
            <meshLambertMaterial color="#333" />
          </mesh>
          {/* muzzle tip accent */}
          <mesh position={[0, 0, 0.38]}>
            <cylinderGeometry args={[0.055, 0.055, 0.06, 8]} />
            <meshLambertMaterial color="#555" />
          </mesh>
        </group>
      )}

      {/* ── AIM RETICLE — floats in front of chasers at gun height ── */}
      {!isCarrier && (
        <mesh
          position={[0, 1.1, 5]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={_reticleGeo}
        >
          <meshBasicMaterial
            map={getReticleTexture()}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* ── FLAG POLE + PENNANT (carrier only) ── */}
      {isCarrier && (
        <group position={[-0.3, 1.0, -0.2]}>
          {/* pole */}
          <mesh position={[0, 0.7, 0]} geometry={_poleGeo} castShadow>
            <meshLambertMaterial color="#c8a96e" />
          </mesh>
          {/* pennant — rotated so the point faces forward */}
          <mesh
            ref={pennantRef}
            position={[0, 1.55, 0.18]}
            rotation={[Math.PI / 2, 0, 0]}
            geometry={_pennantGeo}
            castShadow
          >
            <meshLambertMaterial color="#ffd700" side={THREE.DoubleSide} />
          </mesh>
          {/* small star on top of pole */}
          <mesh position={[0, 1.45, 0]}>
            <octahedronGeometry args={[0.1]} />
            <meshBasicMaterial color="#ffe066" />
          </mesh>
        </group>
      )}

      {/* Name label — billboard text via a thin plane with canvas texture */}
      <NameLabel name={player.name} color={bodyColor} isCarrier={isCarrier} />
    </group>
  )
}

/* ── Canvas-based name label ── */
function NameLabel({
  name,
  color,
  isCarrier,
}: {
  name: string
  color: string
  isCarrier: boolean
}) {
  // Build texture once per player (stable ref, colour doesn't change mid-game)
  const texture = useRef<THREE.CanvasTexture | null>(null)

  if (!texture.current) {
    const canvas  = document.createElement('canvas')
    canvas.width  = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, 256, 64)

    // Background pill
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.beginPath()
    ctx.roundRect(4, 8, 248, 48, 12)
    ctx.fill()

    // Colour accent strip
    ctx.fillStyle = color
    ctx.fillRect(4, 8, 6, 48)

    // Text
    ctx.fillStyle = '#ffffff'
    ctx.font      = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(name, 132, 32)

    texture.current = new THREE.CanvasTexture(canvas)
  }

  return (
    <mesh position={[0, 2.45, 0]} rotation={[0, Math.PI, 0]}>
      <planeGeometry args={[1.4, 0.35]} />
      <meshBasicMaterial
        map={texture.current}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/* ── Bullet visual ── */
export function BulletMesh({ bullets }: { bullets: { id: number; x: number; z: number; vx: number; vz: number }[] }) {
  if (!bullets?.length) return null
  return (
    <>
      {bullets.map(b => {
        // Point bullet along its velocity
        const angle = Math.atan2(b.vx, b.vz)
        return (
          <mesh key={b.id} position={[b.x, 0.6, b.z]} rotation={[0, angle, 0]} castShadow>
            <capsuleGeometry args={[0.07, 0.35, 4, 8]} />
            <meshBasicMaterial color="#ffe44d" />
          </mesh>
        )
      })}
    </>
  )
}

/* ── Main export ── */
export function PlayerMesh({ players }: Props) {
  if (!players?.length) return null
  return (
    <>
      {players.map(p => (
        <SinglePlayer key={p.id} player={p} />
      ))}
    </>
  )
}