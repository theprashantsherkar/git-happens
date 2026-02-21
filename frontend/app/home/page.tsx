// import Link from 'next/link'
// import { PLAYER_COLORS } from '../constants'

// // Mock global leaderboard — replace with real DB fetch
// const GLOBAL_LEADERS = [
//   { rank: 1, name: 'ShadowFlag',  color: PLAYER_COLORS[0], wins: 38, totalHoldMs: 4320000 },
//   { rank: 2, name: 'RedReaper',   color: PLAYER_COLORS[1], wins: 31, totalHoldMs: 3870000 },
//   { rank: 3, name: 'GreenGhost',  color: PLAYER_COLORS[2], wins: 27, totalHoldMs: 3210000 },
//   { rank: 4, name: 'YellowBolt',  color: PLAYER_COLORS[3], wins: 22, totalHoldMs: 2980000 },
//   { rank: 5, name: 'IronCarrier', color: PLAYER_COLORS[0], wins: 19, totalHoldMs: 2640000 },
//   { rank: 6, name: 'BlitzMark',   color: PLAYER_COLORS[1], wins: 15, totalHoldMs: 2100000 },
//   { rank: 7, name: 'NeonHold',    color: PLAYER_COLORS[2], wins: 12, totalHoldMs: 1760000 },
//   { rank: 8, name: 'DarkRunner',  color: PLAYER_COLORS[3], wins: 9,  totalHoldMs: 1340000 },
// ]

// const MEDALS = ['🥇', '🥈', '🥉']

// function fmtMs(ms: number) {
//   const s = Math.floor(ms / 1000)
//   const h = Math.floor(s / 3600)
//   const m = Math.floor((s % 3600) / 60)
//   return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`
// }

// export default function HomePage() {
//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'radial-gradient(ellipse at 50% 20%, #0d2b0d 0%, #050f05 100%)',
//       fontFamily: '"Courier New", monospace',
//       color: '#fff',
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       padding: '48px 24px',
//     }}>

//       {/* ── Nav ── */}
//       <nav style={{
//         position: 'fixed', top: 0, left: 0, right: 0,
//         display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//         padding: '14px 32px',
//         background: 'rgba(0,0,0,0.8)',
//         borderBottom: '1px solid rgba(255,215,0,0.15)',
//         backdropFilter: 'blur(10px)',
//         zIndex: 100,
//       }}>
//         <div style={{ fontSize: 22, fontWeight: 'bold', letterSpacing: 4, color: '#FFD700' }}>
//           FLAG<span style={{ color: '#ef4444' }}>ZILLA</span>
//         </div>
//         <div style={{ display: 'flex', gap: 12 }}>
//           <Link href="/auth/login" style={{
//             padding: '8px 20px', borderRadius: 7, fontSize: 12,
//             border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
//             textDecoration: 'none', letterSpacing: 2,
//           }}>
//             LOGIN
//           </Link>
//           <Link href="/auth/register" style={{
//             padding: '8px 20px', borderRadius: 7, fontSize: 12,
//             background: '#FFD700', color: '#000', fontWeight: 'bold',
//             textDecoration: 'none', letterSpacing: 2,
//           }}>
//             REGISTER
//           </Link>
//         </div>
//       </nav>

//       {/* ── Hero ── */}
//       <div style={{ marginTop: 100, textAlign: 'center', marginBottom: 56 }}>
//         <div style={{
//           fontSize: 80, fontWeight: 'bold', letterSpacing: 6, lineHeight: 1,
//           color: '#FFD700',
//           textShadow: '0 0 60px #FFD70066, 0 0 120px #FFD70022',
//         }}>
//           FLAG<span style={{ color: '#ef4444' }}>ZILLA</span>
//         </div>
//         <div style={{ color: '#FFFFFF44', fontSize: 13, letterSpacing: 6, marginTop: 10 }}>
//           CAPTURE · HOLD · DOMINATE
//         </div>
//         <div style={{ fontSize: 48, margin: '24px 0' }}>🚩</div>
//         <p style={{ color: '#FFFFFF66', fontSize: 13, maxWidth: 420, lineHeight: 1.7, margin: '0 auto 32px' }}>
//          {" Grab the flag. Hold it longer than anyone else. The clock is ticking — and so is everyone else's trigger finger."}
//         </p>
//         <Link href="/game" style={{
//           display: 'inline-block',
//           background: 'linear-gradient(135deg, #FFD700, #f59e0b)',
//           color: '#000', fontWeight: 'bold', fontSize: 17,
//           letterSpacing: 4, padding: '16px 56px',
//           borderRadius: 10, textDecoration: 'none',
//           boxShadow: '0 0 40px #FFD70055',
//         }}>
//           PLAY NOW
//         </Link>
//       </div>

//       {/* ── Global Leaderboard ── */}
//       <div style={{
//         width: '100%', maxWidth: 560,
//         background: 'rgba(0,0,0,0.6)',
//         border: '1px solid rgba(255,215,0,0.2)',
//         borderRadius: 16, padding: '28px 32px',
//         backdropFilter: 'blur(8px)',
//       }}>
//         <div style={{
//           fontSize: 11, letterSpacing: 5, color: '#FFD700',
//           marginBottom: 20, textAlign: 'center',
//           borderBottom: '1px solid rgba(255,255,255,0.08)',
//           paddingBottom: 14,
//         }}>
//           🌍 GLOBAL LEADERBOARD
//         </div>

//         {/* Header row */}
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: '32px 1fr 60px 80px 90px',
//           gap: 8, marginBottom: 10,
//           fontSize: 9, color: '#FFFFFF33', letterSpacing: 2,
//           padding: '0 6px',
//         }}>
//           <span>#</span>
//           <span>PLAYER</span>
//           <span style={{ textAlign: 'right' }}>WINS</span>
//           <span style={{ textAlign: 'right' }}>HOLD TIME</span>
//           <span />
//         </div>

//         {GLOBAL_LEADERS.map((p, i) => (
//           <div key={p.rank} style={{
//             display: 'grid',
//             gridTemplateColumns: '32px 1fr 60px 80px 90px',
//             gap: 8, alignItems: 'center',
//             padding: '10px 6px',
//             borderRadius: 8,
//             marginBottom: 4,
//             background: i < 3 ? `${p.color}0f` : 'transparent',
//             border: i < 3 ? `1px solid ${p.color}22` : '1px solid transparent',
//           }}>
//             {/* Rank */}
//             <span style={{ fontSize: i < 3 ? 18 : 12, color: '#FFFFFF44' }}>
//               {i < 3 ? MEDALS[i] : p.rank}
//             </span>

//             {/* Name */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <span style={{
//                 width: 10, height: 10, borderRadius: '50%',
//                 background: p.color, flexShrink: 0,
//                 boxShadow: i < 3 ? `0 0 8px ${p.color}` : 'none',
//               }} />
//               <span style={{
//                 fontSize: 13,
//                 color: i < 3 ? p.color : '#ffffffcc',
//                 fontWeight: i === 0 ? 'bold' : 'normal',
//               }}>
//                 {p.name}
//               </span>
//             </div>

//             {/* Wins */}
//             <span style={{
//               fontSize: 13, textAlign: 'right',
//               color: i === 0 ? '#FFD700' : '#FFFFFF77',
//               fontWeight: i === 0 ? 'bold' : 'normal',
//             }}>
//               {p.wins}
//             </span>

//             {/* Hold time */}
//             <span style={{
//               fontSize: 12, textAlign: 'right',
//               color: '#FFFFFF55', fontVariantNumeric: 'tabular-nums',
//             }}>
//               {fmtMs(p.totalHoldMs)}
//             </span>

//             {/* Play button on hover — static link for now */}
//             <div style={{ textAlign: 'right' }}>
//               {i === 0 && (
//                 <span style={{
//                   fontSize: 9, color: '#FFD700',
//                   letterSpacing: 1, background: 'rgba(255,215,0,0.1)',
//                   padding: '2px 7px', borderRadius: 4,
//                 }}>
//                   👑 CHAMPION
//                 </span>
//               )}
//             </div>
//           </div>
//         ))}

//         <div style={{
//           textAlign: 'center', marginTop: 20,
//           fontSize: 10, color: '#FFFFFF22', letterSpacing: 2,
//         }}>
//           UPDATED AFTER EACH MATCH
//         </div>
//       </div>

//       {/* ── Footer ── */}
//       <div style={{ marginTop: 48, color: '#FFFFFF18', fontSize: 10, letterSpacing: 3 }}>
//         FLAGZILLA © 2025
//       </div>
//     </div>
//   )
// }

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
  // Generate deterministic star positions (SSR-safe, no Math.random)
  const stars = Array.from({ length: 48 }, (_, i) => ({
    top:    ((i * 37 + 13) % 55),
    left:   ((i * 61 + 7)  % 100),
    size:   ((i * 17)      % 3) + 1,
    delay:  ((i * 7)       % 30) / 10,
    dur:    1.5 + ((i * 11) % 20) / 10,
  }))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Press Start 2P', monospace;
          background: #0d0221;
          color: #fff;
          overflow-x: hidden;
        }

        /* ── Animations ── */
        @keyframes twinkle {
          from { opacity: 0.2; transform: scale(0.8); }
          to   { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes float {
          from { transform: translateY(0px); }
          to   { transform: translateY(-14px); }
        }
        @keyframes logoGlow {
          from { filter: drop-shadow(3px 3px 0 #000) drop-shadow(0 0 20px rgba(0,245,255,0.3)); }
          to   { filter: drop-shadow(3px 3px 0 #000) drop-shadow(0 0 40px rgba(0,245,255,0.7)); }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes borderPulse {
          from { box-shadow: 0 0 0 2px #000, 0 0 20px rgba(0,245,255,0.2), 8px 8px 0 rgba(0,0,0,0.8); }
          to   { box-shadow: 0 0 0 2px #000, 0 0 40px rgba(0,245,255,0.5), 8px 8px 0 rgba(0,0,0,0.8); }
        }
        @keyframes coinBob {
          from { transform: translateY(0); }
          to   { transform: translateY(-8px); }
        }
        @keyframes crateFloat {
          from { transform: translateY(0) rotate(0deg); }
          to   { transform: translateY(-10px) rotate(3deg); }
        }

        /* ── Scene ── */
        .scene {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: linear-gradient(
            180deg,
            #050115  0%,
            #0d0221 10%,
            #1a0533 22%,
            #2d1b69 42%,
            #1e3a5f 58%,
            #2a6a8a 68%,
            #3d9e6a 74%,
            #3dba4e 76%,
            #2a8a36 80%,
            #0a1f0e 100%
          );
        }

        .stars { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .star  {
          position: absolute;
          background: #fff;
          animation: twinkle 2s infinite alternate;
        }

        .sun {
          position: absolute;
          top: 8%; right: 11%;
          width: 76px; height: 76px;
          background: #ffd700;
          box-shadow: 0 0 0 8px #ffaa00, 0 0 50px 20px rgba(255,210,0,0.35);
          image-rendering: pixelated;
        }

        .sunset-stripes {
          position: absolute;
          top: 20%; right: 5%;
          display: flex; flex-direction: column; gap: 3px;
        }
        .stripe { height: 4px; }

        .mountain {
          position: absolute; bottom: 18%;
          width: 0; height: 0;
          border-left-style: solid; border-right-style: solid; border-bottom-style: solid;
          border-left-color: transparent; border-right-color: transparent;
        }
        .m1 { right: 5%;  border-left-width: 90px;  border-right-width: 90px;  border-bottom-width: 130px; border-bottom-color: #4a6e8f; }
        .m2 { right: 16%; border-left-width: 68px;  border-right-width: 68px;  border-bottom-width: 100px; border-bottom-color: #6a8faf; }
        .m3 { left: 2%;   border-left-width: 55px;  border-right-width: 55px;  border-bottom-width: 80px;  border-bottom-color: #5a7e9e; }

        .island { position: absolute; animation: float 4s ease-in-out infinite alternate; }
        .island-grass { background: #3dba4e; }
        .island-earth { background: #8b5e3c; }

        .pixel-tree   { position: absolute; bottom: 100%; }
        .tree-trunk   { width: 8px; height: 12px; background: #5c3d1a; margin: 0 auto; }
        .tree-top     { width: 24px; height: 24px; background: #2d7a1a; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); margin: 0 auto; }
        .tree-top-2   { width: 20px; height: 20px; background: #3dba4e; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); margin: 0 auto; margin-top: -8px; }

        .crate {
          position: absolute;
          background: #c47a2a;
          border: 2px solid #7a4a10;
          box-shadow: inset -3px -3px 0 #7a4a10, inset 3px 3px 0 #e8a040;
          animation: crateFloat 3s ease-in-out infinite alternate;
        }
        .coin {
          position: absolute;
          background: #ffd700;
          border: 2px solid #b8860b;
          border-radius: 50%;
          animation: coinBob 2s ease-in-out infinite alternate;
        }

        .sword {
          position: absolute;
          top: 36%; right: 28%;
          width: 12px; height: 50px;
          background: linear-gradient(180deg, #5bc0de 0%, #3a9abf 40%, #c0c0c0 40%, #888 100%);
          box-shadow: 4px 4px 0 #000;
          transform: rotate(45deg);
          animation: float 2.5s ease-in-out infinite alternate;
        }

        .ground {
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 20%;
          background: linear-gradient(180deg, #3dba4e 0%, #2a8a36 8%, #1f5c28 20%, #0a1f0e 100%);
        }
        .ground::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 8px;
          background: repeating-linear-gradient(90deg, #4ece5c 0px, #4ece5c 16px, #3dba4e 16px, #3dba4e 32px);
        }

        /* CRT overlays */
        .scanlines {
          position: fixed; inset: 0; z-index: 5; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
        }
        .vignette {
          position: fixed; inset: 0; z-index: 4; pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%);
        }
        .border-frame {
          position: fixed; inset: 8px; z-index: 3; pointer-events: none;
          border: 3px solid transparent;
          border-image: linear-gradient(135deg, #00f5ff, #ff6b1a, #ff2d78, #00f5ff) 1;
        }

        /* ── Page layout ── */
        .page {
          position: relative; z-index: 10;
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center;
          padding: 40px 24px 60px;
        }

        /* ── Logo ── */
        .logo-wrap {
          text-align: center;
          margin-top: 20px;
          margin-bottom: 28px;
          animation: panelIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        .logo-title {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(32px, 6.5vw, 72px);
          display: block;
          background: linear-gradient(135deg, #00f5ff 0%, #ff6b1a 40%, #ffd700 70%, #ff2d78 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: logoGlow 2s ease-in-out infinite alternate;
          letter-spacing: 6px;
        }
        .logo-sub {
          font-family: 'VT323', monospace;
          font-size: 22px;
          color: #fff;
          background: rgba(0,0,0,0.65);
          border: 2px solid rgba(255,255,255,0.7);
          display: inline-block;
          padding: 4px 24px;
          margin-top: 10px;
          letter-spacing: 3px;
        }
        .logo-tagline {
          font-family: 'VT323', monospace;
          font-size: 20px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 5px;
          margin-top: 10px;
        }

        /* ── Auth Panel (replaces PLAY NOW) ── */
        .auth-panel {
          background: rgba(10, 5, 30, 0.88);
          border: 3px solid #00f5ff;
          box-shadow: 0 0 0 2px #000, 0 0 30px rgba(0,245,255,0.3), 8px 8px 0 rgba(0,0,0,0.8);
          animation: panelIn 0.5s 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) both,
                     borderPulse 2.5s ease-in-out infinite alternate;
          padding: 32px 40px 28px;
          width: 100%; max-width: 440px;
          position: relative;
          margin-bottom: 40px;
        }
        .panel-corner {
          position: absolute; width: 8px; height: 8px; background: #00f5ff;
        }
        .panel-corner.tl { top: -1px; left: -1px; }
        .panel-corner.tr { top: -1px; right: -1px; }
        .panel-corner.bl { bottom: -1px; left: -1px; }
        .panel-corner.br { bottom: -1px; right: -1px; }

        .panel-title {
          font-family: 'Press Start 2P', monospace;
          font-size: 12px;
          color: #00f5ff;
          text-align: center;
          margin-bottom: 28px;
          text-shadow: 0 0 12px #00f5ff;
          letter-spacing: 1px;
        }

        .auth-desc {
          font-family: 'VT323', monospace;
          font-size: 19px;
          color: rgba(255,255,255,0.5);
          text-align: center;
          line-height: 1.6;
          margin-bottom: 28px;
          letter-spacing: 1px;
        }

        .btn-login {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%;
          background: #ff6b1a;
          color: #fff;
          font-family: 'Press Start 2P', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          padding: 15px;
          border: 3px solid #000;
          box-shadow: 4px 4px 0 #000;
          text-decoration: none;
          text-align: center;
          transition: transform 0.08s, box-shadow 0.08s, background 0.1s;
          margin-bottom: 12px;
          cursor: pointer;
        }
        .btn-login:hover {
          background: #ff8c3a;
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 #000;
        }
        .btn-login:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 #000;
        }

        .btn-register {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%;
          background: transparent;
          color: #00f5ff;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          padding: 13px;
          border: 3px solid #00f5ff;
          box-shadow: 4px 4px 0 rgba(0,245,255,0.3);
          text-decoration: none;
          text-align: center;
          transition: transform 0.08s, box-shadow 0.08s, background 0.1s;
          cursor: pointer;
        }
        .btn-register:hover {
          background: rgba(0,245,255,0.08);
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 rgba(0,245,255,0.3);
        }
        .btn-register:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 rgba(0,245,255,0.3);
        }

        .or-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 16px 0;
        }
        .or-line {
          flex: 1; height: 2px;
          background: repeating-linear-gradient(90deg, #334466 0px, #334466 4px, transparent 4px, transparent 8px);
        }
        .or-text {
          font-family: 'VT323', monospace;
          font-size: 16px;
          color: #556688;
          letter-spacing: 2px;
        }

        /* ── Leaderboard panel ── */
        .lb-panel {
          background: rgba(10, 5, 30, 0.88);
          border: 3px solid rgba(255,215,0,0.5);
          box-shadow: 0 0 0 2px #000, 0 0 20px rgba(255,215,0,0.15), 8px 8px 0 rgba(0,0,0,0.8);
          border-radius: 0;
          padding: 28px 32px;
          width: 100%; max-width: 560px;
          animation: panelIn 0.5s 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
          position: relative;
        }
        .lb-corner { position: absolute; width: 8px; height: 8px; background: #ffd700; }
        .lb-corner.tl { top: -1px; left: -1px; }
        .lb-corner.tr { top: -1px; right: -1px; }
        .lb-corner.bl { bottom: -1px; left: -1px; }
        .lb-corner.br { bottom: -1px; right: -1px; }

        .lb-title {
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          color: #ffd700;
          text-shadow: 0 0 10px #ffd700;
          text-align: center;
          letter-spacing: 2px;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 2px solid;
          border-image: repeating-linear-gradient(90deg, #ffd700 0px, #ffd700 6px, transparent 6px, transparent 12px) 1;
        }

        .lb-header {
          display: grid;
          grid-template-columns: 32px 1fr 60px 90px 100px;
          gap: 8px;
          margin-bottom: 10px;
          padding: 0 6px;
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 1px;
        }

        .lb-row {
          display: grid;
          grid-template-columns: 32px 1fr 60px 90px 100px;
          gap: 8px; align-items: center;
          padding: 10px 6px;
          margin-bottom: 4px;
          border: 1px solid transparent;
          transition: background 0.15s;
        }

        .lb-rank {
          font-family: 'VT323', monospace;
          font-size: 20px;
          color: rgba(255,255,255,0.4);
        }
        .lb-name-wrap { display: flex; align-items: center; gap: 8px; }
        .lb-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .lb-name { font-family: 'VT323', monospace; font-size: 20px; }
        .lb-wins { font-family: 'VT323', monospace; font-size: 20px; text-align: right; }
        .lb-hold { font-family: 'VT323', monospace; font-size: 18px; text-align: right; color: rgba(255,255,255,0.4); }
        .lb-badge { text-align: right; }
        .champion-tag {
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          color: #ffd700;
          background: rgba(255,215,0,0.1);
          border: 1px solid rgba(255,215,0,0.3);
          padding: 3px 6px;
          letter-spacing: 0;
        }

        .lb-footer {
          text-align: center; margin-top: 20px;
          font-family: 'VT323', monospace;
          font-size: 14px; color: rgba(255,255,255,0.15); letter-spacing: 3px;
        }

        /* ── Footer ── */
        .site-footer {
          margin-top: 48px;
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          color: rgba(255,255,255,0.12);
          letter-spacing: 3px;
        }
      `}</style>

      {/* ── Background Scene ── */}
      <div className="scene">
        <div className="stars">
          {stars.map((s, i) => (
            <div
              key={i}
              className="star"
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.dur}s`,
              }}
            />
          ))}
        </div>

        <div className="sun" />

        <div className="sunset-stripes">
          {[90, 72, 54, 38, 26].map((w, i) => (
            <div
              key={i}
              className="stripe"
              style={{
                width: `${w}px`,
                background: i % 2 === 0 ? '#ff2d78' : '#ff6b1a',
                opacity: 0.7 - i * 0.1,
              }}
            />
          ))}
        </div>

        <div className="mountain m1" />
        <div className="mountain m2" />
        <div className="mountain m3" />

        {/* Island 1 */}
        <div className="island" style={{ top: '18%', left: '4%', animationDuration: '4s', animationDelay: '0s' }}>
          <div className="island-grass" style={{ width: 88, height: 16, borderRadius: '4px 4px 0 0', position: 'relative' }}>
            <div className="pixel-tree" style={{ left: 8 }}>
              <div className="tree-top-2" />
              <div className="tree-top" />
              <div className="tree-trunk" />
            </div>
            <div className="pixel-tree" style={{ left: 50 }}>
              <div className="tree-top" style={{ width: 18, height: 18 }} />
              <div className="tree-trunk" style={{ width: 6, height: 8 }} />
            </div>
          </div>
          <div className="island-earth" style={{ width: 88, height: 20, clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' }} />
        </div>

        {/* Island 2 */}
        <div className="island" style={{ top: '30%', left: '19%', animationDuration: '3.5s', animationDelay: '1.5s' }}>
          <div className="island-grass" style={{ width: 56, height: 12, borderRadius: '3px 3px 0 0', position: 'relative' }}>
            <div className="pixel-tree" style={{ left: 16 }}>
              <div className="tree-top" style={{ width: 18, height: 18 }} />
              <div className="tree-trunk" style={{ height: 8 }} />
            </div>
          </div>
          <div className="island-earth" style={{ width: 56, height: 14, clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }} />
        </div>

        {/* Island 3 (right side) */}
        <div className="island" style={{ top: '14%', right: '34%', animationDuration: '4.5s', animationDelay: '0.8s' }}>
          <div className="island-grass" style={{ width: 48, height: 10, borderRadius: '3px 3px 0 0' }} />
          <div className="island-earth" style={{ width: 48, height: 12, clipPath: 'polygon(0 0, 100% 0, 82% 100%, 18% 100%)' }} />
        </div>

        {/* Floating crates */}
        <div className="crate" style={{ width: 22, height: 22, top: '26%', left: '27%', animationDelay: '0.5s' }} />
        <div className="crate" style={{ width: 16, height: 16, top: '20%', left: '40%', animationDelay: '1.2s' }} />
        <div className="crate" style={{ width: 18, height: 18, top: '42%', right: '22%', animationDelay: '0.3s' }} />

        {/* Coins */}
        <div className="coin" style={{ width: 10, height: 10, top: '34%', left: '32%', animationDelay: '0s' }} />
        <div className="coin" style={{ width: 8,  height: 8,  top: '24%', left: '44%', animationDelay: '0.7s' }} />
        <div className="coin" style={{ width: 10, height: 10, top: '38%', right: '30%', animationDelay: '1.1s' }} />

        <div className="sword" />
        <div className="ground" />
      </div>

      {/* CRT overlays */}
      <div className="scanlines" />
      <div className="vignette" />
      <div className="border-frame" />

      {/* ── Page Content ── */}
      <main className="page">

        {/* Logo */}
        <div className="logo-wrap">
          <span className="logo-title">FLAGZiLLA</span>
          <div className="logo-sub">⚔ a fun multiplayer game ⚔</div>
          <div className="logo-tagline">CAPTURE · HOLD · DOMINATE</div>
        </div>

        {/* Auth panel — replaces PLAY NOW */}
        <div className="auth-panel">
          <div className="panel-corner tl" />
          <div className="panel-corner tr" />
          <div className="panel-corner bl" />
          <div className="panel-corner br" />

          <div className="panel-title">▶ ENTER THE ARENA ◀</div>

          <p className="auth-desc">
            Grab the flag. Hold it longer than anyone else.<br />
            The clock is ticking — and so is everyone else&apos;s trigger finger.
          </p>

          <Link href="/auth/login" className="btn-login">
            ▶ &nbsp;START GAME &nbsp;/&nbsp; LOGIN
          </Link>

          <div className="or-divider">
            <div className="or-line" />
            <span className="or-text">— NEW PLAYER? —</span>
            <div className="or-line" />
          </div>

          <Link href="/auth/register" className="btn-register">
            ✦ &nbsp;CREATE ACCOUNT
          </Link>
        </div>

        {/* Global Leaderboard */}
        <div className="lb-panel">
          <div className="lb-corner tl" />
          <div className="lb-corner tr" />
          <div className="lb-corner bl" />
          <div className="lb-corner br" />

          <div className="lb-title">🌍 &nbsp;GLOBAL LEADERBOARD</div>

          <div className="lb-header">
            <span>#</span>
            <span>PLAYER</span>
            <span style={{ textAlign: 'right' }}>WINS</span>
            <span style={{ textAlign: 'right' }}>HOLD TIME</span>
            <span />
          </div>

          {GLOBAL_LEADERS.map((p, i) => (
            <div
              key={p.rank}
              className="lb-row"
              style={{
                background: i < 3 ? `${p.color}12` : 'transparent',
                borderColor: i < 3 ? `${p.color}28` : 'transparent',
              }}
            >
              <span className="lb-rank" style={{ fontSize: i < 3 ? 22 : 18 }}>
                {i < 3 ? MEDALS[i] : p.rank}
              </span>

              <div className="lb-name-wrap">
                <span
                  className="lb-dot"
                  style={{
                    background: p.color,
                    boxShadow: i < 3 ? `0 0 8px ${p.color}` : 'none',
                  }}
                />
                <span
                  className="lb-name"
                  style={{
                    color: i < 3 ? p.color : 'rgba(255,255,255,0.75)',
                    fontWeight: i === 0 ? 'bold' : 'normal',
                  }}
                >
                  {p.name}
                </span>
              </div>

              <span
                className="lb-wins"
                style={{ color: i === 0 ? '#ffd700' : 'rgba(255,255,255,0.6)' }}
              >
                {p.wins}
              </span>

              <span className="lb-hold">{fmtMs(p.totalHoldMs)}</span>

              <div className="lb-badge">
                {i === 0 && <span className="champion-tag">👑 CHAMPION</span>}
              </div>
            </div>
          ))}

          <div className="lb-footer">UPDATED AFTER EACH MATCH</div>
        </div>

        <footer className="site-footer">FLAGZILLA © 2025</footer>
      </main>
    </>
  )
}
