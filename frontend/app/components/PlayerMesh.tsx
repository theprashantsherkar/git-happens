'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from '../types'

type Props = { players: Player[] }

/* ── shared geometries/materials (safe at top level) ── */
const _bodyGeo = new THREE.CapsuleGeometry(0.45, 0.9, 6, 12)
const _headGeo = new THREE.SphereGeometry(0.32, 12, 12)
const _gunGeo = new THREE.BoxGeometry(0.1, 0.1, 0.7)
const _poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6)
const _pennantGeo = new THREE.ConeGeometry(0.28, 0.55, 3)
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
  const pennantRef = useRef<THREE.Mesh>(null)

  // ✅ Safe reticle material (client-only)
  const reticleMaterial = useMemo(() => {
    if (typeof document === 'undefined') return null

    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const cx = size / 2
    const cy = size / 2
    const r = 50

    ctx.strokeStyle = 'rgba(255,60,60,0.92)'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,60,60,0.85)'
    ctx.beginPath()
    ctx.arc(cx, cy, 5, 0, Math.PI * 2)
    ctx.fill()

    const arm = 18
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(cx - arm, cy - arm); ctx.lineTo(cx + arm, cy + arm); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx + arm, cy - arm); ctx.lineTo(cx - arm, cy + arm); ctx.stroke()

    const tickOuter = r + 10
    const tickInner = r + 2
      ;[[0, -1], [0, 1], [1, 0], [-1, 0]].forEach(([dx, dy]) => {
        ctx.beginPath()
        ctx.moveTo(cx + dx * tickInner, cy + dy * tickInner)
        ctx.lineTo(cx + dx * tickOuter, cy + dy * tickOuter)
        ctx.stroke()
      })

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  }, [])

  useFrame(({ clock }) => {
    if (pennantRef.current && player.role === 'carrier') {
      pennantRef.current.rotation.y =
        Math.sin(clock.getElapsedTime() * 3.5) * 0.35
    }
  })

  if (!player.alive) return null

  const isCarrier = player.role === 'carrier'

  return (
    <group
      position={[player.x, player.yPos, player.z]}
      rotation={[0, player.angle, 0]}
    >
      {/* Shadow */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -player.yPos + 0.02, 0]}
        geometry={_shadowGeo}
        material={_shadowMat}
      />

      {/* Body */}
      <mesh position={[0, 1.05, 0]} geometry={_bodyGeo} castShadow>
        <meshLambertMaterial color={player.color} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.85, 0]} geometry={_headGeo} castShadow>
        <meshLambertMaterial color={player.color} />
      </mesh>

      {/* Gun */}
      {!isCarrier && (
        <group position={[0.5, 1.1, 0.2]}>
          <mesh geometry={_gunGeo} castShadow>
            <meshLambertMaterial color="#222" />
          </mesh>
        </group>
      )}

      {/* Reticle */}
      {!isCarrier && reticleMaterial && (
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

      {/* Carrier Flag */}
      {isCarrier && (
        <group position={[-0.3, 1.0, -0.2]}>
          <mesh position={[0, 0.7, 0]} geometry={_poleGeo} castShadow>
            <meshLambertMaterial color="#c8a96e" />
          </mesh>
          <mesh
            ref={pennantRef}
            position={[0, 1.55, 0.18]}
            rotation={[Math.PI / 2, 0, 0]}
            geometry={_pennantGeo}
            castShadow
          >
            <meshLambertMaterial color="#ffd700" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  )
}

/* ── BulletMesh (UNCHANGED & PRESERVED) ── */
export function BulletMesh({
  bullets
}: {
  bullets: { id: number; x: number; z: number; vx: number; vz: number }[]
}) {
  if (!bullets?.length) return null

  return (
    <>
      {bullets.map(b => {
        const angle = Math.atan2(b.vx, b.vz)
        return (
          <mesh
            key={b.id}
            position={[b.x, 0.6, b.z]}
            rotation={[0, angle, 0]}
            castShadow
          >
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