'use client'
/**
 * GameClient.tsx
 *
 * Wires the socket.io connection into the game.
 * Currently a stub — swap `SOCKET_URL` with your server and uncomment
 * the socket event handlers once your backend is ready.
 *
 * Architecture:
 *   socket events → dispatch() → reducer → re-render
 */

import { useEffect, useRef } from 'react'
// import { io, Socket } from 'socket.io-client'
import { GameState } from '../hooks/useGameState'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001'

type Props = {
  state: GameState
  dispatch: React.Dispatch<any>
  roomId: string
  playerName: string
}

export function GameClient({ state, dispatch, roomId, playerName }: Props) {
  // const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    /**
     * Uncomment and fill in when backend is ready:
     *
     * const socket = io(SOCKET_URL, { query: { roomId, playerName } })
     * socketRef.current = socket
     *
     * // Server broadcasts the authoritative tick
     * socket.on('tick', (serverState: Partial<GameState>) => {
     *   dispatch({ type: 'SERVER_SYNC', payload: serverState })
     * })
     *
     * // Flag events
     * socket.on('flag:captured', ({ playerId }) => {
     *   // handled via tick sync
     * })
     *
     * socket.on('player:killed', ({ killed, shooter }) => {
     *   // handled via tick sync
     * })
     *
     * socket.on('game:ended', () => {
     *   dispatch({ type: 'FORCE_END' })
     * })
     *
     * return () => { socket.disconnect() }
     */

    // Stub: log state changes in dev
    if (process.env.NODE_ENV === 'development') {
      console.debug('[GameClient] phase:', state.phase, '| players:', state.players.length)
    }
  }, [state.phase])

  /**
   * When local player moves, emit to server:
   *
   * export function emitMove(dir: 'left'|'right'|'jump') {
   *   socketRef.current?.emit('player:move', { dir })
   * }
   *
   * export function emitShoot() {
   *   socketRef.current?.emit('player:shoot')
   * }
   */

  // This component renders nothing — it's a side-effect-only client
  return null
}