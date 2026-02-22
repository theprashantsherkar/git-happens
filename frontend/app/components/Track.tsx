'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

/* ─── constants ─────────────────────────────────────────── */
const WALL_HALF  = 80      // matches WORLD_SIZE in useGameState
const WALL_H     = 3.5     // ~3-4 "feet" in world units
const WALL_T     = 1.2     // thickness
const BRICK_W    = 2.4
const BRICK_H    = 0.8
const BRICK_D    = WALL_T
const MORTAR     = 0.07

/* ─── colours ───────────────────────────────────────────── */
const BRICK_COLOURS = ['#8b3a2a', '#9b4a38', '#a0522d', '#7a2f1e', '#c1694f']
const MORTAR_COLOR  = '#c8beb0'

/* ──────────────────────────────────────────────────────────
   BrickWall — one straight wall segment
   axis   : 'x' | 'z'  — which axis the wall runs along
   pos    : fixed coordinate on the OTHER axis
   sign   : +1 | -1     — direction wall faces (for mortar shadow)
────────────────────────────────────────────────────────── */
function BrickWall({
  axis,
  pos,
  sign,
}: {
  axis: 'x' | 'z'
  pos: number
  sign: 1 | -1
}) {
  const bricks = useMemo(() => {
    const result: {
      wx: number
      wy: number
      wz: number
      color: string
      key: string
    }[] = []

    const length    = WALL_HALF * 2            // total wall length
    const colCount  = Math.ceil(length / (BRICK_W + MORTAR))
    const rowCount  = Math.ceil(WALL_H / (BRICK_H + MORTAR))

    for (let row = 0; row < rowCount; row++) {
      const offset = (row % 2) * ((BRICK_W + MORTAR) / 2)  // stagger every other row
      const y      = row * (BRICK_H + MORTAR) + BRICK_H / 2

      for (let col = 0; col <= colCount; col++) {
        const along = -WALL_HALF + offset + col * (BRICK_W + MORTAR)
        if (along - BRICK_W / 2 > WALL_HALF) continue  // past edge

        const color = BRICK_COLOURS[Math.floor(Math.random() * BRICK_COLOURS.length)]

        let wx: number, wz: number
        if (axis === 'x') {
          wx = along
          wz = pos
        } else {
          wx = pos
          wz = along
        }

        result.push({ wx, wy: y, wz, color, key: `${row}-${col}` })
      }
    }
    return result
  }, [axis, pos])

  /* base stone footing */
  const footingX = axis === 'x' ? 0 : pos
  const footingZ = axis === 'z' ? 0 : pos
  const footingW = axis === 'x' ? WALL_HALF * 2 : WALL_T + 0.4
  const footingD = axis === 'z' ? WALL_HALF * 2 : WALL_T + 0.4

  return (
    <group>
      {/* stone footing */}
      <mesh position={[footingX, 0.15, footingZ]} castShadow receiveShadow>
        <boxGeometry args={[footingW, 0.3, footingD]} />
        <meshLambertMaterial color="#6b6560" />
      </mesh>

      {/* bricks */}
      {bricks.map(b => (
        <mesh
          key={b.key}
          position={[b.wx, b.wy + 0.3, b.wz]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              axis === 'x' ? BRICK_W : BRICK_D,
              BRICK_H,
              axis === 'z' ? BRICK_W : BRICK_D,
            ]}
          />
          <meshLambertMaterial color={b.color} />
        </mesh>
      ))}
    </group>
  )
}

/* ──────────────────────────────────────────────────────────
   Corner pillars — thicker square posts at each corner
────────────────────────────────────────────────────────── */
function CornerPillar({ x, z }: { x: number; z: number }) {
  const pSize  = WALL_T * 1.6
  const pCount = Math.ceil(WALL_H / (BRICK_H + MORTAR))

  return (
    <group position={[x, 0, z]}>
      {/* footing */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[pSize + 0.4, 0.35, pSize + 0.4]} />
        <meshLambertMaterial color="#5a5550" />
      </mesh>

      {Array.from({ length: pCount }).map((_, row) => {
        const y = row * (BRICK_H + MORTAR) + BRICK_H / 2 + 0.3
        return (
          <mesh key={row} position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[pSize, BRICK_H + 0.04, pSize]} />
            <meshLambertMaterial color={row % 2 === 0 ? '#7a3020' : '#8c4030'} />
          </mesh>
        )
      })}

      {/* cap stone */}
      <mesh position={[0, WALL_H + 0.3 + 0.15, 0]} castShadow>
        <boxGeometry args={[pSize + 0.3, 0.25, pSize + 0.3]} />
        <meshLambertMaterial color="#a09080" />
      </mesh>
    </group>
  )
}

/* ──────────────────────────────────────────────────────────
   Wall cap — flat stone on top of the brick run
────────────────────────────────────────────────────────── */
function WallCap({ axis, pos }: { axis: 'x' | 'z'; pos: number }) {
  const capY  = WALL_H + 0.3 + 0.1
  const capW  = axis === 'x' ? WALL_HALF * 2 : WALL_T + 0.2
  const capD  = axis === 'z' ? WALL_HALF * 2 : WALL_T + 0.2
  const capX  = axis === 'x' ? 0 : pos
  const capZ  = axis === 'z' ? 0 : pos

  return (
    <mesh position={[capX, capY, capZ]} receiveShadow castShadow>
      <boxGeometry args={[capW, 0.2, capD]} />
      <meshLambertMaterial color="#b0a898" />
    </mesh>
  )
}

/* ──────────────────────────────────────────────────────────
   Existing track elements
────────────────────────────────────────────────────────── */
function GroundPlane() {
  // WALL_HALF * 2 = 160 — exactly the playable area
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[WALL_HALF * 2, WALL_HALF * 2]} />
      <meshLambertMaterial color="#2d5a1b" />
    </mesh>
  )
}

function River() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 35]}>
      <planeGeometry args={[200, 12]} />
      <meshLambertMaterial color="#1e4fa3" transparent opacity={0.8} />
    </mesh>
  )
}

function Potholes() {
  const holes = useMemo(() => {
    const h: { x: number; z: number }[] = []
    for (let i = 0; i < 25; i++) {
      const x = (Math.random() - 0.5) * 140
      const z = (Math.random() - 0.5) * 140
      h.push({ x, z })
    }
    return h
  }, [])

  return (
    <>
      {holes.map((p, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[p.x, -0.04, p.z]}>
          <circleGeometry args={[1.2, 20]} />
          <meshLambertMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </>
  )
}

function SceneryTrees() {
  const trees = useMemo(() => {
    const t: { x: number; z: number; scale: number }[] = []
    for (let i = 0; i < 150; i++) {
      const x = (Math.random() - 0.5) * 160
      const z = (Math.random() - 0.5) * 160
      if (Math.abs(x) < 12 && Math.abs(z) < 12) continue
      t.push({ x, z, scale: 0.8 + Math.random() * 0.8 })
    }
    return t
  }, [])

  return (
    <>
      {trees.map((tr, i) => (
        <group key={i} position={[tr.x, 0, tr.z]} scale={tr.scale}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.25, 1.6, 8]} />
            <meshLambertMaterial color="#6B4226" />
          </mesh>
          <mesh position={[0, 2.1, 0]} castShadow>
            <sphereGeometry args={[1.0, 12, 12]} />
            <meshLambertMaterial color="#2e7d32" />
          </mesh>
          <mesh position={[0.5, 2.4, 0.2]} castShadow>
            <sphereGeometry args={[0.8, 12, 12]} />
            <meshLambertMaterial color="#388e3c" />
          </mesh>
          <mesh position={[-0.5, 2.3, -0.2]} castShadow>
            <sphereGeometry args={[0.75, 12, 12]} />
            <meshLambertMaterial color="#2f6d2f" />
          </mesh>
        </group>
      ))}
    </>
  )
}

function Rocks() {
  const rocks = useMemo(() => {
    const r: { x: number; z: number; scale: number }[] = []
    for (let i = 0; i < 40; i++) {
      r.push({
        x: (Math.random() - 0.5) * 160,
        z: (Math.random() - 0.5) * 160,
        scale: 0.6 + Math.random() * 1.2,
      })
    }
    return r
  }, [])

  return (
    <>
      {rocks.map((rock, i) => (
        <mesh key={i} position={[rock.x, 0.4, rock.z]} scale={rock.scale} castShadow>
          <dodecahedronGeometry args={[0.6]} />
          <meshLambertMaterial color="#7a7a7a" />
        </mesh>
      ))}
    </>
  )
}

function Animals() {
  const animals = useMemo(() => {
    const a: { x: number; z: number }[] = []
    for (let i = 0; i < 12; i++) {
      a.push({
        x: (Math.random() - 0.5) * 140,
        z: (Math.random() - 0.5) * 140,
      })
    }
    return a
  }, [])

  return (
    <>
      {animals.map((animal, i) => (
        <mesh key={i} position={[animal.x, 0.5, animal.z]} castShadow>
          <boxGeometry args={[1.2, 0.8, 0.6]} />
          <meshLambertMaterial color="#c2b280" />
        </mesh>
      ))}
    </>
  )
}

function FlagSpawnMarker() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
      <ringGeometry args={[2.0, 2.4, 32]} />
      <meshLambertMaterial color="#ffd700" transparent opacity={0.35} />
    </mesh>
  )
}

/* ──────────────────────────────────────────────────────────
   MAIN EXPORT
────────────────────────────────────────────────────────── */
export function Track() {
  const W = WALL_HALF   // shorthand: 80

  return (
    <group>
      {/* ── ground & scenery ── */}
      <GroundPlane />
      <River />
      <Potholes />
      <SceneryTrees />
      <Rocks />
      <Animals />
      <FlagSpawnMarker />

      {/* ── four brick walls — inner face flush with ±WALL_HALF ── */}
      <BrickWall axis="x" pos={ W + WALL_T / 2} sign={ 1} />
      <BrickWall axis="x" pos={-W - WALL_T / 2} sign={-1} />
      <BrickWall axis="z" pos={ W + WALL_T / 2} sign={ 1} />
      <BrickWall axis="z" pos={-W - WALL_T / 2} sign={-1} />

      {/* ── wall caps ── */}
      <WallCap axis="x" pos={ W + WALL_T / 2} />
      <WallCap axis="x" pos={-W - WALL_T / 2} />
      <WallCap axis="z" pos={ W + WALL_T / 2} />
      <WallCap axis="z" pos={-W - WALL_T / 2} />

      {/* ── corner pillars ── */}
      <CornerPillar x={ W + WALL_T / 2} z={ W + WALL_T / 2} />
      <CornerPillar x={ W + WALL_T / 2} z={-W - WALL_T / 2} />
      <CornerPillar x={-W - WALL_T / 2} z={ W + WALL_T / 2} />
      <CornerPillar x={-W - WALL_T / 2} z={-W - WALL_T / 2} />
    </group>
  )
}