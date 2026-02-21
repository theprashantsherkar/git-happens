'use client'

import { useState, useCallback } from 'react'
import { useGameState } from '../hooks/useGameState'
import { GameScene } from '../components/GameScene'
import { HUD } from '../components/HUD'
import { Lobby } from '../components/Lobby'
import { EndScreen } from '../components/EndScreen'

// ─── App shell ────────────────────────────────────────────────────────────────
// Manages the top-level phase transitions: lobby → playing → ended → lobby

export default function FlagRun({ sessionDuration }: { sessionDuration?: number }) {
  const [configuredMinutes, setConfiguredMinutes] = useState<number | null>(null)

  const handleStart = useCallback((minutes: number) => {
    setConfiguredMinutes(minutes)
  }, [])

  const handleRestart = useCallback(() => {
    setConfiguredMinutes(null)
  }, [])

  if (configuredMinutes === null) {
    return <Lobby onStart={handleStart} initialDuration={sessionDuration} />
  }

  return <ActiveGame sessionMinutes={configuredMinutes} onRestart={handleRestart} />
}

// ─── Active game — owns the game state ────────────────────────────────────────

function ActiveGame({
  sessionMinutes,
  onRestart,
}: {
  sessionMinutes: number
  onRestart: () => void
}) {
  const { state } = useGameState({ sessionMinutes })

  if (state.phase === 'ended') {
    return <EndScreen players={state.players} onRestart={onRestart} />
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: '#000',
    }}>
      {/* 3D canvas fills the screen */}
      <GameScene state={state} />

      {/* 2D HUD layer on top */}
      <HUD
        players={state.players}
        elapsed={state.elapsed}
        sessionDuration={state.sessionDuration}
        worldSpeed={state.worldSpeed}
      />
    </div>
  )
}