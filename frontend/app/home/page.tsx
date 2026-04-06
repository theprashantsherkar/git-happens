"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { BACKEND_URI } from "../page";

type Profile = {
  id: string; username: string; email: string
  totalWins: number; totalPossessionTime: number; totalKills: number
}
type LeaderEntry = {
  rank: number; username: string
  totalWins: number; totalPossessionTime: number; totalKills: number
}

const MEDALS = ["🥇", "🥈", "🥉"]
const PLAYER_COLORS = ["#3B82F6","#EF4444","#22C55E","#EAB308","#A855F7","#F97316","#06B6D4","#84CC16","#EC4899","#14B8A6"]

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`
}

function Skeleton({ w = "100%", h = 18 }: { w?: string | number; h?: number }) {
  return <div style={{ width: w, height: h, background: "linear-gradient(90deg, rgba(0,245,255,0.04) 25%, rgba(0,245,255,0.1) 50%, rgba(0,245,255,0.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", borderRadius: 2 }} />
}

export default function HomePage() {
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
      const token = localStorage.getItem("token")
      if (!token) { router.push("/"); return }
      let userId: string
      try { const decoded = jwtDecode<{ id: string }>(token); userId = decoded.id }
      catch { router.push("/"); return }
      try {
        const { data } = await axios.get(`${BACKEND_URI}app/api/user-routes/get-user-profile/${userId}`, { withCredentials: true })
        if (!cancelled && data?.user) {
          const u = data.user
          setProfile({ id: u._id, username: u.username, email: u.email, totalWins: u.totalWins ?? 0, totalPossessionTime: u.totalPossessionTime ?? 0, totalKills: u.totalKills ?? 0 })
        }
      } catch { if (!cancelled) setProfileErr(true) }
      finally { if (!cancelled) setProfileLoading(false) }
    }
    loadProfile()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadLeaderboard() {
      try {
        // ✅ Fixed: correct backend route
        const { data } = await axios.get(`${BACKEND_URI}app/api/user-routes/leaderboard`, { withCredentials: true })
        if (!cancelled && data?.leaderboard) {
          setLeaders(data.leaderboard.map((u: any, i: number) => ({
            rank: i + 1, username: u.username,
            totalWins: u.totalWins ?? 0, totalPossessionTime: u.totalPossessionTime ?? 0, totalKills: u.totalKills ?? 0
          })))
        }
      } catch { if (!cancelled) setLeadersErr(true) }
      finally { if (!cancelled) setLeadersLoading(false) }
    }
    loadLeaderboard()
    return () => { cancelled = true }
  }, [])

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URI}app/api/user-routes/logout`, { withCredentials: true })
      if (data.success) localStorage.removeItem("token")
    } catch {}
    router.push("/")
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'VT323', monospace; background: #0d0221; overflow-x: hidden; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .nav { display: flex; justify-content: center; align-items: center; padding: 22px 32px; background: rgba(0,0,0,0.8); border-bottom: 1px solid rgba(0,245,255,0.2); }
        .nav-logo { font-family: 'Press Start 2P', monospace; font-size: 42px; letter-spacing: 4px; background: linear-gradient(135deg, #00f5ff, #ff6b1a, #ffd700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(3px 3px 0 #000); text-decoration: none; }
        .content { display: grid; grid-template-columns: 340px 1fr; gap: 28px; padding: 32px 40px; }
        .panel { background: rgba(10,5,30,0.9); border: 3px solid #00f5ff; box-shadow: 0 0 0 2px #000, 0 0 24px rgba(0,245,255,0.2); padding: 22px 24px; }
        .panel-title { font-family: 'Press Start 2P', monospace; font-size: 10px; color: #00f5ff; margin-bottom: 18px; letter-spacing: 1px; }
        .profile-name { font-family: 'Press Start 2P', monospace; font-size: 13px; color: #ffd700; text-align: center; margin-bottom: 4px; }
        .profile-email { font-family: 'VT323', monospace; font-size: 16px; color: #556688; text-align: center; margin-bottom: 14px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
        .stat { background: rgba(0,0,0,0.4); border: 1px solid #334466; padding: 10px; text-align: center; }
        .stat-val { font-family: 'Press Start 2P', monospace; font-size: 16px; color: #ffd700; display: block; margin-bottom: 4px; }
        .stat-label { font-size: 14px; color: #334466; }
        .nav-play { font-family: 'Press Start 2P', monospace; font-size: 9px; padding: 12px; background: #ff6b1a; color: #fff; border: 3px solid #000; box-shadow: 3px 3px 0 #000; cursor: pointer; text-decoration: none; text-align: center; display: block; }
        .nav-logout { font-family: 'VT323', monospace; font-size: 18px; padding: 8px; color: #ff2d78; border: 2px solid #ff2d78; background: transparent; cursor: pointer; width: 100%; }
        .err { font-family: 'VT323', monospace; font-size: 16px; color: #ff2d78; text-align: center; padding: 12px 0; }
        .lb-header { display: grid; grid-template-columns: 36px 1fr 52px 52px 80px; gap: 8px; padding: 0 6px 10px; border-bottom: 2px solid rgba(0,245,255,0.15); margin-bottom: 6px; }
        .lb-hcell { font-family: 'Press Start 2P', monospace; font-size: 7px; color: #334466; letter-spacing: 1px; }
        .lb-row { display: grid; grid-template-columns: 36px 1fr 52px 52px 80px; gap: 8px; align-items: center; padding: 9px 6px; margin-bottom: 3px; border: 1px solid transparent; border-radius: 3px; transition: background 0.1s; }
        .lb-row:hover { background: rgba(0,245,255,0.05); }
        .lb-row.me { background: rgba(0,245,255,0.08); border-color: rgba(0,245,255,0.2); }
        .lb-row.top { border-color: rgba(255,215,0,0.12); }
        .lb-rank { font-family: 'Press Start 2P', monospace; font-size: 11px; text-align: center; }
        .lb-player { display: flex; align-items: center; gap: 8px; overflow: hidden; }
        .lb-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .lb-name { font-family: 'VT323', monospace; font-size: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lb-num { font-family: 'VT323', monospace; font-size: 20px; text-align: right; color: #aad4ff; }
        .lb-time { font-family: 'VT323', monospace; font-size: 18px; text-align: right; color: #556688; font-variant-numeric: tabular-nums; }
        .lb-footer { margin-top: 10px; padding-top: 10px; border-top: 2px solid rgba(0,245,255,0.1); font-family: 'VT323', monospace; font-size: 14px; color: #334466; text-align: center; letter-spacing: 2px; }
      `}</style>

      <div>
        <nav className="nav">
          <Link href="/" className="nav-logo">FLAGZiLLA</Link>
        </nav>

        <div className="content">
          {/* ── Profile ── */}
          <div className="panel">
            <h2 className="panel-title">▶ YOUR PROFILE</h2>
            {profileErr ? (
              <p className="err">⚠ Could not load profile</p>
            ) : profileLoading ? (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <Skeleton w="60%" h={18} /><Skeleton w="80%" h={14} />
                <div className="stats-grid">{[1,2,3].map(i=><Skeleton key={i} h={52}/>)}</div>
              </div>
            ) : profile ? (
              <>
                <div className="profile-name">{profile.username}</div>
                <div className="profile-email">{profile.email}</div>
                <div className="stats-grid">
                  <div className="stat"><span className="stat-val">{profile.totalWins}</span><span className="stat-label">WINS</span></div>
                  <div className="stat"><span className="stat-val">{profile.totalKills}</span><span className="stat-label">KILLS</span></div>
                  <div className="stat" style={{ gridColumn:"1 / -1" }}><span className="stat-val">{fmtTime(profile.totalPossessionTime)}</span><span className="stat-label">FLAG HOLD TIME</span></div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <Link href="/play" className="nav-play">▶ PLAY NOW</Link>
                  <button className="nav-logout" onClick={handleLogout}>⏻ LOGOUT</button>
                </div>
              </>
            ) : null}
          </div>

          {/* ── Leaderboard ── */}
          <div className="panel">
            <h2 className="panel-title">🌍 GLOBAL LEADERBOARD</h2>
            {leadersErr ? (
              <p className="err">⚠ Could not load leaderboard</p>
            ) : leadersLoading ? (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {Array.from({length:8}).map((_,i)=><Skeleton key={i} h={38}/>)}
              </div>
            ) : leaders.length === 0 ? (
              <p className="err" style={{ color:"#556688" }}>No players yet</p>
            ) : (
              <>
                <div className="lb-header">
                  <span className="lb-hcell">#</span>
                  <span className="lb-hcell">PLAYER</span>
                  <span className="lb-hcell" style={{ textAlign:"right" }}>WINS</span>
                  <span className="lb-hcell" style={{ textAlign:"right" }}>KILLS</span>
                  <span className="lb-hcell" style={{ textAlign:"right" }}>HOLD TIME</span>
                </div>
                {leaders.map((p, i) => (
                  <div key={p.rank} className={`lb-row ${i < 3 ? "top" : ""} ${p.username === profile?.username ? "me" : ""}`}>
                    <span className="lb-rank" style={{ color: i < 3 ? ["#ffd700","#c0c0c0","#cd7f32"][i] : "#334466" }}>
                      {i < 3 ? MEDALS[i] : p.rank}
                    </span>
                    <div className="lb-player">
                      <span className="lb-dot" style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length], boxShadow: i < 3 ? `0 0 6px ${PLAYER_COLORS[i % PLAYER_COLORS.length]}` : "none" }} />
                      <span className="lb-name" style={{ color: p.username === profile?.username ? "#00f5ff" : i === 0 ? PLAYER_COLORS[0] : i < 3 ? "#e0f0ff" : "#7799bb" }}>
                        {p.username}
                      </span>
                      {p.username === profile?.username && (
                        <span style={{ fontFamily:"'Press Start 2P',monospace", fontSize:6, color:"#00f5ff", background:"rgba(0,245,255,0.1)", padding:"2px 5px", flexShrink:0 }}>YOU</span>
                      )}
                    </div>
                    <span className="lb-num">{p.totalWins}</span>
                    <span className="lb-num">{p.totalKills}</span>
                    <span className="lb-time">{fmtTime(p.totalPossessionTime)}</span>
                  </div>
                ))}
                <div className="lb-footer">— LIVE FROM DATABASE —</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}