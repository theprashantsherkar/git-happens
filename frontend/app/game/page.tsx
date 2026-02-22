"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGameState } from "../hooks/useGameState";
import { GameScene } from "../components/GameScene";
import { HUD } from "../components/HUD";
import { EndScreen } from "../components/EndScreen";

// ─── Flag Countdown ───────────────────────────────────────────────────────────
function FlagCountdown({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(5);
  const [phase, setPhase] = useState<"counting" | "go">("counting");
  const doneRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval);

          if (!doneRef.current) {
            doneRef.current = true;
            setPhase("go");

            setTimeout(() => {
              onDone();
            }, 500);
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "80px",
        color: "#ffd700",
        zIndex: 50
      }}
    >
      {phase === "counting" ? count : "GO!"}
    </div>
  );
}

// ─── Active Game ──────────────────────────────────────────────────────────────
function ActiveGame({
  sessionMinutes,
  onRestart,
}: {
  sessionMinutes: number;
  onRestart: () => void;
}) {
  const router = useRouter();

  const [countdownDone, setCountdownDone] = useState(false);

  const { state } = useGameState({
    sessionMinutes,
    enabled: countdownDone,
  });

  if (state.phase === "ended") {
    return (
      <>
        <div style={{ width: "100vw", height: "100vh", background: "#0d0221" }} />
        <EndScreen
          players={state.players}
          onRestart={onRestart}
          />
      </>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <GameScene state={state} />
      <HUD
        players={state.players}
        elapsed={state.elapsed}
        sessionDuration={state.sessionDuration}
        worldSpeed={state.worldSpeed}
      />

      {!countdownDone && (
        <FlagCountdown onDone={() => setCountdownDone(true)} />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GamePage() {
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

  return (
    <ActiveGame
      key={key}
      sessionMinutes={sessionMinutes}
      onRestart={handleRestart}
    />
  );
}