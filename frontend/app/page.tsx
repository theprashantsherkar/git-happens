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
//         <div className="tagline">⚔ a fun multiplayer game ⚔</div>
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

export default function LandingPage() {
  useMusic("nav");
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'VT323', monospace; background: #0d0221; overflow: hidden; }
        .scene {
          position: fixed; inset: 0;
          background: linear-gradient(180deg,
            #0d0221 0%, #1a0533 15%, #2d1b69 35%,
            #1e3a5f 55%, #4a9eca 70%, #7ec8e3 80%,
            #3dba4e 82%, #2a8a36 84%, #1f5c28 88%, #0a1f0e 100%);
        }
        .stars { position: absolute; inset: 0; overflow: hidden; }
        .star { position: absolute; background: #fff; animation: twinkle 2s infinite alternate; }
        @keyframes twinkle { from { opacity: 0.3; } to { opacity: 1; } }
        .sun {
          position: absolute; top: 10%; right: 12%;
          width: 80px; height: 80px; background: #ffd700;
          box-shadow: 0 0 0 8px #ffaa00, 0 0 40px 20px rgba(255,200,0,0.3);
        }
        .sunset-stripes { position: absolute; top: 20%; right: 5%; display: flex; flex-direction: column; gap: 3px; }
        .stripe { height: 4px; }
        .mountain { position: absolute; bottom: 18%; width: 0; height: 0; }
        .m1 { right: 6%; border-left: 90px solid transparent; border-right: 90px solid transparent; border-bottom: 130px solid #5b7fa6; }
        .m2 { right: 15%; border-left: 65px solid transparent; border-right: 65px solid transparent; border-bottom: 100px solid #7a9fbf; }
        .island { position: absolute; animation: float 4s ease-in-out infinite alternate; }
        .i-top { background: #3dba4e; }
        .i-bot { background: #8b5e3c; }
        @keyframes float { from { transform: translateY(0); } to { transform: translateY(-12px); } }
        .pt { position: absolute; bottom: 100%; }
        .trunk { width: 8px; height: 12px; background: #5c3d1a; margin: 0 auto; }
        .t1 { width: 24px; height: 24px; background: #2d7a1a; clip-path: polygon(50% 0%,0% 100%,100% 100%); margin: 0 auto; }
        .t2 { width: 20px; height: 20px; background: #3dba4e; clip-path: polygon(50% 0%,0% 100%,100% 100%); margin: 0 auto; margin-top: -8px; }
        .crate {
          position: absolute; width: 20px; height: 20px; background: #c47a2a;
          border: 2px solid #7a4a10;
          box-shadow: inset -3px -3px 0 #7a4a10, inset 3px 3px 0 #e8a040;
          animation: float 3s ease-in-out infinite alternate;
        }
        .coin {
          position: absolute; width: 10px; height: 10px; background: #ffd700;
          border: 2px solid #b8860b; border-radius: 50%;
          animation: float 2s ease-in-out infinite alternate;
        }
        .ground {
          position: absolute; bottom: 0; left: 0; right: 0; height: 20%;
          background: linear-gradient(180deg, #3dba4e 0%, #2a8a36 8%, #1f5c28 20%, #0a1f0e 100%);
        }
        .ground::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 8px;
          background: repeating-linear-gradient(90deg, #4ece5c 0px, #4ece5c 16px, #3dba4e 16px, #3dba4e 32px);
        }
        .scanlines {
          position: fixed; inset: 0; z-index: 5; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
        }
        .vignette {
          position: fixed; inset: 0; z-index: 4; pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%);
        }
        .border-frame {
          position: fixed; inset: 8px; z-index: 3; pointer-events: none;
          border: 3px solid;
          border-image: linear-gradient(135deg, #00f5ff, #ff6b1a, #ff2d78, #00f5ff) 1;
        }
        .page {
          position: relative; z-index: 10; min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 24px; text-align: center;
        }
        .logo {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(36px, 7vw, 64px);
          background: linear-gradient(135deg, #00f5ff, #ff6b1a, #ffd700, #ff2d78);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          filter: drop-shadow(3px 3px 0 #000);
          letter-spacing: 4px;
          animation: logoIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275) both;
        }
        @keyframes logoIn {
          from { transform: translateY(-30px) scale(0.85); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        .tagline {
          font-family: 'VT323', monospace; font-size: 22px; color: #fff;
          background: rgba(0,0,0,0.6); border: 2px solid #fff;
          padding: 5px 22px; display: inline-block; margin-top: 10px; letter-spacing: 2px;
        }
        .desc {
          font-family: 'VT323', monospace; font-size: 22px;
          color: rgba(255,255,255,0.55); margin-top: 28px; max-width: 520px;
          line-height: 1.5; letter-spacing: 1px;
        }
        .desc span { color: #ffd700; }
        .btns { display: flex; gap: 16px; margin-top: 36px; flex-wrap: wrap; justify-content: center; }
        .btn {
          font-family: 'Press Start 2P', monospace; font-size: 11px; letter-spacing: 1px;
          padding: 16px 32px; border: 3px solid #000; cursor: pointer;
          text-decoration: none; display: inline-block;
          box-shadow: 4px 4px 0 #000;
          transition: transform 0.08s, box-shadow 0.08s;
        }
        .btn:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000; }
        .btn:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }
        .btn-primary { background: #ff6b1a; color: #fff; }
        .btn-primary:hover { background: #ff8c3a; }
        .btn-secondary {
          background: rgba(10,5,30,0.88); color: #00f5ff;
          border-color: #00f5ff;
          box-shadow: 4px 4px 0 #000, 0 0 16px rgba(0,245,255,0.2);
        }
        .btn-secondary:hover { background: rgba(0,245,255,0.08); }
        .flag-icon { font-size: 48px; margin: 20px 0 4px; animation: float 3s ease-in-out infinite alternate; display: block; }
      `}</style>

      <div className="scene">
        <div className="stars">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="star" style={{
              width: `${(i*7%3)+1}px`, height: `${(i*7%3)+1}px`,
              top: `${(i*13)%55}%`, left: `${(i*17)%100}%`,
              animationDelay: `${(i*0.13)%3}s`, animationDuration: `${1.5+(i*0.11)%2}s`,
            }} />
          ))}
        </div>
        <div className="sun" />
        <div className="sunset-stripes">
          {[90,70,50,35,25].map((w,i) => (
            <div key={i} className="stripe" style={{ width: w, background: i%2===0?"#ff2d78":"#ff6b1a", opacity: 0.7-i*0.1 }} />
          ))}
        </div>
        <div className="mountain m1" /><div className="mountain m2" />
        <div className="island" style={{ top:"18%", left:"4%" }}>
          <div className="i-top" style={{ width:80, height:16, borderRadius:"4px 4px 0 0", position:"relative" }}>
            <div className="pt" style={{ left:10 }}><div className="t2" style={{ width:18 }} /><div className="t1" style={{ width:22 }} /><div className="trunk" /></div>
          </div>
          <div className="i-bot" style={{ width:80, height:20, clipPath:"polygon(0 0,100% 0,85% 100%,15% 100%)" }} />
        </div>
        <div className="island" style={{ top:"30%", left:"17%", animationDelay:"1.5s" }}>
          <div className="i-top" style={{ width:56, height:12, borderRadius:"3px 3px 0 0", position:"relative" }}>
            <div className="pt" style={{ left:16 }}><div className="t1" style={{ width:20 }} /><div className="trunk" style={{ height:8 }} /></div>
          </div>
          <div className="i-bot" style={{ width:56, height:14, clipPath:"polygon(0 0,100% 0,80% 100%,20% 100%)" }} />
        </div>
        <div className="crate" style={{ top:"26%", left:"24%", animationDelay:"0.5s" }} />
        <div className="crate" style={{ top:"20%", left:"37%", animationDelay:"1.2s", width:14, height:14 }} />
        <div className="coin" style={{ top:"33%", left:"29%", animationDelay:"0s" }} />
        <div className="ground" />
      </div>
      <div className="scanlines" /><div className="vignette" /><div className="border-frame" />

      <main className="page">
        <div className="logo">FLAGZiLLA</div>
        <div className="tagline">⚔ a fun multiplayer game ⚔</div>
        <span className="flag-icon">🚩</span>
        <p className="desc">
          Grab the flag. <span>Hold it longer</span> than anyone else.<br />
          The clock is ticking — and so is everyone else's trigger finger.
        </p>
        <div className="btns">
          <Link href="/auth/login" className="btn btn-primary">▶ LOGIN</Link>
          <Link href="/auth/register" className="btn btn-secondary">✦ REGISTER</Link>
        </div>
      </main>
    </>
  );
}