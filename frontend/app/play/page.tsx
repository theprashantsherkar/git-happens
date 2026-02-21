// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// const SESSION_OPTIONS = [2, 5, 10, 20] as const;

// export default function PlayPage() {
//   const router = useRouter();
//   const [selected, setSelected] = useState<number>(5);
//   const [roomCode, setRoomCode] = useState("");
//   const [roomInput, setRoomInput] = useState("");
//   const [mode, setMode] = useState<"random" | "room" | null>(null);
//   const [error, setError] = useState("");

//   const handleRandom = () => {
//     router.push(`/game?duration=${selected}&mode=random`);
//   };

//   const handleCreateRoom = () => {
//     const code = Math.random().toString(36).substring(2, 8).toUpperCase();
//     setRoomCode(code);
//     setMode("room");
//   };

//   const handleJoinRoom = () => {
//     if (roomInput.trim().length < 4) { setError("Enter a valid room code."); return; }
//     router.push(`/game?duration=${selected}&room=${roomInput.trim().toUpperCase()}`);
//   };

//   const handleStartRoom = () => {
//     router.push(`/game?duration=${selected}&room=${roomCode}`);
//   };

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         body { font-family: 'VT323', monospace; background: #0d0221; min-height: 100vh; overflow: hidden; }
//         .scene { position: fixed; inset: 0; background: linear-gradient(180deg, #0d0221 0%, #1a0533 15%, #2d1b69 35%, #1e3a5f 55%, #4a9eca 70%, #7ec8e3 80%, #3dba4e 82%, #2a8a36 84%, #1f5c28 88%, #0a1f0e 100%); }
//         .stars { position: absolute; inset: 0; overflow: hidden; }
//         .star { position: absolute; background: #fff; animation: twinkle 2s infinite alternate; }
//         @keyframes twinkle { from { opacity: 0.3; } to { opacity: 1; } }
//         .sun { position: absolute; top: 10%; right: 10%; width: 80px; height: 80px; background: #ffd700; box-shadow: 0 0 0 8px #ffaa00, 0 0 40px 20px rgba(255,200,0,0.3); }
//         .sunset-stripes { position: absolute; top: 20%; right: 5%; display: flex; flex-direction: column; gap: 3px; }
//         .stripe { height: 4px; }
//         .mountain { position: absolute; bottom: 18%; width: 0; height: 0; }
//         .m1 { right: 6%; border-left: 80px solid transparent; border-right: 80px solid transparent; border-bottom: 120px solid #5b7fa6; }
//         .m2 { right: 14%; border-left: 60px solid transparent; border-right: 60px solid transparent; border-bottom: 90px solid #7a9fbf; }
//         .island { position: absolute; animation: float 4s ease-in-out infinite alternate; }
//         .i-top { background: #3dba4e; } .i-bot { background: #8b5e3c; }
//         @keyframes float { from { transform: translateY(0); } to { transform: translateY(-12px); } }
//         .pt { position: absolute; bottom: 100%; }
//         .trunk { width: 8px; height: 12px; background: #5c3d1a; margin: 0 auto; }
//         .t1 { width: 24px; height: 24px; background: #2d7a1a; clip-path: polygon(50% 0%,0% 100%,100% 100%); margin: 0 auto; }
//         .t2 { width: 20px; height: 20px; background: #3dba4e; clip-path: polygon(50% 0%,0% 100%,100% 100%); margin: 0 auto; margin-top: -8px; }
//         .crate { position: absolute; width: 20px; height: 20px; background: #c47a2a; border: 2px solid #7a4a10; box-shadow: inset -3px -3px 0 #7a4a10, inset 3px 3px 0 #e8a040; animation: float 3s ease-in-out infinite alternate; }
//         .ground { position: absolute; bottom: 0; left: 0; right: 0; height: 20%; background: linear-gradient(180deg, #3dba4e 0%, #2a8a36 8%, #1f5c28 20%, #0a1f0e 100%); }
//         .ground::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: repeating-linear-gradient(90deg, #4ece5c 0px, #4ece5c 16px, #3dba4e 16px, #3dba4e 32px); }
//         .scanlines { position: fixed; inset: 0; z-index: 5; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px); }
//         .vignette { position: fixed; inset: 0; z-index: 4; pointer-events: none; background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%); }
//         .border-frame { position: fixed; inset: 8px; z-index: 3; pointer-events: none; border: 3px solid; border-image: linear-gradient(135deg, #00f5ff, #ff6b1a, #ff2d78, #00f5ff) 1; }
//         .page { position: relative; z-index: 10; min-height: 100vh; display: flex; flex-direction: column; }
//         .nav { display: flex; justify-content: space-between; align-items: center; padding: 14px 32px; background: rgba(0,0,0,0.75); border-bottom: 1px solid rgba(0,245,255,0.15); backdrop-filter: blur(10px); }
//         .nav-logo { font-family: 'Press Start 2P', monospace; font-size: 18px; background: linear-gradient(135deg, #00f5ff, #ff6b1a, #ffd700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(2px 2px 0 #000); text-decoration: none; }
//         .nav-link { font-family: 'VT323', monospace; font-size: 18px; color: #7799bb; text-decoration: none; padding: 5px 14px; border: 1px solid rgba(255,255,255,0.1); transition: color 0.15s, border-color 0.15s; }
//         .nav-link:hover { color: #00f5ff; border-color: #00f5ff; }
//         .main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; gap: 24px; }
//         .page-title { font-family: 'Press Start 2P', monospace; font-size: 13px; color: #00f5ff; text-shadow: 0 0 16px #00f5ff; letter-spacing: 2px; text-align: center; }
//         .panel { background: rgba(10,5,30,0.88); border: 3px solid #00f5ff; box-shadow: 0 0 0 2px #000, 0 0 28px rgba(0,245,255,0.25), 7px 7px 0 rgba(0,0,0,0.8); padding: 30px 34px; width: 100%; max-width: 560px; position: relative; animation: panelIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both; }
//         @keyframes panelIn { from { transform: scale(0.92) translateY(16px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
//         .pc { position: absolute; width: 8px; height: 8px; background: #00f5ff; }
//         .tl { top:-1px; left:-1px; } .tr { top:-1px; right:-1px; } .bl { bottom:-1px; left:-1px; } .br { bottom:-1px; right:-1px; }
//         .panel-title { font-family: 'Press Start 2P', monospace; font-size: 10px; color: #00f5ff; margin-bottom: 22px; text-align: center; text-shadow: 0 0 8px #00f5ff; letter-spacing: 1px; }

//         /* Duration */
//         .dur-label { font-family: 'Press Start 2P', monospace; font-size: 7px; letter-spacing: 2px; color: #aad4ff; text-align: center; display: block; margin-bottom: 14px; }
//         .dur-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 0; }
//         .dur-btn { background: rgba(0,10,30,0.8); border: 3px solid #334466; color: #7799bb; font-family: 'Press Start 2P', monospace; cursor: pointer; padding: 14px 6px 10px; display: flex; flex-direction: column; align-items: center; gap: 5px; transition: all 0.1s; }
//         .dur-btn .num { font-size: 24px; }
//         .dur-btn .unit { font-size: 6px; letter-spacing: 2px; color: #334466; }
//         .dur-btn:hover { border-color: rgba(0,245,255,0.5); color: #00f5ff; transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #000; }
//         .dur-btn.active { border-color: #ffd700; background: rgba(255,215,0,0.1); box-shadow: 0 0 14px rgba(255,215,0,0.3), 4px 4px 0 #000; }
//         .dur-btn.active .num { color: #ffd700; }
//         .dur-btn.active .unit { color: #b8860b; }

//         /* Mode buttons */
//         .modes { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 22px; }
//         .mode-btn { border: 3px solid #000; font-family: 'Press Start 2P', monospace; font-size: 9px; letter-spacing: 1px; padding: 18px 12px; cursor: pointer; box-shadow: 4px 4px 0 #000; transition: transform 0.08s, box-shadow 0.08s; display: flex; flex-direction: column; align-items: center; gap: 8px; }
//         .mode-btn:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000; }
//         .mode-btn:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }
//         .mode-icon { font-size: 28px; }
//         .mode-sub { font-family: 'VT323', monospace; font-size: 15px; color: rgba(255,255,255,0.5); letter-spacing: 1px; font-weight: normal; margin-top: 2px; }
//         .btn-random { background: #ff6b1a; color: #fff; }
//         .btn-random:hover { background: #ff8c3a; }
//         .btn-room { background: rgba(0,245,255,0.12); color: #00f5ff; border-color: #00f5ff; box-shadow: 4px 4px 0 #000, 0 0 14px rgba(0,245,255,0.15); }
//         .btn-room:hover { background: rgba(0,245,255,0.2); box-shadow: 6px 6px 0 #000, 0 0 20px rgba(0,245,255,0.2); }

//         /* Room panel */
//         .room-panel { animation-delay: 0.1s; }
//         .room-tabs { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 20px; border: 2px solid #334466; }
//         .room-tab { font-family: 'Press Start 2P', monospace; font-size: 8px; padding: 10px; text-align: center; cursor: pointer; color: #556688; background: transparent; border: none; transition: all 0.15s; letter-spacing: 1px; }
//         .room-tab.active { background: rgba(0,245,255,0.12); color: #00f5ff; }

//         .code-display { background: rgba(0,0,0,0.6); border: 2px solid #ffd700; padding: 16px; text-align: center; margin-bottom: 16px; }
//         .code-label { font-family: 'Press Start 2P', monospace; font-size: 7px; color: #aad4ff; letter-spacing: 2px; display: block; margin-bottom: 8px; }
//         .code-value { font-family: 'Press Start 2P', monospace; font-size: 26px; color: #ffd700; letter-spacing: 6px; text-shadow: 0 0 16px #ffd70066; }
//         .code-hint { font-family: 'VT323', monospace; font-size: 16px; color: #556688; margin-top: 8px; }

//         .field-input { width: 100%; background: rgba(0,10,30,0.8); border: 2px solid #334466; color: #e0f0ff; font-family: 'VT323', monospace; font-size: 24px; padding: 10px 14px; outline: none; transition: border-color 0.15s; letter-spacing: 3px; margin-bottom: 14px; text-transform: uppercase; }
//         .field-input::placeholder { color: #334466; letter-spacing: 2px; }
//         .field-input:focus { border-color: #00f5ff; box-shadow: 0 0 0 2px rgba(0,245,255,0.2); }
//         .error-msg { font-family: 'VT323', monospace; font-size: 18px; color: #ff2d78; text-align: center; margin-bottom: 10px; }

//         .btn-action { width: 100%; background: #ff6b1a; color: #fff; border: 3px solid #000; font-family: 'Press Start 2P', monospace; font-size: 10px; padding: 13px; cursor: pointer; box-shadow: 4px 4px 0 #000; letter-spacing: 1px; transition: transform 0.08s, box-shadow 0.08s; }
//         .btn-action:hover { background: #ff8c3a; transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000; }
//         .btn-action:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }
//         .btn-back { background: transparent; color: #556688; border: 2px solid #334466; font-family: 'Press Start 2P', monospace; font-size: 8px; padding: 8px 16px; cursor: pointer; margin-bottom: 16px; letter-spacing: 1px; transition: color 0.15s, border-color 0.15s; }
//         .btn-back:hover { color: #00f5ff; border-color: #00f5ff; }
//       `}</style>

//       <div className="scene">
//         <div className="stars">{Array.from({length:40}).map((_,i)=><div key={i} className="star" style={{ width:`${(i*7%3)+1}px`, height:`${(i*7%3)+1}px`, top:`${(i*13)%55}%`, left:`${(i*17)%100}%`, animationDelay:`${(i*0.13)%3}s`, animationDuration:`${1.5+(i*0.11)%2}s` }}/>)}</div>
//         <div className="sun"/>
//         <div className="sunset-stripes">{[90,70,50,35,25].map((w,i)=><div key={i} className="stripe" style={{ width:w, background:i%2===0?"#ff2d78":"#ff6b1a", opacity:0.7-i*0.1 }}/>)}</div>
//         <div className="mountain m1"/><div className="mountain m2"/>
//         <div className="island" style={{ top:"20%", left:"4%" }}>
//           <div className="i-top" style={{ width:80, height:16, borderRadius:"4px 4px 0 0", position:"relative" }}><div className="pt" style={{ left:10 }}><div className="t2" style={{ width:18 }}/><div className="t1" style={{ width:22 }}/><div className="trunk"/></div></div>
//           <div className="i-bot" style={{ width:80, height:20, clipPath:"polygon(0 0,100% 0,85% 100%,15% 100%)" }}/>
//         </div>
//         <div className="crate" style={{ top:"28%", left:"24%", animationDelay:"0.5s" }}/>
//         <div className="crate" style={{ top:"38%", right:"20%", animationDelay:"0.9s" }}/>
//         <div className="ground"/>
//       </div>
//       <div className="scanlines"/><div className="vignette"/><div className="border-frame"/>

//       <div className="page">
//         <nav className="nav">
//           <Link href="/" className="nav-logo">FLAGZiLLA</Link>
//           <div style={{ display:"flex", gap:10 }}>
//             <Link href="/home" className="nav-link">HOME</Link>
//             <Link href="/auth/login" className="nav-link">LOGIN</Link>
//           </div>
//         </nav>

//         <main className="main">
//           <div className="page-title">▶ START A GAME ◀</div>

//           {/* Duration picker — always visible */}
//           <div className="panel" style={{ maxWidth:560 }}>
//             <div className="pc tl"/><div className="pc tr"/><div className="pc bl"/><div className="pc br"/>
//             <h2 className="panel-title">⏱ SELECT SESSION DURATION</h2>
//             <span className="dur-label">HOW LONG DO YOU WANT TO PLAY?</span>
//             <div className="dur-grid">
//               {SESSION_OPTIONS.map(mins => (
//                 <button key={mins} className={`dur-btn ${selected===mins?"active":""}`} onClick={() => setSelected(mins)}>
//                   <span className="num">{mins}</span>
//                   <span className="unit">MIN</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Mode selection or room panel */}
//           {mode === null ? (
//             <div className="panel" style={{ maxWidth:560, animationDelay:"0.08s" }}>
//               <div className="pc tl"/><div className="pc tr"/><div className="pc bl"/><div className="pc br"/>
//               <h2 className="panel-title">🎮 CHOOSE YOUR MODE</h2>
//               <div className="modes">
//                 <button className="mode-btn btn-random" onClick={handleRandom}>
//                   <span className="mode-icon">⚡</span>
//                   QUICK MATCH
//                   <span className="mode-sub">random players</span>
//                 </button>
//                 <button className="mode-btn btn-room" onClick={() => setMode("room")}>
//                   <span className="mode-icon">🏠</span>
//                   PRIVATE ROOM
//                   <span className="mode-sub">play with friends</span>
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="panel room-panel" style={{ maxWidth:560 }}>
//               <div className="pc tl"/><div className="pc tr"/><div className="pc bl"/><div className="pc br"/>
//               <button className="btn-back" onClick={() => { setMode(null); setRoomCode(""); setRoomInput(""); setError(""); }}>← BACK</button>
//               <div className="room-tabs">
//                 <button className={`room-tab ${!roomCode?"active":""}`} onClick={() => { setRoomCode(""); setError(""); }}>JOIN ROOM</button>
//                 <button className={`room-tab ${roomCode?"active":""}`} onClick={handleCreateRoom}>CREATE ROOM</button>
//               </div>

//               {roomCode ? (
//                 <>
//                   <div className="code-display">
//                     <span className="code-label">YOUR ROOM CODE — SHARE WITH FRIENDS</span>
//                     <div className="code-value">{roomCode}</div>
//                     <div className="code-hint">waiting for players to join...</div>
//                   </div>
//                   <button className="btn-action" onClick={handleStartRoom}>▶ START WITH {selected} MIN</button>
//                 </>
//               ) : (
//                 <>
//                   {error && <div className="error-msg">⚠ {error}</div>}
//                   <input
//                     className="field-input"
//                     placeholder="ENTER CODE"
//                     value={roomInput}
//                     onChange={e => { setRoomInput(e.target.value.toUpperCase()); setError(""); }}
//                     maxLength={8}
//                   />
//                   <button className="btn-action" onClick={handleJoinRoom}>▶ JOIN ROOM</button>
//                 </>
//               )}
//             </div>
//           )}
//         </main>
//       </div>
//     </>
//   );
// }

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMusic } from "../hooks/useAudio";

const SESSION_OPTIONS = [2, 5, 10, 20] as const;

export default function PlayPage() {
  useMusic("nav");
  const router = useRouter();
  const [selected, setSelected] = useState<number>(5);
  const [roomCode, setRoomCode] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [mode, setMode] = useState<"random" | "room" | null>(null);
  const [error, setError] = useState("");

  const handleRandom = () => {
    router.push(`/game?duration=${selected}&mode=random`);
  };

  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setMode("room");
  };

  const handleJoinRoom = () => {
    if (roomInput.trim().length < 4) { setError("Enter a valid room code."); return; }
    router.push(`/game?duration=${selected}&room=${roomInput.trim().toUpperCase()}`);
  };

  const handleStartRoom = () => {
    router.push(`/game?duration=${selected}&room=${roomCode}`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'VT323', monospace; background: #0d0221; min-height: 100vh; overflow: hidden; }
        .scene { position: fixed; inset: 0; background: linear-gradient(180deg, #0d0221 0%, #1a0533 15%, #2d1b69 35%, #1e3a5f 55%, #4a9eca 70%, #7ec8e3 80%, #3dba4e 82%, #2a8a36 84%, #1f5c28 88%, #0a1f0e 100%); }
        .stars { position: absolute; inset: 0; overflow: hidden; }
        .star { position: absolute; background: #fff; animation: twinkle 2s infinite alternate; }
        @keyframes twinkle { from { opacity: 0.3; } to { opacity: 1; } }
        .sun { position: absolute; top: 10%; right: 10%; width: 80px; height: 80px; background: #ffd700; box-shadow: 0 0 0 8px #ffaa00, 0 0 40px 20px rgba(255,200,0,0.3); }
        .sunset-stripes { position: absolute; top: 20%; right: 5%; display: flex; flex-direction: column; gap: 3px; }
        .stripe { height: 4px; }
        .mountain { position: absolute; bottom: 18%; width: 0; height: 0; }
        .m1 { right: 6%; border-left: 80px solid transparent; border-right: 80px solid transparent; border-bottom: 120px solid #5b7fa6; }
        .m2 { right: 14%; border-left: 60px solid transparent; border-right: 60px solid transparent; border-bottom: 90px solid #7a9fbf; }
        .island { position: absolute; animation: float 4s ease-in-out infinite alternate; }
        .i-top { background: #3dba4e; } .i-bot { background: #8b5e3c; }
        @keyframes float { from { transform: translateY(0); } to { transform: translateY(-12px); } }
        .pt { position: absolute; bottom: 100%; }
        .trunk { width: 8px; height: 12px; background: #5c3d1a; margin: 0 auto; }
        .t1 { width: 24px; height: 24px; background: #2d7a1a; clip-path: polygon(50% 0%,0% 100%,100% 100%); margin: 0 auto; }
        .t2 { width: 20px; height: 20px; background: #3dba4e; clip-path: polygon(50% 0%,0% 100%,100% 100%); margin: 0 auto; margin-top: -8px; }
        .crate { position: absolute; width: 20px; height: 20px; background: #c47a2a; border: 2px solid #7a4a10; box-shadow: inset -3px -3px 0 #7a4a10, inset 3px 3px 0 #e8a040; animation: float 3s ease-in-out infinite alternate; }
        .ground { position: absolute; bottom: 0; left: 0; right: 0; height: 20%; background: linear-gradient(180deg, #3dba4e 0%, #2a8a36 8%, #1f5c28 20%, #0a1f0e 100%); }
        .ground::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: repeating-linear-gradient(90deg, #4ece5c 0px, #4ece5c 16px, #3dba4e 16px, #3dba4e 32px); }
        .scanlines { position: fixed; inset: 0; z-index: 5; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px); }
        .vignette { position: fixed; inset: 0; z-index: 4; pointer-events: none; background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%); }
        .border-frame { position: fixed; inset: 8px; z-index: 3; pointer-events: none; border: 3px solid; border-image: linear-gradient(135deg, #00f5ff, #ff6b1a, #ff2d78, #00f5ff) 1; }
        .page { position: relative; z-index: 10; min-height: 100vh; display: flex; flex-direction: column; }
        .nav { display: flex; justify-content: space-between; align-items: center; padding: 14px 32px; background: rgba(0,0,0,0.75); border-bottom: 1px solid rgba(0,245,255,0.15); backdrop-filter: blur(10px); }
        .nav-logo { font-family: 'Press Start 2P', monospace; font-size: 18px; background: linear-gradient(135deg, #00f5ff, #ff6b1a, #ffd700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(2px 2px 0 #000); text-decoration: none; }
        .nav-link { font-family: 'VT323', monospace; font-size: 18px; color: #7799bb; text-decoration: none; padding: 5px 14px; border: 1px solid rgba(255,255,255,0.1); transition: color 0.15s, border-color 0.15s; }
        .nav-link:hover { color: #00f5ff; border-color: #00f5ff; }
        .main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; gap: 24px; }
        .page-title { font-family: 'Press Start 2P', monospace; font-size: 13px; color: #00f5ff; text-shadow: 0 0 16px #00f5ff; letter-spacing: 2px; text-align: center; }
        .panel { background: rgba(10,5,30,0.88); border: 3px solid #00f5ff; box-shadow: 0 0 0 2px #000, 0 0 28px rgba(0,245,255,0.25), 7px 7px 0 rgba(0,0,0,0.8); padding: 30px 34px; width: 100%; max-width: 560px; position: relative; animation: panelIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both; }
        @keyframes panelIn { from { transform: scale(0.92) translateY(16px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .pc { position: absolute; width: 8px; height: 8px; background: #00f5ff; }
        .tl { top:-1px; left:-1px; } .tr { top:-1px; right:-1px; } .bl { bottom:-1px; left:-1px; } .br { bottom:-1px; right:-1px; }
        .panel-title { font-family: 'Press Start 2P', monospace; font-size: 10px; color: #00f5ff; margin-bottom: 22px; text-align: center; text-shadow: 0 0 8px #00f5ff; letter-spacing: 1px; }

        /* Duration */
        .dur-label { font-family: 'Press Start 2P', monospace; font-size: 7px; letter-spacing: 2px; color: #aad4ff; text-align: center; display: block; margin-bottom: 14px; }
        .dur-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 0; }
        .dur-btn { background: rgba(0,10,30,0.8); border: 3px solid #334466; color: #7799bb; font-family: 'Press Start 2P', monospace; cursor: pointer; padding: 14px 6px 10px; display: flex; flex-direction: column; align-items: center; gap: 5px; transition: all 0.1s; }
        .dur-btn .num { font-size: 24px; }
        .dur-btn .unit { font-size: 6px; letter-spacing: 2px; color: #334466; }
        .dur-btn:hover { border-color: rgba(0,245,255,0.5); color: #00f5ff; transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #000; }
        .dur-btn.active { border-color: #ffd700; background: rgba(255,215,0,0.1); box-shadow: 0 0 14px rgba(255,215,0,0.3), 4px 4px 0 #000; }
        .dur-btn.active .num { color: #ffd700; }
        .dur-btn.active .unit { color: #b8860b; }

        /* Mode buttons */
        .modes { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 22px; }
        .mode-btn { border: 3px solid #000; font-family: 'Press Start 2P', monospace; font-size: 9px; letter-spacing: 1px; padding: 18px 12px; cursor: pointer; box-shadow: 4px 4px 0 #000; transition: transform 0.08s, box-shadow 0.08s; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .mode-btn:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000; }
        .mode-btn:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }
        .mode-icon { font-size: 28px; }
        .mode-sub { font-family: 'VT323', monospace; font-size: 15px; color: rgba(255,255,255,0.5); letter-spacing: 1px; font-weight: normal; margin-top: 2px; }
        .btn-random { background: #ff6b1a; color: #fff; }
        .btn-random:hover { background: #ff8c3a; }
        .btn-room { background: rgba(0,245,255,0.12); color: #00f5ff; border-color: #00f5ff; box-shadow: 4px 4px 0 #000, 0 0 14px rgba(0,245,255,0.15); }
        .btn-room:hover { background: rgba(0,245,255,0.2); box-shadow: 6px 6px 0 #000, 0 0 20px rgba(0,245,255,0.2); }

        /* Room panel */
        .room-panel { animation-delay: 0.1s; }
        .room-tabs { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 20px; border: 2px solid #334466; }
        .room-tab { font-family: 'Press Start 2P', monospace; font-size: 8px; padding: 10px; text-align: center; cursor: pointer; color: #556688; background: transparent; border: none; transition: all 0.15s; letter-spacing: 1px; }
        .room-tab.active { background: rgba(0,245,255,0.12); color: #00f5ff; }

        .code-display { background: rgba(0,0,0,0.6); border: 2px solid #ffd700; padding: 16px; text-align: center; margin-bottom: 16px; }
        .code-label { font-family: 'Press Start 2P', monospace; font-size: 7px; color: #aad4ff; letter-spacing: 2px; display: block; margin-bottom: 8px; }
        .code-value { font-family: 'Press Start 2P', monospace; font-size: 26px; color: #ffd700; letter-spacing: 6px; text-shadow: 0 0 16px #ffd70066; }
        .code-hint { font-family: 'VT323', monospace; font-size: 16px; color: #556688; margin-top: 8px; }

        .field-input { width: 100%; background: rgba(0,10,30,0.8); border: 2px solid #334466; color: #e0f0ff; font-family: 'VT323', monospace; font-size: 24px; padding: 10px 14px; outline: none; transition: border-color 0.15s; letter-spacing: 3px; margin-bottom: 14px; text-transform: uppercase; }
        .field-input::placeholder { color: #334466; letter-spacing: 2px; }
        .field-input:focus { border-color: #00f5ff; box-shadow: 0 0 0 2px rgba(0,245,255,0.2); }
        .error-msg { font-family: 'VT323', monospace; font-size: 18px; color: #ff2d78; text-align: center; margin-bottom: 10px; }

        .btn-action { width: 100%; background: #ff6b1a; color: #fff; border: 3px solid #000; font-family: 'Press Start 2P', monospace; font-size: 10px; padding: 13px; cursor: pointer; box-shadow: 4px 4px 0 #000; letter-spacing: 1px; transition: transform 0.08s, box-shadow 0.08s; }
        .btn-action:hover { background: #ff8c3a; transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000; }
        .btn-action:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }
        .btn-back { background: transparent; color: #556688; border: 2px solid #334466; font-family: 'Press Start 2P', monospace; font-size: 8px; padding: 8px 16px; cursor: pointer; margin-bottom: 16px; letter-spacing: 1px; transition: color 0.15s, border-color 0.15s; }
        .btn-back:hover { color: #00f5ff; border-color: #00f5ff; }
      `}</style>

      <div className="scene">
        <div className="stars">{Array.from({length:40}).map((_,i)=><div key={i} className="star" style={{ width:`${(i*7%3)+1}px`, height:`${(i*7%3)+1}px`, top:`${(i*13)%55}%`, left:`${(i*17)%100}%`, animationDelay:`${(i*0.13)%3}s`, animationDuration:`${1.5+(i*0.11)%2}s` }}/>)}</div>
        <div className="sun"/>
        <div className="sunset-stripes">{[90,70,50,35,25].map((w,i)=><div key={i} className="stripe" style={{ width:w, background:i%2===0?"#ff2d78":"#ff6b1a", opacity:0.7-i*0.1 }}/>)}</div>
        <div className="mountain m1"/><div className="mountain m2"/>
        <div className="island" style={{ top:"20%", left:"4%" }}>
          <div className="i-top" style={{ width:80, height:16, borderRadius:"4px 4px 0 0", position:"relative" }}><div className="pt" style={{ left:10 }}><div className="t2" style={{ width:18 }}/><div className="t1" style={{ width:22 }}/><div className="trunk"/></div></div>
          <div className="i-bot" style={{ width:80, height:20, clipPath:"polygon(0 0,100% 0,85% 100%,15% 100%)" }}/>
        </div>
        <div className="crate" style={{ top:"28%", left:"24%", animationDelay:"0.5s" }}/>
        <div className="crate" style={{ top:"38%", right:"20%", animationDelay:"0.9s" }}/>
        <div className="ground"/>
      </div>
      <div className="scanlines"/><div className="vignette"/><div className="border-frame"/>

      <div className="page">
        <nav className="nav">
          <Link href="/" className="nav-logo">FLAGZiLLA</Link>
          <div style={{ display:"flex", gap:10 }}>
            <Link href="/home" className="nav-link">HOME</Link>
            <Link href="/auth/login" className="nav-link">LOGIN</Link>
          </div>
        </nav>

        <main className="main">
          <div className="page-title">▶ START A GAME ◀</div>

          {/* Duration picker — always visible */}
          <div className="panel" style={{ maxWidth:560 }}>
            <div className="pc tl"/><div className="pc tr"/><div className="pc bl"/><div className="pc br"/>
            <h2 className="panel-title">⏱ SELECT SESSION DURATION</h2>
            <span className="dur-label">HOW LONG DO YOU WANT TO PLAY?</span>
            <div className="dur-grid">
              {SESSION_OPTIONS.map(mins => (
                <button key={mins} className={`dur-btn ${selected===mins?"active":""}`} onClick={() => setSelected(mins)}>
                  <span className="num">{mins}</span>
                  <span className="unit">MIN</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode selection or room panel */}
          {mode === null ? (
            <div className="panel" style={{ maxWidth:560, animationDelay:"0.08s" }}>
              <div className="pc tl"/><div className="pc tr"/><div className="pc bl"/><div className="pc br"/>
              <h2 className="panel-title">🎮 CHOOSE YOUR MODE</h2>
              <div className="modes">
                <button className="mode-btn btn-random" onClick={handleRandom}>
                  <span className="mode-icon">⚡</span>
                  QUICK MATCH
                  <span className="mode-sub">random players</span>
                </button>
                <button className="mode-btn btn-room" onClick={() => setMode("room")}>
                  <span className="mode-icon">🏠</span>
                  PRIVATE ROOM
                  <span className="mode-sub">play with friends</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="panel room-panel" style={{ maxWidth:560 }}>
              <div className="pc tl"/><div className="pc tr"/><div className="pc bl"/><div className="pc br"/>
              <button className="btn-back" onClick={() => { setMode(null); setRoomCode(""); setRoomInput(""); setError(""); }}>← BACK</button>
              <div className="room-tabs">
                <button className={`room-tab ${!roomCode?"active":""}`} onClick={() => { setRoomCode(""); setError(""); }}>JOIN ROOM</button>
                <button className={`room-tab ${roomCode?"active":""}`} onClick={handleCreateRoom}>CREATE ROOM</button>
              </div>

              {roomCode ? (
                <>
                  <div className="code-display">
                    <span className="code-label">YOUR ROOM CODE — SHARE WITH FRIENDS</span>
                    <div className="code-value">{roomCode}</div>
                    <div className="code-hint">waiting for players to join...</div>
                  </div>
                  <button className="btn-action" onClick={handleStartRoom}>▶ START WITH {selected} MIN</button>
                </>
              ) : (
                <>
                  {error && <div className="error-msg">⚠ {error}</div>}
                  <input
                    className="field-input"
                    placeholder="ENTER CODE"
                    value={roomInput}
                    onChange={e => { setRoomInput(e.target.value.toUpperCase()); setError(""); }}
                    maxLength={8}
                  />
                  <button className="btn-action" onClick={handleJoinRoom}>▶ JOIN ROOM</button>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}