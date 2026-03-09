'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ServerPlayer } from '../hooks/useGameState'

type Props = { players: ServerPlayer[]; myPlayerId?: string | null }

const SLOT_COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#EAB308']

function getColor(p: ServerPlayer) {
  return SLOT_COLORS[p.playerIndex ?? 0] ?? '#ffffff'
}

/* ── shared geometries ── */
const _bodyGeo    = new THREE.CapsuleGeometry(0.45, 0.9, 6, 12)
const _headGeo    = new THREE.SphereGeometry(0.32, 12, 12)
const _gunGeo     = new THREE.BoxGeometry(0.1, 0.1, 0.7)
const _poleGeo    = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6)
const _pennantGeo = new THREE.ConeGeometry(0.28, 0.55, 3)
const _shadowGeo  = new THREE.CircleGeometry(0.55, 16)
const _shadowMat  = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.18 })
const _reticleGeo = new THREE.PlaneGeometry(2.2, 2.2)

let _reticleTexture: THREE.CanvasTexture | null = null
function getReticleTexture(): THREE.CanvasTexture {
  if (_reticleTexture) return _reticleTexture
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2, cy = size / 2, r = 50
  ctx.strokeStyle = 'rgba(255,60,60,0.92)'; ctx.lineWidth = 5
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = 'rgba(255,60,60,0.85)'
  ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill()
  const arm = 18
  ctx.strokeStyle = 'rgba(255,60,60,0.92)'; ctx.lineWidth = 4; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(cx - arm, cy - arm); ctx.lineTo(cx + arm, cy + arm); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx + arm, cy - arm); ctx.lineTo(cx - arm, cy + arm); ctx.stroke()
  const tickOuter = r + 10, tickInner = r + 2
  ;([[0,-1],[0,1],[1,0],[-1,0]] as [number,number][]).forEach(([dx, dy]) => {
    ctx.beginPath(); ctx.moveTo(cx + dx * tickInner, cy + dy * tickInner)
    ctx.lineTo(cx + dx * tickOuter, cy + dy * tickOuter); ctx.stroke()
  })
  _reticleTexture = new THREE.CanvasTexture(canvas)
  _reticleTexture.needsUpdate = true
  return _reticleTexture
}

/* ── Name label ── */
function NameLabel({ name, color, isCarrier }: { name: string; color: string; isCarrier: boolean }) {
  const texture = useRef<THREE.CanvasTexture | null>(null)
  if (!texture.current) {
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 256, 64)
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.beginPath(); ctx.roundRect(4, 8, 248, 48, 12); ctx.fill()
    ctx.fillStyle = color; ctx.fillRect(4, 8, 6, 48)
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(name, 132, 32)
    texture.current = new THREE.CanvasTexture(canvas)
  }
  return (
    <mesh position={[0, 2.45, 0]} rotation={[0, Math.PI, 0]}>
      <planeGeometry args={[1.4, 0.35]} />
      <meshBasicMaterial map={texture.current} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

/* ── Single player ── */
function SinglePlayer({ player }: { player: ServerPlayer }) {
  const pennantRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (pennantRef.current && player.hasFlag) {
      pennantRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 3.5) * 0.35
    }
  })

  // server uses x/y for position, y is the horizontal plane axis (mapped to Z in Three.js)
  if (!player.isAlive) return null

  const color     = getColor(player)
  const isCarrier = player.hasFlag

  return (
    <group position={[player.x, 0, player.y]} rotation={[0, player.angle ?? 0, 0]}>
      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} geometry={_shadowGeo} material={_shadowMat} />

      {/* Body */}
      <mesh position={[0, 1.05, 0]} geometry={_bodyGeo} castShadow>
        <meshLambertMaterial color={color} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.85, 0]} geometry={_headGeo} castShadow>
        <meshLambertMaterial color={color} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.13, 1.92, 0.28]}><sphereGeometry args={[0.07, 6, 6]} /><meshBasicMaterial color="white" /></mesh>
      <mesh position={[-0.13, 1.92, 0.28]}><sphereGeometry args={[0.07, 6, 6]} /><meshBasicMaterial color="white" /></mesh>
      <mesh position={[0.13, 1.92, 0.31]}><sphereGeometry args={[0.04, 6, 6]} /><meshBasicMaterial color="#111" /></mesh>
      <mesh position={[-0.13, 1.92, 0.31]}><sphereGeometry args={[0.04, 6, 6]} /><meshBasicMaterial color="#111" /></mesh>

      {/* Gun — chasers (no flag, has weapon) */}
      {!isCarrier && player.hasWeapon && (
        <group position={[0.5, 1.1, 0.2]}>
          <mesh geometry={_gunGeo} castShadow><meshLambertMaterial color="#222" /></mesh>
          <mesh position={[0, -0.1, -0.15]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.1, 0.25, 0.1]} /><meshLambertMaterial color="#333" />
          </mesh>
          <mesh position={[0, 0, 0.38]}>
            <cylinderGeometry args={[0.055, 0.055, 0.06, 8]} /><meshLambertMaterial color="#555" />
          </mesh>
        </group>
      )}

      {/* Reticle */}
      {!isCarrier && player.hasWeapon && (
        <mesh position={[0, 1.1, 5]} rotation={[-Math.PI / 2, 0, 0]} geometry={_reticleGeo}>
          <meshBasicMaterial map={getReticleTexture()} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Flag pole + pennant — carrier */}
      {isCarrier && (
        <group position={[-0.3, 1.0, -0.2]}>
          <mesh position={[0, 0.7, 0]} geometry={_poleGeo} castShadow>
            <meshLambertMaterial color="#c8a96e" />
          </mesh>
          <mesh ref={pennantRef} position={[0, 1.55, 0.18]} rotation={[Math.PI / 2, 0, 0]} geometry={_pennantGeo} castShadow>
            <meshLambertMaterial color="#ffd700" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 1.45, 0]}>
            <octahedronGeometry args={[0.1]} /><meshBasicMaterial color="#ffe066" />
          </mesh>
        </group>
      )}

      <NameLabel name={player.username} color={color} isCarrier={isCarrier} />
    </group>
  )
}

/* ── Bullet mesh ── */
export function BulletMesh({ bullets }: { bullets: { id: number; x: number; y: number; vx: number; vy: number }[] }) {
  if (!bullets?.length) return null
  return (
    <>
      {bullets.map(b => (
        <mesh key={b.id} position={[b.x, 0.8, b.y]}>
          <sphereGeometry args={[0.18, 6, 6]} />
          <meshBasicMaterial color="#ffe44d" />
        </mesh>
      ))}
    </>
  )
}

/* ── Main export ── */
export function PlayerMesh({ players, myPlayerId }: Props) {
  if (!players?.length) return null
  return (
    <>
      {players.map(p => <SinglePlayer key={p.id} player={p} />)}
    </>
  )
}