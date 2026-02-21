'use client'
import { useState } from 'react'
import { SESSION_OPTIONS, PLAYER_COLORS, PLAYER_NAMES } from '../constants'

type Props = {
  onStart: (minutes: number) => void
  initialDuration?: number
}

export function Lobby({ onStart, initialDuration }: Props) {
  const [selected, setSelected] = useState<number>(initialDuration ?? 5)

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at 50% 30%, #0d2b0d 0%, #050f05 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Courier New", monospace',
      userSelect: 'none',
    }}>
      {/* Title */}
      <div style={{ marginBottom: 10 }}>
        <div style={{
          fontSize: 72, fontWeight: 'bold', letterSpacing: 6,
          color: '#FFD700',
          textShadow: '0 0 40px #FFD70088, 0 0 80px #FFD70033',
          lineHeight: 1,
        }}>
          FLAG<span style={{ color: '#ef4444' }}>ZILLA</span>
        </div>
        <div style={{ textAlign: 'center', color: '#FFFFFF33', fontSize: 12, letterSpacing: 4, marginTop: 4 }}>
          CAPTURE · HOLD · WIN
        </div>
      </div>

      {/* Flag decoration */}
      <div style={{ fontSize: 48, margin: '16px 0 28px' }}>🚩</div>

      {/* Duration picker */}
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,215,0,0.2)',
        borderRadius: 14, padding: '24px 32px',
        marginBottom: 28, textAlign: 'center',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ color: '#FFFFFF55', fontSize: 11, letterSpacing: 4, marginBottom: 16 }}>
          SESSION DURATION
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {SESSION_OPTIONS.map(mins => (
            <button
              key={mins}
              onClick={() => setSelected(mins)}
              style={{
                width: 72, height: 72, borderRadius: 10, cursor: 'pointer',
                border: selected === mins ? '2px solid #FFD700' : '2px solid rgba(255,255,255,0.1)',
                background: selected === mins ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)',
                color: selected === mins ? '#FFD700' : '#FFFFFF66',
                fontSize: 22, fontWeight: 'bold',
                fontFamily: '"Courier New", monospace',
                boxShadow: selected === mins ? '0 0 20px #FFD70044' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {mins}
              <div style={{ fontSize: 9, fontWeight: 'normal', letterSpacing: 1, marginTop: 2, color: 'inherit', opacity: 0.7 }}>
                min
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Players */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 32,
      }}>
        {PLAYER_NAMES.map((name, i) => (
          <div key={i} style={{
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid ${PLAYER_COLORS[i]}44`,
            borderRadius: 8, padding: '10px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: PLAYER_COLORS[i],
              boxShadow: `0 0 10px ${PLAYER_COLORS[i]}88`,
            }} />
            <span style={{ color: PLAYER_COLORS[i], fontSize: 11 }}>{name}</span>
            <span style={{ color: '#FFFFFF33', fontSize: 9, letterSpacing: 1 }}>
              {i === 0 ? 'A/D/W/·' : i === 1 ? 'J/L/I/U' : i === 2 ? '←/→/↑//' : '4/6/8/5'}
            </span>
          </div>
        ))}
      </div>

      {/* Start button */}
      <button
        onClick={() => onStart(selected)}
        style={{
          background: 'linear-gradient(135deg, #FFD700, #f59e0b)',
          color: '#000', border: 'none', borderRadius: 10,
          fontSize: 18, fontWeight: 'bold', letterSpacing: 4,
          padding: '16px 56px', cursor: 'pointer',
          fontFamily: '"Courier New", monospace',
          boxShadow: '0 0 30px #FFD70066',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseEnter={e => {
          (e.target as HTMLButtonElement).style.transform = 'scale(1.04)'
          ;(e.target as HTMLButtonElement).style.boxShadow = '0 0 50px #FFD700aa'
        }}
        onMouseLeave={e => {
          (e.target as HTMLButtonElement).style.transform = 'scale(1)'
          ;(e.target as HTMLButtonElement).style.boxShadow = '0 0 30px #FFD70066'
        }}
      >
        START GAME
      </button>

      <div style={{ marginTop: 24, color: '#FFFFFF22', fontSize: 10, letterSpacing: 2 }}>
        HOLD THE FLAG LONGEST TO WIN
      </div>
    </div>
  )
}