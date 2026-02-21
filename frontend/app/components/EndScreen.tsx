'use client'

import { Player } from '../types'

type Props = {
  players: Player[]
  onRestart: () => void
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`
}

export function EndScreen({ players, onRestart }: Props) {
  const sorted = [...players].sort((a, b) => b.flagTime - a.flagTime)
  const winner = sorted[0]

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(ellipse at center, #0b1f0b 0%, #000 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Courier New", monospace',
      color: 'white',
    }}>
      <div style={{
        fontSize: 11, letterSpacing: 6, color: '#FFD700', marginBottom: 8, opacity: 0.7,
      }}>
        SESSION OVER
      </div>
      <div style={{
        fontSize: 52, fontWeight: 'bold',
        color: winner.color,
        textShadow: `0 0 40px ${winner.color}`,
        marginBottom: 4,
      }}>
        {winner.name} Wins!
      </div>
      <div style={{ color: '#FFFFFF55', fontSize: 13, marginBottom: 48 }}>
        Held the flag for {formatTime(winner.flagTime)}
      </div>

      {/* Results */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        overflow: 'hidden',
        minWidth: 400,
        marginBottom: 44,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '36px 1fr 100px 70px',
          padding: '10px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontSize: 10,
          color: '#FFFFFF44',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          <span>#</span><span>Player</span><span style={{ textAlign: 'right' }}>Flag Time</span><span style={{ textAlign: 'right' }}>Kills</span>
        </div>

        {sorted.map((p, i) => (
          <div key={p.id} style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr 100px 70px',
            padding: '14px 20px',
            borderBottom: i < sorted.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            background: i === 0 ? `${p.color}14` : 'transparent',
          }}>
            <span style={{ color: i === 0 ? '#FFD700' : '#FFFFFF33', fontWeight: 'bold' }}>
              {i + 1}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 12, height: 12, borderRadius: '50%',
                background: p.color,
                boxShadow: i === 0 ? `0 0 10px ${p.color}` : 'none',
                display: 'inline-block',
              }} />
              <span style={{ color: p.color, fontWeight: i === 0 ? 'bold' : 'normal' }}>{p.name}</span>
            </span>
            <span style={{ textAlign: 'right', color: '#FFD700', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(p.flagTime)}
            </span>
            <span style={{ textAlign: 'right', color: '#FF8888' }}>
              ☠ {p.kills}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        onMouseEnter={e => {
          const el = e.target as HTMLButtonElement
          el.style.background = '#FFD700'
          el.style.color = 'black'
        }}
        onMouseLeave={e => {
          const el = e.target as HTMLButtonElement
          el.style.background = 'transparent'
          el.style.color = '#FFD700'
        }}
        style={{
          background: 'transparent',
          border: '2px solid #FFD700',
          color: '#FFD700',
          padding: '14px 60px',
          fontSize: 15,
          letterSpacing: 4,
          cursor: 'pointer',
          borderRadius: 10,
          fontFamily: 'inherit',
          textTransform: 'uppercase',
          transition: 'all 0.2s',
        }}
      >
        Play Again
      </button>
    </div>
  )
}