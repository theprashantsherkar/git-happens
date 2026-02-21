import Link from 'next/link'
import { PLAYER_COLORS } from '../constants'

// Mock global leaderboard — replace with real DB fetch
const GLOBAL_LEADERS = [
  { rank: 1, name: 'ShadowFlag',  color: PLAYER_COLORS[0], wins: 38, totalHoldMs: 4320000 },
  { rank: 2, name: 'RedReaper',   color: PLAYER_COLORS[1], wins: 31, totalHoldMs: 3870000 },
  { rank: 3, name: 'GreenGhost',  color: PLAYER_COLORS[2], wins: 27, totalHoldMs: 3210000 },
  { rank: 4, name: 'YellowBolt',  color: PLAYER_COLORS[3], wins: 22, totalHoldMs: 2980000 },
  { rank: 5, name: 'IronCarrier', color: PLAYER_COLORS[0], wins: 19, totalHoldMs: 2640000 },
  { rank: 6, name: 'BlitzMark',   color: PLAYER_COLORS[1], wins: 15, totalHoldMs: 2100000 },
  { rank: 7, name: 'NeonHold',    color: PLAYER_COLORS[2], wins: 12, totalHoldMs: 1760000 },
  { rank: 8, name: 'DarkRunner',  color: PLAYER_COLORS[3], wins: 9,  totalHoldMs: 1340000 },
]

const MEDALS = ['🥇', '🥈', '🥉']

function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`
}

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #0d2b0d 0%, #050f05 100%)',
      fontFamily: '"Courier New", monospace',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 24px',
    }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 32px',
        background: 'rgba(0,0,0,0.8)',
        borderBottom: '1px solid rgba(255,215,0,0.15)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
      }}>
        <div style={{ fontSize: 22, fontWeight: 'bold', letterSpacing: 4, color: '#FFD700' }}>
          FLAG<span style={{ color: '#ef4444' }}>ZILLA</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login" style={{
            padding: '8px 20px', borderRadius: 7, fontSize: 12,
            border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
            textDecoration: 'none', letterSpacing: 2,
          }}>
            LOGIN
          </Link>
          <Link href="/auth/register" style={{
            padding: '8px 20px', borderRadius: 7, fontSize: 12,
            background: '#FFD700', color: '#000', fontWeight: 'bold',
            textDecoration: 'none', letterSpacing: 2,
          }}>
            REGISTER
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ marginTop: 100, textAlign: 'center', marginBottom: 56 }}>
        <div style={{
          fontSize: 80, fontWeight: 'bold', letterSpacing: 6, lineHeight: 1,
          color: '#FFD700',
          textShadow: '0 0 60px #FFD70066, 0 0 120px #FFD70022',
        }}>
          FLAG<span style={{ color: '#ef4444' }}>ZILLA</span>
        </div>
        <div style={{ color: '#FFFFFF44', fontSize: 13, letterSpacing: 6, marginTop: 10 }}>
          CAPTURE · HOLD · DOMINATE
        </div>
        <div style={{ fontSize: 48, margin: '24px 0' }}>🚩</div>
        <p style={{ color: '#FFFFFF66', fontSize: 13, maxWidth: 420, lineHeight: 1.7, margin: '0 auto 32px' }}>
          Grab the flag. Hold it longer than anyone else. The clock is ticking — and so is everyone else's trigger finger.
        </p>
        <Link href="/game" style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #FFD700, #f59e0b)',
          color: '#000', fontWeight: 'bold', fontSize: 17,
          letterSpacing: 4, padding: '16px 56px',
          borderRadius: 10, textDecoration: 'none',
          boxShadow: '0 0 40px #FFD70055',
        }}>
          PLAY NOW
        </Link>
      </div>

      {/* ── Global Leaderboard ── */}
      <div style={{
        width: '100%', maxWidth: 560,
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,215,0,0.2)',
        borderRadius: 16, padding: '28px 32px',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 5, color: '#FFD700',
          marginBottom: 20, textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 14,
        }}>
          🌍 GLOBAL LEADERBOARD
        </div>

        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 60px 80px 90px',
          gap: 8, marginBottom: 10,
          fontSize: 9, color: '#FFFFFF33', letterSpacing: 2,
          padding: '0 6px',
        }}>
          <span>#</span>
          <span>PLAYER</span>
          <span style={{ textAlign: 'right' }}>WINS</span>
          <span style={{ textAlign: 'right' }}>HOLD TIME</span>
          <span />
        </div>

        {GLOBAL_LEADERS.map((p, i) => (
          <div key={p.rank} style={{
            display: 'grid',
            gridTemplateColumns: '32px 1fr 60px 80px 90px',
            gap: 8, alignItems: 'center',
            padding: '10px 6px',
            borderRadius: 8,
            marginBottom: 4,
            background: i < 3 ? `${p.color}0f` : 'transparent',
            border: i < 3 ? `1px solid ${p.color}22` : '1px solid transparent',
          }}>
            {/* Rank */}
            <span style={{ fontSize: i < 3 ? 18 : 12, color: '#FFFFFF44' }}>
              {i < 3 ? MEDALS[i] : p.rank}
            </span>

            {/* Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: p.color, flexShrink: 0,
                boxShadow: i < 3 ? `0 0 8px ${p.color}` : 'none',
              }} />
              <span style={{
                fontSize: 13,
                color: i < 3 ? p.color : '#ffffffcc',
                fontWeight: i === 0 ? 'bold' : 'normal',
              }}>
                {p.name}
              </span>
            </div>

            {/* Wins */}
            <span style={{
              fontSize: 13, textAlign: 'right',
              color: i === 0 ? '#FFD700' : '#FFFFFF77',
              fontWeight: i === 0 ? 'bold' : 'normal',
            }}>
              {p.wins}
            </span>

            {/* Hold time */}
            <span style={{
              fontSize: 12, textAlign: 'right',
              color: '#FFFFFF55', fontVariantNumeric: 'tabular-nums',
            }}>
              {fmtMs(p.totalHoldMs)}
            </span>

            {/* Play button on hover — static link for now */}
            <div style={{ textAlign: 'right' }}>
              {i === 0 && (
                <span style={{
                  fontSize: 9, color: '#FFD700',
                  letterSpacing: 1, background: 'rgba(255,215,0,0.1)',
                  padding: '2px 7px', borderRadius: 4,
                }}>
                  👑 CHAMPION
                </span>
              )}
            </div>
          </div>
        ))}

        <div style={{
          textAlign: 'center', marginTop: 20,
          fontSize: 10, color: '#FFFFFF22', letterSpacing: 2,
        }}>
          UPDATED AFTER EACH MATCH
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: 48, color: '#FFFFFF18', fontSize: 10, letterSpacing: 3 }}>
        FLAGZILLA © 2025
      </div>
    </div>
  )
}