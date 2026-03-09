'use client'
import { useRouter } from 'next/navigation'
import { ServerPlayer } from '../hooks/useGameState'

type Props = {
  players: ServerPlayer[]
  myPlayerId: string | null
  onRestart?: () => void
}

const SLOT_COLORS  = ['#3B82F6', '#EF4444', '#22C55E', '#EAB308']
const MEDALS       = ['🥇', '🥈', '🥉', '4️⃣']

function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

export function EndScreen({ players, myPlayerId, onRestart }: Props) {
  const router  = useRouter()
  const sorted  = [...players].sort((a, b) => b.possessionTime - a.possessionTime)
  const winner  = sorted[0]

  if (!winner) return null

  const winnerColor = SLOT_COLORS[winner.playerIndex ?? 0]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.93)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', zIndex: 100,
      fontFamily: "'Press Start 2P', monospace",
    }}>
      {/* Winner banner */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: '#556688', letterSpacing: 3, marginBottom: 12 }}>
          GAME OVER
        </div>
        <div style={{ fontSize: 22, color: winnerColor, textShadow: `0 0 20px ${winnerColor}` }}>
          🏆 {winner.username} WINS!
        </div>
        <div style={{ fontSize: 10, color: '#7799bb', marginTop: 10 }}>
          Held flag for {fmtMs(winner.possessionTime)}
        </div>
      </div>

      {/* Scoreboard */}
      <div style={{
        background: 'rgba(10,5,30,0.9)',
        border: '2px solid rgba(0,245,255,0.2)',
        padding: '20px 32px',
        minWidth: 420,
        marginBottom: 32,
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '32px 1fr 80px 60px',
          gap: 8, marginBottom: 12,
          fontSize: 7, color: '#334466', letterSpacing: 2,
          borderBottom: '1px solid rgba(0,245,255,0.1)', paddingBottom: 8,
        }}>
          <span>#</span><span>PLAYER</span><span style={{ textAlign: 'right' }}>HOLD</span><span style={{ textAlign: 'right' }}>KILLS</span>
        </div>

        {sorted.map((p, i) => {
          const color  = SLOT_COLORS[p.playerIndex ?? i]
          const isMe   = p.id === myPlayerId
          return (
            <div key={p.id} style={{
              display: 'grid', gridTemplateColumns: '32px 1fr 80px 60px',
              gap: 8, alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: isMe ? 'rgba(0,245,255,0.05)' : 'transparent',
            }}>
              <span style={{ fontSize: 14 }}>{MEDALS[i]}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: i === 0 ? `0 0 8px ${color}` : 'none' }} />
                <span style={{ fontSize: 11, color: isMe ? '#00f5ff' : i === 0 ? color : '#aac4dd' }}>
                  {p.username}{isMe ? ' (YOU)' : ''}
                </span>
              </div>
              <span style={{ fontSize: 12, color: '#ffd700', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {fmtMs(p.possessionTime)}
              </span>
              <span style={{ fontSize: 12, color: '#aad4ff', textAlign: 'right' }}>
                {p.kills ?? 0}
              </span>
            </div>
          )
        })}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 16 }}>
        <button
          onClick={() => router.push('/home')}
          style={{
            padding: '12px 24px', background: 'transparent',
            color: '#00f5ff', border: '2px solid #00f5ff',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 9, letterSpacing: 1,
          }}
        >
          ← HOME
        </button>
        {onRestart && (
          <button
            onClick={onRestart}
            style={{
              padding: '12px 24px', background: '#ff6b1a',
              color: '#fff', border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 9, letterSpacing: 1,
            }}
          >
            PLAY AGAIN ▶
          </button>
        )}
      </div>
    </div>
  )
}