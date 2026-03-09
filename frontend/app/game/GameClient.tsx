'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001'

type Props = {
  roomId: string
  playerName: string
  onServerState: (room: any) => void
  onGameStart: () => void
  onGameOver: (room: any) => void
  onLeaderboardUpdate: (lb: any[]) => void
  onIdentity: (playerId: string, playerIndex: number) => void
  keysRef: React.MutableRefObject<Set<string>>
  angleRef: React.MutableRefObject<number>
  onShoot: (emit: () => void) => void
}

export function GameClient({
  roomId,
  playerName,
  onServerState,
  onGameStart,
  onGameOver,
  onLeaderboardUpdate,
  onIdentity,
  keysRef,
  angleRef,
  onShoot,
}: Props) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })
    socketRef.current = socket

    // ── Identity ────────────────────────────────────────────────────────────
    socket.on('joined_successfully', ({ playerId, playerIndex }: { playerId: string; playerIndex: number }) => {
      onIdentity(playerId, playerIndex)
    })

    socket.on('match_found', ({ roomId: assignedRoom, playerId, playerIndex }: any) => {
      onIdentity(playerId, playerIndex)
      // roomId already comes from the route/props — just capture identity here
    })

    // ── Game lifecycle ───────────────────────────────────────────────────────
    socket.on('game_start', () => onGameStart())
    socket.on('room_state', (room: any) => onServerState(room))
    socket.on('game_over', (room: any) => onGameOver(room))
    socket.on('leaderboard_update', (lb: any[]) => onLeaderboardUpdate(lb))

    // ── Join the room ────────────────────────────────────────────────────────
    socket.emit('join_room', { roomId, username: playerName })

    // ── Input loop: emit held keys + angle every 50ms ────────────────────────
    const inputInterval = setInterval(() => {
      if (!socket.connected) return
      socket.emit('input', {
        roomId,
        keys: Array.from(keysRef.current),
        angle: angleRef.current,
      })
    }, 50)

    // ── Expose shoot emitter to parent ───────────────────────────────────────
    onShoot(() => {
      socket.emit('shoot', { roomId })
    })

    return () => {
      clearInterval(inputInterval)
      socket.disconnect()
    }
  }, [roomId])

  return null
}