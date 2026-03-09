'use client'
import { useRef, useEffect, useState } from 'react'
import { ServerPlayer, ServerRoom, LeaderboardEntry } from '../hooks/useGameState'

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  leaderboard: LeaderboardEntry[]
  myPlayer: ServerPlayer | null
  room: ServerRoom | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

// Consistent colour per player slot
const SLOT_COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#EAB308']

// ─── Minimap ──────────────────────────────────────────────────────────────────
const MM = 180
const WORLD = 80

function Minimap({ players }: { players: ServerPlayer[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    ctx.fillStyle = 'rgba(10,20,10,0.88)'
    ctx.roundRect(0, 0, MM, MM, 8)
    ctx.fill()

    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 4; i++) {
      const pos = (i / 4) * MM
      ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, MM); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(MM, pos); ctx.stroke()
    }

    // Flag spawn marker
    const center = toMM(0, 0)
    ctx.beginPath()
    ctx.arc(center.x, center.y, 5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,215,0,0.4)'
    ctx.fill()
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 1
    ctx.stroke()

    players.forEach((p, i) => {
      if (!p.isAlive) return
      const color = SLOT_COLORS[p.playerIndex ?? i] ?? '#ffffff'
      const { x, y } = toMM(p.x, p.y)
      const isCarrier = p.hasFlag

      ctx.beginPath()
      ctx.arc(x, y, isCarrier ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      if (isCarrier) {
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = '#dc2626'
        ctx.fillRect(x + 6, y - 10, 2, 10)
        ctx.fillRect(x + 7, y - 10, 8, 5)
      }

      if (p.angle !== undefined) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(
          x + Math.sin(p.angle) * (isCarrier ? 9 : 7),
          y + Math.cos(p.angle) * (isCarrier ? 9 : 7)
        )
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    })

    ctx.strokeStyle = 'rgba(255,215,0,0.35)'
    ctx.lineWidth = 1.5
    ctx.roundRect(0, 0, MM, MM, 8)
    ctx.stroke()

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

// ─── Main HUD export ──────────────────────────────────────────────────────────
export function HUD({ leaderboard, myPlayer, room }: Props) {
  const players = room ? Object.values(room.players) : []
  const carrier = players.find(p => p.hasFlag && p.isAlive) ?? null

  return (
    <>
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
        {leaderboard.map((entry, rank) => {
          const isCarrier = carrier?.username === entry.username
          const color = SLOT_COLORS[rank] ?? '#ffffff'
          return (
            <div key={entry.username} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              marginBottom: 7, padding: '3px 6px', borderRadius: 5,
              background: isCarrier ? `${color}18` : 'transparent',
              border: isCarrier ? `1px solid ${color}44` : '1px solid transparent',
            }}>
              <span style={{ color: rank === 0 ? '#FFD700' : '#FFFFFF33', fontSize: 10, width: 14 }}>{rank + 1}</span>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: isCarrier ? `0 0 8px ${color}` : 'none', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, color: isCarrier ? color : 'white' }}>{entry.username}</span>
              <span style={{ fontSize: 12, color: isCarrier ? '#FFD700' : '#FFFFFF77', fontVariantNumeric: 'tabular-nums' }}>
                {fmtMs(entry.possessionTime)}
              </span>
              {isCarrier && <span style={{ fontSize: 11 }}>🚩</span>}
            </div>
          )
        })}
      </div>

      {/* ── My player status — bottom left ── */}
      {myPlayer && (
        <div style={{
          position: 'absolute', bottom: 16, left: 16, zIndex: 10,
          background: 'rgba(0,0,0,0.75)', border: '2px solid rgba(0,245,255,0.3)',
          padding: '10px 14px', fontFamily: '"Courier New", monospace', fontSize: 11,
          borderRadius: 8,
        }}>
          <div style={{ color: SLOT_COLORS[myPlayer.playerIndex ?? 0], fontWeight: 'bold', marginBottom: 5 }}>
            {myPlayer.username}
          </div>
          <div style={{ color: myPlayer.hasFlag ? '#ffd700' : myPlayer.hasWeapon ? '#22c55e' : '#ef4444' }}>
            {myPlayer.hasFlag ? '🚩 CARRYING FLAG' : myPlayer.hasWeapon ? '🔫 HAS WEAPON' : '⚠ NO WEAPON'}
          </div>
          {!myPlayer.isAlive && (
            <div style={{ color: '#ef4444', marginTop: 4 }}>💀 RESPAWNING...</div>
          )}
        </div>
      )}

      {/* ── Carrier banner — bottom centre ── */}
      {carrier && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, fontFamily: '"Courier New", monospace',
          background: 'rgba(0,0,0,0.72)',
          border: `1px solid ${SLOT_COLORS[carrier.playerIndex ?? 0]}55`,
          borderRadius: 7, padding: '6px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          backdropFilter: 'blur(6px)',
        }}>
          <span>🚩</span>
          <span style={{ color: SLOT_COLORS[carrier.playerIndex ?? 0], fontSize: 14, fontWeight: 'bold' }}>
            {carrier.username}
          </span>
          <span style={{ color: '#FFFFFF55', fontSize: 11 }}>has the flag</span>
          <span style={{ color: '#FFD700', fontSize: 14, fontWeight: 'bold' }}>
            {fmtMs(carrier.possessionTime)}
          </span>
        </div>
      )}
    </>
  )
}