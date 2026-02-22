'use client'
import { useRef, useEffect, useState } from 'react'
import { Player } from '../types'
import { PLAYER_COLORS } from '../constants'

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  players: Player[]
  elapsed: number
  sessionDuration: number
  worldSpeed: number
}

type ChatMsg = { id: number; name: string; color: string; text: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

function fmtCountdown(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

const CTRL = [
  '↑ move · ←/→ turn · Space shoot',
  'W move · A/D turn · F shoot',
  'I move · J/L turn · U shoot',
  '8 move · 4/6 turn · 0 shoot',
]

// ─── Minimap ──────────────────────────────────────────────────────────────────
const MM = 180        // minimap px size
const WORLD = 80      // world half-extent (-80..+80)

function Minimap({ players }: { players: Player[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Convert world x/z to minimap pixel coords
  function toMM(wx: number, wz: number) {
    return {
      x: ((wx + WORLD) / (WORLD * 2)) * MM,
      y: ((wz + WORLD) / (WORLD * 2)) * MM,
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, MM, MM)

    // Background
    ctx.fillStyle = 'rgba(10,20,10,0.88)'
    ctx.roundRect(0, 0, MM, MM, 8)
    ctx.fill()

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const pos = (i / 4) * MM
      ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, MM); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(MM, pos); ctx.stroke()
    }

    // Flag spawn marker (center)
    const center = toMM(0, 0)
    ctx.beginPath()
    ctx.arc(center.x, center.y, 5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,215,0,0.4)'
    ctx.fill()
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 1
    ctx.stroke()

    // Player dots
    players.forEach(p => {
      const { x, y } = toMM(p.x, p.z)
      const isCarrier = p.role === 'carrier' && p.alive

      ctx.beginPath()
      ctx.arc(x, y, isCarrier ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = p.alive ? p.color : p.color + '44'
      ctx.fill()

      if (isCarrier) {
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 2
        ctx.stroke()
        // Mini flag
        ctx.fillStyle = '#dc2626'
        ctx.fillRect(x + 6, y - 10, 2, 10)
        ctx.fillRect(x + 7, y - 10, 8, 5)
      }

      // Direction tick
      if (p.alive) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(
          x + Math.sin(p.angle) * (isCarrier ? 9 : 7),
          y + Math.cos(p.angle) * (isCarrier ? 9 : 7)
        )
        ctx.strokeStyle = p.color
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    })

    // Border
    ctx.strokeStyle = 'rgba(255,215,0,0.35)'
    ctx.lineWidth = 1.5
    ctx.roundRect(0, 0, MM, MM, 8)
    ctx.stroke()

    // Label
    ctx.fillStyle = 'rgba(255,215,0,0.75)'
    ctx.font = 'bold 9px "Courier New", monospace'
    ctx.fillText('WORLD MAP', 6, 13)
  })

  return (
    <canvas
      ref={canvasRef}
      width={MM}
      height={MM}
      style={{ display: 'block', borderRadius: 8 }}
    />
  )
}

// ─── Chat panel ───────────────────────────────────────────────────────────────
let _chatId = 0
const SEED_MSGS: ChatMsg[] = [
  { id: _chatId++, name: 'Red',   color: PLAYER_COLORS[1], text: 'I have the flag!' },
  { id: _chatId++, name: 'Green', color: PLAYER_COLORS[2], text: 'not for long 😈' },
]

function ChatPanel({ players }: { players: Player[] }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(SEED_MSGS)
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const send = () => {
    const text = input.trim()
    if (!text) return
    setMsgs(m => [...m, { id: _chatId++, name: 'Blue', color: PLAYER_COLORS[0], text }])
    setInput('')
  }

  return (
    <div style={{
      position: 'absolute', top: 18, left: 18, zIndex: 10,
      width: 220,
      background: 'rgba(0,0,0,0.78)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      fontFamily: '"Courier New", monospace',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        fontSize: 10, letterSpacing: 3, color: '#FFD700',
        padding: '7px 12px 5px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        💬 ROOM CHAT
      </div>
      <div style={{ overflowY: 'auto', maxHeight: 110, padding: '6px 10px', scrollbarWidth: 'none' }}>
        {msgs.map(m => (
          <div key={m.id} style={{ marginBottom: 4 }}>
            <span style={{ color: m.color, fontWeight: 'bold', fontSize: 10 }}>{m.name}: </span>
            <span style={{ color: '#d1d5db', fontSize: 10 }}>{m.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ display: 'flex', gap: 5, padding: '5px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
          placeholder="Say something…"
          style={{
            flex: 1, background: 'rgba(255,255,255,0.07)',
            border: 'none', borderRadius: 5,
            color: '#fff', fontSize: 10, padding: '4px 7px',
            outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button
          onClick={send}
          style={{
            background: '#FFD700', color: '#000', border: 'none',
            borderRadius: 5, fontSize: 11, fontWeight: 'bold',
            padding: '4px 8px', cursor: 'pointer',
          }}
        >▶</button>
      </div>
    </div>
  )
}

// ─── Main HUD export ──────────────────────────────────────────────────────────
export function HUD({ players, elapsed, sessionDuration }: Props) {
  const remaining = Math.max(0, sessionDuration - elapsed)
  const urgent    = remaining < 30_000
  const sorted    = [...players].sort((a, b) => b.flagTime - a.flagTime)
  const carrier   = players.find(p => p.role === 'carrier' && p.alive)

  return (
    <>
      {/* ── Chat — top left ── */}
      <ChatPanel players={players} />

      {/* ── Timer — top centre ── */}
      <div style={{
        position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, fontFamily: '"Courier New", monospace',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.75)',
          border: `2px solid ${urgent ? '#FF4444' : '#FFD700'}`,
          borderRadius: 8, padding: '8px 22px',
          backdropFilter: 'blur(6px)', textAlign: 'center',
        }}>
          <div style={{
            fontSize: 10, letterSpacing: 3,
            color: urgent ? '#FF4444' : '#FFFFFF55',
            marginBottom: 3,
          }}>
            {urgent ? '⚠ TIME' : 'SESSION'}
          </div>
          <div style={{
            fontSize: 34, fontWeight: 'bold', lineHeight: 1, letterSpacing: 2,
            color: urgent ? '#FF4444' : '#FFD700',
            textShadow: `0 0 16px ${urgent ? '#FF4444' : '#FFD700'}88`,
          }}>
            {fmtCountdown(remaining)}
          </div>
        </div>
      </div>

      {/* ── Minimap — top right ── */}
      <div style={{ position: 'absolute', top: 18, right: 18, zIndex: 10 }}>
        <Minimap players={players} />
      </div>

      {/* ── Leaderboard — below minimap ── */}
      <div style={{
        position: 'absolute', top: 18 + MM + 10, right: 18, zIndex: 10,
        background: 'rgba(0,0,0,0.78)', border: '1px solid #ffffff18',
        borderRadius: 10, padding: '12px 16px', minWidth: MM,
        fontFamily: '"Courier New", monospace', backdropFilter: 'blur(8px)',
      }}>
        <div style={{
          fontSize: 10, letterSpacing: 4, color: '#FFD700',
          marginBottom: 10, borderBottom: '1px solid #ffffff15', paddingBottom: 7,
        }}>
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

      {/* ── Carrier banner — bottom centre ── */}
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