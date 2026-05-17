'use client'
import { useEffect, useReducer, useRef } from 'react'
import { Player, Obstacle, Bullet, Flag, GamePhase } from '../types'
import { PLAYER_COLORS, PLAYER_NAMES } from '../constants'

const WORLD_SIZE  = 80
const WALL_T_HALF = 0.6
const WORLD_CLAMP = WORLD_SIZE - WALL_T_HALF

const MOVE_SPEED   = 12
const TURN_SPEED   = 2.2
const BULLET_SPEED = 30
const BULLET_LIFE  = 2.5
const FLAG_PICKUP_R = 2.5
const BULLET_HIT_R  = 1.4

const CARRIER_SPEED_FACTOR = 0.78

const GRAVITY    = -30
const JUMP_FORCE = 12

const SPAWN: [number, number, number][] = [
  [-30, 0,  30],
  [ 30, 0,  30],
  [-30, 0, -30],
  [ 30, 0, -30],
]

function randomRespawn(): { x: number; z: number } {
  return {
    x: (Math.random() * 2 - 1) * (WORLD_CLAMP - 4),
    z: (Math.random() * 2 - 1) * (WORLD_CLAMP - 4),
  }
}

export type KillEvent = {
  victimIndex: number
  killerIndex: number
  respawnX: number
  respawnZ: number
  wasCarrier: boolean
  ts: number
}

export type GameState = {
  phase: GamePhase
  players: Player[]
  obstacles: Obstacle[]
  bullets: Bullet[]
  flag: Flag
  elapsed: number
  startedAt: number | null
  sessionDuration: number
  worldSpeed: number
  playerIndex: number
  lastKillEvent: KillEvent | null
  lastFlagEvent: { ts: number } | null
}

const BINDINGS = [
  { left: 'ArrowLeft', right: 'ArrowRight', forward: 'ArrowUp', jump: 'Space', shoot: 'KeyK' },
  { left: 'KeyA',      right: 'KeyD',       forward: 'KeyW',    shoot: 'KeyF' },
  { left: 'KeyJ',      right: 'KeyL',       forward: 'KeyI',    shoot: 'KeyU' },
  { left: 'Numpad4',   right: 'Numpad6',    forward: 'Numpad8', shoot: 'Numpad0' },
]

type Action =
  | { type: 'TICK';   dt: number; keys: Set<string>; enabled: boolean }
  | { type: 'START' }
  | { type: 'ENABLE' }
  | { type: 'SYNC_PLAYER'; playerIndex: number; data: Partial<Player> & { name?: string } }
  | { type: 'SYNC_KILL'; victimIndex: number; killerIndex: number; respawnX: number; respawnZ: number; wasCarrier: boolean; ts: number }
  | { type: 'SYNC_FLAG'; flag: Flag }
  | { type: 'SET_PLAYER_NAMES'; names: { playerIndex: number; username: string }[] }
  | { type: 'PLAYER_LEFT'; playerIndex: number }

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function spawnObstacles(): Obstacle[] {
  const obs: Obstacle[] = []
  const types: Obstacle['type'][] = [
    'tree','tree','tree','tree',
    'rock','rock',
    'log',
    'barrel',
    'river',
  ]
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * 150 - 75
    const z = Math.random() * 150 - 75
    if (Math.abs(x) < 8 && Math.abs(z) < 8) continue
    obs.push({ id: i, x, z, type: types[Math.floor(Math.random() * types.length)] })
  }
  return obs
}

function makeInitialState(sessionMinutes: number, playerIndex: number = 0, playerName: string = PLAYER_NAMES[0]): GameState {
  const players: Player[] = PLAYER_COLORS.map((color, i) => ({
    id: i,
    name: i === playerIndex ? playerName : PLAYER_NAMES[i],
    color,
    x: SPAWN[i][0],
    z: SPAWN[i][2],
    angle: Math.atan2(-SPAWN[i][0], -SPAWN[i][2]),
    vx: 0,
    vz: 0,
    alive: true,
    role: 'chaser' as const,
    flagTime: 0,
    flagHoldStart: null,
    kills: 0,
    isJumping: false,
    jumpVelocity: 0,
    yPos: 0,
    speedMultiplier: 1,
    hasGun: true,
    lastShotAt: 0,
  }))

  return {
    phase: 'playing',
    players,
    obstacles: spawnObstacles(),
    bullets: [],
    flag: { x: 0, z: 0, carrierId: null },
    elapsed: 0,
    startedAt: null,
    sessionDuration: sessionMinutes * 60 * 1000,
    worldSpeed: 1,
    playerIndex,
    lastKillEvent: null,
    lastFlagEvent: null,
  }
}

let nextBulletId = 1000

function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'START') return state

  if (action.type === 'ENABLE') {
    return { ...state, startedAt: Date.now() }
  }

  // ── Network sync: another player's position ──
  if (action.type === 'SYNC_PLAYER') {
    if (action.playerIndex === state.playerIndex) return state
    return {
      ...state,
      players: state.players.map((p, i) =>
        i === action.playerIndex ? { ...p, ...action.data } : p
      ),
    }
  }

  // ── Network sync: a kill happened on another client ──
  if (action.type === 'SYNC_KILL') {
    const { victimIndex, killerIndex, respawnX, respawnZ, wasCarrier } = action
    const newPlayers = state.players.map((p, i) => {
      if (i === victimIndex) {
        return {
          ...p, x: respawnX, z: respawnZ,
          alive: true, role: 'chaser' as const,
          hasGun: true, isJumping: false,
          jumpVelocity: 0, yPos: 0, lastShotAt: 0,
          flagHoldStart: null,
        }
      }
      if (i === killerIndex) {
        return wasCarrier
          ? { ...p, role: 'carrier' as const, hasGun: false, kills: p.kills + 1, flagHoldStart: Date.now() }
          : { ...p, kills: p.kills + 1 }
      }
      return p
    })
    const killerPlayer = newPlayers[killerIndex]
    const newFlag = wasCarrier
      ? { x: killerPlayer?.x ?? state.flag.x, z: killerPlayer?.z ?? state.flag.z, carrierId: killerIndex }
      : state.flag.carrierId === victimIndex
        ? { ...state.flag, carrierId: null }
        : state.flag
    return { ...state, players: newPlayers, flag: newFlag }
  }

  // ── Network sync: flag was picked up / dropped on another client ──
  if (action.type === 'SYNC_FLAG') {
    const newPlayers = state.players.map((p, i) => {
      if (i === action.flag.carrierId) return { ...p, role: 'carrier' as const }
      if (p.role === 'carrier') return { ...p, role: 'chaser' as const }
      return p
    })
    return { ...state, flag: action.flag, players: newPlayers }
  }

  // ── A player left the game permanently ──
  if (action.type === 'PLAYER_LEFT') {
    const { playerIndex } = action
    const leaving = state.players[playerIndex]
    const wasCarrier = state.flag.carrierId === playerIndex
    const newPlayers = state.players.map((p, i) =>
      i === playerIndex ? { ...p, alive: false, left: true } : p
    )
    const newFlag = wasCarrier
      ? { x: leaving?.x ?? state.flag.x, z: leaving?.z ?? state.flag.z, carrierId: null }
      : state.flag
    return { ...state, players: newPlayers, flag: newFlag }
  }

  // ── Network sync: authoritative player names from server ──
  if (action.type === 'SET_PLAYER_NAMES') {
    const nameMap = new Map(action.names.map(n => [n.playerIndex, n.username]))
    return {
      ...state,
      players: state.players.map((p, i) =>
        nameMap.has(i) ? { ...p, name: nameMap.get(i)! } : p
      ),
    }
  }

  if (action.type === 'TICK') {
    const { dt, keys, enabled } = action
    if (!enabled || state.phase !== 'playing' || state.startedAt === null) return state

    const now = Date.now()
    const newBullets: Bullet[] = []
    let newKillEvent: KillEvent | null = null
    let newFlagEvent: GameState['lastFlagEvent'] = null

    /* ============================
       PLAYER MOVEMENT — local player only
    ============================ */
    const players = state.players.map((p, i) => {
      if (!p.alive) return p
      if (i !== state.playerIndex) return p
      const b = BINDINGS[i]
      if (!b) return p

      let angle = p.angle
      if (keys.has(b.left))  angle += TURN_SPEED * dt
      if (keys.has(b.right)) angle -= TURN_SPEED * dt

      const prevX = p.x
      const prevZ = p.z
      let x = p.x
      let z = p.z
      let speedMultiplier = 1

      const speed = MOVE_SPEED * (p.role === 'carrier' ? CARRIER_SPEED_FACTOR : 1)
      if (keys.has(b.forward)) {
        x += Math.sin(angle) * speed * dt
        z += Math.cos(angle) * speed * dt
      }

      x = clamp(x, -WORLD_CLAMP, WORLD_CLAMP)
      z = clamp(z, -WORLD_CLAMP, WORLD_CLAMP)

      let yPos = p.yPos
      let jumpVelocity = p.jumpVelocity
      let isJumping = p.isJumping

      if (b.jump && keys.has(b.jump) && !isJumping) {
        isJumping = true
        jumpVelocity = JUMP_FORCE
      }
      if (isJumping) {
        jumpVelocity += GRAVITY * dt
        yPos += jumpVelocity * dt
        if (yPos <= 0) { yPos = 0; jumpVelocity = 0; isJumping = false }
      }

      for (const obs of state.obstacles) {
        const dx = x - obs.x
        const dz = z - obs.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (obs.type === 'river' && dist < 3) speedMultiplier = 0.4
        if (
          (obs.type === 'tree' || obs.type === 'rock' ||
           obs.type === 'log'  || obs.type === 'barrel') &&
          dist < 1.8 && yPos < 1
        ) { x = prevX; z = prevZ }
      }

      let lastShotAt = p.lastShotAt ?? 0
      if (p.role !== 'carrier' && b.shoot && keys.has(b.shoot)) {
        if (now - lastShotAt > 350) {
          newBullets.push({
            id: nextBulletId++,
            ownerId: i,
            x: p.x,
            z: p.z,
            vx: Math.sin(angle) * BULLET_SPEED,
            vz: Math.cos(angle) * BULLET_SPEED,
          })
          lastShotAt = now
        }
      }

      return { ...p, x, z, angle, yPos, jumpVelocity, isJumping, speedMultiplier, lastShotAt }
    })

    /* ============================
       BULLET MOVEMENT + HIT DETECTION
    ============================ */
    let playersAfterHits = [...players]
    let flagAfterHits = { ...state.flag }
    const survivingBullets: typeof state.bullets = []

    const allBullets = [
      ...state.bullets.map(b => ({
        ...b,
        x: b.x + b.vx * dt,
        z: b.z + b.vz * dt,
        _age: ((b as any)._age ?? 0) + dt,
      })),
      ...newBullets,
    ]

    for (const bullet of allBullets) {
      if (
        (bullet as any)._age >= BULLET_LIFE ||
        Math.abs(bullet.x) > WORLD_CLAMP ||
        Math.abs(bullet.z) > WORLD_CLAMP
      ) continue

      let hit = false

      for (let vi = 0; vi < playersAfterHits.length; vi++) {
        const victim = playersAfterHits[vi]
        if (victim.id === bullet.ownerId || !victim.alive) continue

        const dx = bullet.x - victim.x
        const dz = bullet.z - victim.z
        if (dx * dx + dz * dz > BULLET_HIT_R * BULLET_HIT_R) continue

        // ── CONFIRMED HIT ──
        hit = true
        const shooterIdx = playersAfterHits.findIndex(p => p.id === bullet.ownerId)
        const victimIsCarrier = victim.id === flagAfterHits.carrierId
        const respawn = randomRespawn()

        if (victimIsCarrier) {
          playersAfterHits[vi] = {
            ...victim, ...respawn,
            role: 'chaser', hasGun: true,
            isJumping: false, jumpVelocity: 0, yPos: 0, lastShotAt: 0,
          }
          if (shooterIdx !== -1) {
            const shooter = playersAfterHits[shooterIdx]
            playersAfterHits[shooterIdx] = {
              ...shooter,
              role: 'carrier', hasGun: false,
              kills: shooter.kills + 1,
              flagHoldStart: Date.now(),
            }
            flagAfterHits = { x: shooter.x, z: shooter.z, carrierId: shooter.id }
          }
        } else {
          playersAfterHits[vi] = {
            ...victim, ...respawn,
            role: 'chaser', hasGun: true,
            isJumping: false, jumpVelocity: 0, yPos: 0, lastShotAt: 0,
          }
          if (shooterIdx !== -1) {
            playersAfterHits[shooterIdx] = {
              ...playersAfterHits[shooterIdx],
              kills: playersAfterHits[shooterIdx].kills + 1,
            }
          }
        }

        // Record kill for network broadcast (bullets only belong to local player)
        newKillEvent = {
          victimIndex: vi,
          killerIndex: state.playerIndex,
          respawnX: respawn.x,
          respawnZ: respawn.z,
          wasCarrier: victimIsCarrier,
          ts: now,
        }

        break
      }

      if (!hit) survivingBullets.push(bullet)
    }

    /* ============================
       FLAG PICKUP + CARRY TICK
    ============================ */
    if (flagAfterHits.carrierId === null) {
      for (let i = 0; i < playersAfterHits.length; i++) {
        const p = playersAfterHits[i]
        if (!p.alive) continue
        const dx = p.x - flagAfterHits.x
        const dz = p.z - flagAfterHits.z
        if (dx * dx + dz * dz < FLAG_PICKUP_R * FLAG_PICKUP_R) {
          flagAfterHits.carrierId = p.id
          playersAfterHits[i] = { ...p, role: 'carrier', flagHoldStart: Date.now() }
          if (p.id === state.playerIndex) {
            newFlagEvent = { ts: now }
          }
          break
        }
      }
    } else {
      const ci = playersAfterHits.findIndex(p => p.id === flagAfterHits.carrierId)
      if (ci !== -1 && playersAfterHits[ci].alive) {
        flagAfterHits.x = playersAfterHits[ci].x
        flagAfterHits.z = playersAfterHits[ci].z
        playersAfterHits[ci] = {
          ...playersAfterHits[ci],
          flagTime: playersAfterHits[ci].flagTime + dt * 1000,
        }
      } else {
        if (ci !== -1) {
          flagAfterHits.x = playersAfterHits[ci].x
          flagAfterHits.z = playersAfterHits[ci].z
        }
        flagAfterHits.carrierId = null
      }
    }

    /* ============================
       ELAPSED / PHASE
    ============================ */
    const elapsed = Date.now() - state.startedAt
    const phase: GamePhase = elapsed >= state.sessionDuration ? 'ended' : 'playing'

    return {
      ...state,
      phase,
      players: playersAfterHits,
      bullets: survivingBullets,
      elapsed,
      flag: flagAfterHits,
      lastKillEvent: newKillEvent ?? state.lastKillEvent,
      lastFlagEvent: newFlagEvent ?? state.lastFlagEvent,
    }
  }

  return state
}

export function useGameState({
  sessionMinutes,
  enabled,
  playerIndex = 0,
  playerName,
}: {
  sessionMinutes: number
  enabled: boolean
  playerIndex?: number
  playerName?: string
}) {
  const [state, dispatch] = useReducer(
    reducer,
    sessionMinutes,
    (sm) => makeInitialState(sm, playerIndex, playerName ?? PLAYER_NAMES[playerIndex])
  )

  const keysRef     = useRef<Set<string>>(new Set())
  const lastTimeRef = useRef<number>(performance.now())

  useEffect(() => {
    if (!enabled) return
    dispatch({ type: 'ENABLE' })
    lastTimeRef.current = performance.now()
  }, [enabled])

  useEffect(() => {
    const down = (e: KeyboardEvent) => keysRef.current.add(e.code)
    const up   = (e: KeyboardEvent) => keysRef.current.delete(e.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup',   up)
    }
  }, [])

  useEffect(() => {
    let raf: number
    function loop(now: number) {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now
      dispatch({ type: 'TICK', dt, keys: new Set(keysRef.current), enabled })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [enabled])

  return { state, dispatch }
}
