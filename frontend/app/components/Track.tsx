// 'use client'
// import { useMemo } from 'react'

// function GroundPlane() {
//   return (
//     <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
//       <planeGeometry args={[200, 200]} />
//       <meshLambertMaterial color="#2d5a1b" />
//     </mesh>
//   )
// }

// function GroundGrid() {
//   const lines = useMemo(() => {
//     const segs: React.ReactElement[] = []
//     for (let i = -80; i <= 80; i += 20) {
//       segs.push(
//         <mesh key={`h${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, i]}>
//           <planeGeometry args={[160, 0.08]} />
//           <meshLambertMaterial color="#264d17" transparent opacity={0.5} />
//         </mesh>,
//         <mesh key={`v${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[i, -0.04, 0]}>
//           <planeGeometry args={[0.08, 160]} />
//           <meshLambertMaterial color="#264d17" transparent opacity={0.5} />
//         </mesh>
//       )
//     }
//     return segs
//   }, [])
//   return <>{lines}</>
// }

// function SceneryTrees() {
//   const trees = useMemo(() => {
//     const t: { x: number; z: number; scale: number }[] = []
//     for (let i = 0; i < 120; i++) {
//       const seed = i * 7919
//       const x = (((seed * 1031) % 160) - 80)
//       const z = (((seed * 2053) % 160) - 80)
//       if (Math.abs(x) < 10 && Math.abs(z) < 10) continue
//       if (Math.abs(Math.abs(x) - 30) < 6 && Math.abs(Math.abs(z) - 30) < 6) continue
//       t.push({ x, z, scale: 0.6 + ((seed * 3571) % 10) / 20 })
//     }
//     return t
//   }, [])

//   return (
//     <>
//       {trees.map((tr, i) => (
//         <group key={i} position={[tr.x, 0, tr.z]} scale={tr.scale}>
//           <mesh position={[0, 0.7, 0]} castShadow>
//             <cylinderGeometry args={[0.12, 0.18, 1.4, 6]} />
//             <meshLambertMaterial color="#6B4226" />
//           </mesh>
//           <mesh position={[0, 2.0, 0]} castShadow>
//             <coneGeometry args={[0.85, 1.8, 7]} />
//             <meshLambertMaterial color="#1a4d1a" />
//           </mesh>
//           <mesh position={[0, 2.9, 0]} castShadow>
//             <coneGeometry args={[0.55, 1.4, 7]} />
//             <meshLambertMaterial color="#1f5c1f" />
//           </mesh>
//         </group>
//       ))}
//     </>
//   )
// }

// function FlagSpawnMarker() {
//   return (
//     <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
//       <ringGeometry args={[2.0, 2.4, 32]} />
//       <meshLambertMaterial color="#ffd700" transparent opacity={0.35} />
//     </mesh>
//   )
// }

// function BoundaryMarkers() {
//   const markers = useMemo(() => {
//     const m: React.ReactElement[] = []
//     const S = 80
//     for (let i = -S; i <= S; i += 10) {
//       m.push(
//         <mesh key={`n${i}`} position={[i, 0.4, -S]}><boxGeometry args={[0.4, 0.8, 0.4]} /><meshLambertMaterial color="#4a3520" /></mesh>,
//         <mesh key={`s${i}`} position={[i, 0.4,  S]}><boxGeometry args={[0.4, 0.8, 0.4]} /><meshLambertMaterial color="#4a3520" /></mesh>,
//         <mesh key={`w${i}`} position={[-S, 0.4, i]}><boxGeometry args={[0.4, 0.8, 0.4]} /><meshLambertMaterial color="#4a3520" /></mesh>,
//         <mesh key={`e${i}`} position={[ S, 0.4, i]}><boxGeometry args={[0.4, 0.8, 0.4]} /><meshLambertMaterial color="#4a3520" /></mesh>
//       )
//     }
//     return m
//   }, [])
//   return <>{markers}</>
// }

// export function Track() {
//   return (
//     <group>
//       <GroundPlane />
//       <GroundGrid />
//       <SceneryTrees />
//       <FlagSpawnMarker />
//       <BoundaryMarkers />
//     </group>
//   )
// }

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
          {/* trunk */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.25, 1.6, 8]} />
            <meshLambertMaterial color="#6B4226" />
          </mesh>

          {/* soft leaf layers */}
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

export function Track() {
  return (
    <group>
      <GroundPlane />
      <River />
      <Potholes />
      <SceneryTrees />
      <Rocks />
      <Animals />
      <FlagSpawnMarker />
    </group>
  )
}