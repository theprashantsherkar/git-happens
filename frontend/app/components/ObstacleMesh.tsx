// 'use client'
// import { Obstacle } from '../types'

// type Props = { obstacles: Obstacle[] }

// function TreeObstacle() {
//   return (
//     <group>
//       <mesh position={[0, 0.7, 0]} castShadow>
//         <cylinderGeometry args={[0.12, 0.18, 1.4, 6]} />
//         <meshLambertMaterial color="#6B4226" />
//       </mesh>
//       <mesh position={[0, 2.0, 0]} castShadow>
//         <coneGeometry args={[0.85, 1.8, 7]} />
//         <meshLambertMaterial color="#1a4d1a" />
//       </mesh>
//     </group>
//   )
// }

// function RockObstacle() {
//   return (
//     <mesh position={[0, 0.4, 0]} castShadow>
//       <dodecahedronGeometry args={[0.6]} />
//       <meshLambertMaterial color="#888880" />
//     </mesh>
//   )
// }

// function LogObstacle() {
//   return (
//     <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
//       <cylinderGeometry args={[0.25, 0.25, 1.6, 8]} />
//       <meshLambertMaterial color="#8B6914" />
//     </mesh>
//   )
// }

// function BarrelObstacle() {
//   return (
//     <mesh position={[0, 0.5, 0]} castShadow>
//       <cylinderGeometry args={[0.3, 0.3, 1.0, 10]} />
//       <meshLambertMaterial color="#c0392b" />
//     </mesh>
//   )
// }

// export function ObstacleMesh({ obstacles }: Props) {
//   return (
//     <>
//       {obstacles.map(obs => (
//         <group key={obs.id} position={[obs.x, 0, obs.z]}>
//           {obs.type === 'tree'   && <TreeObstacle />}
//           {obs.type === 'rock'   && <RockObstacle />}
//           {obs.type === 'log'    && <LogObstacle />}
//           {obs.type === 'barrel' && <BarrelObstacle />}
//         </group>
//       ))}
//     </>
//   )
// }


'use client'
import { Obstacle } from '../types'

type Props = { obstacles: Obstacle[] }

function TreeObstacle() {
  return (
    <group>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.4, 6]} />
        <meshLambertMaterial color="#6B4226" />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[0.85, 1.8, 7]} />
        <meshLambertMaterial color="#1a4d1a" />
      </mesh>
    </group>
  )
}

function RockObstacle() {
  return (
    <mesh position={[0, 0.4, 0]} castShadow>
      <dodecahedronGeometry args={[0.6]} />
      <meshLambertMaterial color="#888880" />
    </mesh>
  )
}

function LogObstacle() {
  return (
    <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.25, 0.25, 1.6, 8]} />
      <meshLambertMaterial color="#8B6914" />
    </mesh>
  )
}

function BarrelObstacle() {
  return (
    <mesh position={[0, 0.5, 0]} castShadow>
      <cylinderGeometry args={[0.3, 0.3, 1.0, 10]} />
      <meshLambertMaterial color="#c0392b" />
    </mesh>
  )
}

export function ObstacleMesh({ obstacles }: Props) {
  return (
    <>
      {obstacles.map(obs => (
        <group key={obs.id} position={[obs.x, 0, obs.z]}>
          {obs.type === 'tree'   && <TreeObstacle />}
          {obs.type === 'rock'   && <RockObstacle />}
          {obs.type === 'log'    && <LogObstacle />}
          {obs.type === 'barrel' && <BarrelObstacle />}
        </group>
      ))}
    </>
  )
}