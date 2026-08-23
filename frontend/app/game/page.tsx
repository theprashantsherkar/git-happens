"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSocket } from "../lib/socket";
import { GameScene } from "../components/GameScene";
import { HUD } from "../components/HUD";
import { EndScreen } from "../components/EndScreen";
import WaitingRoom from "../components/WaitingRoom";

export const dynamic = "force-dynamic";

// ─── Countdown Overlay ────────────────────────────────────────────────────────
function FlagCountdown({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(5);
  const [phase, setPhase] = useState<"counting" | "go">("counting");
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase("go");
          setTimeout(() => {
            onDoneRef.current();
          }, 500);
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
  const [socketId, setSocketId] = useState<string>("");

  const roomIdRef = useRef<string | null>(room || null);
  const roomStateRef = useRef<any>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const myPosRef = useRef<{ x: number; z: number; angle: number } | null>(null);

  // ── 1. Setup Socket Listeners & Matchmaking ────────────────────────────────
  useEffect(() => {
    const socket = getSocket();

    const updateSocketId = () => {
      if (socket.id) setSocketId(socket.id);
    };

    updateSocketId();

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

    socket.on("room_update", ({ playerCount: count }: { playerCount: number }) => {
      setPlayerCount(count);
    });

    socket.on("match_found", ({ roomId }: { roomId: string }) => {
      console.log("Match found:", roomId);
      roomIdRef.current = roomId;
    });

    socket.on("game_start", () => {
      console.log("game_start received — starting game");
      updateSocketId();
      setGameStarted(true);
    });

    socket.on("room_state", (state: any) => {
      roomStateRef.current = state;
      setRoomState(state);

      const currentSocketId = socket.id || socketId;
      const myServerPlayer = state.players?.find((p: any) => String(p.id) === String(currentSocketId));
      if (myServerPlayer) {
        // Sync local position reference with server authoritative position
        if (!myPosRef.current) {
          myPosRef.current = { x: myServerPlayer.x, z: myServerPlayer.z, angle: myServerPlayer.angle || 0 };
        }
      }
    });

    socket.on("game_over", ({ winner: w }: any) => {
      setWinner(w);
    });

    const joinGame = () => {
      updateSocketId();
      const username = getUsername();

      if (mode === "random") {
        socket.emit("find_match", { duration });
      }

      if (room) {
        socket.emit("join_room", { roomId: room, duration, username });
      }
    };

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
  }, [duration, mode, room, socketId]);

  // ── 2. Real-Time Movement Input Loop (20 Hz) ────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't register movement keys if user is typing inside an input element (e.g. Chat)
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      keysRef.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let movementInterval: NodeJS.Timeout;

    if (gameStarted) {
      movementInterval = setInterval(() => {
        const socket = getSocket();
        const activeRoomId = roomIdRef.current;
        const currentRoomState = roomStateRef.current;
        if (!socket || !activeRoomId || !currentRoomState?.players) return;

        const currentSocketId = socket.id || socketId;
        const myPlayer = currentRoomState.players.find((p: any) => String(p.id) === String(currentSocketId));
        if (!myPlayer || !myPlayer.alive) return;

        const keys = keysRef.current;
        const isForward = keys.has("KeyW") || keys.has("ArrowUp");
        const isBackward = keys.has("KeyS") || keys.has("ArrowDown");
        const isTurnLeft = keys.has("KeyA") || keys.has("ArrowLeft");
        const isTurnRight = keys.has("KeyD") || keys.has("ArrowRight");

        if (!isForward && !isBackward && !isTurnLeft && !isTurnRight) return;

        let currentPos = myPosRef.current || { x: myPlayer.x, z: myPlayer.z, angle: myPlayer.angle || 0 };
        let angle = currentPos.angle;
        const turnSpeed = 0.15;
        const moveSpeed = 1.4;

        if (isTurnLeft) angle += turnSpeed;
        if (isTurnRight) angle -= turnSpeed;

        let x = currentPos.x;
        let z = currentPos.z;

        if (isForward) {
          x += Math.sin(angle) * moveSpeed;
          z += Math.cos(angle) * moveSpeed;
        }
        if (isBackward) {
          x -= Math.sin(angle) * moveSpeed;
          z -= Math.cos(angle) * moveSpeed;
        }

        const HALF_MAP = 74;
        x = Math.max(-HALF_MAP, Math.min(HALF_MAP, x));
        z = Math.max(-HALF_MAP, Math.min(HALF_MAP, z));

        myPosRef.current = { x, z, angle };
        socket.emit("move", { roomId: activeRoomId, x, z, angle });
      }, 50); // 20 Hz movement emission
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (movementInterval) clearInterval(movementInterval);
    };
  }, [gameStarted, socketId]);

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
            <GameScene state={roomState} mySocketId={socketId} />
          </div>
          <HUD
            players={roomState.players || []}
            elapsed={roomState.elapsed || 0}
            sessionDuration={roomState.Duration || 0}
            worldSpeed={roomState.worldSpeed || 1}
            roomId={roomIdRef.current || undefined}
          />
        </>
      )}

      {!countdownDone && (
        <FlagCountdown onDone={() => setCountdownDone(true)} />
      )}
    </div>
  );
}

function GamePageContent() {
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

// ─── Root page ────────────────────────────────────────────────────────────────
export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#0d0221] font-mono text-lg text-[#ffd700]">
          Loading Game Match...
        </div>
      }
    >
      <GamePageContent />
    </Suspense>
  );
}