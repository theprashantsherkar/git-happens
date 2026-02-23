"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSocket } from "../lib/socket";
import { GameScene } from "../components/GameScene";
import { HUD } from "../components/HUD";
import { EndScreen } from "../components/EndScreen";
import WaitingRoom from "../components/WaitingRoom";

// ─── Countdown ────────────────────────────────────────────────────────────────
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
            setTimeout(onDone, 500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "80px", color: "#ffd700", zIndex: 50,
      fontFamily: "'Press Start 2P', monospace"
    }}>
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
  const params = useSearchParams();

  const duration = params.get("duration") || "5";
  const mode = params.get("mode");
  const room = params.get("room");

  const [gameStarted, setGameStarted] = useState(false);
  const [roomState, setRoomState] = useState<any>(null);
  const [winner, setWinner] = useState<any>(null);
  const [countdownDone, setCountdownDone] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);

  // Track the roomId we actually joined so we can send moves to the right room
  const roomIdRef = useRef<string | null>(room || null);

  useEffect(() => {
    const socket = getSocket();

    // ── Helper to decode username from JWT stored in localStorage ──────────
    const getUsername = (): string => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return `Player_${socket.id?.slice(0, 4) ?? "anon"}`;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.username || payload.name || `Player_${socket.id?.slice(0, 4)}`;
      } catch {
        return `Player_${socket.id?.slice(0, 4) ?? "anon"}`;
      }
    };

    // Fix: register ALL event listeners BEFORE connecting / emitting
    // Previously game_start was only listened inside the "connect" callback,
    // so if the event fired before connect re-triggered it was missed.

    socket.on("room_update", ({ playerCount: count }: { playerCount: number }) => {
      setPlayerCount(count);
    });

    socket.on("match_found", ({ roomId }: { roomId: string }) => {
      console.log("Match found:", roomId);
      // Fix: store the real roomId assigned by the server
      roomIdRef.current = roomId;
    });

    socket.on("game_start", () => {
      console.log("game_start received — starting game");
      setGameStarted(true);
    });

    socket.on("room_state", (state: any) => {
      setRoomState(state);
    });

    socket.on("game_over", ({ winner: w }: any) => {
      setWinner(w);
    });

    // ── Connect and emit join intent ─────────────────────────────────────────
    const joinGame = () => {
      const username = getUsername();

      if (mode === "random") {
        // Fix: pass duration so server sets correct game length
        socket.emit("find_match", { duration });
      }

      if (room) {
        // Fix: pass username — backend was receiving undefined
        socket.emit("join_room", { roomId: room, duration, username });
      }
    };

    // If socket is already connected (e.g. hot reload) emit immediately
    if (socket.connected) {
      joinGame();
    } else {
      socket.on("connect", joinGame);
    }

    return () => {
      socket.off("connect", joinGame);
      socket.off("room_update");
      socket.off("match_found");
      socket.off("game_start");
      socket.off("room_state");
      socket.off("game_over");
    };
  }, []);

  // ── Waiting screen ─────────────────────────────────────────────────────────
  if (!gameStarted) {
    return <WaitingRoom />;
  }

  // ── Game over ──────────────────────────────────────────────────────────────
  if (winner) {
    return (
      <>
        <div style={{ width: "100vw", height: "100vh", background: "#0d0221" }} />
        <EndScreen
          players={roomState?.players || []}
          onRestart={onRestart}
        />
      </>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {!roomState ? (
        <div style={{
          color: "white", display: "flex", alignItems: "center",
          justifyContent: "center", height: "100vh",
          fontFamily: "monospace", fontSize: 20
        }}>
          Syncing game state...
        </div>
      ) : (
        <>
          <div className="w-screen h-screen">
            {/* Fix: roomState.Duration (capital D) matches what gameLoop emits */}
            <GameScene state={roomState} />
          </div>
          <HUD
            players={roomState.players || []}
            elapsed={roomState.elapsed || 0}
            sessionDuration={roomState.Duration || 0}
            worldSpeed={roomState.worldSpeed || 1}
          />
        </>
      )}

      {!countdownDone && (
        <FlagCountdown onDone={() => setCountdownDone(true)} />
      )}
    </div>
  );
}

// ─── Root page ────────────────────────────────────────────────────────────────
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

  if (sessionMinutes === null) return null;

  return (
    <ActiveGame
      key={key}
      sessionMinutes={sessionMinutes}
      onRestart={handleRestart}
    />
  );
}