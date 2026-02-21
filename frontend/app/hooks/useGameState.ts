import { useEffect, useRef, useReducer } from 'react'
import { Player, Obstacle, Bullet, GameConfig, PlayerRole } from '../types'
import {
  PLAYER_COLORS, PLAYER_NAMES,
  BASE_SPEED, SPEED_RAMP,
  CARRIER_START_T, CHASER_SPREAD,
  BULLET_SPEED, JUMP_VELOCITY, GRAVITY,
  RESPAWN_DELAY, OBSTACLE_TYPES,
  HIT_RADIUS_T, HIT_RADIUS_SIDE,
} from '../constants'

// ─── State ────────────────────────────────────────────────────────────────────

export type GameState = {
  phase: 'playing' | 'ended'
  players: Player[]
  obstacles: Obstacle[]
  bullets: Bullet[]
  elapsed: number
  sessionDuration: number
  worldSpeed: number
  nextObstacleId: number
  nextBulletId: number
  // Track where obstacles have been placed (t values) to avoid clustering
  lastObstacleT: number
}

// ─── Factory ──────────────────────────────────────────────────────────────────

function makePlayers(): Player[] {
  return PLAYER_NAMES.map((name, i) => ({
    id: i, name, color: PLAYER_COLORS[i],
    pathT: i === 0 ? CARRIER_START_T : CARRIER_START_T - (CHASER_SPREAD * (i)),
    side: 0,
    alive: true,
    role: i === 0 ? 'carrier' : 'chaser',
    flagTime: 0,
    flagHoldStart: i === 0 ? Date.now() : null,
    kills: 0,
    isJumping: false, jumpVelocity: 0, yPos: 0,
  }))
}

function makeState(sessionMinutes: number): GameState {
  return {
    phase: 'playing',
    players: makePlayers(),
    obstacles: [],
    bullets: [],
    elapsed: 0,
    sessionDuration: sessionMinutes * 60,
    worldSpeed: BASE_SPEED,
    nextObstacleId: 0,
    nextBulletId: 0,
    lastObstacleT: 0,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tDist(a: number, b: number): number {
  // Shortest distance on a circular path (0..1)
  const d = Math.abs(a - b) % 1
  return Math.min(d, 1 - d)
}

function transferFlag(players: Player[], killedId: number, shooterId: number | null, now: number): Player[] {
  // Shooter gets the flag if specified, otherwise nearest chaser ahead
  const killed = players.find(p => p.id === killedId)!
  let newCarrierId = shooterId

  if (newCarrierId === null) {
    const chasers = players.filter(p => p.id !== killedId && p.alive && p.role === 'chaser')
    if (chasers.length === 0) return players
    const closest = chasers.reduce((best, p) =>
      tDist(p.pathT, killed.pathT) < tDist(best.pathT, killed.pathT) ? p : best
    )
    newCarrierId = closest.id
  }

  return players.map(p => {
    if (p.id === killedId) return { ...p, alive: false, role: 'chaser' as PlayerRole, flagHoldStart: null }
    if (p.id === newCarrierId) return { ...p, role: 'carrier' as PlayerRole, flagHoldStart: now, kills: p.kills + (shooterId ? 1 : 0), pathT: killed.pathT }
    return p
  })
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'TICK'; dt: number; now: number }
  | { type: 'MOVE'; playerId: number; dir: 'left' | 'right' | 'jump' }
  | { type: 'SHOOT'; shooterId: number }
  | { type: 'REVIVE'; playerId: number }

function reducer(state: GameState, action: Action): GameState {
  if (state.phase !== 'playing') return state

  switch (action.type) {

    case 'TICK': {
      const { dt, now } = action
      let s = { ...state }

      s.elapsed += dt
      if (s.elapsed >= s.sessionDuration) return { ...s, phase: 'ended' }

      s.worldSpeed = BASE_SPEED + s.elapsed * SPEED_RAMP

      // ── Update players ──
      s.players = s.players.map(p => {
        if (!p.alive) return p
        let np = { ...p }

        // Accumulate flag time
        if (np.flagHoldStart !== null) np.flagTime += dt * 1000

        // Jump physics
        if (np.isJumping) {
          np.yPos += np.jumpVelocity * dt
          np.jumpVelocity -= GRAVITY * dt
          if (np.yPos <= 0) { np.yPos = 0; np.isJumping = false; np.jumpVelocity = 0 }
        }

        // Move along path
        const speed = np.role === 'carrier' ? s.worldSpeed : s.worldSpeed * 0.92
        np.pathT = (np.pathT + speed * dt) % 1

        return np
      })

      // ── Spawn obstacles ──
      const carrier = s.players.find(p => p.role === 'carrier' && p.alive)
      let newObstacles = [...s.obstacles]
      if (carrier && (carrier.pathT - s.lastObstacleT + 1) % 1 > 0.035) {
        if (Math.random() < 0.6) {
          const spawnT = (carrier.pathT + 0.12) % 1
          const side = (Math.floor(Math.random() * 3) - 1)
          newObstacles.push({
            id: s.nextObstacleId,
            pathT: spawnT,
            side,
            type: OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)],
          })
          s.nextObstacleId++
          s.lastObstacleT = carrier.pathT
        }
      }
      // Despawn obstacles that are too far behind carrier
      if (carrier) {
        newObstacles = newObstacles.filter(o => {
          const dist = (carrier.pathT - o.pathT + 1) % 1
          return dist < 0.35 // keep in a 35% window behind carrier
        })
      }

      // ── Obstacle collisions ──
      let playersAfter = s.players
      for (const obs of newObstacles) {
        const carHit = playersAfter.find(p =>
          p.alive && p.role === 'carrier' &&
          p.side === obs.side &&
          tDist(p.pathT, obs.pathT) < HIT_RADIUS_T &&
          p.yPos < 1.5
        )
        if (carHit) {
          playersAfter = transferFlag(playersAfter, carHit.id, null, now)
          // Remove the obstacle that caused the hit
          newObstacles = newObstacles.filter(o => o.id !== obs.id)
          continue
        }
        // Chasers just die from obstacles
        playersAfter = playersAfter.map(p => {
          if (!p.alive || p.role === 'carrier') return p
          if (p.side === obs.side && tDist(p.pathT, obs.pathT) < HIT_RADIUS_T && p.yPos < 1.5) {
            return { ...p, alive: false }
          }
          return p
        })
      }
      s.players = playersAfter

      // ── Move bullets ──
      let newBullets = s.bullets.map(b => ({ ...b, pathT: (b.pathT + b.dt * dt + 1) % 1 }))

      // Bullet hits carrier
      const liveCarrier = s.players.find(p => p.role === 'carrier' && p.alive)
      if (liveCarrier) {
        newBullets = newBullets.filter(b => {
          if (b.ownerId === liveCarrier.id) return true
          if (
            Math.abs(b.side - liveCarrier.side) <= HIT_RADIUS_SIDE &&
            tDist(b.pathT, liveCarrier.pathT) < HIT_RADIUS_T * 1.5
          ) {
            s.players = transferFlag(s.players, liveCarrier.id, b.ownerId, now)
            return false
          }
          return true
        })
        // Despawn bullets too far ahead
        newBullets = newBullets.filter(b => {
          const ahead = (b.pathT - liveCarrier.pathT + 1) % 1
          return ahead < 0.3
        })
      }

      s.obstacles = newObstacles
      s.bullets = newBullets
      return s
    }

    case 'MOVE': {
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id !== action.playerId || !p.alive) return p
          if (action.dir === 'left')  return { ...p, side: Math.max(-1, p.side - 1) }
          if (action.dir === 'right') return { ...p, side: Math.min(1, p.side + 1) }
          if (action.dir === 'jump' && !p.isJumping) return { ...p, isJumping: true, jumpVelocity: JUMP_VELOCITY }
          return p
        })
      }
    }

    case 'SHOOT': {
      const shooter = state.players.find(p => p.id === action.shooterId)
      if (!shooter || !shooter.alive || shooter.role !== 'chaser') return state
      const bullet = {
        id: state.nextBulletId,
        ownerId: action.shooterId,
        side: shooter.side,
        pathT: (shooter.pathT + 0.01) % 1,
        dt: BULLET_SPEED,
      }
      return { ...state, nextBulletId: state.nextBulletId + 1, bullets: [...state.bullets, bullet] }
    }

    case 'REVIVE': {
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.playerId ? { ...p, alive: true, yPos: 0, isJumping: false, jumpVelocity: 0 } : p
        )
      }
    }

    default: return state
  }
}

// ─── Key bindings ─────────────────────────────────────────────────────────────

const KEY_MAP: Record<string, { player: number; action: 'left' | 'right' | 'jump' | 'shoot' }> = {
  'a': { player: 0, action: 'left' }, 'd': { player: 0, action: 'right' },
  'w': { player: 0, action: 'jump' }, ' ': { player: 0, action: 'shoot' },
  'j': { player: 1, action: 'left' }, 'l': { player: 1, action: 'right' },
  'i': { player: 1, action: 'jump' }, 'u': { player: 1, action: 'shoot' },
  'ArrowLeft':  { player: 2, action: 'left'  }, 'ArrowRight': { player: 2, action: 'right' },
  'ArrowUp':    { player: 2, action: 'jump'  }, '/': { player: 2, action: 'shoot' },
  '4': { player: 3, action: 'left' }, '6': { player: 3, action: 'right' },
  '8': { player: 3, action: 'jump' }, '5': { player: 3, action: 'shoot' },
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState(config: GameConfig) {
  const [state, dispatch] = useReducer(reducer, config.sessionMinutes, makeState)
  const lastFrameRef = useRef<number>(performance.now())
  const rafRef = useRef<number>(0)
  const respawnTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    if (state.phase !== 'playing') return
    const loop = (now: number) => {
      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05)
      lastFrameRef.current = now
      dispatch({ type: 'TICK', dt, now })
      rafRef.current = requestAnimationFrame(loop)
    }
    lastFrameRef.current = performance.now()
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [state.phase])

  useEffect(() => {
    state.players.forEach(p => {
      if (!p.alive && !respawnTimers.current.has(p.id)) {
        const t = setTimeout(() => {
          respawnTimers.current.delete(p.id)
          dispatch({ type: 'REVIVE', playerId: p.id })
        }, RESPAWN_DELAY)
        respawnTimers.current.set(p.id, t)
      }
    })
  }, [state.players])

  useEffect(() => {
    if (state.phase !== 'playing') return
    const down = (e: KeyboardEvent) => {
      const b = KEY_MAP[e.key]; if (!b) return
      e.preventDefault()
      if (b.action === 'shoot') dispatch({ type: 'SHOOT', shooterId: b.player })
      else dispatch({ type: 'MOVE', playerId: b.player, dir: b.action })
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [state.phase])

  return { state, dispatch }
}