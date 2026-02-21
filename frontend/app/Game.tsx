'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { io, Socket } from 'socket.io-client'
import * as THREE from 'three';

type Vec3 = [number, number, number]

type Player = {
  id: string
  name: string
  hasFlag: boolean
  time: number
  position: Vec3
}

type Obstacle = {
  position: Vec3
  size: Vec3
}

const dummyPlayers: Player[] = [
  { id: '1', name: 'Player 1', hasFlag: true, time: 0, position: [0, 0.5, 0] },
  { id: '2', name: 'Player 2', hasFlag: false, time: 0, position: [0, 0.5, -3] },
  { id: '3', name: 'Player 3', hasFlag: false, time: 0, position: [0, 0.5, -6] },
]

const initialObstacles: Obstacle[] = [
  { position: [0, 0.5, -5], size: [2, 1, 1] },
  { position: [3, 0.5, -10], size: [1, 1, 2] },
  { position: [-2, 0.5, -15], size: [1, 2, 1] },
  { position: [2, 0.5, -25], size: [2, 1, 2] },
  { position: [0, 0.5, -35], size: [1, 1, 3] },
]

const Game = ({ sessionDuration = 2 }: { sessionDuration?: number }) => {
  const [players, setPlayers] = useState<Player[]>(dummyPlayers)
  const [flagTimer, setFlagTimer] = useState<number>(0)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [sessionOver, setSessionOver] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>(initialObstacles);
  const [envOffset, setEnvOffset] = useState(0);
  const speed = 0.15; // environment speed

  const myId = '1'

  // Connect socket
//   useEffect(() => {
//     const s = io('http://localhost:3001')
//     setSocket(s)

//     s.on('players_update', (updatedPlayers: Player[]) => {
//       setPlayers(updatedPlayers)
//     })

//     return () => {
//       s.disconnect()
//     }
//   }, [])

  // Leaderboard (sorted by time)
  const leaderboard = useMemo(() => {
    return [...players].sort((a, b) => b.time - a.time)
  }, [players])

  // Session timer always counts up
  useEffect(() => {
    if (sessionOver) return;
    const interval = setInterval(() => {
      setFlagTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionOver]);

  // Session end logic
  useEffect(() => {
    if (flagTimer >= sessionDuration * 60) {
      setSessionOver(true);
    }
  }, [flagTimer, sessionDuration]);

  if (sessionOver) {
    const winner = leaderboard[0];
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111',
        color: '#fff',
      }}>
        <h1 style={{ fontSize: 40, marginBottom: 24 }}>Session Over!</h1>
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>Winner: {winner.name} ({winner.time}s)</h2>
        <div style={{ fontSize: 20, marginBottom: 32 }}>Leaderboard:</div>
        <ol style={{ fontSize: 18 }}>
          {leaderboard.map((p) => (
            <li key={p.id}>
              {p.name}: {p.time}s {p.hasFlag ? '🚩' : ''}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // Move environment and players forward
  useEffect(() => {
    if (sessionOver) return;
    const interval = setInterval(() => {
      setEnvOffset((prev) => prev + speed);
      setPlayers((prevPlayers) =>
        prevPlayers.map((p, i) => {
          if (p.id === myId) {
            // Local player: don't auto-move left/right/up/down
            return { ...p, position: [p.position[0], p.position[1], p.position[2] + speed] };
          }
          // Other players: move forward
          return { ...p, position: [p.position[0], p.position[1], p.position[2] + speed] };
        })
      );
      setObstacles((prevObstacles) =>
        prevObstacles.map((obs) => ({
          ...obs,
          position: [obs.position[0], obs.position[1], obs.position[2] + speed],
        }))
      );
    }, 33); // ~30fps
    return () => clearInterval(interval);
  }, [sessionOver]);

  // Keyboard controls for local player
  useEffect(() => {
    if (sessionOver) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      setPlayers((prevPlayers) =>
        prevPlayers.map((p) => {
          if (p.id !== myId) return p;
          let [x, y, z] = p.position;
          if (e.key === 'ArrowLeft' || e.key === 'a') x -= 1;
          if (e.key === 'ArrowRight' || e.key === 'd') x += 1;
          if (e.key === 'ArrowUp' || e.key === 'w') y += 1;
          if (e.key === 'ArrowDown' || e.key === 's') y -= 1;
          // Clamp values for demo
          x = Math.max(-10, Math.min(10, x));
          y = Math.max(0.5, Math.min(5, y));
          return { ...p, position: [x, y, z] };
        })
      );
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionOver]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: 'linear-gradient(180deg, #222 0%, #444 100%)',
      }}
    >
      {/* Timer */}
      {players.find((p) => p.id === myId)?.hasFlag && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 32,
            color: '#fff',
            zIndex: 10,
          }}
        >
          ⏱ {flagTimer}s
        </div>
      )}

      {/* Leaderboard */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 40,
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: 16,
          borderRadius: 8,
          zIndex: 10,
          minWidth: 200,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Leaderboard</h3>
        <ol>
          {leaderboard.map((p) => (
            <li key={p.id}>
              {p.name}: {p.time}s {p.hasFlag ? '🚩' : ''}
            </li>
          ))}
        </ol>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        <Physics>
          {/* Moving Ground */}
          <RigidBody type="fixed">
            <mesh receiveShadow position={[0, -0.5, envOffset]}>
              <boxGeometry args={[50, 1, 200]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          </RigidBody>

          {/* Obstacles */}
          {obstacles.map((obs, i) => (
            <RigidBody key={i} type="fixed" position={obs.position}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={obs.size} />
                <meshStandardMaterial color="#a00" />
              </mesh>
            </RigidBody>
          ))}

          {/* Players (running animation) */}
          {players.map((p, idx) => (
            <RigidBody key={p.id} position={p.position}>
              <mesh castShadow>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color={p.hasFlag ? '#FFD700' : '#00aaff'} />
              </mesh>
              {/* Simple running animation: up/down */}
              <mesh position={[p.position[0], 0.5 + Math.sin(envOffset + idx) * 0.2, p.position[2]]}>
                <boxGeometry args={[0.2, 0.6, 0.2]} />
                <meshStandardMaterial color={p.hasFlag ? '#FFD700' : '#00aaff'} />
              </mesh>
            </RigidBody>
          ))}
        </Physics>

        {/* Remove OrbitControls for fixed camera, or keep for debug */}
        {/* <OrbitControls /> */}
      </Canvas>
    </div>
  )
}

export default Game