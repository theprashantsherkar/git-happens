'use client'

import { useState } from 'react'
import { PLAYER_COLORS, PLAYER_NAMES } from '../constants'

type LobbyPhase = 'main' | 'weapon'

type Weapon = {
  id: string
  emoji: string
  name: string
  desc: string
  stats: { speed: number; range: number; power: number }
}

const WEAPONS: Weapon[] = [
  { id: 'hammer',  emoji: '🔨', name: 'HAMMER',  desc: 'Slow, Stuns',       stats: { speed: 1, range: 2, power: 5 } },
  { id: 'sword',   emoji: '⚔️',  name: 'SWORD',   desc: 'Balanced',          stats: { speed: 3, range: 3, power: 3 } },
  { id: 'crowbar', emoji: '🪝',  name: 'CROWBAR', desc: 'Fast, Short Range', stats: { speed: 5, range: 1, power: 2 } },
  { id: 'random',  emoji: '📦',  name: 'RANDOM',  desc: '???',               stats: { speed: 3, range: 3, power: 3 } },
]

const DURATIONS = [3, 5, 10, 20]

const CTRL_HINTS = [
  { move: 'A / D', jump: 'W', shoot: 'Space' },
  { move: 'J / L', jump: 'I', shoot: 'U' },
  { move: '← / →', jump: '↑', shoot: '/' },
  { move: '4 / 6', jump: '8', shoot: '5' },
]

const MOCK_FRIENDS = ['PLAYER_ONE', 'NAME.J', 'RANUZA']

type Props = {
  onStart: (minutes: number) => void
  initialDuration?: number
}

function StatBar({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: 14, height: 8,
          background: i < value ? '#FFD700' : '#1a2a1a',
          border: '1px solid #FFD70066',
          borderRadius: 2,
        }} />
      ))}
    </div>
  )
}

function WeaponCard({ weapon, selected, onClick }: { weapon: Weapon; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        background: selected ? '#1a3a5c' : '#0d1f2d',
        border: `3px solid ${selected ? '#00D4FF' : '#1a3a5c'}`,
        borderRadius: 12,
        padding: '20px 16px',
        textAlign: 'center',
        transition: 'all 0.15s',
        transform: selected ? 'translateY(-4px)' : 'none',
        boxShadow: selected ? '0 8px 24px #00D4FF44' : '0 2px 8px #00000066',
        minWidth: 150,
      }}
    >
      <div style={{
        width: 80, height: 80,
        background: '#0a1520',
        border: `2px solid ${selected ? '#00D4FF' : '#1a3a5c'}`,
        borderRadius: 8,
        margin: '0 auto 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 38,
      }}>
        {weapon.emoji}
      </div>
      <div style={{
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: 10,
        color: selected ? '#00D4FF' : 'white',
        marginBottom: 6,
        letterSpacing: 1,
      }}>
        {weapon.name}
      </div>
      <div style={{
        fontSize: 10,
        color: '#FFFFFF88',
        fontFamily: '"Courier New", monospace',
        marginBottom: 14,
      }}>
        {weapon.desc}
      </div>
      {weapon.id !== 'random' && (
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {(['speed', 'range', 'power'] as const).map(stat => (
            <div key={stat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 9, color: '#FFFFFF55', width: 36, fontFamily: 'monospace', textTransform: 'uppercase' }}>{stat}</span>
              <StatBar value={weapon.stats[stat]} />
            </div>
          ))}
        </div>
      )}
      {weapon.id === 'random' && (
        <div style={{ fontSize: 22, marginTop: 8 }}>❓</div>
      )}
    </div>
  )
}

function PixelButton({ children, onClick, color = '#FFD700', wide = false }: {
  children: React.ReactNode
  onClick: () => void
  color?: string
  wide?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: 12,
        padding: wide ? '14px 48px' : '12px 24px',
        background: hov ? color : '#0d1f2d',
        color: hov ? '#000' : color,
        border: `3px solid ${color}`,
        borderRadius: 6,
        cursor: 'pointer',
        letterSpacing: 2,
        transition: 'all 0.1s',
        boxShadow: hov ? `0 0 20px ${color}88` : `0 4px 0 ${color}44`,
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

export function Lobby({ onStart, initialDuration }: Props) {
  const [phase, setPhase] = useState<LobbyPhase>('main')
  const [duration, setDuration] = useState(
    DURATIONS.includes(initialDuration ?? 0) ? initialDuration! : 5
  )
  const [selectedWeapon, setSelectedWeapon] = useState('sword')
  const [roomCode, setRoomCode] = useState('')

  // ── Weapon select screen ──────────────────────────────────────────────────
  if (phase === 'weapon') {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: 'linear-gradient(180deg, #1a9fd4 0%, #4dc8f0 40%, #7de0f8 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Cloud blobs */}
        {[['12%','15%',100],['75%','8%',120],['45%','20%',90],['88%','30%',110],['5%','60%',80]].map(([l,t,w],i) => (
          <div key={i} style={{
            position: 'absolute', left: l as string, top: t as string,
            width: Number(w), height: 36,
            background: 'rgba(255,255,255,0.35)',
            borderRadius: 40,
            filter: 'blur(6px)',
            pointerEvents: 'none',
          }} />
        ))}

        <h1 style={{
          fontFamily: '"Press Start 2P", "Courier New", monospace',
          fontSize: 26,
          color: 'white',
          textShadow: '3px 3px 0 #00000033',
          marginBottom: 40,
          letterSpacing: 2,
          position: 'relative',
        }}>
          CHOOSE YOUR WEAPON
        </h1>

        <div style={{ display: 'flex', gap: 20, marginBottom: 48, flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
          {WEAPONS.map(w => (
            <WeaponCard key={w.id} weapon={w} selected={selectedWeapon === w.id} onClick={() => setSelectedWeapon(w.id)} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
          <PixelButton onClick={() => setPhase('main')} color="#AAAAAA">← BACK</PixelButton>
          <PixelButton onClick={() => onStart(duration)} color="#44DD44" wide>✓ CONFIRM</PixelButton>
        </div>

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
      </div>
    )
  }

  // ── Main lobby screen ─────────────────────────────────────────────────────
  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #2a1a6e 0%, #4a2a9e 30%, #6a3abe 50%, #4a8a3e 70%, #3a7a2e 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Courier New", monospace',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Pixel border frame */}
      <div style={{
        position: 'absolute', inset: 8,
        border: '4px solid',
        borderColor: '#00D4FF #7B2CBF #FF006E #00D4FF',
        borderRadius: 4,
        pointerEvents: 'none',
        boxShadow: 'inset 0 0 40px rgba(0,212,255,0.08)',
      }} />

      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
      }} />

      {/* Sunset */}
      <div style={{
        position: 'absolute', top: 24, right: 80,
        width: 70, height: 70, borderRadius: '50%',
        background: 'radial-gradient(circle, #FFD700 30%, #FF8C00 60%, transparent 70%)',
        boxShadow: '0 0 32px #FFD70077',
      }} />

      {/* Mountains */}
      <div style={{ position: 'absolute', bottom: 0, right: 120, width: 0, height: 0, borderLeft: '80px solid transparent', borderRight: '80px solid transparent', borderBottom: '120px solid #2a4a1a' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 70, width: 0, height: 0, borderLeft: '55px solid transparent', borderRight: '55px solid transparent', borderBottom: '85px solid #1e3a14' }} />

      {/* ── TOP LEFT: Player profile + friends ── */}
      <div style={{
        position: 'absolute', top: 28, left: 28,
        background: 'rgba(0,0,20,0.78)',
        border: '2px solid #00D4FF',
        borderRadius: 6,
        padding: '12px 14px',
        minWidth: 185,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #00D4FF33' }}>
          <div style={{
            width: 30, height: 30, background: '#1a3a5c',
            border: '2px solid #00D4FF', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>👤</div>
          <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: '#00D4FF' }}>PLAYER_ONE</span>
        </div>

        <div style={{ fontSize: 9, color: '#FFD700', fontFamily: '"Press Start 2P", monospace', marginBottom: 8 }}>MENU</div>
        <div style={{ fontSize: 8, color: '#44FF88', marginBottom: 6, fontFamily: 'monospace' }}>FRIENDS ({MOCK_FRIENDS.length} Online)</div>
        {MOCK_FRIENDS.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: i === 0 ? '#44FF88' : '#FF4444' }} />
            <span style={{ fontSize: 8, color: '#FFFFFFBB', fontFamily: 'monospace' }}>{f}</span>
          </div>
        ))}

        <div style={{ marginTop: 10, fontSize: 8, color: '#FFFFFF66', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 }}>
          ENTER ROOM CODE
        </div>
        <input
          value={roomCode}
          onChange={e => setRoomCode(e.target.value.toUpperCase())}
          placeholder="_ _ _ _"
          maxLength={4}
          style={{
            width: '100%', background: '#0a0a1a',
            border: '2px solid #1a3a5c', borderRadius: 3,
            color: '#00D4FF', fontFamily: 'monospace',
            fontSize: 12, padding: '4px 8px',
            letterSpacing: 4, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* ── TOP RIGHT: Leaderboard ── */}
      <div style={{
        position: 'absolute', top: 28, right: 28,
        background: 'rgba(0,0,20,0.78)',
        border: '2px solid #00D4FF',
        borderRadius: 6,
        padding: '12px 16px',
        minWidth: 155,
      }}>
        <div style={{ fontSize: 8, color: '#FFD700', fontFamily: '"Press Start 2P", monospace', marginBottom: 10, letterSpacing: 1 }}>
          LEADERBOARD
        </div>
        {[['P1', '9999', '#FFD700'], ['P2', '8500', '#00D4FF'], ['P3', '7200', '#FF4444']].map(([p, score, color]) => (
          <div key={p} style={{ display: 'flex', justifyContent: 'space-between', gap: 18, marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: color as string, fontFamily: 'monospace' }}>{p}:</span>
            <span style={{ fontSize: 9, color: color as string, fontFamily: 'monospace' }}>{score}</span>
          </div>
        ))}
      </div>

      {/* ── CENTER: Title ── */}
      <h1 style={{
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: 52,
        margin: '0 0 8px',
        background: 'linear-gradient(180deg, #00D4FF 0%, #7B2CBF 50%, #FF006E 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(3px 3px 0 #FF006E88) drop-shadow(-1px -1px 0 #00D4FF44)',
        letterSpacing: 4,
        position: 'relative',
      }}>
        FLAGZILLA
      </h1>
      <div style={{
        background: 'white', color: '#222',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 9, padding: '6px 18px',
        borderRadius: 3, marginBottom: 20, letterSpacing: 1,
      }}>
        a fun multiplayer game
      </div>

      {/* Stickman */}
      <div style={{ fontSize: 64, marginBottom: 12, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>🏃</div>

      {/* Session duration */}
      <div style={{
        background: 'rgba(0,0,20,0.65)', border: '1px solid #00D4FF33',
        borderRadius: 6, padding: '12px 20px', marginBottom: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <div style={{ fontSize: 8, color: '#FFFFFF55', fontFamily: 'monospace', letterSpacing: 2 }}>SESSION DURATION</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {DURATIONS.map(min => (
            <button key={min} onClick={() => setDuration(min)} style={{
              background: duration === min ? '#FFD700' : 'rgba(255,255,255,0.07)',
              border: `2px solid ${duration === min ? '#FFD700' : '#ffffff22'}`,
              color: duration === min ? '#000' : 'white',
              padding: '6px 14px', borderRadius: 4,
              cursor: 'pointer',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 8, transition: 'all 0.1s',
            }}>
              {min}m
            </button>
          ))}
        </div>
      </div>

      {/* ── BOTTOM BUTTONS ── */}
      <div style={{ display: 'flex', gap: 14 }}>
        <PixelButton onClick={() => setPhase('weapon')} color="#00D4FF">🎩 CUSTOMIZE</PixelButton>
        <PixelButton onClick={() => onStart(duration)} color="#FFD700" wide>▶ PLAY</PixelButton>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
    </div>
  )
}