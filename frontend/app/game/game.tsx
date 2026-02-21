'use client'

import { useState, useCallback } from 'react'
import { useGameState } from '../hooks/useGameState'
import { GameScene } from '../components/GameScene'
import { HUD } from '../components/HUD'
import { EndScreen } from '../components/EndScreen'

// ─── Simple Countdown Overlay ────────────────────────────────────────────────

function Countdown({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(5)

  useState(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setTimeout(onDone, 500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '100px',
        color: '#ffd700',
        zIndex: 100,
      }}
    >
      {count > 0 ? count : 'GO!'}
    </div>
  )
}

// ─── Active Game ─────────────────────────────────────────────────────────────

function ActiveGame({
  sessionMinutes,
  onRestart,
}: {
  sessionMinutes: number
  onRestart: () => void
}) {
  const [countdownDone, setCountdownDone] = useState(false)

  const { state } = useGameState({
    sessionMinutes,
    enabled: countdownDone,
  })

  if (state.phase === 'ended') {
    return <EndScreen players={state.players} onRestart={onRestart} />
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      <GameScene state={state} />

      <HUD
        players={state.players}
        elapsed={state.elapsed}
        sessionDuration={state.sessionDuration}
        worldSpeed={state.worldSpeed}
      />

      {!countdownDone && (
        <Countdown onDone={() => setCountdownDone(true)} />
      )}
    </div>
  )
}