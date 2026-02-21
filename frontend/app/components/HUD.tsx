'use client'

import { Player } from '../types'

type Props = {
  players: Player[]
  elapsed: number
  sessionDuration: number
  worldSpeed: number
}

function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

function fmtCountdown(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const CTRL = [
  'A/D · W · Space',
  'J/L · I · U',
  '←/→ · ↑ · /',
  '4/6 · 8 · 5',
]

export function HUD({ players, elapsed, sessionDuration, worldSpeed }: Props) {
  const remaining = Math.max(0, sessionDuration - elapsed)
  const urgent = remaining < 30
  const sorted = [...players].sort((a, b) => b.flagTime - a.flagTime)
  const carrier = players.find(p => p.role === 'carrier' && p.alive)
  const speedPct = Math.min(100, ((worldSpeed - 0.04) / 0.06) * 100)

  return (
    <>
      {/* ── Session timer — top left ── */}
      <div style={{
        position: 'absolute', top: 18, left: 18, zIndex: 10,
        fontFamily: '"Courier New", monospace',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.75)',
          border: `2px solid ${urgent ? '#FF4444' : '#FFD700'}`,
          borderRadius: 8, padding: '8px 16px',
          backdropFilter: 'blur(6px)',
        }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: urgent ? '#FF4444' : '#FFFFFF55', textTransform: 'uppercase', marginBottom: 3 }}>
            {urgent ? '⚠ TIME' : 'Session'}
          </div>
          <div style={{
            fontSize: 34, fontWeight: 'bold', lineHeight: 1, letterSpacing: 2,
            color: urgent ? '#FF4444' : '#FFD700',
            textShadow: `0 0 16px ${urgent ? '#FF4444' : '#FFD700'}88`,
          }}>
            {fmtCountdown(remaining)}
          </div>
        </div>
        {/* Speed bar */}
        <div style={{ marginTop: 6, background: 'rgba(0,0,0,0.6)', border: '1px solid #ffffff11', borderRadius: 6, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, color: '#FFFFFF44', letterSpacing: 2 }}>SPEED</span>
          <div style={{ flex: 1, height: 4, background: '#ffffff15', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${speedPct}%`, background: 'linear-gradient(90deg,#00E5FF,#FFD700)', borderRadius: 2, transition: 'width 0.5s' }} />
          </div>
        </div>
      </div>

      {/* ── Leaderboard — top right ── */}
      <div style={{
        position: 'absolute', top: 18, right: 18, zIndex: 10,
        background: 'rgba(0,0,0,0.78)', border: '1px solid #ffffff18',
        borderRadius: 10, padding: '12px 16px', minWidth: 195,
        fontFamily: '"Courier New", monospace', backdropFilter: 'blur(8px)',
      }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: '#FFD700', marginBottom: 10, borderBottom: '1px solid #ffffff15', paddingBottom: 7 }}>
          🏆 FLAG TIME
        </div>
        {sorted.map((p, rank) => {
          const isHolder = p.role === 'carrier' && p.alive
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              marginBottom: 7, padding: '3px 6px', borderRadius: 5,
              background: isHolder ? `${p.color}18` : 'transparent',
              border: isHolder ? `1px solid ${p.color}44` : '1px solid transparent',
            }}>
              <span style={{ color: rank === 0 ? '#FFD700' : '#FFFFFF33', fontSize: 10, width: 14 }}>{rank + 1}</span>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, boxShadow: isHolder ? `0 0 8px ${p.color}` : 'none', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, color: isHolder ? p.color : p.alive ? 'white' : '#FFFFFF44' }}>{p.name}</span>
              <span style={{ fontSize: 12, color: isHolder ? '#FFD700' : '#FFFFFF77', fontVariantNumeric: 'tabular-nums' }}>{fmtMs(p.flagTime)}</span>
              {isHolder && <span style={{ fontSize: 11 }}>🚩</span>}
            </div>
          )
        })}
      </div>

      {/* ── Controls — bottom left ── */}
      <div style={{
        position: 'absolute', bottom: 18, left: 18, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {players.map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(0,0,0,0.55)',
            border: `1px solid ${p.role === 'carrier' && p.alive ? p.color + '88' : '#ffffff11'}`,
            borderRadius: 5, padding: '3px 10px',
            fontFamily: '"Courier New", monospace',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <span style={{ color: p.color, fontSize: 10, width: 38 }}>{p.name}</span>
            <span style={{ color: '#FFFFFF44', fontSize: 9 }}>{CTRL[i]}</span>
            {p.role === 'carrier' && p.alive && <span style={{ fontSize: 9 }}>🚩</span>}
            {!p.alive && <span style={{ fontSize: 9, color: '#FF4444' }}>💀</span>}
          </div>
        ))}
      </div>

      {/* ── Current carrier — bottom center ── */}
      {carrier && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, fontFamily: '"Courier New", monospace',
          background: 'rgba(0,0,0,0.72)',
          border: `1px solid ${carrier.color}55`,
          borderRadius: 7, padding: '6px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          backdropFilter: 'blur(6px)',
        }}>
          <span>🚩</span>
          <span style={{ color: carrier.color, fontSize: 14, fontWeight: 'bold' }}>{carrier.name}</span>
          <span style={{ color: '#FFFFFF55', fontSize: 11 }}>has the flag</span>
          <span style={{ color: '#FFD700', fontSize: 14, fontWeight: 'bold' }}>{fmtMs(carrier.flagTime)}</span>
        </div>
      )}
    </>
  )
}