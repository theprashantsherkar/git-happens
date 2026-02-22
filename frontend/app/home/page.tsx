"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMusic } from "../hooks/useAudio";
import axios from "axios";
import { BACKEND_URI } from "../page";

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
const PLAYER_COLORS = ["#3B82F6", "#EF4444", "#22C55E", "#EAB308", "#A855F7",
                       "#F97316", "#06B6D4", "#84CC16", "#EC4899", "#14B8A6"]

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 18 }: { w?: string | number; h?: number }) {
  return (
    <div style={{
      width: w, height: h,
      background: "linear-gradient(90deg, rgba(0,245,255,0.04) 25%, rgba(0,245,255,0.1) 50%, rgba(0,245,255,0.04) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
      borderRadius: 2,
    }} />
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  useMusic("nav")
  const router = useRouter()

  const [profile, setProfile]               = useState<Profile | null>(null)
  const [leaders, setLeaders]               = useState<LeaderEntry[]>([])
  const [profileErr, setProfileErr]         = useState(false)
  const [leadersErr, setLeadersErr]         = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [leadersLoading, setLeadersLoading] = useState(true)

  // ── Profile: decode JWT → get ID → fetch profile ──────────────────────────
  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      const token = localStorage.getItem("token")
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
          { withCredentials: true }
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
  }, [])

  // ── Leaderboard ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function loadLeaderboard() {
      try {
        const { data } = await axios.get(
          `${BACKEND_URI}app/api/leaderboard/global`,
          { withCredentials: true }
        )
        if (!cancelled && data?.leaderboard) {
          setLeaders(
            data.leaderboard.map((u: any, i: number) => ({
              rank:                i + 1,
              username:            u.username,
              totalWins:           u.totalWins           ?? 0,
              totalPossessionTime: u.totalPossessionTime ?? 0,
              totalKills:          u.totalKills          ?? 0,
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

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_URI}app/api/user-routes/logout`,
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      )
      if (data.success) localStorage.removeItem("token")
    } catch { /* silent */ }
    router.push("/")
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'VT323', monospace; background: #0d0221; overflow-x: hidden; }
        .scene { position: fixed; inset: 0; background: linear-gradient(180deg, #0d0221 0%, #1a0533 15%, #2d1b69 35%, #1e3a5f 55%, #4a9eca 70%, #7ec8e3 80%, #3dba4e 82%, #2a8a36 84%, #1f5c28 88%, #0a1f0e 100%); }
        .stars { position: absolute; inset: 0; overflow: hidden; }
        .star { position: absolute; background: #fff; animation: twinkle 2s infinite alternate; }
        @keyframes twinkle { from { opacity: 0.3; } to { opacity: 1; } }
        .sun { position: absolute; top: 8%; right: 8%; width: 72px; height: 72px; background: #ffd700; box-shadow: 0 0 0 8px #ffaa00, 0 0 40px 20px rgba(255,200,0,0.3); }
        .mountain { position: absolute; bottom: 18%; width: 0; height: 0; }
        .m1 { right: 4%; border-left: 80px solid transparent; border-right: 80px solid transparent; border-bottom: 120px solid #5b7fa6; }
        .m2 { right: 12%; border-left: 60px solid transparent; border-right: 60px solid transparent; border-bottom: 90px solid #7a9fbf; }
        .island { position: absolute; animation: float 4s ease-in-out infinite alternate; }
        .i-top { background: #3dba4e; } .i-bot { background: #8b5e3c; }
        @keyframes float { from { transform: translateY(0); } to { transform: translateY(-12px); } }
        .pt { position: absolute; bottom: 100%; }
        .trunk { width: 8px; height: 12px; background: #5c3d1a; margin: 0 auto; }
        .t1 { width: 24px; height: 24px; background: #2d7a1a; clip-path: polygon(50% 0%,0% 100%,100% 100%); margin: 0 auto; }
        .t2 { width: 20px; height: 20px; background: #3dba4e; clip-path: polygon(50% 0%,0% 100%,100% 100%); margin: 0 auto; margin-top: -8px; }
        .ground { position: absolute; bottom: 0; left: 0; right: 0; height: 20%; background: linear-gradient(180deg, #3dba4e 0%, #2a8a36 8%, #1f5c28 20%, #0a1f0e 100%); }
        .ground::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: repeating-linear-gradient(90deg, #4ece5c 0px, #4ece5c 16px, #3dba4e 16px, #3dba4e 32px); }
        .scanlines { position: fixed; inset: 0; z-index: 5; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px); }
        .vignette { position: fixed; inset: 0; z-index: 4; pointer-events: none; background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%); }
        .border-frame { position: fixed; inset: 8px; z-index: 3; pointer-events: none; border: 3px solid; border-image: linear-gradient(135deg, #00f5ff, #ff6b1a, #ff2d78, #00f5ff) 1; }
        .page { position: relative; z-index: 10; min-height: 100vh; display: flex; flex-direction: column; }
        .nav { display: flex; justify-content: space-between; align-items: center; padding: 14px 32px; background: rgba(0,0,0,0.75); border-bottom: 1px solid rgba(0,245,255,0.15); backdrop-filter: blur(10px); }
        .nav-logo { font-family: 'Press Start 2P', monospace; font-size: 18px; background: linear-gradient(135deg, #00f5ff, #ff6b1a, #ffd700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(2px 2px 0 #000); text-decoration: none; }
        .nav-right { display: flex; gap: 12px; align-items: center; }
        .nav-play { font-family: 'Press Start 2P', monospace; font-size: 9px; padding: 10px 20px; background: #ff6b1a; color: #fff; border: 3px solid #000; box-shadow: 3px 3px 0 #000; cursor: pointer; text-decoration: none; letter-spacing: 1px; transition: transform 0.08s, box-shadow 0.08s; }
        .nav-play:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 #000; }
        .nav-logout { font-family: 'VT323', monospace; font-size: 18px; padding: 7px 16px; color: #ff2d78; border: 2px solid #ff2d78; background: transparent; cursor: pointer; transition: background 0.15s; letter-spacing: 1px; }
        .nav-logout:hover { background: rgba(255,45,120,0.12); }
        .content { display: grid; grid-template-columns: 340px 1fr; gap: 28px; padding: 32px 40px; flex: 1; align-items: start; }
        .panel { background: rgba(10,5,30,0.88); border: 3px solid #00f5ff; box-shadow: 0 0 0 2px #000, 0 0 24px rgba(0,245,255,0.2), 6px 6px 0 rgba(0,0,0,0.8); padding: 28px 30px; position: relative; animation: panelIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both; }
        @keyframes panelIn { from { transform: scale(0.93) translateY(14px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .pc { position: absolute; width: 8px; height: 8px; background: #00f5ff; }
        .tl { top:-1px; left:-1px; } .tr { top:-1px; right:-1px; } .bl { bottom:-1px; left:-1px; } .br { bottom:-1px; right:-1px; }
        .panel-title { font-family: 'Press Start 2P', monospace; font-size: 10px; color: #00f5ff; margin-bottom: 22px; text-shadow: 0 0 10px #00f5ff; letter-spacing: 1px; }
        .avatar { width: 72px; height: 72px; border: 3px solid #00f5ff; background: rgba(0,245,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 16px; box-shadow: 0 0 16px rgba(0,245,255,0.3); }
        .profile-name { font-family: 'Press Start 2P', monospace; font-size: 13px; color: #ffd700; text-align: center; text-shadow: 0 0 10px #ffd70066; margin-bottom: 4px; }
        .profile-email { font-family: 'VT323', monospace; font-size: 16px; color: #556688; text-align: center; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .stat { background: rgba(0,0,0,0.4); border: 1px solid #334466; padding: 10px; text-align: center; }
        .stat-val { font-family: 'Press Start 2P', monospace; font-size: 18px; color: #ffd700; display: block; margin-bottom: 4px; }
        .stat-label { font-family: 'VT323', monospace; font-size: 14px; color: #334466; letter-spacing: 1px; }
        .right-panel { animation-delay: 0.1s; display: flex; flex-direction: column; }
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
        .err { font-family: 'VT323', monospace; font-size: 16px; color: #ff2d78; text-align: center; padding: 12px 0; letter-spacing: 1px; }
      `}</style>

      {/* ── Scene ── */}
      <div className="scene">
        <div className="stars">{Array.from({length:40}).map((_,i) => <div key={i} className="star" style={{ width:`${(i*7%3)+1}px`, height:`${(i*7%3)+1}px`, top:`${(i*13)%55}%`, left:`${(i*17)%100}%`, animationDelay:`${(i*0.13)%3}s`, animationDuration:`${1.5+(i*0.11)%2}s` }} />)}</div>
        <div className="sun" />
        <div className="mountain m1" /><div className="mountain m2" />
        <div className="island" style={{ top:"22%", left:"4%" }}>
          <div className="i-top" style={{ width:72, height:14, borderRadius:"4px 4px 0 0", position:"relative" }}><div className="pt" style={{ left:8 }}><div className="t2" style={{ width:16 }} /><div className="t1" style={{ width:20 }} /><div className="trunk" /></div></div>
          <div className="i-bot" style={{ width:72, height:18, clipPath:"polygon(0 0,100% 0,85% 100%,15% 100%)" }} />
        </div>
        <div className="ground" />
      </div>
      <div className="scanlines" /><div className="vignette" /><div className="border-frame" />

      <div className="page">
        <nav className="nav">
          <Link href="/" className="nav-logo">FLAGZiLLA</Link>
          <div className="nav-right">
            <Link href="/play" className="nav-play">▶ PLAY NOW</Link>
            <button className="nav-logout" onClick={handleLogout}>⏻ LOGOUT</button>
          </div>
        </nav>

        <div className="content">

          {/* ── Profile ── */}
          <div className="panel">
            <div className="pc tl" /><div className="pc tr" /><div className="pc bl" /><div className="pc br" />
            <h2 className="panel-title">▶ YOUR PROFILE</h2>
            {profileErr ? (
              <p className="err">⚠ Could not load profile</p>
            ) : profileLoading || !profile ? (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <Skeleton w={72} h={72} />
                <Skeleton w="60%" h={18} />
                <Skeleton w="80%" h={14} />
                <div className="stats-grid">{[1,2,3,4].map(i => <Skeleton key={i} h={52} />)}</div>
              </div>
            ) : (
              <>
                <div className="avatar">🎮</div>
                <div className="profile-name">{profile.username}</div>
                <div className="profile-email">{profile.email}</div>
                <div className="stats-grid">
                  <div className="stat">
                    <span className="stat-val">{profile.totalWins}</span>
                    <span className="stat-label">WINS</span>
                  </div>
                  <div className="stat">
                    <span className="stat-val">{profile.totalKills}</span>
                    <span className="stat-label">KILLS</span>
                  </div>
                  <div className="stat" style={{ gridColumn:"1 / -1" }}>
                    <span className="stat-val">{fmtTime(profile.totalPossessionTime)}</span>
                    <span className="stat-label">FLAG HOLD TIME</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Leaderboard ── */}
          <div className="panel right-panel" style={{ animationDelay:"0.1s" }}>
            <div className="pc tl" /><div className="pc tr" /><div className="pc bl" /><div className="pc br" />
            <h2 className="panel-title">🌍 GLOBAL LEADERBOARD</h2>
            {leadersErr ? (
              <p className="err">⚠ Could not load leaderboard</p>
            ) : leadersLoading ? (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {Array.from({length:8}).map((_,i) => <Skeleton key={i} h={38} />)}
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
                    <span className="lb-rank" style={{ color: i < 3 ? (["#ffd700","#c0c0c0","#cd7f32"][i]) : "#334466" }}>
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