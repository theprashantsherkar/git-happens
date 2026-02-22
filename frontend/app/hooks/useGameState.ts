// 'use client'
// import { useEffect, useReducer, useRef } from 'react'
// import { Player, Obstacle, Bullet, Flag, GamePhase } from '../types'
// import { PLAYER_COLORS, PLAYER_NAMES } from '../constants'

// const WORLD_SIZE = 80
// const MOVE_SPEED = 12
// const TURN_SPEED = 2.2
// const BULLET_SPEED = 30
// const BULLET_LIFE = 2.5
// const FLAG_PICKUP_R = 2.5

// const GRAVITY = -30
// const JUMP_FORCE = 12

// const SPAWN: [number, number, number][] = [
//   [-30, 0, 30],
//   [30, 0, 30],
//   [-30, 0, -30],
//   [30, 0, -30],
// ]

// export type GameState = {
//   phase: GamePhase
//   players: Player[]
//   obstacles: Obstacle[]
//   bullets: Bullet[]
//   flag: Flag
//   elapsed: number
//   startedAt: number | null  // wall-clock timestamp of when the game was enabled
//   sessionDuration: number
//   worldSpeed: number
// }

// const BINDINGS = [
//   { left: 'ArrowLeft', right: 'ArrowRight', forward: 'ArrowUp', jump: 'Space', shoot: 'KeyK' },
//   { left: 'KeyA', right: 'KeyD', forward: 'KeyW', shoot: 'KeyF' },
//   { left: 'KeyJ', right: 'KeyL', forward: 'KeyI', shoot: 'KeyU' },
//   { left: 'Numpad4', right: 'Numpad6', forward: 'Numpad8', shoot: 'Numpad0' },
// ]

// type Action =
//   | { type: 'TICK'; dt: number; keys: Set<string>; enabled: boolean }
//   | { type: 'START' }
//   | { type: 'ENABLE' }  // dispatched once when countdown finishes

// function clamp(v: number, lo: number, hi: number) {
//   return Math.max(lo, Math.min(hi, v))
// }

// /* ============================ */
// function spawnObstacles(): Obstacle[] {
//   const obs: Obstacle[] = []
//   const types: Obstacle['type'][] = [
//     'tree','tree','tree','tree',
//     'rock','rock',
//     'log',
//     'barrel',
//     'river',
//   ]

//   for (let i = 0; i < 120; i++) {
//     const x = Math.random() * 150 - 75
//     const z = Math.random() * 150 - 75

//     if (Math.abs(x) < 8 && Math.abs(z) < 8) continue

//     obs.push({
//       id: i,
//       x,
//       z,
//       type: types[Math.floor(Math.random() * types.length)]
//     })
//   }

//   return obs
// }

// /* ============================ */
// function makeInitialState(sessionMinutes: number): GameState {
//   const players: Player[] = PLAYER_COLORS.map((color, i) => ({
//     id: i,
//     name: PLAYER_NAMES[i],
//     color,
//     x: SPAWN[i][0],
//     z: SPAWN[i][2],
//     angle: Math.atan2(-SPAWN[i][0], -SPAWN[i][2]),
//     vx: 0,
//     vz: 0,
//     alive: true,
//     role: 'chaser',
//     flagTime: 0,
//     flagHoldStart: null,
//     kills: 0,
//     isJumping: false,
//     jumpVelocity: 0,
//     yPos: 0,
//     speedMultiplier: 1,
//   }))

//   return {
//     phase: 'playing',
//     players,
//     obstacles: spawnObstacles(),
//     bullets: [],
//     flag: { x: 0, z: 0, carrierId: null },
//     elapsed: 0,
//     startedAt: null,          // not started until ENABLE is dispatched
//     sessionDuration: sessionMinutes * 60 * 1000,
//     worldSpeed: 1,
//   }
// }

// let nextBulletId = 1000

// /* ============================ */
// function reducer(state: GameState, action: Action): GameState {
//   if (action.type === 'START') return state

//   // ── POINT 4: Set startedAt to current wall-clock time, once ──
//   if (action.type === 'ENABLE') {
//     return { ...state, startedAt: Date.now() }
//   }

//   if (action.type === 'TICK') {
//     const { dt, keys, enabled } = action

//     // ── POINT 4 (guard): Don't tick until enabled and startedAt is set ──
//     if (!enabled || state.phase !== 'playing' || state.startedAt === null) return state

//     const now = Date.now()
//     const newBullets: Bullet[] = []

//     /* ============================
//        PLAYER UPDATE
//     ============================ */
//     const players = state.players.map((p, i) => {
//       if (!p.alive) return p
//       const b = BINDINGS[i]
//       if (!b) return p

//       let angle = p.angle
//       if (keys.has(b.left)) angle += TURN_SPEED * dt
//       if (keys.has(b.right)) angle -= TURN_SPEED * dt

//       const prevX = p.x
//       const prevZ = p.z

//       let x = p.x
//       let z = p.z

//       let speedMultiplier = 1

//       if (keys.has(b.forward)) {
//         x += Math.sin(angle) * MOVE_SPEED * dt
//         z += Math.cos(angle) * MOVE_SPEED * dt
//       }

//       x = clamp(x, -WORLD_SIZE, WORLD_SIZE)
//       z = clamp(z, -WORLD_SIZE, WORLD_SIZE)

//       /* ---- Jump ---- */
//       let yPos = p.yPos
//       let jumpVelocity = p.jumpVelocity
//       let isJumping = p.isJumping

//       if (b.jump && keys.has(b.jump) && !isJumping) {
//         isJumping = true
//         jumpVelocity = JUMP_FORCE
//       }

//       if (isJumping) {
//         jumpVelocity += GRAVITY * dt
//         yPos += jumpVelocity * dt
//         if (yPos <= 0) {
//           yPos = 0
//           jumpVelocity = 0
//           isJumping = false
//         }
//       }

//       /* ---- Obstacles ---- */
//       for (const obs of state.obstacles) {
//         const dx = x - obs.x
//         const dz = z - obs.z
//         const dist = Math.sqrt(dx * dx + dz * dz)

//         if (obs.type === 'river' && dist < 3) {
//           speedMultiplier = 0.4
//         }

//         if (
//           (obs.type === 'tree' ||
//            obs.type === 'rock' ||
//            obs.type === 'log' ||
//            obs.type === 'barrel') &&
//           dist < 1.8 &&
//           yPos < 1
//         ) {
//           x = prevX
//           z = prevZ
//         }
//       }

//       /* ---- Shooting ---- */
//       if (b.shoot && keys.has(b.shoot)) {
//         const lastShot = (p as any)._lastShot ?? 0
//         if (now - lastShot > 350) {
//           newBullets.push({
//             id: nextBulletId++,
//             ownerId: i,
//             x: p.x,
//             z: p.z,
//             vx: Math.sin(angle) * BULLET_SPEED,
//             vz: Math.cos(angle) * BULLET_SPEED,
//           })
//           ;(p as any)._lastShot = now
//         }
//       }

//       return {
//         ...p,
//         x,
//         z,
//         angle,
//         yPos,
//         jumpVelocity,
//         isJumping,
//         speedMultiplier,
//       }
//     })

//     /* ============================
//        BULLETS
//     ============================ */
//     const bullets = [
//       ...state.bullets
//         .map(b => ({
//           ...b,
//           x: b.x + b.vx * dt,
//           z: b.z + b.vz * dt,
//           _age: ((b as any)._age ?? 0) + dt,
//         }))
//         .filter(b => (b as any)._age < BULLET_LIFE),
//       ...newBullets,
//     ]

//     /* ============================
//        FLAG LOGIC 
//     ============================ */
//     let flag = { ...state.flag }
//     let playersUpdated = [...players]

//     if (flag.carrierId === null) {
//       for (let i = 0; i < playersUpdated.length; i++) {
//         const p = playersUpdated[i]
//         if (!p.alive) continue

//         const dx = p.x - flag.x
//         const dz = p.z - flag.z

//         if (dx * dx + dz * dz < FLAG_PICKUP_R * FLAG_PICKUP_R) {
//           flag.carrierId = p.id
//           playersUpdated[i] = {
//             ...p,
//             role: 'carrier',
//             flagHoldStart: Date.now(),
//           }
//           break
//         }
//       }
//     } else {
//       const carrierIndex = playersUpdated.findIndex(p => p.id === flag.carrierId)

//       if (carrierIndex !== -1) {
//         const carrier = playersUpdated[carrierIndex]

//         if (carrier.alive) {
//           flag.x = carrier.x
//           flag.z = carrier.z

//           playersUpdated[carrierIndex] = {
//             ...carrier,
//             flagTime: carrier.flagTime + dt * 1000,
//           }
//         } else {
//           flag.carrierId = null
//           flag.x = carrier.x
//           flag.z = carrier.z
//         }
//       } else {
//         flag.carrierId = null
//       }
//     }

//     // ── POINT 3: elapsed and phase derived from wall-clock, not accumulated dt ──
//     const elapsed = Date.now() - state.startedAt
//     const phase: GamePhase = elapsed >= state.sessionDuration ? 'ended' : 'playing'

//     return {
//       ...state,
//       phase,
//       players: playersUpdated,
//       bullets,
//       elapsed,        // wall-clock based — never pauses when tab is hidden
//       flag,
//     }
//   }

//   return state
// }

// /* ============================ */
// export function useGameState({
//   sessionMinutes,
//   enabled,
// }: {
//   sessionMinutes: number
//   enabled: boolean
// }) {
//   const [state, dispatch] = useReducer(
//     reducer,
//     sessionMinutes,
//     makeInitialState
//   )

//   const keysRef = useRef<Set<string>>(new Set())
//   const lastTimeRef = useRef<number>(performance.now())

//   // ── POINT 4: Dispatch ENABLE once when enabled flips to true ──
//   useEffect(() => {
//     if (!enabled) return
//     dispatch({ type: 'ENABLE' })
//     lastTimeRef.current = performance.now()
//   }, [enabled])

//   useEffect(() => {
//     const down = (e: KeyboardEvent) => keysRef.current.add(e.code)
//     const up = (e: KeyboardEvent) => keysRef.current.delete(e.code)
//     window.addEventListener('keydown', down)
//     window.addEventListener('keyup', up)
//     return () => {
//       window.removeEventListener('keydown', down)
//       window.removeEventListener('keyup', up)
//     }
//   }, [])

//   useEffect(() => {
//     let raf: number
//     function loop(now: number) {
//       const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
//       lastTimeRef.current = now

//       dispatch({
//         type: 'TICK',
//         dt,
//         keys: new Set(keysRef.current),
//         enabled,
//       })

//       raf = requestAnimationFrame(loop)
//     }

//     raf = requestAnimationFrame(loop)
//     return () => cancelAnimationFrame(raf)
//   }, [enabled])

//   return { state }
// }

'use client'
import { useEffect, useReducer, useRef } from 'react'
import { Player, Obstacle, Bullet, Flag, GamePhase } from '../types'
import { PLAYER_COLORS, PLAYER_NAMES } from '../constants'

const WORLD_SIZE = 80
const WALL_T_HALF = 0.6      // half of Track.tsx WALL_T (1.2) — player stops at inner brick face
const WORLD_CLAMP = WORLD_SIZE - WALL_T_HALF  // 79.4
const MOVE_SPEED = 12
const TURN_SPEED = 2.2
const BULLET_SPEED = 30
const BULLET_LIFE = 2.5
const FLAG_PICKUP_R = 2.5

const GRAVITY = -30
const JUMP_FORCE = 12

const SPAWN: [number, number, number][] = [
  [-30, 0, 30],
  [30, 0, 30],
  [-30, 0, -30],
  [30, 0, -30],
]

export type GameState = {
  phase: GamePhase
  players: Player[]
  obstacles: Obstacle[]
  bullets: Bullet[]
  flag: Flag
  elapsed: number
  startedAt: number | null  // wall-clock timestamp of when the game was enabled
  sessionDuration: number
  worldSpeed: number
}

const BINDINGS = [
  { left: 'ArrowLeft', right: 'ArrowRight', forward: 'ArrowUp', jump: 'Space', shoot: 'KeyK' },
  { left: 'KeyA', right: 'KeyD', forward: 'KeyW', shoot: 'KeyF' },
  { left: 'KeyJ', right: 'KeyL', forward: 'KeyI', shoot: 'KeyU' },
  { left: 'Numpad4', right: 'Numpad6', forward: 'Numpad8', shoot: 'Numpad0' },
]

type Action =
  | { type: 'TICK'; dt: number; keys: Set<string>; enabled: boolean }
  | { type: 'START' }
  | { type: 'ENABLE' }  // dispatched once when countdown finishes

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

/* ============================ */
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

    obs.push({
      id: i,
      x,
      z,
      type: types[Math.floor(Math.random() * types.length)]
    })
  }

  return obs
}

/* ============================ */
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
    speedMultiplier: 1,
  }))

  return {
    phase: 'playing',
    players,
    obstacles: spawnObstacles(),
    bullets: [],
    flag: { x: 0, z: 0, carrierId: null },
    elapsed: 0,
    startedAt: null,          // not started until ENABLE is dispatched
    sessionDuration: sessionMinutes * 60 * 1000,
    worldSpeed: 1,
  }
}

let nextBulletId = 1000

/* ============================ */
function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'START') return state

  // ── POINT 4: Set startedAt to current wall-clock time, once ──
  if (action.type === 'ENABLE') {
    return { ...state, startedAt: Date.now() }
  }

  if (action.type === 'TICK') {
    const { dt, keys, enabled } = action

    // ── POINT 4 (guard): Don't tick until enabled and startedAt is set ──
    if (!enabled || state.phase !== 'playing' || state.startedAt === null) return state

    const now = Date.now()
    const newBullets: Bullet[] = []

    /* ============================
       PLAYER UPDATE
    ============================ */
    const players = state.players.map((p, i) => {
      if (!p.alive) return p
      const b = BINDINGS[i]
      if (!b) return p

      let angle = p.angle
      if (keys.has(b.left)) angle += TURN_SPEED * dt
      if (keys.has(b.right)) angle -= TURN_SPEED * dt

      const prevX = p.x
      const prevZ = p.z

      let x = p.x
      let z = p.z

      let speedMultiplier = 1

      if (keys.has(b.forward)) {
        x += Math.sin(angle) * MOVE_SPEED * dt
        z += Math.cos(angle) * MOVE_SPEED * dt
      }

      x = clamp(x, -WORLD_CLAMP, WORLD_CLAMP)
      z = clamp(z, -WORLD_CLAMP, WORLD_CLAMP)

      /* ---- Jump ---- */
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
        if (yPos <= 0) {
          yPos = 0
          jumpVelocity = 0
          isJumping = false
        }
      }

      /* ---- Obstacles ---- */
      for (const obs of state.obstacles) {
        const dx = x - obs.x
        const dz = z - obs.z
        const dist = Math.sqrt(dx * dx + dz * dz)

        if (obs.type === 'river' && dist < 3) {
          speedMultiplier = 0.4
        }

        if (
          (obs.type === 'tree' ||
           obs.type === 'rock' ||
           obs.type === 'log' ||
           obs.type === 'barrel') &&
          dist < 1.8 &&
          yPos < 1
        ) {
          x = prevX
          z = prevZ
        }
      }

      /* ---- Shooting ---- */
      if (b.shoot && keys.has(b.shoot)) {
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

      return {
        ...p,
        x,
        z,
        angle,
        yPos,
        jumpVelocity,
        isJumping,
        speedMultiplier,
      }
    })

    /* ============================
       BULLETS
    ============================ */
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

    /* ============================
       FLAG LOGIC 
    ============================ */
    let flag = { ...state.flag }
    let playersUpdated = [...players]

    if (flag.carrierId === null) {
      for (let i = 0; i < playersUpdated.length; i++) {
        const p = playersUpdated[i]
        if (!p.alive) continue

        const dx = p.x - flag.x
        const dz = p.z - flag.z

        if (dx * dx + dz * dz < FLAG_PICKUP_R * FLAG_PICKUP_R) {
          flag.carrierId = p.id
          playersUpdated[i] = {
            ...p,
            role: 'carrier',
            flagHoldStart: Date.now(),
          }
          break
        }
      }
    } else {
      const carrierIndex = playersUpdated.findIndex(p => p.id === flag.carrierId)

      if (carrierIndex !== -1) {
        const carrier = playersUpdated[carrierIndex]

        if (carrier.alive) {
          flag.x = carrier.x
          flag.z = carrier.z

          playersUpdated[carrierIndex] = {
            ...carrier,
            flagTime: carrier.flagTime + dt * 1000,
          }
        } else {
          flag.carrierId = null
          flag.x = carrier.x
          flag.z = carrier.z
        }
      } else {
        flag.carrierId = null
      }
    }

    // ── POINT 3: elapsed and phase derived from wall-clock, not accumulated dt ──
    const elapsed = Date.now() - state.startedAt
    const phase: GamePhase = elapsed >= state.sessionDuration ? 'ended' : 'playing'

    return {
      ...state,
      phase,
      players: playersUpdated,
      bullets,
      elapsed,        // wall-clock based — never pauses when tab is hidden
      flag,
    }
  }

  return state
}

/* ============================ */
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

  // ── POINT 4: Dispatch ENABLE once when enabled flips to true ──
  useEffect(() => {
    if (!enabled) return
    dispatch({ type: 'ENABLE' })
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
    return () => cancelAnimationFrame(raf)
  }, [enabled])

  return { state }
}