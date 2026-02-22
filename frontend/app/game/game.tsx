'use client'

import { useState, useCallback, useEffect } from 'react'
import { useGameState } from '../hooks/useGameState'
import { GameScene } from '../components/GameScene'
import { HUD } from '../components/HUD'
import { EndScreen } from '../components/EndScreen'

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(5)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setTimeout(onDone, 600)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.82)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      pointerEvents: 'none',
    }}>
      <div style={{
        fontSize: count > 0 ? 120 : 80,
        fontWeight: 'bold',
        fontFamily: '"Courier New", monospace',
        color: count > 0 ? '#ffd700' : '#ffffff',
        letterSpacing: count > 0 ? 0 : 12,
        textShadow: `0 0 60px ${count > 0 ? '#ffd700' : '#ffffff'}88`,
        transition: 'all 0.15s ease',
      }}>
        {count > 0 ? count : 'GO!'}
      </div>
      {count > 0 && (
        <div style={{
          marginTop: 16,
          fontSize: 13,
          letterSpacing: 6,
          color: '#ffffff44',
          fontFamily: '"Courier New", monospace',
        }}>
          GET READY
        </div>
      )}
    </div>
  )
}

// ─── Active Game ──────────────────────────────────────────────────────────────
function ActiveGame({
  sessionMinutes,
  onRestart,
}: {
  sessionMinutes: number
  onRestart: () => void
}) {
  const [countdownDone, setCountdownDone] = useState(false)
  const handleDone = useCallback(() => setCountdownDone(true), [])

  const { state } = useGameState({
    sessionMinutes,
    enabled: countdownDone,
  })

  // ── Game ended — render EndScreen as a full-page overlay, NOT inside Canvas ──
  if (state.phase === 'ended') {
    return (
      <EndScreen players={state.players} onRestart={onRestart} />
    )
  }

  return (
    // Outermost wrapper fills the viewport
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: '#000',
    }}>
      {/* 3D canvas fills the whole background */}
      <GameScene state={state} />

      {/* HUD sits on top via absolute positioning */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',   // let clicks pass through to canvas
        zIndex: 10,
      }}>
        <HUD
          players={state.players}
          elapsed={state.elapsed}
          sessionDuration={state.sessionDuration}
          worldSpeed={state.worldSpeed}
        />
      </div>

      {/* Countdown overlay */}
      {!countdownDone && <Countdown onDone={handleDone} />}
    </div>
  )
}

// ─── Root page ────────────────────────────────────────────────────────────────
export default function GamePage() {
  const [sessionMinutes] = useState(5)
  const [gameKey, setGameKey] = useState(0)

  // Incrementing gameKey forces ActiveGame to fully remount on restart,
  // which resets useGameState to a fresh initial state
  const handleRestart = useCallback(() => setGameKey(k => k + 1), [])

  return (
    <ActiveGame
      key={gameKey}
      sessionMinutes={sessionMinutes}
      onRestart={handleRestart}
    />
  )
}