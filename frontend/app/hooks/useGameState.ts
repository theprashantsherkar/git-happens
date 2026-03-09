/**
 * useGameState.ts
 *
 * In server-authoritative mode the game loop runs on the backend.
 * This hook:
 *   1. Holds the latest room_state snapshot from the server
 *   2. Exposes applyServerState() so GameClient can push updates in
 *   3. Derives the local player from socket.id / playerIndex
 *   4. Keeps refs for live keyboard input (read by GameClient input loop)
 *   5. Runs a lightweight interpolation rAF so motion looks smooth
 *      between 50ms server ticks
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types matching your backend room shape ───────────────────────────────────
export type ServerPlayer = {
  id: string           // socket.id
  username: string
  playerIndex: number  // 0-3
  x: number
  y: number
  angle: number
  hasFlag: boolean
  hasWeapon: boolean
  isAlive: boolean
  possessionTime: number
  kills?: number
}

export type ServerFlag = {
  x: number
  y: number
  holderId: string | null
}

export type ServerRoom = {
  players: Record<string, ServerPlayer>
  flag: ServerFlag
  gameStartTime: number
}

export type GamePhase = 'waiting' | 'playing' | 'ended'

export type LeaderboardEntry = {
  username: string
  possessionTime: number
  kills: number
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useGameState() {
  // Identity — set once on joined_successfully / match_found
  const [myPlayerId, setMyPlayerId]       = useState<string | null>(null)
  const [myPlayerIndex, setMyPlayerIndex] = useState<number | null>(null)

  // Server state
  const [room, setRoom]           = useState<ServerRoom | null>(null)
  const [phase, setPhase]         = useState<GamePhase>('waiting')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [endRoom, setEndRoom]     = useState<ServerRoom | null>(null)

  // Interpolated render state (smoothed between server ticks)
  const [renderPlayers, setRenderPlayers] = useState<ServerPlayer[]>([])
  const prevPlayersRef = useRef<Record<string, ServerPlayer>>({})
  const latestPlayersRef = useRef<Record<string, ServerPlayer>>({})
  const lastTickRef = useRef<number>(Date.now())
  const TICK_MS = 50

  // Input refs — GameClient reads these every 50ms and emits to server
  const keysRef  = useRef<Set<string>>(new Set())
  const angleRef = useRef<number>(0)

  // Shoot emitter — GameClient injects this via onShoot callback
  const shootEmitRef = useRef<(() => void) | null>(null)

  // ── Identity ──────────────────────────────────────────────────────────────
  const setIdentity = useCallback((playerId: string, playerIndex: number) => {
    setMyPlayerId(playerId)
    setMyPlayerIndex(playerIndex)
  }, [])

  // ── Server state ingestion ────────────────────────────────────────────────
  const applyServerState = useCallback((incomingRoom: ServerRoom) => {
    prevPlayersRef.current   = latestPlayersRef.current
    latestPlayersRef.current = incomingRoom.players
    lastTickRef.current      = Date.now()
    setRoom(incomingRoom)
  }, [])

  const handleGameStart = useCallback(() => {
    setPhase('playing')
  }, [])

  const handleGameOver = useCallback((finalRoom: ServerRoom) => {
    setPhase('ended')
    setEndRoom(finalRoom)
  }, [])

  const handleLeaderboardUpdate = useCallback((lb: LeaderboardEntry[]) => {
    setLeaderboard(lb)
  }, [])

  // ── Interpolation rAF ─────────────────────────────────────────────────────
  // Smoothly lerp player positions between server ticks so motion isn't choppy
  useEffect(() => {
    let rafId: number

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      const t = Math.min((Date.now() - lastTickRef.current) / TICK_MS, 1)
      const prev   = prevPlayersRef.current
      const latest = latestPlayersRef.current

      const interpolated = Object.values(latest).map(p => {
        const old = prev[p.id]
        if (!old) return p
        return {
          ...p,
          x: lerp(old.x, p.x, t),
          y: lerp(old.y, p.y, t),
        }
      })

      setRenderPlayers(interpolated)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // ── Key tracking ──────────────────────────────────────────────────────────
  useEffect(() => {
    const SHOOT_KEYS: Record<number, string> = { 0: 'k', 1: 'f', 2: 'u', 3: 'Numpad0' }

    const onDown = (e: KeyboardEvent) => {
      const key = e.code === 'Numpad0' ? 'Numpad0' : e.key.toLowerCase()
      keysRef.current.add(key)

      // Shoot: only fire for this player's assigned key
      if (myPlayerIndex !== null && key === SHOOT_KEYS[myPlayerIndex]) {
        shootEmitRef.current?.()
      }
    }

    const onUp = (e: KeyboardEvent) => {
      const key = e.code === 'Numpad0' ? 'Numpad0' : e.key.toLowerCase()
      keysRef.current.delete(key)
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [myPlayerIndex])

  // ── Derived: my own player object ────────────────────────────────────────
  const myPlayer = myPlayerId && room
    ? room.players[myPlayerId] ?? null
    : null

  return {
    // State
    phase,
    room,
    renderPlayers,        // use this in your 3D scene
    myPlayer,
    myPlayerId,
    myPlayerIndex,
    leaderboard,
    endRoom,

    // Callbacks for GameClient
    applyServerState,
    handleGameStart,
    handleGameOver,
    handleLeaderboardUpdate,
    setIdentity,

    // Input refs for GameClient
    keysRef,
    angleRef,
    shootEmitRef,
  }
}