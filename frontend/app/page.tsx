// import Link from "next/link";

// export default function LandingPage() {
//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         body { font-family: 'VT323', monospace; background: #0d0221; overflow: hidden; }
//         .scene {
//           position: fixed; inset: 0;
//           background: linear-gradient(180deg,
//             #0d0221 0%, #1a0533 15%, #2d1b69 35%,
//             #1e3a5f 55%, #4a9eca 70%, #7ec8e3 80%,
//             #3dba4e 82%, #2a8a36 84%, #1f5c28 88%, #0a1f0e 100%);
//         }
//         .stars { position: absolute; inset: 0; overflow: hidden; }
//         .star { position: absolute; background: #fff; animation: twinkle 2s infinite alternate; }
//         @keyframes twinkle { from { opacity: 0.3; } to { opacity: 1; } }
//         .sun {
//           position: absolute; top: 10%; right: 12%;
//           width: 80px; height: 80px; background: #ffd700;
//           box-shadow: 0 0 0 8px #ffaa00, 0 0 40px 20px rgba(255,200,0,0.3);
//         }
//         .sunset-stripes { position: absolute; top: 20%; right: 5%; display: flex; flex-direction: column; gap: 3px; }
//         .stripe { height: 4px; }
//         .mountain { position: absolute; bottom: 18%; width: 0; height: 0; }
//         .m1 { right: 6%; border-left: 90px solid transparent; border-right: 90px solid transparent; border-bottom: 130px solid #5b7fa6; }
//         .m2 { right: 15%; border-left: 65px solid transparent; border-right: 65px solid transparent; border-bottom: 100px solid #7a9fbf; }
//         .island { position: absolute; animation: float 4s ease-in-out infinite alternate; }
//         .i-top { background: #3dba4e; }
//         .i-bot { background: #8b5e3c; }
//         @keyframes float { from { transform: translateY(0); } to { transform: translateY(-12px); } }
//         .pt { position: absolute; bottom: 100%; }
//         .trunk { width: 8px; height: 12px; background: #5c3d1a; margin: 0 auto; }
//         .t1 { width: 24px; height: 24px; background: #2d7a1a; clip-path: polygon(50% 0%,0% 100%,100% 100%); margin: 0 auto; }
//         .t2 { width: 20px; height: 20px; background: #3dba4e; clip-path: polygon(50% 0%,0% 100%,100% 100%); margin: 0 auto; margin-top: -8px; }
//         .crate {
//           position: absolute; width: 20px; height: 20px; background: #c47a2a;
//           border: 2px solid #7a4a10;
//           box-shadow: inset -3px -3px 0 #7a4a10, inset 3px 3px 0 #e8a040;
//           animation: float 3s ease-in-out infinite alternate;
//         }
//         .coin {
//           position: absolute; width: 10px; height: 10px; background: #ffd700;
//           border: 2px solid #b8860b; border-radius: 50%;
//           animation: float 2s ease-in-out infinite alternate;
//         }
//         .ground {
//           position: absolute; bottom: 0; left: 0; right: 0; height: 20%;
//           background: linear-gradient(180deg, #3dba4e 0%, #2a8a36 8%, #1f5c28 20%, #0a1f0e 100%);
//         }
//         .ground::before {
//           content: ''; position: absolute; top: 0; left: 0; right: 0; height: 8px;
//           background: repeating-linear-gradient(90deg, #4ece5c 0px, #4ece5c 16px, #3dba4e 16px, #3dba4e 32px);
//         }
//         .scanlines {
//           position: fixed; inset: 0; z-index: 5; pointer-events: none;
//           background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
//         }
//         .vignette {
//           position: fixed; inset: 0; z-index: 4; pointer-events: none;
//           background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%);
//         }
//         .border-frame {
//           position: fixed; inset: 8px; z-index: 3; pointer-events: none;
//           border: 3px solid;
//           border-image: linear-gradient(135deg, #00f5ff, #ff6b1a, #ff2d78, #00f5ff) 1;
//         }
//         .page {
//           position: relative; z-index: 10; min-height: 100vh;
//           display: flex; flex-direction: column; align-items: center; justify-content: center;
//           padding: 24px; text-align: center;
//         }
//         .logo {
//           font-family: 'Press Start 2P', monospace;
//           font-size: clamp(36px, 7vw, 64px);
//           background: linear-gradient(135deg, #00f5ff, #ff6b1a, #ffd700, #ff2d78);
//           -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
//           filter: drop-shadow(3px 3px 0 #000);
//           letter-spacing: 4px;
//           animation: logoIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275) both;
//         }
//         @keyframes logoIn {
//           from { transform: translateY(-30px) scale(0.85); opacity: 0; }
//           to   { transform: translateY(0) scale(1); opacity: 1; }
//         }
//         .tagline {
//           font-family: 'VT323', monospace; font-size: 22px; color: #fff;
//           background: rgba(0,0,0,0.6); border: 2px solid #fff;
//           padding: 5px 22px; display: inline-block; margin-top: 10px; letter-spacing: 2px;
//         }
//         .desc {
//           font-family: 'VT323', monospace; font-size: 22px;
//           color: rgba(255,255,255,0.55); margin-top: 28px; max-width: 520px;
//           line-height: 1.5; letter-spacing: 1px;
//         }
//         .desc span { color: #ffd700; }
//         .btns { display: flex; gap: 16px; margin-top: 36px; flex-wrap: wrap; justify-content: center; }
//         .btn {
//           font-family: 'Press Start 2P', monospace; font-size: 11px; letter-spacing: 1px;
//           padding: 16px 32px; border: 3px solid #000; cursor: pointer;
//           text-decoration: none; display: inline-block;
//           box-shadow: 4px 4px 0 #000;
//           transition: transform 0.08s, box-shadow 0.08s;
//         }
//         .btn:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000; }
//         .btn:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }
//         .btn-primary { background: #ff6b1a; color: #fff; }
//         .btn-primary:hover { background: #ff8c3a; }
//         .btn-secondary {
//           background: rgba(10,5,30,0.88); color: #00f5ff;
//           border-color: #00f5ff;
//           box-shadow: 4px 4px 0 #000, 0 0 16px rgba(0,245,255,0.2);
//         }
//         .btn-secondary:hover { background: rgba(0,245,255,0.08); }
//         .flag-icon { font-size: 48px; margin: 20px 0 4px; animation: float 3s ease-in-out infinite alternate; display: block; }
//       `}</style>

//       <div className="scene">
//         <div className="stars">
//           {Array.from({ length: 40 }).map((_, i) => (
//             <div key={i} className="star" style={{
//               width: `${(i*7%3)+1}px`, height: `${(i*7%3)+1}px`,
//               top: `${(i*13)%55}%`, left: `${(i*17)%100}%`,
//               animationDelay: `${(i*0.13)%3}s`, animationDuration: `${1.5+(i*0.11)%2}s`,
//             }} />
//           ))}
//         </div>
//         <div className="sun" />
//         <div className="sunset-stripes">
//           {[90,70,50,35,25].map((w,i) => (
//             <div key={i} className="stripe" style={{ width: w, background: i%2===0?"#ff2d78":"#ff6b1a", opacity: 0.7-i*0.1 }} />
//           ))}
//         </div>
//         <div className="mountain m1" /><div className="mountain m2" />
//         <div className="island" style={{ top:"18%", left:"4%" }}>
//           <div className="i-top" style={{ width:80, height:16, borderRadius:"4px 4px 0 0", position:"relative" }}>
//             <div className="pt" style={{ left:10 }}><div className="t2" style={{ width:18 }} /><div className="t1" style={{ width:22 }} /><div className="trunk" /></div>
//           </div>
//           <div className="i-bot" style={{ width:80, height:20, clipPath:"polygon(0 0,100% 0,85% 100%,15% 100%)" }} />
//         </div>
//         <div className="island" style={{ top:"30%", left:"17%", animationDelay:"1.5s" }}>
//           <div className="i-top" style={{ width:56, height:12, borderRadius:"3px 3px 0 0", position:"relative" }}>
//             <div className="pt" style={{ left:16 }}><div className="t1" style={{ width:20 }} /><div className="trunk" style={{ height:8 }} /></div>
//           </div>
//           <div className="i-bot" style={{ width:56, height:14, clipPath:"polygon(0 0,100% 0,80% 100%,20% 100%)" }} />
//         </div>
//         <div className="crate" style={{ top:"26%", left:"24%", animationDelay:"0.5s" }} />
//         <div className="crate" style={{ top:"20%", left:"37%", animationDelay:"1.2s", width:14, height:14 }} />
//         <div className="coin" style={{ top:"33%", left:"29%", animationDelay:"0s" }} />
//         <div className="ground" />
//       </div>
//       <div className="scanlines" /><div className="vignette" /><div className="border-frame" />

//       <main className="page">
//         <div className="logo">FLAGZiLLA</div>
//         <div className="tagline">⚔ GRAB.FIGHT.REPEAT. ⚔</div>
//         <span className="flag-icon">🚩</span>
//         <p className="desc">
//           Grab the flag. <span>Hold it longer</span> than anyone else.<br />
//           The clock is ticking — and so is everyone else's trigger finger.
//         </p>
//         <div className="btns">
//           <Link href="/auth/login" className="btn btn-primary">▶ LOGIN</Link>
//           <Link href="/auth/register" className="btn btn-secondary">✦ REGISTER</Link>
//         </div>
//       </main>
//     </>
//   );
// }

"use client";
import Link from "next/link";
import { useMusic } from "./hooks/useAudio";

export const BACKEND_URI = "http://localhost:5000/";

export default function LandingPage() {
  useMusic("nav");
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'VT323', monospace;
          min-height: 100vh;
          overflow: hidden;
        }

        /* ─── SCENE / SKY ─── */
        .scene {
          position: fixed; inset: 0;
          background: linear-gradient(
            180deg,
            #0a0520 0%,
            #12063a 12%,
            #1a0a55 25%,
            #1e2d72 40%,
            #1a4a7a 55%,
            #1a6a6a 65%,
            #2a8a50 72%,
            #3dba4e 76%,
            #2a8a36 82%,
            #0a1f0e 100%
          );
        }

        /* ─── STARS ─── */
        .stars { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .star  { position: absolute; background: #fff; border-radius: 50%; animation: twinkle 2s infinite alternate; }
        @keyframes twinkle {
          from { opacity: 0.15; transform: scale(0.7); }
          to   { opacity: 0.95; transform: scale(1.3); }
        }

        /* ─── SUN (top-right) ─── */
        .sun {
          position: absolute; top: 6%; right: 8%;
          width: 80px; height: 80px;
          background: #ffd700;
          box-shadow: 0 0 0 10px #ffaa00, 0 0 60px 24px rgba(255,210,0,0.4);
        }

        /* ─── SUNSET STRIPES ─── */
        .sunset-stripes {
          position: absolute; top: 18%; right: 3%;
          display: flex; flex-direction: column; gap: 4px;
        }
        .stripe { height: 5px; }

        /* ─── MOUNTAINS (right side) ─── */
        .mountain {
          position: absolute; bottom: 19%; width: 0; height: 0;
          border-style: solid;
          border-left-color: transparent; border-right-color: transparent; border-top: none;
        }
        .m1 { right: 3%;  border-left-width: 100px; border-right-width: 100px; border-bottom: 150px solid #3a5a7a; }
        .m2 { right: 15%; border-left-width: 70px;  border-right-width: 70px;  border-bottom: 110px solid #4a6a8a; }
        .m3 { right: 28%; border-left-width: 50px;  border-right-width: 50px;  border-bottom: 80px  solid #5a7a9a; }

        /* ─── FLOATING ISLANDS ─── */
        .island { position: absolute; animation: floatIsland 4s ease-in-out infinite alternate; }
        @keyframes floatIsland { from { transform: translateY(0); } to { transform: translateY(-16px); } }
        .island-grass { background: #3dba4e; }
        .island-earth { background: #8b5e3c; }

        /* ─── PIXEL TREES ─── */
        .pixel-tree { position: absolute; bottom: 100%; }
        .tree-trunk  { width: 8px; height: 14px; background: #5c3d1a; margin: 0 auto; }
        .tree-top    { width: 28px; height: 28px; background: #2d7a1a; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); margin: 0 auto; }
        .tree-top-2  { width: 22px; height: 22px; background: #3dba4e; clip-path: polygon(50% 0%, 0% 100%, 100% 100%); margin: 0 auto; margin-top: -10px; }

        /* ─── CRATES & COINS ─── */
        .crate {
          position: absolute; background: #c47a2a;
          border: 2px solid #7a4a10;
          box-shadow: inset -3px -3px 0 #7a4a10, inset 3px 3px 0 #e8a040;
          animation: floatIsland 3s ease-in-out infinite alternate;
        }
        .coin {
          position: absolute; background: #ffd700;
          border: 2px solid #b8860b; border-radius: 50%;
          animation: floatIsland 2.2s ease-in-out infinite alternate;
        }

        /* ─── GROUND ─── */
        .ground {
          position: absolute; bottom: 0; left: 0; right: 0; height: 22%;
          background: linear-gradient(180deg, #3dba4e 0%, #2a8a36 7%, #1f5c28 18%, #0a1f0e 100%);
        }
        .ground::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 10px;
          background: repeating-linear-gradient(90deg, #4ece5c 0px, #4ece5c 18px, #3dba4e 18px, #3dba4e 36px);
        }

        /* ─── CRT OVERLAYS ─── */
        .scanlines {
          position: fixed; inset: 0; z-index: 5; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
        }
        .vignette {
          position: fixed; inset: 0; z-index: 4; pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.72) 100%);
        }
        .border-frame {
          position: fixed; inset: 8px; z-index: 6; pointer-events: none;
          border: 3px solid;
          border-image: linear-gradient(135deg, #ff6b1a, #ff2d78, #ffd700, #00f5ff, #ff6b1a) 1;
        }

        /* ═══════════════════════════════════════════
           STICK FIGURES
        ═══════════════════════════════════════════ */
        .figures-scene {
          position: absolute;
          bottom: 21%;
          left: 0; right: 0;
          height: 260px;
          pointer-events: none;
          z-index: 2;
        }

        @keyframes runBob {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(-4px); }
          100% { transform: translateY(0); }
        }
        @keyframes legSwingF { from { transform: rotate(-24deg); } to { transform: rotate(20deg); } }
        @keyframes legSwingB { from { transform: rotate(20deg);  } to { transform: rotate(-24deg); } }
        @keyframes armSwing  { from { transform: rotate(-20deg); } to { transform: rotate(24deg);  } }
        @keyframes hammerUp  { from { transform: rotate(-100deg); } to { transform: rotate(-50deg); } }
        @keyframes swordSlash { from { transform: rotate(-70deg); } to { transform: rotate(-20deg); } }
        @keyframes pickSwing  { from { transform: rotate(-75deg); } to { transform: rotate(-25deg); } }
        @keyframes flagWave   { from { transform: skewY(-5deg) scaleX(1); } to { transform: skewY(5deg) scaleX(0.9); } }
        @keyframes dustPuff   {
          from { opacity: 0.5; transform: translateY(0) scale(1); }
          to   { opacity: 0;   transform: translateY(-10px) scale(1.6); }
        }
        @keyframes explodePulse {
          from { transform: scale(0.85) rotate(-8deg); opacity: 0.8; }
          to   { transform: scale(1.2)  rotate(8deg);  opacity: 1; }
        }

        .figure { position: absolute; bottom: 0; animation: runBob 0.35s ease-in-out infinite; }

        /* ── BLUE ── */
        .blue-head {
          width: 46px; height: 46px; border-radius: 50%;
          background: radial-gradient(circle at 36% 34%, #4fc3f7, #0277bd);
          box-shadow: 0 4px 12px rgba(0,0,0,0.55);
          margin: 0 auto; position: relative;
        }
        .blue-head::before {
          content: ''; position: absolute;
          top: 23px; left: -3px; right: -3px; height: 9px;
          background: linear-gradient(90deg, #e0e0e0, #bdbdbd); border-radius: 4px;
        }
        .blue-head::after {
          content: ''; position: absolute;
          top: 11px; left: 11px; width: 13px; height: 8px;
          background: rgba(255,255,255,0.85); border-radius: 50% 50% 0 0;
        }
        .blue-torso {
          width: 40px; height: 50px;
          background: linear-gradient(160deg, #1565c0, #0d47a1);
          border-radius: 7px 7px 10px 10px;
          margin: -3px auto 0; position: relative;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }
        .blue-arm-back {
          position: absolute; top: 4px; left: -15px;
          width: 16px; height: 36px;
          background: linear-gradient(180deg, #1976d2, #0d47a1); border-radius: 8px;
          transform: rotate(25deg); transform-origin: top center;
          animation: armSwing 0.35s ease-in-out infinite alternate;
        }
        .blue-arm-flag {
          position: absolute; top: -6px; right: -13px;
          width: 16px; height: 40px;
          background: linear-gradient(180deg, #1976d2, #0d47a1); border-radius: 8px;
          transform: rotate(-15deg); transform-origin: top center;
        }
        .flag-pole {
          position: absolute; top: -90px; right: -3px;
          width: 6px; height: 94px;
          background: linear-gradient(90deg, #a1887f, #5d4037); border-radius: 3px;
        }
        .flag-cloth {
          position: absolute; top: 0; left: 6px;
          width: 50px; height: 36px;
          background: linear-gradient(140deg, #e53935 50%, #c62828);
          clip-path: polygon(0 0, 100% 22%, 100% 78%, 0 100%);
          animation: flagWave 0.4s ease-in-out infinite alternate;
          transform-origin: left center;
          box-shadow: 3px 3px 8px rgba(0,0,0,0.45);
        }
        .flag-cloth::after {
          content: ''; position: absolute; inset: 6px 12px;
          background: rgba(255,255,255,0.12);
          clip-path: polygon(0 0, 100% 22%, 100% 78%, 0 100%);
        }
        .blue-legs { position: relative; width: 40px; height: 46px; margin: 0 auto; }
        .blue-leg-l {
          position: absolute; left: 2px; top: 0; width: 17px; height: 44px;
          background: linear-gradient(180deg, #1a237e, #283593); border-radius: 8px;
          animation: legSwingF 0.35s ease-in-out infinite alternate; transform-origin: top center;
        }
        .blue-leg-r {
          position: absolute; right: 2px; top: 0; width: 17px; height: 44px;
          background: linear-gradient(180deg, #1a237e, #283593); border-radius: 8px;
          animation: legSwingB 0.35s ease-in-out infinite alternate; transform-origin: top center;
        }
        .blue-foot-l, .blue-foot-r {
          position: absolute; bottom: -6px; width: 22px; height: 10px;
          background: #0d47a1; border-radius: 0 5px 5px 0;
        }
        .blue-foot-l { left: -3px; }
        .blue-foot-r { right: -3px; transform: scaleX(-1); }

        /* ── RED ── */
        .red-head {
          width: 43px; height: 43px; border-radius: 50%;
          background: radial-gradient(circle at 36% 34%, #ef5350, #b71c1c);
          box-shadow: 0 4px 12px rgba(0,0,0,0.55);
          margin: 0 auto; position: relative;
        }
        .red-head::after {
          content: ''; position: absolute; top: 10px; left: 10px;
          width: 12px; height: 8px; background: rgba(255,255,255,0.8); border-radius: 50% 50% 0 0;
        }
        .red-torso {
          width: 35px; height: 46px;
          background: linear-gradient(160deg, #c62828, #b71c1c);
          border-radius: 6px 6px 9px 9px;
          margin: -2px auto 0; position: relative; box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }
        .red-arm-back {
          position: absolute; top: 4px; left: -13px; width: 14px; height: 32px;
          background: linear-gradient(180deg, #e53935, #c62828); border-radius: 7px;
          transform: rotate(20deg); transform-origin: top center;
          animation: armSwing 0.35s ease-in-out infinite alternate;
        }
        .red-arm-hammer {
          position: absolute; top: -14px; right: -15px; width: 14px; height: 36px;
          background: linear-gradient(180deg, #e53935, #c62828); border-radius: 7px;
          transform-origin: bottom center; animation: hammerUp 0.45s ease-in-out infinite alternate;
        }
        .hammer-head {
          position: absolute; top: -14px; left: -10px; width: 33px; height: 18px;
          background: linear-gradient(90deg, #757575, #424242); border-radius: 4px;
          box-shadow: 0 3px 7px rgba(0,0,0,0.6);
        }
        .hammer-head::after {
          content: ''; position: absolute; top: 3px; left: 3px; right: 3px; bottom: 3px;
          background: rgba(255,255,255,0.08); border-radius: 3px;
        }
        .red-legs { position: relative; width: 35px; height: 44px; margin: 0 auto; }
        .red-leg-l {
          position: absolute; left: 2px; top: 0; width: 15px; height: 42px;
          background: linear-gradient(180deg, #7f0000, #b71c1c); border-radius: 7px;
          animation: legSwingB 0.32s ease-in-out infinite alternate; transform-origin: top center;
        }
        .red-leg-r {
          position: absolute; right: 2px; top: 0; width: 15px; height: 42px;
          background: linear-gradient(180deg, #7f0000, #b71c1c); border-radius: 7px;
          animation: legSwingF 0.32s ease-in-out infinite alternate; transform-origin: top center;
        }

        /* ── GREEN ── */
        .green-head {
          width: 43px; height: 43px; border-radius: 50%;
          background: radial-gradient(circle at 36% 34%, #66bb6a, #2e7d32);
          box-shadow: 0 4px 12px rgba(0,0,0,0.55);
          margin: 0 auto; position: relative;
        }
        .green-head::after {
          content: ''; position: absolute; top: 10px; left: 9px;
          width: 12px; height: 7px; background: rgba(255,255,255,0.8); border-radius: 50% 50% 0 0;
        }
        .green-torso {
          width: 35px; height: 46px;
          background: linear-gradient(160deg, #388e3c, #2e7d32);
          border-radius: 6px 6px 9px 9px;
          margin: -2px auto 0; position: relative; box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }
        .green-arm-back {
          position: absolute; top: 4px; right: -13px; width: 14px; height: 32px;
          background: linear-gradient(180deg, #43a047, #2e7d32); border-radius: 7px;
          transform: rotate(-20deg); transform-origin: top center;
          animation: armSwing 0.38s ease-in-out infinite alternate;
        }
        .green-arm-sword {
          position: absolute; top: -12px; left: -16px; width: 14px; height: 34px;
          background: linear-gradient(180deg, #43a047, #2e7d32); border-radius: 7px;
          transform-origin: bottom center; animation: swordSlash 0.5s ease-in-out infinite alternate;
        }
        .sword-guard {
          position: absolute; top: -2px; left: -8px; width: 30px; height: 8px;
          background: linear-gradient(90deg, #795548, #4e342e); border-radius: 3px;
        }
        .sword-blade {
          position: absolute; top: -52px; left: 2px; width: 11px; height: 56px;
          background: linear-gradient(180deg, #e0f7fa, #4dd0e1 40%, #00838f);
          border-radius: 5px 5px 0 0; box-shadow: 0 0 12px rgba(0,245,255,0.8);
        }
        .green-legs { position: relative; width: 35px; height: 44px; margin: 0 auto; }
        .green-leg-l {
          position: absolute; left: 2px; top: 0; width: 15px; height: 42px;
          background: linear-gradient(180deg, #1b5e20, #2e7d32); border-radius: 7px;
          animation: legSwingF 0.6s ease-in-out infinite alternate; transform-origin: top center;
        }
        .green-leg-r {
          position: absolute; right: 2px; top: 0; width: 15px; height: 42px;
          background: linear-gradient(180deg, #1b5e20, #2e7d32); border-radius: 7px;
          animation: legSwingB 0.6s ease-in-out infinite alternate; transform-origin: top center;
        }

        /* ── YELLOW ── */
        .yellow-head {
          width: 41px; height: 41px; border-radius: 50%;
          background: radial-gradient(circle at 36% 34%, #ffee58, #f9a825);
          box-shadow: 0 4px 12px rgba(0,0,0,0.55);
          margin: 0 auto; position: relative;
        }
        .yellow-head::after {
          content: ''; position: absolute; top: 9px; left: 8px;
          width: 11px; height: 7px; background: rgba(255,255,255,0.8); border-radius: 50% 50% 0 0;
        }
        .yellow-torso {
          width: 32px; height: 44px;
          background: linear-gradient(160deg, #f9a825, #e65100);
          border-radius: 6px 6px 8px 8px;
          margin: -2px auto 0; position: relative; box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }
        .yellow-arm-back {
          position: absolute; top: 4px; left: -12px; width: 13px; height: 29px;
          background: linear-gradient(180deg, #fbc02d, #f9a825); border-radius: 6px;
          transform: rotate(20deg); transform-origin: top center;
          animation: armSwing 0.4s ease-in-out infinite alternate;
        }
        .yellow-arm-pick {
          position: absolute; top: -15px; right: -15px; width: 13px; height: 35px;
          background: linear-gradient(180deg, #fbc02d, #f9a825); border-radius: 6px;
          transform-origin: bottom center; animation: pickSwing 0.5s ease-in-out infinite alternate;
        }
        .pick-head {
          position: absolute; top: -14px; left: -12px; width: 36px; height: 13px;
          background: linear-gradient(90deg, #9e9e9e, #616161); border-radius: 3px;
          box-shadow: 0 3px 7px rgba(0,0,0,0.55);
        }
        .pick-tip {
          position: absolute; right: -8px; top: -8px; width: 14px; height: 20px;
          background: linear-gradient(180deg, #bdbdbd, #757575);
          clip-path: polygon(0 0, 100% 50%, 0 100%);
        }
        .yellow-legs { position: relative; width: 32px; height: 42px; margin: 0 auto; }
        .yellow-leg-l {
          position: absolute; left: 2px; top: 0; width: 13px; height: 40px;
          background: linear-gradient(180deg, #e65100, #bf360c); border-radius: 6px;
          animation: legSwingB 0.6s ease-in-out infinite alternate; transform-origin: top center;
        }
        .yellow-leg-r {
          position: absolute; right: 2px; top: 0; width: 13px; height: 40px;
          background: linear-gradient(180deg, #e65100, #bf360c); border-radius: 6px;
          animation: legSwingF 0.6s ease-in-out infinite alternate; transform-origin: top center;
        }

        /* shared figure utils */
        .fig-shadow {
          width: 46px; height: 9px; background: rgba(0,0,0,0.28);
          border-radius: 50%; margin: 3px auto 0;
        }
        .dust-cloud { display: flex; gap: 4px; justify-content: center; margin-top: 2px; }
        .dust-puff {
          width: 14px; height: 9px; background: rgba(255,255,255,0.22);
          border-radius: 50%; animation: dustPuff 0.4s ease-out infinite alternate;
        }
        .dust-puff:nth-child(2) { animation-delay: 0.12s; width: 10px; }
        .dust-puff:nth-child(3) { animation-delay: 0.22s; width: 12px; }

        .explosion-fx {
          position: absolute; font-size: 42px;
          animation: explodePulse 0.7s ease-in-out infinite alternate;
        }

        /* ─── PAGE LAYOUT ─── */
        .page {
          position: relative; z-index: 10;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 30px 30px 40px;
          text-align: center;
        }

        /* ─── TITLE ─── */
        @keyframes titleIn {
          from { transform: translateY(-30px) scale(0.85); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }

        .logo-title {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(36px, 6vw, 80px);
          display: block;
          letter-spacing: 6px;
          animation: titleIn 0.7s cubic-bezier(0.175,0.885,0.32,1.275) both;
          /* multicolor per letter matching the screenshot */
          background: linear-gradient(90deg,
            #00e5ff 0%,    /* F  - cyan */
            #00e5ff 8%,
            #ffd700 9%,    /* L  - yellow */
            #ffd700 17%,
            #ff6b1a 18%,   /* A  - orange */
            #ff6b1a 27%,
            #ff2d78 28%,   /* G  - pink */
            #ff2d78 36%,
            #ffd700 37%,   /* Z  - yellow */
            #ffd700 46%,
            #39ff14 47%,   /* i  - green */
            #39ff14 54%,
            #ff6b1a 55%,   /* L  - orange */
            #ff6b1a 64%,
            #ffd700 65%,   /* L  - yellow */
            #ffd700 73%,
            #ff2d78 74%,   /* A  - pink */
            #ff2d78 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.8));
        }

        /* ─── TAGLINE BOX ─── */
        .tagline-box {
          display: inline-flex; align-items: center; gap: 14px;
          margin-top: 18px;
          border: 2px solid rgba(255,255,255,0.85);
          padding: 10px 28px;
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(10px, 1.4vw, 14px);
          color: #fff;
          letter-spacing: 3px;
          background: rgba(0,0,0,0.55);
          animation: titleIn 0.6s 0.15s both;
        }
        .tagline-x { color: rgba(255,255,255,0.7); font-size: 0.9em; }

        /* ─── FLAG ICON ─── */
        .flag-icon {
          margin-top: 22px;
          font-size: 44px;
          animation: flagBob 1.2s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 12px rgba(255,45,120,0.7));
        }
        @keyframes flagBob {
          from { transform: translateY(0) rotate(-5deg); }
          to   { transform: translateY(-8px) rotate(5deg); }
        }

        /* ─── DESCRIPTION ─── */
        .desc {
          margin-top: 20px;
          font-family: 'VT323', monospace;
          font-size: clamp(18px, 2.2vw, 22px);
          color: rgba(180,230,255,0.88);
          line-height: 1.7;
          letter-spacing: 1px;
          text-shadow: 0 0 10px rgba(0,200,255,0.3);
          animation: titleIn 0.6s 0.25s both;
          max-width: 520px;
        }
        .desc strong {
          color: #ffd700;
          text-shadow: 0 0 10px #ffd700;
          font-weight: normal;
        }

        /* ─── BUTTONS ─── */
        .btn-row {
          display: flex; gap: 16px; margin-top: 32px;
          animation: titleIn 0.6s 0.35s both;
        }

        .btn-login {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(9px, 1.1vw, 12px);
          padding: 16px 32px;
          background: #ff6b1a;
          color: #fff;
          border: 3px solid #000;
          box-shadow: 4px 4px 0 #000;
          cursor: pointer;
          letter-spacing: 2px;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 10px;
          transition: transform 0.08s, box-shadow 0.08s, background 0.1s;
        }
        .btn-login:hover {
          background: #ff8c3a;
          transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000;
        }
        .btn-login:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }

        .btn-register {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(9px, 1.1vw, 12px);
          padding: 16px 32px;
          background: rgba(0,15,35,0.85);
          color: #00e5ff;
          border: 3px solid #00e5ff;
          box-shadow: 4px 4px 0 #000;
          cursor: pointer;
          letter-spacing: 2px;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 10px;
          transition: transform 0.08s, box-shadow 0.08s, background 0.1s;
        }
        .btn-register:hover {
          background: rgba(0,229,255,0.12);
          transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000;
        }
        .btn-register:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }
      `}</style>

      {/* ── SCENE ── */}
      <div className="scene">

        {/* Stars */}
        <div className="stars">
          {Array.from({ length: 55 }).map((_, i) => (
            <div key={i} className="star" style={{
              width:  `${((i * 13) % 3) + 1}px`,
              height: `${((i * 13) % 3) + 1}px`,
              top:    `${(i * 31 + 7)  % 62}%`,
              left:   `${(i * 57 + 11) % 100}%`,
              animationDelay:    `${((i * 9) % 28) / 10}s`,
              animationDuration: `${1.4 + ((i * 13) % 22) / 10}s`,
            }} />
          ))}
        </div>

        {/* Sun */}
        <div className="sun" />

        {/* Sunset stripes */}
        <div className="sunset-stripes">
          {[90, 72, 56, 40, 28].map((w, i) => (
            <div key={i} className="stripe" style={{
              width: `${w}px`,
              background: i % 2 === 0 ? '#ff2d78' : '#ff6b1a',
              opacity: 0.7 - i * 0.1,
            }} />
          ))}
        </div>

        {/* Mountains */}
        <div className="mountain m1" />
        <div className="mountain m2" />
        <div className="mountain m3" />

        {/* Island 1 — top left */}
        <div className="island" style={{ top: '10%', left: '3%', animationDelay: '0s' }}>
          <div className="island-grass" style={{ width: 90, height: 16, borderRadius: '3px 3px 0 0', position: 'relative' }}>
            <div className="pixel-tree" style={{ left: 10 }}>
              <div className="tree-top-2" /><div className="tree-top" /><div className="tree-trunk" />
            </div>
            <div className="pixel-tree" style={{ left: 52 }}>
              <div className="tree-top" style={{ width: 20 }} />
              <div className="tree-trunk" style={{ width: 6, height: 9 }} />
            </div>
          </div>
          <div className="island-earth" style={{ width: 90, height: 20, clipPath: 'polygon(0 0,100% 0,84% 100%,16% 100%)' }} />
        </div>

        {/* Island 2 — smaller, left-center */}
        <div className="island" style={{ top: '26%', left: '16%', animationDelay: '1.6s' }}>
          <div className="island-grass" style={{ width: 55, height: 12, borderRadius: '3px 3px 0 0', position: 'relative' }}>
            <div className="pixel-tree" style={{ left: 14 }}>
              <div className="tree-top" style={{ width: 20 }} />
              <div className="tree-trunk" style={{ height: 9 }} />
            </div>
          </div>
          <div className="island-earth" style={{ width: 55, height: 14, clipPath: 'polygon(0 0,100% 0,80% 100%,20% 100%)' }} />
        </div>

        {/* Crates & coins */}
        <div className="crate" style={{ width: 20, height: 20, top: '22%', left: '26%', animationDelay: '0.3s' }} />
        <div className="crate" style={{ width: 15, height: 15, top: '16%', left: '40%', animationDelay: '0.8s' }} />
        <div className="coin"  style={{ width: 10, height: 10, top: '30%', left: '32%', animationDelay: '0s' }} />
        <div className="coin"  style={{ width: 8,  height: 8,  top: '19%', left: '45%', animationDelay: '0.6s' }} />

        {/* Ground */}
        <div className="ground" />

        {/* ═══════════════════════════════════
            FIGURES SCENE
        ═══════════════════════════════════ */}
        <div className="figures-scene">

          {/* BLUE – flag carrier, left side */}
          <div className="figure" style={{ left: '8%', animationDuration: '0.32s' }}>
            <div className="blue-head" />
            <div className="blue-torso">
              <div className="blue-arm-back" />
              <div className="blue-arm-flag">
                <div className="flag-pole">
                  <div className="flag-cloth" />
                </div>
              </div>
            </div>
            <div className="blue-legs">
              <div className="blue-leg-l"><div className="blue-foot-l" /></div>
              <div className="blue-leg-r"><div className="blue-foot-r" /></div>
            </div>
            <div className="dust-cloud">
              <div className="dust-puff" /><div className="dust-puff" /><div className="dust-puff" />
            </div>
            <div className="fig-shadow" />
          </div>

          {/* RED – hammer chaser, behind blue */}
          <div className="figure" style={{ left: '22%', animationDuration: '0.29s', animationDelay: '0.05s' }}>
            <div className="red-head" />
            <div className="red-torso">
              <div className="red-arm-back" />
              <div className="red-arm-hammer">
                <div className="hammer-head" />
              </div>
            </div>
            <div className="red-legs">
              <div className="red-leg-l" /><div className="red-leg-r" />
            </div>
            <div className="fig-shadow" />
          </div>

          {/* GREEN – sword fighter, right side */}
          <div className="figure" style={{ left: '70%', animationDuration: '0.55s', animationDelay: '0.08s' }}>
            <div className="green-head" />
            <div className="green-torso">
              <div className="green-arm-back" />
              <div className="green-arm-sword">
                <div className="sword-guard" />
                <div className="sword-blade" />
              </div>
            </div>
            <div className="green-legs">
              <div className="green-leg-l" /><div className="green-leg-r" />
            </div>
            <div className="fig-shadow" />
          </div>

          {/* Explosion spark */}
          <div className="explosion-fx" style={{ bottom: 18, left: '80%' }}>💥</div>

          {/* YELLOW – pickaxe fighter, facing green */}
          <div className="figure" style={{ left: '86%', animationDuration: '0.58s', animationDelay: '0.15s' }}>
            <div className="yellow-head" />
            <div className="yellow-torso">
              <div className="yellow-arm-back" />
              <div className="yellow-arm-pick">
                <div className="pick-head">
                  <div className="pick-tip" />
                </div>
              </div>
            </div>
            <div className="yellow-legs">
              <div className="yellow-leg-l" /><div className="yellow-leg-r" />
            </div>
            <div className="fig-shadow" />
          </div>

        </div>{/* end figures-scene */}

      </div>{/* end scene */}

      <div className="scanlines" />
      <div className="vignette" />
      <div className="border-frame" />

      {/* ── MAIN CONTENT ── */}
      <main className="page">

        {/* Title */}
        <span className="logo-title">FLAGZiLLA</span>

        {/* Tagline */}
        <div className="tagline-box">
          <span className="tagline-x">✗</span>
          GRAB.FIGHT.REPEAT.
          <span className="tagline-x">✗</span>
        </div>

        {/* Pixel flag */}
        <div className="flag-icon">🚩</div>

        {/* Description */}
        <p className="desc">
          Grab the flag. <strong>Hold it longer</strong> than anyone else.<br />
          The clock is ticking — and so is everyone else&apos;s<br />
          trigger finger.
        </p>

        {/* CTA buttons */}
        <div className="btn-row">
          <Link href="/auth/login" className="btn-login">
            ▶ LOGIN
          </Link>
          <Link href="/auth/register" className="btn-register">
            ✦ REGISTER
          </Link>
        </div>

      </main>
    </>
  );
}