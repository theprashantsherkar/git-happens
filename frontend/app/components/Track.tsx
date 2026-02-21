'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { PATH_SPLINE } from '../utils/path'

const FORTRESSES = [
  { t: 0.0,  color: '#2244AA', label: 'Blue Base'  },
  { t: 0.45, color: '#CC9900', label: 'Gold Base'  },
  { t: 0.65, color: '#AA2222', label: 'Red Base'   },
  { t: 0.82, color: '#226622', label: 'Green Base' },
]

function PathRibbon() {
  const geometry = useMemo(() => {
    const points = PATH_SPLINE.getPoints(300)
    const geo = new THREE.BufferGeometry()
    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []
    const width = 5.5

    for (let i = 0; i < points.length; i++) {
      const t = i / (points.length - 1)
      const tangent = PATH_SPLINE.getTangent(t)
      const right = new THREE.Vector3()
        .crossVectors(tangent, new THREE.Vector3(0, 1, 0))
        .normalize()

      const l = points[i].clone().addScaledVector(right, -width / 2)
      const r = points[i].clone().addScaledVector(right,  width / 2)

      positions.push(l.x, l.y + 0.05, l.z, r.x, r.y + 0.05, r.z)
      uvs.push(0, t * 10, 1, t * 10)

      if (i < points.length - 1) {
        const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3
        indices.push(a, b, c, b, d, c)
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#C8A86B" roughness={0.9} />
    </mesh>
  )
}

function PathEdges() {
  const geo = useMemo(() => {
    const pts = PATH_SPLINE.getPoints(300)
    const left: THREE.Vector3[] = []
    const right: THREE.Vector3[] = []
    const w = 2.9

    pts.forEach((p, i) => {
      const t = i / (pts.length - 1)
      const tan = PATH_SPLINE.getTangent(t)
      const r = new THREE.Vector3()
        .crossVectors(tan, new THREE.Vector3(0, 1, 0))
        .normalize()

      left.push(p.clone().addScaledVector(r, -w).setY(0.06))
      right.push(p.clone().addScaledVector(r,  w).setY(0.06))
    })

    return {
      lg: new THREE.BufferGeometry().setFromPoints(left),
      rg: new THREE.BufferGeometry().setFromPoints(right),
    }
  }, [])

  return (
    <>
      <line>
        <primitive object={geo.lg} attach="geometry" />
        <lineBasicMaterial color="#8B6914" />
      </line>

      <line>
        <primitive object={geo.rg} attach="geometry" />
        <lineBasicMaterial color="#8B6914" />
      </line>
    </>
  )
}

/* ---------- STABLE PRECOMPUTED DATA ---------- */

const TREE_DATA = Array.from({ length: 50 }, (_, i) => {
  const angle = (i / 50) * Math.PI * 2
  const r = 18 + (i % 7) * 3
  const seed1 = Math.sin(i * 127.1) * 0.5 + 0.5
  const seed2 = Math.sin(i * 311.7) * 0.5 + 0.5
  const seed3 = Math.sin(i * 74.3)  * 0.5 + 0.5

  return {
    x: Math.cos(angle) * r + (seed1 - 0.5) * 8,
    z: Math.sin(angle) * r + (seed2 - 0.5) * 8,
    h: 2 + seed3 * 2.5,
    coneR: 0.9 + (Math.sin(i * 53.2) * 0.5 + 0.5) * 0.4,
  }
})

const GRASS_DATA = PATH_SPLINE.getPoints(60).map((p, i) => ({
  x: p.x,
  z: p.z,
  rot: Math.sin(i * 43.7) * Math.PI,
  r: 3 + (Math.sin(i * 91.3) * 0.5 + 0.5) * 2,
}))

/* ---------- FIXED ROCKS (NO RANDOM) ---------- */

const ROCK_POINTS = PATH_SPLINE.getPoints(24)

const ROCK_DATA = ROCK_POINTS.map((p, i) => {
  const t = i / 24
  const tan = PATH_SPLINE.getTangent(t)
  const right = new THREE.Vector3()
    .crossVectors(tan, new THREE.Vector3(0, 1, 0))
    .normalize()

  const seed1 = Math.sin(i * 91.7) * 0.5 + 0.5
  const seed2 = Math.sin(i * 173.3) * 0.5 + 0.5
  const seed3 = Math.sin(i * 47.2) * 0.5 + 0.5

  const side = (i % 2 === 0 ? 1 : -1) * (4 + seed1 * 3)
  const pos = p.clone().addScaledVector(right, side)

  return {
    x: pos.x,
    z: pos.z,
    scale: 0.5 + seed2 * 0.8,
    rotY: seed3 * Math.PI,
  }
})

function Terrain() {
  return (
    <>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#3a1e6a" roughness={1} />
      </mesh>

      {GRASS_DATA.map((g, i) => (
        <mesh key={i} receiveShadow rotation={[-Math.PI/2, 0, g.rot]} position={[g.x, 0.01, g.z]}>
          <circleGeometry args={[g.r, 7]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? '#3a6b28' : '#4a8232'}
            roughness={0.95}
          />
        </mesh>
      ))}

      {TREE_DATA.map((tree, i) => (
        <group key={i} position={[tree.x, 0, tree.z]}>
          <mesh castShadow position={[0, tree.h * 0.4, 0]}>
            <cylinderGeometry args={[0.18, 0.28, tree.h * 0.8, 6]} />
            <meshStandardMaterial color="#4a2e14" roughness={0.95} />
          </mesh>
          <mesh castShadow position={[0, tree.h, 0]}>
            <coneGeometry args={[tree.coneR, tree.h * 0.8, 7]} />
            <meshStandardMaterial
              color={i % 4 === 0 ? '#1a5c2a' : '#236b33'}
              roughness={0.85}
            />
          </mesh>
        </group>
      ))}

      {ROCK_DATA.map((rock, i) => (
        <mesh
          key={i}
          castShadow
          position={[rock.x, rock.scale * 0.3, rock.z]}
          rotation={[0, rock.rotY, 0]}
        >
          <dodecahedronGeometry args={[rock.scale, 0]} />
          <meshStandardMaterial color="#5a5a6a" roughness={0.95} />
        </mesh>
      ))}
    </>
  )
}

function Fortress({ position, color }: { position: THREE.Vector3; color: string }) {
  const c = new THREE.Color(color)
  const dark = c.clone().multiplyScalar(0.5)

  return (
    <group position={[position.x, 0, position.z]}>
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[9, 1.2, 9]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {[[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 2, z]}>
          <boxGeometry args={[1.8, 2.8, 1.8]} />
          <meshStandardMaterial
            color={`#${dark.getHexString()}`}
            roughness={0.75}
          />
        </mesh>
      ))}

      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 3, 6]} />
        <meshStandardMaterial color="#CCC" metalness={0.8} />
      </mesh>

      <mesh position={[0.55, 4.7, 0]}>
        <planeGeometry args={[1.0, 0.6]} />
        <meshStandardMaterial
          color={color}
          side={THREE.DoubleSide}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  )
}

export function Track() {
  return (
    <>
      <Terrain />
      <PathRibbon />
      <PathEdges />

      {FORTRESSES.map((f, i) => {
        const pos = PATH_SPLINE.getPoint(f.t)
        return <Fortress key={i} position={pos} color={f.color} />
      })}
    </>
  )
}