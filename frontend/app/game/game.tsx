"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "../hooks/useGameState";
import { GameClient } from "./GameClient";
import { GameScene } from "../components/GameScene";
import { HUD } from "../components/HUD";
import { EndScreen } from "../components/EndScreen";

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(5);
  const [go, setGo] = useState(false);
  const doneRef = useRef(false);

  useState(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!doneRef.current) {
            doneRef.current = true;
            setGo(true);
            setTimeout(onDone, 600);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "100px", color: "#ffd700", zIndex: 100,
      fontFamily: "'Press Start 2P', monospace",
    }}>
      {go ? "GO!" : count}
    </div>
  );
}

// ─── Active Game ──────────────────────────────────────────────────────────────
export function ActiveGame({ roomId, username }: { roomId: string; username: string }) {
  const router = useRouter();
  const [countdownDone, setCountdownDone] = useState(false);

  const {
    phase, room, renderPlayers, myPlayer, myPlayerId,
    leaderboard, endRoom,
    applyServerState, handleGameStart, handleGameOver,
    handleLeaderboardUpdate, setIdentity,
    keysRef, angleRef, shootEmitRef,
  } = useGameState();

  const playerCount = room ? Object.keys(room.players).length : 0;

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#000" }}>

      {/* ── GameClient: mounted ONCE, lives through all phases ── */}
      <GameClient
        roomId={roomId}
        playerName={username}
        onServerState={applyServerState}
        onGameStart={handleGameStart}
        onGameOver={handleGameOver}
        onLeaderboardUpdate={handleLeaderboardUpdate}
        onIdentity={setIdentity}
        keysRef={keysRef}
        angleRef={angleRef}
        onShoot={(fn) => { shootEmitRef.current = fn; }}
      />

      {/* ── Waiting screen ── */}
      {phase === "waiting" && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50,
          background: "#0d0221",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "'Press Start 2P', monospace", gap: 20,
        }}>
          {/* Animated dots ring */}
          <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: 16, height: 16, borderRadius: "50%",
                background: i < playerCount ? "#00f5ff" : "#1a2a3a",
                boxShadow: i < playerCount ? "0 0 10px #00f5ff" : "none",
                transition: "background 0.3s, box-shadow 0.3s",
              }} />
            ))}
          </div>

          <p style={{ fontSize: 12, color: "#00f5ff" }}>WAITING FOR PLAYERS</p>
          <p style={{ fontSize: 10, color: "#556688" }}>
            {playerCount} / 4 joined
          </p>
          <p style={{ fontSize: 8, color: "#334466" }}>Room: {roomId}</p>

          {playerCount === 4 && (
            <p style={{ fontSize: 9, color: "#ffd700", animation: "pulse 0.8s infinite alternate" }}>
              STARTING...
            </p>
          )}

          <style>{`@keyframes pulse { from { opacity:0.4; } to { opacity:1; } }`}</style>
        </div>
      )}

      {/* ── End screen ── */}
      {phase === "ended" && endRoom && (
        <EndScreen
          players={Object.values(endRoom.players).sort((a, b) => b.possessionTime - a.possessionTime)}
          myPlayerId={myPlayerId}
          onRestart={() => router.push("/home")}
        />
      )}

      {/* ── Active game scene (only rendered when playing) ── */}
      {phase === "playing" && (
        <>
          <GameScene
            players={renderPlayers}
            flag={room?.flag ?? null}
            myPlayerId={myPlayerId}
          />
          <HUD
            leaderboard={leaderboard}
            myPlayer={myPlayer}
            room={room}
          />
          {!countdownDone && (
            <Countdown onDone={() => setCountdownDone(true)} />
          )}
        </>
      )}

    </div>
  );
}