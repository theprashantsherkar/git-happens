"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameState } from "../hooks/useGameState";
import { GameScene } from "../components/GameScene";
import { HUD } from "../components/HUD";

// ─── Mock global leaderboard ──────────────────────────────────────────────────
const GLOBAL_LEADERS = [
  { rank: 1, name: "ShadowFlag",  color: "#3B82F6", wins: 38, holdMs: 4320000 },
  { rank: 2, name: "RedReaper",   color: "#EF4444", wins: 31, holdMs: 3870000 },
  { rank: 3, name: "GreenGhost",  color: "#22C55E", wins: 27, holdMs: 3210000 },
  { rank: 4, name: "YellowBolt",  color: "#EAB308", wins: 22, holdMs: 2980000 },
  { rank: 5, name: "IronCarrier", color: "#3B82F6", wins: 19, holdMs: 2640000 },
  { rank: 6, name: "BlitzMark",   color: "#EF4444", wins: 15, holdMs: 2100000 },
];
const MEDALS = ["🥇", "🥈", "🥉"];

function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}
function fmtHold(ms: number) {
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
}

// ─── Flag countdown overlay ───────────────────────────────────────────────────
function FlagCountdown({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(5);
  const [phase, setPhase] = useState<"counting" | "go">("counting");

  useEffect(() => {
    if (count === 0) {
      setPhase("go");
      const t = setTimeout(onDone, 100);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount(c => c - 1), 200);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');
        .cd-backdrop {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(2px);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          pointer-events: none;
        }
        .cd-label {
          font-family: 'Press Start 2P', monospace;
          font-size: 13px; letter-spacing: 4px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 24px;
        }
        .cd-number {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(80px, 18vw, 140px);
          color: #ffd700;
          text-shadow: 0 0 40px #ffd70099, 0 0 80px #ffd70033;
          filter: drop-shadow(4px 4px 0 #000);
          animation: cdPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
          line-height: 1;
        }
        .cd-go {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(60px, 14vw, 110px);
          color: #ff6b1a;
          text-shadow: 0 0 40px #ff6b1a99, 0 0 80px #ff6b1a33;
          filter: drop-shadow(4px 4px 0 #000);
          animation: cdGo 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
          line-height: 1;
        }
        .cd-flag { font-size: 48px; margin-top: 20px; animation: cdDrop 0.5s 0.1s ease-out both; }
        @keyframes cdPop  { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes cdGo   { from { transform: scale(1.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes cdDrop { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .cd-scanlines {
          position: fixed; inset: 0; z-index: 51; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
        }
      `}</style>
      <div className="cd-scanlines" />
      <div className="cd-backdrop">
        {phase === "counting" ? (
          <>
            <div className="cd-label">🚩 FLAG DROPS IN</div>
            <div className="cd-number" key={count}>{count}</div>
          </>
        ) : (
          <>
            <div className="cd-go">GO!</div>
            <div className="cd-flag">🚩</div>
          </>
        )}
      </div>
    </>
  );
}

// ─── End-of-game modal ────────────────────────────────────────────────────────
function EndModal({ players, onPlayAgain, onHome }: {
  players: any[];
  onPlayAgain: () => void;
  onHome: () => void;
}) {
  const sorted = [...players].sort((a, b) => b.flagTime - a.flagTime);
  const winner = sorted[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');
        .modal-backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal { background: rgba(10,5,30,0.97); border: 3px solid #00f5ff; box-shadow: 0 0 0 2px #000, 0 0 40px rgba(0,245,255,0.3), 10px 10px 0 rgba(0,0,0,0.9); width: 100%; max-width: 780px; max-height: 90vh; overflow-y: auto; scrollbar-width: none; position: relative; animation: slideUp 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both; }
        @keyframes slideUp { from { transform: translateY(40px) scale(0.93); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        .mpc { position: absolute; width: 8px; height: 8px; background: #00f5ff; }
        .m-tl { top:-1px; left:-1px; } .m-tr { top:-1px; right:-1px; } .m-bl { bottom:-1px; left:-1px; } .m-br { bottom:-1px; right:-1px; }
        .modal-inner { padding: 32px 36px; }
        .modal-header { text-align: center; margin-bottom: 28px; }
        .modal-over { font-family: 'VT323', monospace; font-size: 18px; color: rgba(255,255,255,0.35); letter-spacing: 6px; margin-bottom: 6px; }
        .modal-winner { font-family: 'Press Start 2P', monospace; font-size: clamp(18px,3vw,28px); letter-spacing: 3px; margin-bottom: 6px; }
        .modal-sub { font-family: 'VT323', monospace; font-size: 18px; color: rgba(255,255,255,0.45); letter-spacing: 2px; }
        .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .modal-section-title { font-family: 'Press Start 2P', monospace; font-size: 8px; color: #00f5ff; letter-spacing: 2px; margin-bottom: 12px; text-shadow: 0 0 8px #00f5ff; }
        .session-row { display: grid; grid-template-columns: 28px 1fr 70px; gap: 6px; align-items: center; padding: 8px 6px; margin-bottom: 3px; border: 1px solid transparent; border-radius: 3px; }
        .session-row.s-winner { background: rgba(255,215,0,0.08); border-color: rgba(255,215,0,0.2); }
        .s-rank { font-family: 'Press Start 2P', monospace; font-size: 10px; text-align: center; }
        .s-player { display: flex; align-items: center; gap: 7px; }
        .s-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .s-name { font-family: 'VT323', monospace; font-size: 18px; }
        .s-time { font-family: 'VT323', monospace; font-size: 18px; text-align: right; color: #ffd700; font-variant-numeric: tabular-nums; }
        .global-row { display: grid; grid-template-columns: 28px 1fr 50px 70px; gap: 6px; align-items: center; padding: 7px 6px; margin-bottom: 2px; border-radius: 3px; }
        .global-row:hover { background: rgba(0,245,255,0.04); }
        .g-rank { font-family: 'Press Start 2P', monospace; font-size: 9px; text-align: center; }
        .g-player { display: flex; align-items: center; gap: 6px; }
        .g-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .g-name { font-family: 'VT323', monospace; font-size: 18px; }
        .g-wins { font-family: 'VT323', monospace; font-size: 16px; text-align: right; color: #aad4ff; }
        .g-time { font-family: 'VT323', monospace; font-size: 15px; text-align: right; color: #556688; font-variant-numeric: tabular-nums; }
        .modal-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .mbtn { border: 3px solid #000; font-family: 'Press Start 2P', monospace; font-size: 10px; letter-spacing: 1px; padding: 14px; cursor: pointer; box-shadow: 4px 4px 0 #000; transition: transform 0.08s, box-shadow 0.08s; }
        .mbtn:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #000; }
        .mbtn:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000; }
        .mbtn-again { background: #ff6b1a; color: #fff; }
        .mbtn-again:hover { background: #ff8c3a; }
        .mbtn-home { background: rgba(0,245,255,0.1); color: #00f5ff; border-color: #00f5ff; box-shadow: 4px 4px 0 #000, 0 0 12px rgba(0,245,255,0.15); }
        .mbtn-home:hover { background: rgba(0,245,255,0.18); }
        .scanlines-modal { position: fixed; inset: 0; z-index: 99; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px); }
      `}</style>
      <div className="scanlines-modal" />
      <div className="modal-backdrop">
        <div className="modal">
          <div className="mpc m-tl" /><div className="mpc m-tr" /><div className="mpc m-bl" /><div className="mpc m-br" />
          <div className="modal-inner">
            <div className="modal-header">
              <div className="modal-over">GAME OVER</div>
              <div className="modal-winner" style={{ color: winner.color, textShadow: `0 0 30px ${winner.color}88` }}>
                {winner.name} WINS 🚩
              </div>
              <div className="modal-sub">held the flag for {fmtMs(winner.flagTime)}</div>
            </div>
            <div className="modal-grid">
              <div>
                <div className="modal-section-title">▶ SESSION RESULTS</div>
                {sorted.map((p, i) => (
                  <div key={p.id} className={`session-row ${i === 0 ? "s-winner" : ""}`}>
                    <span className="s-rank" style={{ color: i < 3 ? ["#ffd700","#c0c0c0","#cd7f32"][i] : "#334466" }}>{i < 3 ? MEDALS[i] : i + 1}</span>
                    <div className="s-player">
                      <span className="s-dot" style={{ background: p.color, boxShadow: i === 0 ? `0 0 6px ${p.color}` : "none" }} />
                      <span className="s-name" style={{ color: i === 0 ? p.color : "#aad4ff" }}>{p.name}</span>
                    </div>
                    <span className="s-time">{fmtMs(p.flagTime)}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="modal-section-title">🌍 GLOBAL LEADERBOARD</div>
                {GLOBAL_LEADERS.map((p, i) => (
                  <div key={p.rank} className="global-row">
                    <span className="g-rank" style={{ color: i < 3 ? ["#ffd700","#c0c0c0","#cd7f32"][i] : "#334466" }}>{i < 3 ? MEDALS[i] : p.rank}</span>
                    <div className="g-player">
                      <span className="g-dot" style={{ background: p.color, boxShadow: i < 3 ? `0 0 5px ${p.color}` : "none" }} />
                      <span className="g-name" style={{ color: i === 0 ? p.color : i < 3 ? "#e0f0ff" : "#7799bb" }}>{p.name}</span>
                    </div>
                    <span className="g-wins">{p.wins}</span>
                    <span className="g-time">{fmtHold(p.holdMs)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-btns">
              <button className="mbtn mbtn-again" onClick={onPlayAgain}>▶ PLAY AGAIN</button>
              <button className="mbtn mbtn-home" onClick={onHome}>⌂ HOME</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Active game ──────────────────────────────────────────────────────────────
function ActiveGame({ sessionMinutes, onRestart }: { sessionMinutes: number; onRestart: () => void }) {
  const router = useRouter();
  const { state } = useGameState({ sessionMinutes });
  const [countdownDone, setCountdownDone] = useState(false);

  if (state.phase === "ended") {
    return (
      <>
        <div style={{ width: "100vw", height: "100vh", background: "#0d0221" }} />
        <EndModal
          players={state.players}
          onPlayAgain={onRestart}
          onHome={() => router.push("/home")}
        />
      </>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#000" }}>
      <GameScene state={state} />
      <HUD
        players={state.players}
        elapsed={state.elapsed}
        sessionDuration={state.sessionDuration}
        worldSpeed={state.worldSpeed}
      />
      {!countdownDone && <FlagCountdown onDone={() => setCountdownDone(true)} />}
    </div>
  );
}

// ─── Page — reads duration from URL, never shows Lobby ───────────────────────
export default function GamePage() {
  const router = useRouter();
  const params = useSearchParams();
  const [sessionMinutes, setSessionMinutes] = useState<number | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const d = params.get("duration");
    const mins = d ? parseInt(d, 10) : 5;
    setSessionMinutes(isNaN(mins) ? 5 : mins);
  }, [params]);

  const handleRestart = () => {
    const d = params.get("duration");
    const mins = d ? parseInt(d, 10) : 5;
    setSessionMinutes(isNaN(mins) ? 5 : mins);
    setKey(k => k + 1);
  };

  if (!sessionMinutes) return null;

  return <ActiveGame key={key} sessionMinutes={sessionMinutes} onRestart={handleRestart} />;
}