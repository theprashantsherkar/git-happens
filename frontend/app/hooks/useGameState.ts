'use client'
import { useEffect, useReducer, useRef } from 'react'
import { Player, Obstacle, Bullet, Flag, GamePhase } from '../types'
import { PLAYER_COLORS, PLAYER_NAMES } from '../constants'

// ─── Constants ────────────────────────────────────────────────────────────────
const WORLD_SIZE = 80
const MOVE_SPEED = 12
const TURN_SPEED = 2.2
const BULLET_SPEED = 30
const BULLET_LIFE = 2.5
const FLAG_PICKUP_R = 2.5
const HIT_RADIUS = 1.5
const RESPAWN_DELAY = 3000

const SPAWN: [number, number, number][] = [
  [-30, 0, 30],
  [30, 0, 30],
  [-30, 0, -30],
  [30, 0, -30],
]

// ─── State ────────────────────────────────────────────────────────────────────
export type GameState = {
  phase: GamePhase
  players: Player[]
  obstacles: Obstacle[]
  bullets: Bullet[]
  flag: Flag
  elapsed: number
  sessionDuration: number
  worldSpeed: number
}

const BINDINGS = [
  { left: 'ArrowLeft', right: 'ArrowRight', forward: 'ArrowUp', shoot: 'Space' },
  { left: 'KeyA', right: 'KeyD', forward: 'KeyW', shoot: 'KeyF' },
  { left: 'KeyJ', right: 'KeyL', forward: 'KeyI', shoot: 'KeyU' },
  { left: 'Numpad4', right: 'Numpad6', forward: 'Numpad8', shoot: 'Numpad0' },
]

type Action =
  | { type: 'TICK'; dt: number; keys: Set<string>; enabled: boolean }
  | { type: 'START' }

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function dist(ax: number, az: number, bx: number, bz: number) {
  const dx = ax - bx
  const dz = az - bz
  return Math.sqrt(dx * dx + dz * dz)
}

function spawnObstacles(): Obstacle[] {
  const obs: Obstacle[] = []
  const types: Obstacle['type'][] = ['tree', 'rock', 'log', 'barrel']
  for (let i = 0; i < 40; i++) {
    const seed = i * 7919
    const x = (seed * 1031) % 140 - 70
    const z = (seed * 2053) % 140 - 70
    if (Math.abs(x) < 8 && Math.abs(z) < 8) continue
    obs.push({ id: i, x, z, type: types[i % 4] })
  }
  return obs
}

function makeInitialState(sessionMinutes: number): GameState {
  const players: Player[] = PLAYER_COLORS.map((color, i) => ({
    id: i,
    name: PLAYER_NAMES[i],
    color,
    x: SPAWN[i][0],
    z: SPAWN[i][2],
    angle: Math.atan2(-SPAWN[i][0], -SPAWN[i][2]),
    vx: 0,
    vz: 0,
    alive: true,
    role: 'chaser',
    flagTime: 0,
    flagHoldStart: null,
    kills: 0,
    isJumping: false,
    jumpVelocity: 0,
    yPos: 0,
  }))

  return {
    phase: 'playing',
    players,
    obstacles: spawnObstacles(),
    bullets: [],
    flag: { x: 0, z: 0, carrierId: null },
    elapsed: 0,
    sessionDuration: sessionMinutes * 60 * 1000,
    worldSpeed: 1,
  }
}

let nextBulletId = 1000
let respawnTimers = new Map<number, ReturnType<typeof setTimeout>>()

function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'START') return state

  if (action.type === 'TICK') {
    const { dt, keys, enabled } = action

    if (!enabled) {
      return state
    }

    if (state.phase !== 'playing') return state

    const now = Date.now()
    const newBullets: Bullet[] = []

    const players = state.players.map((p, i) => {
      if (!p.alive) return p
      const b = BINDINGS[i]
      if (!b) return p

      let angle = p.angle
      if (keys.has(b.left)) angle += TURN_SPEED * dt
      if (keys.has(b.right)) angle -= TURN_SPEED * dt

      let x = p.x
      let z = p.z

      if (keys.has(b.forward)) {
        x += Math.sin(angle) * MOVE_SPEED * dt
        z += Math.cos(angle) * MOVE_SPEED * dt
      }

      x = clamp(x, -WORLD_SIZE, WORLD_SIZE)
      z = clamp(z, -WORLD_SIZE, WORLD_SIZE)

      if (keys.has(b.shoot)) {
        const lastShot = (p as any)._lastShot ?? 0
        if (now - lastShot > 350) {
          newBullets.push({
            id: nextBulletId++,
            ownerId: i,
            x: p.x,
            z: p.z,
            vx: Math.sin(angle) * BULLET_SPEED,
            vz: Math.cos(angle) * BULLET_SPEED,
          })
          ;(p as any)._lastShot = now
        }
      }

      return { ...p, x, z, angle }
    })

    const bullets = [
      ...state.bullets
        .map(b => ({
          ...b,
          x: b.x + b.vx * dt,
          z: b.z + b.vz * dt,
          _age: ((b as any)._age ?? 0) + dt,
        }))
        .filter(b => (b as any)._age < BULLET_LIFE),
      ...newBullets,
    ]

    let elapsed = state.elapsed + dt * 1000
    const phase: GamePhase =
      elapsed >= state.sessionDuration ? 'ended' : 'playing'

    return {
      ...state,
      phase,
      players,
      bullets,
      elapsed,
    }
  }

  return state
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useGameState({
  sessionMinutes,
  enabled,
}: {
  sessionMinutes: number
  enabled: boolean
}) {
  const [state, dispatch] = useReducer(
    reducer,
    sessionMinutes,
    makeInitialState
  )

  const keysRef = useRef<Set<string>>(new Set())
  const lastTimeRef = useRef<number>(performance.now())

  useEffect(() => {
    if (!enabled) return
    lastTimeRef.current = performance.now()
  }, [enabled])

  useEffect(() => {
    const down = (e: KeyboardEvent) => keysRef.current.add(e.code)
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    let raf: number

    function loop(now: number) {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now

      dispatch({
        type: 'TICK',
        dt,
        keys: new Set(keysRef.current),
        enabled,
      })

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      respawnTimers.forEach(t => clearTimeout(t))
      respawnTimers.clear()
    }
  }, [enabled])

  return { state }
}