"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMusic } from "../hooks/useAudio";
import axios from "axios";
import { BACKEND_URI } from "../page";
import { getStoredToken, clearStoredToken } from "../lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────
type Profile = {
  id: string
  username: string
  email: string
  totalWins: number
  totalPossessionTime: number
  totalKills: number
}

type LeaderEntry = {
  rank: number
  username: string
  totalWins: number
  totalPossessionTime: number
  totalKills: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MEDALS = ["🥇", "🥈", "🥉"]

const WORDMARK_COLORS = [
  "#00f5ff", // F - Cyan
  "#00f5ff", // L - Cyan
  "#3dba4e", // A - Green
  "#3dba4e", // G - Green
  "#ffd700", // Z - Yellow
  "#ffd700", // I - Yellow
  "#ff6b1a", // L - Orange
  "#ff6b1a", // L - Orange
  "#ff2d78", // A - Pink
];

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 20 }: { w?: string | number; h?: number }) {
  return (
    <div style={{
      width: w, height: h,
      background: "linear-gradient(90deg, rgba(0,245,255,0.04) 25%, rgba(0,245,255,0.12) 50%, rgba(0,245,255,0.04) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
      borderRadius: 2,
    }} />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  useMusic("nav")
  const router = useRouter()

  const [profile, setProfile]               = useState<Profile | null>(null)
  const [leaders, setLeaders]               = useState<LeaderEntry[]>([])
  const [profileErr, setProfileErr]         = useState(false)
  const [leadersErr, setLeadersErr]         = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [leadersLoading, setLeadersLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      const token = getStoredToken()
      if (!token) { router.push("/"); return }

      let userId: string
      try {
        const decoded = jwtDecode<{ id: string }>(token)
        userId = decoded.id
      } catch {
        router.push("/")
        return
      }

      try {
        const { data } = await axios.get(
          `${BACKEND_URI}app/api/user-routes/get-user-profile/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        )
        if (!cancelled && data?.user) {
          const u = data.user
          setProfile({
            id:                  u._id,
            username:            u.username,
            email:               u.email,
            totalWins:           u.totalWins           ?? 0,
            totalPossessionTime: u.totalPossessionTime ?? 0,
            totalKills:          u.totalKills          ?? 0,
          })
        }
      } catch {
        if (!cancelled) setProfileErr(true)
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    loadProfile()
    return () => { cancelled = true }
  }, [router])

  useEffect(() => {
    let cancelled = false

    async function loadLeaderboard() {
      try {
        const token = getStoredToken()
        const { data } = await axios.get(
          `${BACKEND_URI}app/api/leaderboard/global`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
          }
        )
        const list = data?.leaderboard || (Array.isArray(data) ? data : []);
        if (!cancelled && Array.isArray(list)) {
          setLeaders(
            list.map((u: any, i: number) => ({
              rank: i + 1,
              username: u.username,
              totalWins: u.totalWins ?? 0,
              totalPossessionTime: u.totalPossessionTime ?? 0,
              totalKills: u.totalKills ?? 0,
            }))
          )
        }
      } catch {
        if (!cancelled) setLeadersErr(true)
      } finally {
        if (!cancelled) setLeadersLoading(false)
      }
    }

    loadLeaderboard()
    return () => { cancelled = true }
  }, [])

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_URI}app/api/user-routes/logout`,
        { withCredentials: true }
      )
      if (data.success) clearStoredToken()
    } catch {}
    clearStoredToken()
    router.push("/")
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        html, body {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #050212;
          color: #fff;
          font-family: 'VT323', monospace;
        }

        /* ─── Full-Viewport Split Layout (100vw x 100vh) ────────────────────── */
        .split-page {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          background: #050212;
          overflow: hidden;
        }

        /* ─── Center Vertical Seam & Glowing Line ────────────────────────────── */
        .center-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #00f5ff;
          box-shadow: 0 0 16px rgba(0, 245, 255, 0.8), 0 0 32px rgba(0, 245, 255, 0.4);
          z-index: 10;
          transform: translateX(-50%);
        }

        /* ─── Vertical FLAGZILLA Wordmark Pill ─────────────────────────────── */
        .vertical-wordmark {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 25;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          background: rgba(5, 2, 18, 0.95);
          padding: 16px 12px;
          border: 2px solid #00f5ff;
          box-shadow: 0 0 24px rgba(0, 245, 255, 0.5), inset 0 0 12px rgba(0, 245, 255, 0.2);
          font-family: 'Press Start 2P', monospace;
          font-size: 16px;
          line-height: 1;
          pointer-events: auto;
        }

        .vertical-wordmark::before {
          content: '';
          position: absolute;
          top: -4px; left: -4px;
          width: 8px; height: 8px;
          border-top: 2px solid #ffd700;
          border-left: 2px solid #ffd700;
        }

        .vertical-wordmark::after {
          content: '';
          position: absolute;
          bottom: -4px; right: -4px;
          width: 8px; height: 8px;
          border-bottom: 2px solid #ffd700;
          border-right: 2px solid #ffd700;
        }

        .wordmark-letter {
          display: block;
          filter: drop-shadow(2px 2px 0 #000);
          text-shadow: 0 0 6px currentColor;
        }

        /* ─── Left Half: Unboxed Global Leaderboard (50% Width) ──────────────── */
        .half-left {
          width: 50%;
          height: 100%;
          padding: 40px 60px 40px 48px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* ─── Right Half: Unboxed Profile (50% Width) ───────────────────────── */
        .half-right {
          width: 50%;
          height: 100%;
          padding: 40px 48px 40px 60px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          overflow-y: auto;
        }

        @media (max-width: 1024px) {
          .split-page {
            flex-direction: column;
            overflow-y: auto;
            height: auto;
            min-height: 100vh;
          }
          .center-line, .vertical-wordmark {
            display: none;
          }
          .half-left, .half-right {
            width: 100%;
            height: auto;
            padding: 32px 24px;
          }
        }

        /* ─── Section Header with Yellow Corner Ticks ───────────────────────── */
        .section-header {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: rgba(10, 5, 30, 0.85);
          border-left: 4px solid #00f5ff;
          border-bottom: 2px solid rgba(0, 245, 255, 0.3);
          margin-bottom: 28px;
        }

        .section-header::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 10px; height: 10px;
          border-top: 2px solid #ffd700;
          border-right: 2px solid #ffd700;
        }

        .section-title {
          font-family: 'Press Start 2P', monospace;
          font-size: 14px;
          color: #00f5ff;
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
        }

        /* ─── Leaderboard Table (Left Half Edge-to-Edge) ───────────────────── */
        .leaderboard-table-wrap {
          width: 100%;
          flex: 1;
          overflow-y: auto;
          padding-right: 8px;
        }

        .leaderboard-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          font-family: 'VT323', monospace;
          font-size: 22px;
        }

        .leaderboard-table th {
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          color: #00f5ff;
          padding: 14px 10px;
          border-bottom: 2px solid #00f5ff;
          background: rgba(5, 2, 18, 0.95);
          position: sticky;
          top: 0;
          z-index: 5;
          letter-spacing: 1px;
        }

        .leaderboard-table td {
          padding: 14px 10px;
          border-bottom: 1px solid rgba(51, 68, 102, 0.4);
        }

        .leaderboard-table tr {
          transition: background 0.15s ease;
        }

        .leaderboard-table tr:hover {
          background: rgba(0, 245, 255, 0.08);
        }

        .current-user-row {
          background: rgba(255, 215, 0, 0.15) !important;
        }

        .current-user-row td {
          border-bottom: 1px solid #ffd700;
        }

        .current-user-row td:first-child {
          border-left: 4px solid #ffd700;
        }

        .col-rank { width: 14%; text-align: center; }
        .col-player { width: 38%; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .col-wins { width: 14%; text-align: center; }
        .col-kills { width: 14%; text-align: center; }
        .col-time { width: 20%; text-align: right; }

        .rank-cell {
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          color: #ffd700;
          text-align: center;
        }

        .player-cell {
          color: #fff;
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .you-tag {
          color: #ffd700;
          font-size: 15px;
          font-family: 'VT323', monospace;
        }

        .wins-cell { color: #3dba4e; font-weight: bold; text-align: center; }
        .kills-cell { color: #ff2d78; font-weight: bold; text-align: center; }
        .time-cell { color: #ffd700; text-align: right; padding-right: 8px !important; }

        /* ─── Profile Content (Right Half Edge-to-Edge) ─────────────────────── */
        .profile-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }

        .profile-identity {
          padding: 24px 20px;
          background: rgba(0, 0, 0, 0.4);
          border-left: 4px solid #ffd700;
          margin-bottom: 32px;
        }

        .profile-username {
          font-family: 'Press Start 2P', monospace;
          font-size: 22px;
          color: #ffd700;
          margin-bottom: 10px;
          text-shadow: 2px 2px 0 #000;
          letter-spacing: 1px;
        }

        .profile-email {
          font-family: 'VT323', monospace;
          font-size: 24px;
          color: #7788aa;
        }

        /* Clean Horizontal Unboxed Stats Strip */
        .stats-strip {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 32px 16px;
          background: rgba(0, 0, 0, 0.45);
          border-top: 2px dashed rgba(0, 245, 255, 0.3);
          border-bottom: 2px dashed rgba(0, 245, 255, 0.3);
          margin-bottom: 36px;
        }

        .stat-block {
          text-align: center;
          flex: 1;
        }

        .stat-val-wins {
          font-family: 'Press Start 2P', monospace;
          font-size: 32px;
          color: #3dba4e;
          display: block;
          margin-bottom: 10px;
          text-shadow: 3px 3px 0 #000;
        }

        .stat-val-kills {
          font-family: 'Press Start 2P', monospace;
          font-size: 32px;
          color: #ff2d78;
          display: block;
          margin-bottom: 10px;
          text-shadow: 3px 3px 0 #000;
        }

        .stat-val-time {
          font-family: 'Press Start 2P', monospace;
          font-size: 24px;
          color: #ffd700;
          display: block;
          margin-bottom: 10px;
          text-shadow: 3px 3px 0 #000;
        }

        .stat-label {
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          color: #7788aa;
          letter-spacing: 1px;
        }

        /* Side-by-Side Action Buttons (70% Play Now, 30% Logout) */
        .actions-row {
          display: flex;
          gap: 20px;
          width: 100%;
          margin-top: auto;
        }

        .btn-play {
          flex: 7;
          font-family: 'Press Start 2P', monospace;
          font-size: 12px;
          padding: 22px 28px;
          background: linear-gradient(135deg, #ff6b1a 0%, #ff4500 100%);
          color: #fff;
          border: 3px solid #000;
          box-shadow: 4px 4px 0 #000, 0 0 20px rgba(255, 107, 26, 0.4);
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          display: block;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
          letter-spacing: 2px;
        }

        .btn-play:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 #000, 0 0 30px rgba(255, 107, 26, 0.7);
        }

        .btn-logout {
          flex: 3;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          padding: 22px 18px;
          color: #ff2d78;
          border: 2px solid #ff2d78;
          background: rgba(255, 45, 120, 0.08);
          box-shadow: 0 0 16px rgba(255, 45, 120, 0.2);
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
          letter-spacing: 1px;
        }

        .btn-logout:hover {
          background: rgba(255, 45, 120, 0.25);
          box-shadow: 0 0 24px rgba(255, 45, 120, 0.5);
        }

        /* ─── Bottom-Left Status Bar Pill ──────────────────────────────────── */
        .status-bar {
          position: fixed;
          bottom: 16px;
          left: 20px;
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          color: #3dba4e;
          background: rgba(5, 2, 18, 0.9);
          border: 1px solid rgba(61, 186, 78, 0.4);
          box-shadow: 0 0 12px rgba(61, 186, 78, 0.2);
          padding: 8px 14px;
          letter-spacing: 1px;
          z-index: 100;
          pointer-events: none;
        }
      `}</style>

      <div className="split-page">
        {/* Center Glowing Neon Divider Line */}
        <div className="center-line" />

        {/* Center Vertical Wordmark Pill (FLAGZILLA Stacked Vertically) */}
        <Link href="/home" style={{ textDecoration: "none" }}>
          <div className="vertical-wordmark">
            {"FLAGZILLA".split("").map((letter, i) => (
              <span
                key={i}
                className="wordmark-letter"
                style={{ color: WORDMARK_COLORS[i % WORDMARK_COLORS.length] }}
              >
                {letter}
              </span>
            ))}
          </div>
        </Link>

        {/* LEFT HALF: UNBOXED GLOBAL LEADERBOARD (50% WIDTH) */}
        <div className="half-left">
          <div className="section-header">
            <span style={{ fontSize: 20 }}>🛰️</span>
            <h2 className="section-title">GLOBAL LEADERBOARD</h2>
          </div>

          {leadersLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Skeleton h={40} />
              <Skeleton h={40} />
              <Skeleton h={40} />
              <Skeleton h={40} />
            </div>
          ) : leadersErr ? (
            <div style={{ color: "#ff2d78", fontFamily: "VT323", fontSize: 24 }}>
              ❌ Failed to load global leaderboard
            </div>
          ) : leaders.length === 0 ? (
            <div style={{ color: "#556688", fontFamily: "VT323", fontSize: 24, textAlign: "center", padding: "40px 0" }}>
              No rankings recorded yet. Play matches to climb the leaderboard!
            </div>
          ) : (
            <div className="leaderboard-table-wrap">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th className="col-rank">RANK</th>
                    <th className="col-player">PLAYER</th>
                    <th className="col-wins">WINS</th>
                    <th className="col-kills">KILLS</th>
                    <th className="col-time">FLAG TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader, i) => (
                    <tr key={leader.username + i} className={leader.username === profile?.username ? "current-user-row" : ""}>
                      <td className="rank-cell col-rank">
                        {i < 3 ? MEDALS[i] : `#${leader.rank}`}
                      </td>
                      <td className="player-cell col-player">
                        {leader.username}
                        {leader.username === profile?.username && <span className="you-tag"> (YOU)</span>}
                      </td>
                      <td className="wins-cell col-wins">{leader.totalWins}</td>
                      <td className="kills-cell col-kills">{leader.totalKills}</td>
                      <td className="time-cell col-time">{fmtTime(leader.totalPossessionTime * 1000)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT HALF: UNBOXED PROFILE (50% WIDTH) */}
        <div className="half-right">
          <div className="profile-container">
            <div>
              <div className="section-header">
                <span style={{ fontSize: 20 }}>▶</span>
                <h2 className="section-title">YOUR PROFILE</h2>
              </div>

              {profileLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Skeleton h={90} />
                  <Skeleton h={120} />
                  <Skeleton h={60} />
                </div>
              ) : profileErr ? (
                <div style={{ color: "#ff2d78", fontFamily: "VT323", fontSize: 24 }}>
                  ❌ Failed to load user profile
                </div>
              ) : profile && (
                <>
                  <div className="profile-identity">
                    <div className="profile-username">{profile.username}</div>
                    <div className="profile-email">{profile.email}</div>
                  </div>

                  {/* Clean Horizontal Unboxed Stats Strip */}
                  <div className="stats-strip">
                    <div className="stat-block">
                      <span className="stat-val-wins">{profile.totalWins}</span>
                      <span className="stat-label">TOTAL WINS</span>
                    </div>
                    <div className="stat-block">
                      <span className="stat-val-kills">{profile.totalKills}</span>
                      <span className="stat-label">TOTAL KILLS</span>
                    </div>
                    <div className="stat-block">
                      <span className="stat-val-time">{fmtTime(profile.totalPossessionTime * 1000)}</span>
                      <span className="stat-label">FLAG TIME</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {profile && (
              <div className="actions-row">
                <Link href="/play" className="btn-play">
                  ▶ PLAY NOW
                </Link>
                <button className="btn-logout" onClick={handleLogout}>
                  ⏻ LOGOUT
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Left System Status Indicator */}
        <div className="status-bar">
          SYSTEM STATUS: ONLINE // 200 OK
        </div>
      </div>
    </>
  )
}