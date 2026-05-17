"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useGameState } from "../hooks/useGameState";
import { GameScene } from "../components/GameScene";
import { HUD } from "../components/HUD";
import { EndScreen } from "../components/EndScreen";
import type { Flag, Player } from "../types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

export type ChatMsg = { id: number; name: string; text: string };

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
      fontFamily: '"Courier New", monospace', fontWeight: "bold",
    }}>
      {phase === "counting" ? count : "GO!"}
    </div>
  );
}

function getUsernameFromToken(token: string): string {
  try {
    // JWT uses base64url — replace chars before decoding
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64));
    return payload.username || 'Player';
  } catch {
    return 'Player';
  }
}

// ─── Active Game ──────────────────────────────────────────────────────────────
function ActiveGame({
  sessionMinutes,
  onRestart,
  roomId,
  playerIndex,
  playerName,
}: {
  sessionMinutes: number;
  onRestart: () => void;
  roomId: string | null;
  playerIndex: number;
  playerName: string;
}) {
  const router = useRouter();
  const [countdownDone,    setCountdownDone]    = useState(false);
  const [chatMessages,     setChatMessages]     = useState<ChatMsg[]>([]);
  const [showExitConfirm,  setShowExitConfirm]  = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const { state, dispatch } = useGameState({ sessionMinutes, enabled: countdownDone, playerIndex, playerName });

  // Always-current ref so interval callbacks see fresh state without re-creating
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Timestamps to deduplicate outgoing events
  const lastKillTsRef = useRef(0);
  const lastFlagTsRef = useRef(0);

  // ── Single socket for chat + game sync ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (roomId) socket.emit("join_chat", { roomId });
    });

    // Chat
    socket.on("receive_message", (msg: { username: string; message: string; timestamp: number }) => {
      setChatMessages(prev => [...prev, { id: msg.timestamp, name: msg.username, text: msg.message }]);
    });

    // Authoritative player names from server on room join
    socket.on("room_players_data", ({ players }: { players: { playerIndex: number; username: string }[] }) => {
      dispatch({ type: "SET_PLAYER_NAMES", names: players });
    });

    // Another player moved
    socket.on("player_synced", ({ playerIndex: pi, state: data }: { playerIndex: number; state: Partial<Player> & { name?: string } }) => {
      dispatch({ type: "SYNC_PLAYER", playerIndex: pi, data });
    });

    // Another player scored a kill
    socket.on("kill_synced", (payload: { victimIndex: number; killerIndex: number; respawnX: number; respawnZ: number; wasCarrier: boolean; ts: number }) => {
      if (payload.killerIndex === playerIndex) return; // already applied locally
      dispatch({ type: "SYNC_KILL", ...payload });
    });

    // Flag state changed on another client
    socket.on("flag_synced", ({ flag }: { flag: Flag }) => {
      dispatch({ type: "SYNC_FLAG", flag });
    });

    // Another player left or disconnected
    socket.on("player_left", ({ playerIndex: pi }: { playerIndex: number }) => {
      dispatch({ type: "PLAYER_LEFT", playerIndex: pi });
    });

    return () => { socket.disconnect(); };
  }, [roomId, dispatch, playerIndex]);

  // ── Broadcast local player position at ~20 fps ──
  useEffect(() => {
    if (!countdownDone || !roomId) return;
    const interval = setInterval(() => {
      if (!socketRef.current) return;
      const p = stateRef.current.players[playerIndex];
      if (!p) return;
      socketRef.current.emit("sync_player", {
        roomId,
        playerState: {
          x: p.x, z: p.z, angle: p.angle,
          yPos: p.yPos, alive: p.alive,
          role: p.role, flagTime: p.flagTime,
          kills: p.kills, name: playerName,
        },
      });
    }, 50);
    return () => clearInterval(interval);
  }, [countdownDone, roomId, playerIndex, playerName]);

  // ── Broadcast kill events when local player scores ──
  useEffect(() => {
    const e = state.lastKillEvent;
    if (!e || !roomId || e.ts <= lastKillTsRef.current) return;
    lastKillTsRef.current = e.ts;
    socketRef.current?.emit("sync_kill", { roomId, ...e });
  }, [state.lastKillEvent, roomId]);

  // ── Broadcast flag pickup/drop when local player takes the flag ──
  useEffect(() => {
    const e = state.lastFlagEvent;
    if (!e || !roomId || e.ts <= lastFlagTsRef.current) return;
    lastFlagTsRef.current = e.ts;
    socketRef.current?.emit("sync_flag", { roomId, flag: state.flag });
  }, [state.lastFlagEvent, roomId]);

  const sendMessage = useCallback((text: string) => {
    if (!roomId || !text.trim() || !socketRef.current) return;
    socketRef.current.emit("send_message", { roomId, message: text, username: playerName });
  }, [roomId, playerName]);

  const handleExit = useCallback(() => {
    if (roomId) socketRef.current?.emit("leave_game", { roomId });
    router.push("/home");
  }, [roomId, router]);

  if (state.phase === "ended") {
    return (
      <>
        <div style={{ width: "100vw", height: "100vh", background: "#0d0221" }} />
        <EndScreen players={state.players} onRestart={onRestart} />
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
        chatMessages={chatMessages}
        onSendMessage={sendMessage}
      />
      {!countdownDone && (
        <FlagCountdown onDone={() => setCountdownDone(true)} />
      )}

      {/* ── Leave button — bottom right ── */}
      {!showExitConfirm && (
        <button
          onClick={() => setShowExitConfirm(true)}
          style={{
            position: "absolute", bottom: 20, right: 20, zIndex: 20,
            fontFamily: '"Courier New", monospace',
            background: "rgba(0,0,0,0.72)",
            border: "1px solid rgba(255,80,80,0.35)",
            color: "#FF6666", fontSize: 11, letterSpacing: 1,
            padding: "7px 14px", cursor: "pointer", borderRadius: 6,
            backdropFilter: "blur(6px)",
          }}
        >
          ✕ LEAVE
        </button>
      )}

      {/* ── Exit confirmation modal ── */}
      {showExitConfirm && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 30,
          background: "rgba(0,0,0,0.82)",
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "auto",
        }}>
          <div style={{
            fontFamily: '"Courier New", monospace',
            background: "rgba(8,4,18,0.97)",
            border: "2px solid rgba(255,80,80,0.55)",
            borderRadius: 10, padding: "32px 40px",
            textAlign: "center", minWidth: 280,
          }}>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#FF6666", marginBottom: 8 }}>
              LEAVE GAME?
            </div>
            <div style={{ fontSize: 12, color: "#FFFFFF55", marginBottom: 28 }}>
              Other players will be notified.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={handleExit}
                style={{
                  background: "#CC2222", color: "#fff", border: "none",
                  borderRadius: 6, padding: "10px 26px", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 12, fontWeight: "bold", letterSpacing: 1,
                }}
              >
                YES, LEAVE
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  background: "transparent", color: "#AAAAAA",
                  border: "1px solid #444", borderRadius: 6,
                  padding: "10px 26px", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 12, letterSpacing: 1,
                }}
              >
                STAY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GamePage() {
  const params = useSearchParams();
  const [sessionMinutes, setSessionMinutes] = useState<number | null>(null);
  const [roomId,         setRoomId]         = useState<string | null>(null);
  const [playerIndex,    setPlayerIndex]    = useState(0);
  const [playerName,     setPlayerName]     = useState('Player');
  const [key,            setKey]            = useState(0);

  useEffect(() => {
    const d    = params.get("duration");
    const mins = d ? parseInt(d, 10) : 5;
    setSessionMinutes(isNaN(mins) ? 5 : mins);
    setRoomId(params.get("roomId"));

    const pi = params.get("playerIndex");
    const idx = pi ? parseInt(pi, 10) : 0;
    setPlayerIndex(isNaN(idx) ? 0 : Math.min(3, Math.max(0, idx)));

    const token = localStorage.getItem("token");
    if (token) setPlayerName(getUsernameFromToken(token));
  }, [params]);

  const handleRestart = () => {
    const d    = params.get("duration");
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
      roomId={roomId}
      playerIndex={playerIndex}
      playerName={playerName}
    />
  );
}
