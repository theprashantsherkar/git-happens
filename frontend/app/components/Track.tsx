'use client'
import { useMemo } from 'react'

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshLambertMaterial color="#2d5a1b" />
    </mesh>
  )
}

function GroundGrid() {
  const lines = useMemo(() => {
    const segs: React.ReactElement[] = []
    for (let i = -80; i <= 80; i += 20) {
      segs.push(
        <mesh key={`h${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, i]}>
          <planeGeometry args={[160, 0.08]} />
          <meshLambertMaterial color="#264d17" transparent opacity={0.5} />
        </mesh>,
        <mesh key={`v${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[i, -0.04, 0]}>
          <planeGeometry args={[0.08, 160]} />
          <meshLambertMaterial color="#264d17" transparent opacity={0.5} />
        </mesh>
      )
    }
    return segs
  }, [])
  return <>{lines}</>
}

function SceneryTrees() {
  const trees = useMemo(() => {
    const t: { x: number; z: number; scale: number }[] = []
    for (let i = 0; i < 120; i++) {
      const seed = i * 7919
      const x = (((seed * 1031) % 160) - 80)
      const z = (((seed * 2053) % 160) - 80)
      if (Math.abs(x) < 10 && Math.abs(z) < 10) continue
      if (Math.abs(Math.abs(x) - 30) < 6 && Math.abs(Math.abs(z) - 30) < 6) continue
      t.push({ x, z, scale: 0.6 + ((seed * 3571) % 10) / 20 })
    }
    return t
  }, [])

  return (
    <>
      {trees.map((tr, i) => (
        <group key={i} position={[tr.x, 0, tr.z]} scale={tr.scale}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 1.4, 6]} />
            <meshLambertMaterial color="#6B4226" />
          </mesh>
          <mesh position={[0, 2.0, 0]} castShadow>
            <coneGeometry args={[0.85, 1.8, 7]} />
            <meshLambertMaterial color="#1a4d1a" />
          </mesh>
          <mesh position={[0, 2.9, 0]} castShadow>
            <coneGeometry args={[0.55, 1.4, 7]} />
            <meshLambertMaterial color="#1f5c1f" />
          </mesh>
        </group>
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

function BoundaryMarkers() {
  const markers = useMemo(() => {
    const m: React.ReactElement[] = []
    const S = 80
    for (let i = -S; i <= S; i += 10) {
      m.push(
        <mesh key={`n${i}`} position={[i, 0.4, -S]}><boxGeometry args={[0.4, 0.8, 0.4]} /><meshLambertMaterial color="#4a3520" /></mesh>,
        <mesh key={`s${i}`} position={[i, 0.4,  S]}><boxGeometry args={[0.4, 0.8, 0.4]} /><meshLambertMaterial color="#4a3520" /></mesh>,
        <mesh key={`w${i}`} position={[-S, 0.4, i]}><boxGeometry args={[0.4, 0.8, 0.4]} /><meshLambertMaterial color="#4a3520" /></mesh>,
        <mesh key={`e${i}`} position={[ S, 0.4, i]}><boxGeometry args={[0.4, 0.8, 0.4]} /><meshLambertMaterial color="#4a3520" /></mesh>
      )
    }
    return m
  }, [])
  return <>{markers}</>
}

export function Track() {
  return (
    <group>
      <GroundPlane />
      <GroundGrid />
      <SceneryTrees />
      <FlagSpawnMarker />
      <BoundaryMarkers />
    </group>
  )
}