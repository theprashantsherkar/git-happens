"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import Link from "next/link";
import { useMusic } from "../hooks/useAudio";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";
const SESSION_OPTIONS = [2, 5, 10, 20] as const;

type Phase =
  | "select"       // choose quick match vs private room
  | "room_options" // create / join private room
  | "searching"    // waiting in find_match queue
  | "waiting"      // in a private room, waiting for 3 more
  | "found";       // match ready, about to navigate

export default function PlayPage() {
  useMusic("nav");
  const router = useRouter();

  const socketRef    = useRef<Socket | null>(null);
  const selectedRef  = useRef(5);
  const currentRoom  = useRef("");

  const [phase,       setPhase]       = useState<Phase>("select");
  const [selected,    setSelected]    = useState(5);
  const [playerCount, setPlayerCount] = useState(0);
  const [roomCode,    setRoomCode]    = useState("");
  const [roomInput,   setRoomInput]   = useState("");
  const [roomTab,     setRoomTab]     = useState<"create" | "join">("create");
  const [error,       setError]       = useState("");
  const [connected,   setConnected]   = useState(false);

  // Keep selectedRef in sync
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // Connect socket once on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("connect_error", (err) => {
      setError(`Cannot connect to server: ${err.message}`);
    });

    socket.on("match_found", ({ roomId, playerIndex }: { roomId: string; playerIndex: number }) => {
      setPhase("found");
      setTimeout(() => {
        router.push(`/game?roomId=${roomId}&duration=${selectedRef.current}&playerIndex=${playerIndex}`);
      }, 1200);
    });

    // Room state gives us live player count while waiting in private room
    socket.on("room_state", (room: { players: Record<string, unknown> }) => {
      setPlayerCount(Object.keys(room.players || {}).length);
    });

    socket.on("game_start", ({ roomId, playerIndex }: { roomId: string; playerIndex: number }) => {
      setPhase("found");
      setTimeout(() => {
        router.push(`/game?roomId=${roomId}&duration=${selectedRef.current}&playerIndex=${playerIndex}`);
      }, 1200);
    });

    socket.on("room_full", () => {
      setError("That room is already full!");
      setPhase("room_options");
    });

    socket.on("room_not_found", () => {
      setError("Room not found. Check the code and try again.");
      setPhase("room_options");
    });

    return () => { socket.disconnect(); };
  }, [router]);

  const handleQuickMatch = () => {
    if (!connected) { setError("Still connecting… please wait."); return; }
    setError("");
    setPhase("searching");
    socketRef.current!.emit("find_match");
  };

  const handleCreateRoom = () => {
    if (!connected) { setError("Still connecting… please wait."); return; }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    currentRoom.current = code;
    setPlayerCount(0);
    setError("");
    setPhase("waiting");
    socketRef.current!.emit("join_room", { roomId: code });
  };

  const handleJoinRoom = () => {
    const code = roomInput.trim().toUpperCase();
    if (code.length < 4) { setError("Enter a valid room code (4+ chars)."); return; }
    if (!connected) { setError("Still connecting… please wait."); return; }
    currentRoom.current = code;
    setPlayerCount(0);
    setError("");
    setPhase("waiting");
    socketRef.current!.emit("join_room", { roomId: code });
  };

  const handleBack = () => {
    setPhase("select");
    setRoomCode("");
    setRoomInput("");
    setError("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'VT323', monospace; background: #0d0221; min-height: 100vh; overflow: hidden; }

        .scene { position: fixed; inset: 0; background: linear-gradient(180deg,
          #050115 0%, #0d0221 10%, #1a0533 22%, #2d1b69 42%,
          #1e3a5f 58%, #2a6e44 70%, #3dba4e 75%, #2a8a36 80%, #0a1f0e 100%); }
        .stars { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .star { position: absolute; background: #fff; border-radius: 50%;
          animation: twinkle 2s infinite alternate; }
        @keyframes twinkle {
          from { opacity: 0.15; transform: scale(0.8); }
          to   { opacity: 0.9;  transform: scale(1.2); }
        }
        .sun { position: absolute; top: 7%; right: 9%; width: 72px; height: 72px;
          background: #ffd700; box-shadow: 0 0 0 10px #ffaa00, 0 0 60px 24px rgba(255,210,0,0.4); }
        .sunset-stripes { position: absolute; top: 18%; right: 4%; display: flex;
          flex-direction: column; gap: 4px; }
        .stripe { height: 5px; }
        .mountain { position: absolute; bottom: 19%; width: 0; height: 0;
          border-style: solid; border-left-color: transparent;
          border-right-color: transparent; border-top: none; }
        .m1 { right: 3%;  border-left-width: 100px; border-right-width: 100px;
          border-bottom: 150px solid #3a5a7a; }
        .m2 { right: 16%; border-left-width: 70px;  border-right-width: 70px;
          border-bottom: 110px solid #4a6a8a; }
        .ground { position: absolute; bottom: 0; left: 0; right: 0; height: 22%;
          background: linear-gradient(180deg, #3dba4e 0%, #2a8a36 7%, #1f5c28 18%, #0a1f0e 100%); }
        .ground::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 10px;
          background: repeating-linear-gradient(90deg, #4ece5c 0px, #4ece5c 18px,
            #3dba4e 18px, #3dba4e 36px); }

        .scanlines { position: fixed; inset: 0; z-index: 5; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px,
            rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px); }
        .vignette { position: fixed; inset: 0; z-index: 4; pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%); }
        .border-frame { position: fixed; inset: 8px; z-index: 6; pointer-events: none;
          border: 3px solid;
          border-image: linear-gradient(135deg, #00f5ff, #ff6b1a, #ff2d78, #00f5ff) 1; }

        .page { position: relative; z-index: 10; min-height: 100vh;
          display: flex; flex-direction: column; }

        /* Nav */
        .nav { display: flex; justify-content: space-between; align-items: center;
          padding: 14px 32px; background: rgba(0,0,0,0.75);
          border-bottom: 1px solid rgba(0,245,255,0.15); backdrop-filter: blur(10px); }
        .nav-logo { font-family: 'Press Start 2P', monospace; font-size: 18px;
          background: linear-gradient(135deg, #00f5ff, #ff6b1a, #ffd700);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; filter: drop-shadow(2px 2px 0 #000); text-decoration: none; }
        .nav-link { font-family: 'VT323', monospace; font-size: 18px; color: #7799bb;
          text-decoration: none; padding: 5px 14px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: color 0.15s, border-color 0.15s; }
        .nav-link:hover { color: #00f5ff; border-color: #00f5ff; }

        /* Main layout */
        .main { flex: 1; display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 32px 24px; gap: 24px; }
        .page-title { font-family: 'Press Start 2P', monospace; font-size: 13px;
          color: #00f5ff; text-shadow: 0 0 16px #00f5ff;
          letter-spacing: 2px; text-align: center; }

        /* Panel */
        .panel { background: rgba(10,5,30,0.9); border: 3px solid #00f5ff;
          box-shadow: 0 0 0 2px #000, 0 0 28px rgba(0,245,255,0.25), 7px 7px 0 rgba(0,0,0,0.8);
          padding: 30px 34px; width: 100%; max-width: 560px; position: relative;
          animation: panelIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both; }
        @keyframes panelIn {
          from { transform: scale(0.92) translateY(16px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; } }
        .pc { position: absolute; width: 8px; height: 8px; background: #00f5ff; }
        .tl { top:-1px; left:-1px; } .tr { top:-1px; right:-1px; }
        .bl { bottom:-1px; left:-1px; } .br { bottom:-1px; right:-1px; }
        .panel-title { font-family: 'Press Start 2P', monospace; font-size: 10px;
          color: #00f5ff; margin-bottom: 22px; text-align: center;
          text-shadow: 0 0 8px #00f5ff; letter-spacing: 1px; }

        /* Duration picker */
        .dur-label { font-family: 'Press Start 2P', monospace; font-size: 7px;
          letter-spacing: 2px; color: #aad4ff; text-align: center;
          display: block; margin-bottom: 14px; }
        .dur-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .dur-btn { background: rgba(0,10,30,0.8); border: 3px solid #334466;
          color: #7799bb; font-family: 'Press Start 2P', monospace; cursor: pointer;
          padding: 14px 6px 10px; display: flex; flex-direction: column;
          align-items: center; gap: 5px; transition: all 0.1s; }
        .dur-btn .num { font-size: 24px; }
        .dur-btn .unit { font-size: 6px; letter-spacing: 2px; color: #334466; }
        .dur-btn:hover { border-color: rgba(0,245,255,0.5); color: #00f5ff;
          transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #000; }
        .dur-btn.active { border-color: #ffd700; background: rgba(255,215,0,0.1);
          box-shadow: 0 0 14px rgba(255,215,0,0.3), 4px 4px 0 #000; }
        .dur-btn.active .num { color: #ffd700; }
        .dur-btn.active .unit { color: #b8860b; }

        /* Mode buttons */
        .modes { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 22px; }
        .mode-btn { border: 3px solid #000; font-family: 'Press Start 2P', monospace;
          font-size: 9px; letter-spacing: 1px; padding: 18px 12px; cursor: pointer;
          box-shadow: 4px 4px 0 #000; transition: transform 0.08s, box-shadow 0.08s;
          display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .mode-btn:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000; }
        .mode-btn:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }
        .mode-icon { font-size: 28px; }
        .mode-sub { font-family: 'VT323', monospace; font-size: 15px;
          color: rgba(255,255,255,0.5); letter-spacing: 1px; margin-top: 2px; }
        .btn-random { background: #ff6b1a; color: #fff; }
        .btn-random:hover { background: #ff8c3a; }
        .btn-room { background: rgba(0,245,255,0.1); color: #00f5ff;
          border-color: #00f5ff;
          box-shadow: 4px 4px 0 #000, 0 0 14px rgba(0,245,255,0.15); }
        .btn-room:hover { background: rgba(0,245,255,0.2);
          box-shadow: 6px 6px 0 #000, 0 0 20px rgba(0,245,255,0.2); }

        /* Room panel */
        .room-tabs { display: grid; grid-template-columns: 1fr 1fr;
          margin-bottom: 20px; border: 2px solid #334466; }
        .room-tab { font-family: 'Press Start 2P', monospace; font-size: 8px;
          padding: 10px; text-align: center; cursor: pointer; color: #556688;
          background: transparent; border: none; transition: all 0.15s; letter-spacing: 1px; }
        .room-tab.active { background: rgba(0,245,255,0.12); color: #00f5ff; }

        .code-display { background: rgba(0,0,0,0.6); border: 2px solid #ffd700;
          padding: 16px; text-align: center; margin-bottom: 16px; }
        .code-label { font-family: 'Press Start 2P', monospace; font-size: 7px;
          color: #aad4ff; letter-spacing: 2px; display: block; margin-bottom: 8px; }
        .code-value { font-family: 'Press Start 2P', monospace; font-size: 26px;
          color: #ffd700; letter-spacing: 6px; text-shadow: 0 0 16px #ffd70066; }
        .code-hint { font-family: 'VT323', monospace; font-size: 16px;
          color: #556688; margin-top: 8px; }

        .field-input { width: 100%; background: rgba(0,10,30,0.8);
          border: 2px solid #334466; color: #e0f0ff;
          font-family: 'VT323', monospace; font-size: 24px;
          padding: 10px 14px; outline: none; transition: border-color 0.15s;
          letter-spacing: 3px; margin-bottom: 14px; text-transform: uppercase; }
        .field-input::placeholder { color: #334466; }
        .field-input:focus { border-color: #00f5ff;
          box-shadow: 0 0 0 2px rgba(0,245,255,0.2); }

        .error-msg { font-family: 'VT323', monospace; font-size: 18px;
          color: #ff2d78; text-align: center; margin-bottom: 12px; }

        .btn-action { width: 100%; background: #ff6b1a; color: #fff;
          border: 3px solid #000; font-family: 'Press Start 2P', monospace;
          font-size: 10px; padding: 13px; cursor: pointer;
          box-shadow: 4px 4px 0 #000; letter-spacing: 1px;
          transition: transform 0.08s, box-shadow 0.08s; }
        .btn-action:hover { background: #ff8c3a; transform: translate(-2px,-2px);
          box-shadow: 6px 6px 0 #000; }
        .btn-action:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }

        .btn-back { background: transparent; color: #556688;
          border: 2px solid #334466; font-family: 'Press Start 2P', monospace;
          font-size: 8px; padding: 8px 16px; cursor: pointer; margin-bottom: 16px;
          letter-spacing: 1px; transition: color 0.15s, border-color 0.15s; }
        .btn-back:hover { color: #00f5ff; border-color: #00f5ff; }

        /* Searching / waiting state */
        .status-panel { text-align: center; padding: 10px 0 6px; }
        .status-icon { font-size: 44px; display: block; margin-bottom: 16px;
          animation: pulse 1.2s ease-in-out infinite alternate; }
        @keyframes pulse {
          from { transform: scale(0.92); opacity: 0.7; }
          to   { transform: scale(1.06); opacity: 1; } }
        .status-title { font-family: 'Press Start 2P', monospace; font-size: 11px;
          color: #ffd700; text-shadow: 0 0 14px #ffd70066;
          letter-spacing: 2px; margin-bottom: 14px; }
        .status-sub { font-family: 'VT323', monospace; font-size: 20px;
          color: #7799bb; letter-spacing: 1px; }

        /* Player slots */
        .slots { display: flex; gap: 12px; justify-content: center;
          margin: 20px 0; }
        .slot { width: 44px; height: 44px; border-radius: 50%;
          border: 3px solid #334466; display: flex; align-items: center;
          justify-content: center; font-size: 18px; transition: all 0.3s; }
        .slot.filled { border-color: #ffd700;
          background: rgba(255,215,0,0.12);
          box-shadow: 0 0 12px rgba(255,215,0,0.4); }
        .slot.empty { border-color: #334466; background: rgba(0,0,0,0.4); }

        /* Found state */
        .found-panel { text-align: center; padding: 10px 0; }
        .found-title { font-family: 'Press Start 2P', monospace; font-size: 14px;
          color: #39ff14; text-shadow: 0 0 20px #39ff1488;
          letter-spacing: 3px; margin-bottom: 16px;
          animation: flash 0.5s ease-in-out infinite alternate; }
        @keyframes flash {
          from { opacity: 0.7; }
          to   { opacity: 1; text-shadow: 0 0 30px #39ff14; } }
        .found-sub { font-family: 'VT323', monospace; font-size: 22px;
          color: #aad4ff; }

        .dots::after { content: ''; animation: dots 1.2s steps(4, end) infinite; }
        @keyframes dots {
          0%   { content: ''; }
          25%  { content: '.'; }
          50%  { content: '..'; }
          75%  { content: '...'; }
          100% { content: ''; }
        }
      `}</style>

      {/* ── Scene ── */}
      <div className="scene">
        <div className="stars">
          {Array.from({ length: 45 }).map((_, i) => (
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
        <div className="sun" />
        <div className="sunset-stripes">
          {[90, 72, 56, 40, 28].map((w, i) => (
            <div key={i} className="stripe" style={{
              width: `${w}px`,
              background: i % 2 === 0 ? '#ff2d78' : '#ff6b1a',
              opacity: 0.7 - i * 0.1,
            }} />
          ))}
        </div>
        <div className="mountain m1" />
        <div className="mountain m2" />
        <div className="ground" />
      </div>
      <div className="scanlines" />
      <div className="vignette" />
      <div className="border-frame" />

      {/* ── Page ── */}
      <div className="page">
        <nav className="nav">
          <Link href="/" className="nav-logo">FLAGZiLLA</Link>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/home" className="nav-link">HOME</Link>
          </div>
        </nav>

        <main className="main">
          <div className="page-title">▶ START A MATCH ◀</div>

          {/* Duration picker — always visible */}
          <div className="panel">
            <div className="pc tl" /><div className="pc tr" />
            <div className="pc bl" /><div className="pc br" />
            <h2 className="panel-title">⏱ SESSION DURATION</h2>
            <span className="dur-label">HOW LONG DO YOU WANT TO PLAY?</span>
            <div className="dur-grid">
              {SESSION_OPTIONS.map(mins => (
                <button
                  key={mins}
                  className={`dur-btn ${selected === mins ? "active" : ""}`}
                  onClick={() => setSelected(mins)}
                >
                  <span className="num">{mins}</span>
                  <span className="unit">MIN</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── State-driven panel ── */}
          {phase === "select" && (
            <div className="panel" style={{ animationDelay: "0.08s" }}>
              <div className="pc tl" /><div className="pc tr" />
              <div className="pc bl" /><div className="pc br" />
              <h2 className="panel-title">🎮 CHOOSE YOUR MODE</h2>
              {error && <div className="error-msg">⚠ {error}</div>}
              <div className="modes">
                <button className="mode-btn btn-random" onClick={handleQuickMatch}>
                  <span className="mode-icon">⚡</span>
                  QUICK MATCH
                  <span className="mode-sub">auto-match 4 players</span>
                </button>
                <button className="mode-btn btn-room" onClick={() => { setPhase("room_options"); setError(""); }}>
                  <span className="mode-icon">🏠</span>
                  PRIVATE ROOM
                  <span className="mode-sub">play with friends</span>
                </button>
              </div>
            </div>
          )}

          {phase === "room_options" && (
            <div className="panel" style={{ animationDelay: "0.06s" }}>
              <div className="pc tl" /><div className="pc tr" />
              <div className="pc bl" /><div className="pc br" />
              <button className="btn-back" onClick={handleBack}>← BACK</button>
              <div className="room-tabs">
                <button
                  className={`room-tab ${roomTab === "join" ? "active" : ""}`}
                  onClick={() => { setRoomTab("join"); setError(""); }}
                >JOIN ROOM</button>
                <button
                  className={`room-tab ${roomTab === "create" ? "active" : ""}`}
                  onClick={() => { setRoomTab("create"); setError(""); }}
                >CREATE ROOM</button>
              </div>
              {error && <div className="error-msg">⚠ {error}</div>}
              {roomTab === "create" ? (
                <button className="btn-action" onClick={handleCreateRoom}>
                  🏠 CREATE &amp; ENTER ROOM
                </button>
              ) : (
                <>
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

          {phase === "searching" && (
            <div className="panel" style={{ animationDelay: "0.06s" }}>
              <div className="pc tl" /><div className="pc tr" />
              <div className="pc bl" /><div className="pc br" />
              <div className="status-panel">
                <span className="status-icon">🔍</span>
                <div className="status-title">FINDING MATCH<span className="dots" /></div>
                <div className="status-sub">Looking for 3 more players…</div>
                <div className="slots" style={{ marginTop: 24 }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`slot ${i === 0 ? "filled" : "empty"}`}>
                      {i === 0 ? "🟢" : "⬜"}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {phase === "waiting" && (
            <div className="panel" style={{ animationDelay: "0.06s" }}>
              <div className="pc tl" /><div className="pc tr" />
              <div className="pc bl" /><div className="pc br" />
              <div className="status-panel">
                <span className="status-icon">🏠</span>
                <div className="status-title">ROOM: {currentRoom.current}</div>
                <div className="status-sub">Share this code with friends!</div>
                <div className="slots" style={{ marginTop: 20 }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`slot ${i < playerCount ? "filled" : "empty"}`}>
                      {i < playerCount ? "🟢" : "⬜"}
                    </div>
                  ))}
                </div>
                <div className="status-sub" style={{ marginTop: 12 }}>
                  {playerCount}/4 players ready
                </div>
              </div>
            </div>
          )}

          {phase === "found" && (
            <div className="panel" style={{ animationDelay: "0s" }}>
              <div className="pc tl" /><div className="pc tr" />
              <div className="pc bl" /><div className="pc br" />
              <div className="found-panel">
                <span className="status-icon" style={{ animation: "none", fontSize: 52 }}>🚀</span>
                <div className="found-title">MATCH FOUND!</div>
                <div className="found-sub">Entering game<span className="dots" /></div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
