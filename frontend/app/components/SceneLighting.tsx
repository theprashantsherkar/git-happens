'use client'

// Ambient + directional lights that give the world a slightly dramatic top-down feel.
export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.55} color="#c8d8ff" />
      <directionalLight
        position={[8, 18, 6]}
        intensity={1.4}
        color="#fffbe8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      {/* Soft fill from the opposite side */}
      <directionalLight position={[-6, 8, -10]} intensity={0.3} color="#a0c4ff" />
      {/* Ground bounce */}
      <hemisphereLight args={['#87ceeb', '#3a5c2a', 0.4]} />
    </>
  )
}