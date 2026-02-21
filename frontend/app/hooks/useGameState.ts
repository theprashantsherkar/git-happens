'use client'
import { useEffect, useReducer, useRef } from 'react'
import { Player, Obstacle, Bullet, Flag, GamePhase } from '../types'
import { PLAYER_COLORS, PLAYER_NAMES } from '../constants'

// ─── Constants ────────────────────────────────────────────────────────────────
const WORLD_SIZE   = 80      // half-extent: players roam -80..80 on X and Z
const MOVE_SPEED   = 12      // units per second forward
const TURN_SPEED   = 2.2     // radians per second turn rate
const BULLET_SPEED = 30      // units per second
const BULLET_LIFE  = 2.5     // seconds before bullet disappears
const FLAG_PICKUP_R = 2.5    // distance to pick up flag
const HIT_RADIUS   = 1.5     // bullet hit radius
const RESPAWN_DELAY = 3000   // ms

// ─── Spawn positions (spread around map) ─────────────────────────────────────
const SPAWN: [number, number, number][] = [
  [-30, 0,  30],
  [ 30, 0,  30],
  [-30, 0, -30],
  [ 30, 0, -30],
]

// ─── State shape ─────────────────────────────────────────────────────────────
export type GameState = {
  phase: GamePhase
  players: Player[]
  obstacles: Obstacle[]
  bullets: Bullet[]
  flag: Flag
  elapsed: number        // ms elapsed
  sessionDuration: number // ms total
  worldSpeed: number     // legacy compat — always 1 in free roam
}

// ─── Keyboard bindings: player index → { left, right, forward, shoot } ───────
const BINDINGS = [
  { left: 'ArrowLeft',  right: 'ArrowRight', forward: 'ArrowUp',   shoot: 'Space' },
  { left: 'KeyA',       right: 'KeyD',       forward: 'KeyW',      shoot: 'KeyF'  },
  { left: 'KeyJ',       right: 'KeyL',       forward: 'KeyI',      shoot: 'KeyU'  },
  { left: 'Numpad4',    right: 'Numpad6',    forward: 'Numpad8',   shoot: 'Numpad0' },
]

// ─── Action types ─────────────────────────────────────────────────────────────
type Action =
  | { type: 'TICK'; dt: number; keys: Set<string> }
  | { type: 'START' }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function dist(ax: number, az: number, bx: number, bz: number) {
  const dx = ax - bx, dz = az - bz
  return Math.sqrt(dx * dx + dz * dz)
}

function spawnObstacles(): Obstacle[] {
  const obs: Obstacle[] = []
  const types: Obstacle['type'][] = ['tree', 'rock', 'log', 'barrel']
  // Scatter 40 obstacles around the map, avoiding center flag spawn
  for (let i = 0; i < 40; i++) {
    const seed = i * 7919
    const x = (((seed * 1031) % 140) - 70)
    const z = (((seed * 2053) % 140) - 70)
    // Skip center area where flag spawns
    if (Math.abs(x) < 8 && Math.abs(z) < 8) continue
    obs.push({ id: i, x, z, type: types[i % 4] })
  }
  return obs
}

// ─── Initial state ─────────────────────────────────────────────────────────────
function makeInitialState(sessionMinutes: number): GameState {
  const players: Player[] = PLAYER_COLORS.map((color, i) => ({
    id: i,
    name: PLAYER_NAMES[i],
    color,
    x: SPAWN[i][0],
    z: SPAWN[i][2],
    angle: Math.atan2(-SPAWN[i][0], -SPAWN[i][2]), // face center
    vx: 0, vz: 0,
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

// ─── Reducer ──────────────────────────────────────────────────────────────────
let nextBulletId = 1000
let respawnTimers: Map<number, ReturnType<typeof setTimeout>> = new Map()

function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'START') return state

  if (action.type === 'TICK') {
    if (state.phase !== 'playing') return state

    const { dt, keys } = action
    const now = Date.now()

    // ── 1. Move players ───────────────────────────────────────────────────────
    const newBullets: Bullet[] = []
    const players = state.players.map((p, i) => {
      if (!p.alive) return p
      const b = BINDINGS[i]
      if (!b) return p

      let angle = p.angle
      if (keys.has(b.left))  angle -= TURN_SPEED * dt
      if (keys.has(b.right)) angle += TURN_SPEED * dt

      let x = p.x
      let z = p.z
      if (keys.has(b.forward)) {
        x += Math.sin(angle) * MOVE_SPEED * dt
        z += Math.cos(angle) * MOVE_SPEED * dt
      }

      // World bounds
      x = clamp(x, -WORLD_SIZE, WORLD_SIZE)
      z = clamp(z, -WORLD_SIZE, WORLD_SIZE)

      // Jump
      let { isJumping, jumpVelocity, yPos } = p
      if (keys.has('Space') && !isJumping) {
        isJumping = true
        jumpVelocity = 8
      }
      if (isJumping) {
        yPos += jumpVelocity * dt
        jumpVelocity -= 20 * dt
        if (yPos <= 0) { yPos = 0; isJumping = false; jumpVelocity = 0 }
      }

      // Shoot
      if (keys.has(b.shoot)) {
        const lastShot = (p as any)._lastShot ?? 0
        if (now - lastShot > 350) {
          newBullets.push({
            id: nextBulletId++,
            ownerId: i,
            x: p.x + Math.sin(angle) * 1.5,
            z: p.z + Math.cos(angle) * 1.5,
            vx: Math.sin(angle) * BULLET_SPEED,
            vz: Math.cos(angle) * BULLET_SPEED,
          })
          ;(p as any)._lastShot = now
        }
      }

      return { ...p, x, z, angle, isJumping, jumpVelocity, yPos }
    })

    // ── 2. Move + expire bullets ──────────────────────────────────────────────
    const allBullets = [
      ...state.bullets.map(b => ({
        ...b,
        x: b.x + b.vx * dt,
        z: b.z + b.vz * dt,
        _age: ((b as any)._age ?? 0) + dt,
      })).filter(b => {
        const age = (b as any)._age ?? 0
        return age < BULLET_LIFE &&
          Math.abs(b.x) < WORLD_SIZE + 5 &&
          Math.abs(b.z) < WORLD_SIZE + 5
      }),
      ...newBullets,
    ]

    // ── 3. Bullet hit detection ───────────────────────────────────────────────
    const hitPlayerIds = new Set<number>()
    const survivingBullets = allBullets.filter(bullet => {
      for (const p of players) {
        if (!p.alive || p.id === bullet.ownerId) continue
        if (dist(bullet.x, bullet.z, p.x, p.z) < HIT_RADIUS) {
          hitPlayerIds.add(p.id)
          return false // consume bullet
        }
      }
      return true
    })

    // ── 4. Apply hits: kill + flag drop + respawn ─────────────────────────────
    let flag = state.flag
    let updatedPlayers = players.map(p => {
      if (!hitPlayerIds.has(p.id)) return p

      // Kill
      const killer = survivingBullets.find(() => false) // just mark dead
      const killedBy = allBullets.find(b => !survivingBullets.includes(b) && dist(b.x, b.z, p.x, p.z) < HIT_RADIUS)

      // Drop flag if carrier
      if (flag.carrierId === p.id) {
        flag = { x: p.x, z: p.z, carrierId: null }
      }

      // Schedule respawn
      if (!respawnTimers.has(p.id)) {
        const t = setTimeout(() => {
          respawnTimers.delete(p.id)
        }, RESPAWN_DELAY)
        respawnTimers.set(p.id, t)
      }

      return {
        ...p,
        alive: false,
        flagHoldStart: null,
        role: 'chaser' as const,
      }
    })

    // Award kill to shooter
    allBullets.forEach(b => {
      if (!survivingBullets.includes(b)) {
        const hitId = [...hitPlayerIds].find(id => {
          const victim = players.find(p => p.id === id)
          return victim && dist(b.x, b.z, victim.x, victim.z) < HIT_RADIUS
        })
        if (hitId !== undefined) {
          updatedPlayers = updatedPlayers.map(p =>
            p.id === b.ownerId ? { ...p, kills: p.kills + 1 } : p
          )
        }
      }
    })

    // Respawn dead players after RESPAWN_DELAY
    updatedPlayers = updatedPlayers.map(p => {
      if (p.alive) return p
      if (respawnTimers.has(p.id)) return p
      // Respawn
      return {
        ...p,
        alive: true,
        x: SPAWN[p.id][0] + (Math.random() - 0.5) * 4,
        z: SPAWN[p.id][2] + (Math.random() - 0.5) * 4,
        angle: Math.atan2(-SPAWN[p.id][0], -SPAWN[p.id][2]),
        yPos: 0, isJumping: false, jumpVelocity: 0,
      }
    })

    // ── 5. Flag pickup by proximity ───────────────────────────────────────────
    if (flag.carrierId === null) {
      for (const p of updatedPlayers) {
        if (!p.alive) continue
        if (dist(p.x, p.z, flag.x, flag.z) < FLAG_PICKUP_R) {
          flag = { ...flag, carrierId: p.id }
          break
        }
      }
    }

    // ── 6. Flag hold time ─────────────────────────────────────────────────────
    updatedPlayers = updatedPlayers.map(p => {
      if (flag.carrierId === p.id) {
        const start = p.flagHoldStart ?? now
        return {
          ...p,
          role: 'carrier' as const,
          flagHoldStart: start,
          flagTime: p.flagTime + dt * 1000,
        }
      }
      return {
        ...p,
        role: 'chaser' as const,
        flagHoldStart: null,
      }
    })

    // Move flag with carrier
    if (flag.carrierId !== null) {
      const carrier = updatedPlayers.find(p => p.id === flag.carrierId)
      if (carrier) flag = { ...flag, x: carrier.x, z: carrier.z }
    }

    // ── 7. Timer ──────────────────────────────────────────────────────────────
    const elapsed = state.elapsed + dt * 1000
    const phase: GamePhase = elapsed >= state.sessionDuration ? 'ended' : 'playing'

    return {
      ...state,
      phase,
      players: updatedPlayers,
      bullets: survivingBullets,
      flag,
      elapsed,
    }
  }

  return state
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useGameState({ sessionMinutes }: { sessionMinutes: number }) {
  const [state, dispatch] = useReducer(reducer, sessionMinutes, makeInitialState)
  const keysRef = useRef<Set<string>>(new Set())
  const lastTimeRef = useRef<number>(performance.now())

  // Keyboard listeners
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)
      // Prevent page scroll on arrow/space
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Game loop via requestAnimationFrame
  useEffect(() => {
    let raf: number
    function loop(now: number) {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now
      dispatch({ type: 'TICK', dt, keys: new Set(keysRef.current) })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      respawnTimers.forEach(t => clearTimeout(t))
      respawnTimers.clear()
    }
  }, [])

  return { state }
}