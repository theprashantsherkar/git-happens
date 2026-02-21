'use client'
import { Player } from '../types'

type Props = {
  players: Player[]
  onRestart: () => void
}

function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣']

export function EndScreen({ players, onRestart }: Props) {
  const sorted = [...players].sort((a, b) => b.flagTime - a.flagTime)
  const winner = sorted[0]

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at 50% 30%, #1a0a00 0%, #050505 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Courier New", monospace',
      userSelect: 'none',
    }}>
      {/* Header */}
      <div style={{ fontSize: 13, letterSpacing: 8, color: '#FFFFFF33', marginBottom: 8 }}>
        GAME OVER
      </div>
      <div style={{
        fontSize: 56, fontWeight: 'bold', letterSpacing: 4,
        color: winner.color,
        textShadow: `0 0 40px ${winner.color}88`,
        marginBottom: 6,
      }}>
        {winner.name} WINS
      </div>
      <div style={{ fontSize: 14, color: '#FFFFFF44', letterSpacing: 2, marginBottom: 36 }}>
        🚩 held flag for {fmtMs(winner.flagTime)}
      </div>

      {/* Leaderboard */}
      <div style={{
        background: 'rgba(0,0,0,0.65)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14, padding: '20px 32px',
        minWidth: 320, marginBottom: 36,
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ color: '#FFD700', fontSize: 11, letterSpacing: 4, marginBottom: 16, textAlign: 'center' }}>
          FINAL STANDINGS
        </div>
        {sorted.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 8px', marginBottom: 4,
            borderRadius: 7,
            background: i === 0 ? `${p.color}18` : 'transparent',
            border: i === 0 ? `1px solid ${p.color}44` : '1px solid transparent',
          }}>
            <span style={{ fontSize: 20, width: 28 }}>{MEDALS[i]}</span>
            <span style={{
              width: 14, height: 14, borderRadius: '50%',
              background: p.color,
              boxShadow: i === 0 ? `0 0 10px ${p.color}` : 'none',
              flexShrink: 0,
            }} />
            <span style={{
              flex: 1, fontSize: 15, fontWeight: i === 0 ? 'bold' : 'normal',
              color: i === 0 ? p.color : '#ffffffcc',
            }}>
              {p.name}
            </span>
            <span style={{ color: '#FFFFFF66', fontSize: 12, marginRight: 4 }}>
              {p.kills} kills
            </span>
            <span style={{
              color: i === 0 ? '#FFD700' : '#FFFFFF77',
              fontSize: 15, fontWeight: 'bold',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {fmtMs(p.flagTime)}
            </span>
          </div>
        ))}
      </div>

      {/* Restart button */}
      <button
        onClick={onRestart}
        style={{
          background: 'linear-gradient(135deg, #FFD700, #f59e0b)',
          color: '#000', border: 'none', borderRadius: 10,
          fontSize: 16, fontWeight: 'bold', letterSpacing: 4,
          padding: '14px 48px', cursor: 'pointer',
          fontFamily: '"Courier New", monospace',
          boxShadow: '0 0 30px #FFD70066',
        }}
        onMouseEnter={e => (e.target as HTMLButtonElement).style.transform = 'scale(1.04)'}
        onMouseLeave={e => (e.target as HTMLButtonElement).style.transform = 'scale(1)'}
      >
        PLAY AGAIN
      </button>
    </div>
  )
}