'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

const HALF_MAP = 75
const WALL_H = 4.0
const WALL_T = 1.5

/* ─── Ground Plane ─── */
function GroundPlane() {
  return (
    <group>
      {/* Primary Grass Turf */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[HALF_MAP * 2, HALF_MAP * 2]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>
      {/* Grid Pattern */}
      <gridHelper args={[HALF_MAP * 2, 30, '#81c784', '#4caf50']} position={[0, 0.01, 0]} />
    </group>
  )
}

/* ─── Boundary Wall ─── */
function BoundaryWall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, size[1] / 2, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#795548" roughness={0.7} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, size[1] + 0.1, 0]} castShadow>
        <boxGeometry args={[size[0] + 0.2, 0.2, size[2] + 0.2]} />
        <meshStandardMaterial color="#d7ccc8" roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ─── Corner Pillars ─── */
function CornerPillar({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], (WALL_H + 0.5) / 2, position[2]]} castShadow receiveShadow>
      <boxGeometry args={[WALL_T * 1.5, WALL_H + 0.5, WALL_T * 1.5]} />
      <meshStandardMaterial color="#5d4037" roughness={0.6} />
    </mesh>
  )
}

/* ─── River ─── */
function River() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 20]}>
      <planeGeometry args={[130, 8]} />
      <meshStandardMaterial color="#0288d1" roughness={0.2} transparent opacity={0.85} />
    </mesh>
  )
}

/* ─── Scenery Trees ─── */
function SceneryTrees() {
  const trees = useMemo(() => {
    const t: { x: number; z: number; scale: number }[] = []
    const coords = [
      [-40, 40], [40, 40], [-40, -40], [40, -40],
      [-50, 10], [50, 10], [-50, -10], [50, -10],
      [-20, 50], [20, 50], [-20, -50], [20, -50],
      [-60, 30], [60, 30], [-60, -30], [60, -30],
    ]
    coords.forEach(([x, z], i) => {
      t.push({ x, z, scale: 0.9 + (i % 3) * 0.2 })
    })
    return t
  }, [])

  return (
    <group>
      {trees.map((tr, i) => (
        <group key={i} position={[tr.x, 0, tr.z]} scale={tr.scale}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 1.6, 8]} />
            <meshStandardMaterial color="#5d4037" />
          </mesh>
          <mesh position={[0, 2.1, 0]} castShadow>
            <sphereGeometry args={[1.2, 12, 12]} />
            <meshStandardMaterial color="#1b5e20" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ─── Rocks ─── */
function Rocks() {
  const rocks = useMemo(() => {
    return [
      { x: -15, z:  15, scale: 1.2 },
      { x:  15, z: -15, scale: 1.2 },
      { x: -30, z:   0, scale: 1.5 },
      { x:  30, z:   0, scale: 1.5 },
      { x:   0, z: -35, scale: 1.1 },
    ]
  }, [])

  return (
    <group>
      {rocks.map((rock, i) => (
        <mesh key={i} position={[rock.x, 0.5, rock.z]} scale={rock.scale} castShadow>
          <dodecahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#616161" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

/* ─── Flag Spawn Ring ─── */
function FlagSpawnMarker() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <ringGeometry args={[2.0, 2.5, 32]} />
      <meshStandardMaterial color="#ffd700" roughness={0.3} transparent opacity={0.8} />
    </mesh>
  )
}

/* ─── MAIN EXPORT ─── */
export function Track() {
  const W = HALF_MAP

  return (
    <group>
      <GroundPlane />
      <River />
      <SceneryTrees />
      <Rocks />
      <FlagSpawnMarker />

      {/* Four Arena Walls */}
      <BoundaryWall position={[0, 0, W]} size={[W * 2, WALL_H, WALL_T]} />
      <BoundaryWall position={[0, 0, -W]} size={[W * 2, WALL_H, WALL_T]} />
      <BoundaryWall position={[W, 0, 0]} size={[WALL_T, WALL_H, W * 2]} />
      <BoundaryWall position={[-W, 0, 0]} size={[WALL_T, WALL_H, W * 2]} />

      {/* Corner Pillars */}
      <CornerPillar position={[W, 0, W]} />
      <CornerPillar position={[W, 0, -W]} />
      <CornerPillar position={[-W, 0, W]} />
      <CornerPillar position={[-W, 0, -W]} />
    </group>
  )
}