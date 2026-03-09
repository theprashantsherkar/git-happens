"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ActiveGame } from "./game";

// page.tsx — thin route entry point
// Reads roomId + username from URL params, renders ActiveGame
// Navigation to this page: router.push(`/game?roomId=${roomId}&username=${username}`)

export default function GamePage() {
  const params = useSearchParams();

  const [roomId, setRoomId]     = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const r = params.get("roomId");
    const u = params.get("username");
    if (r) setRoomId(r);
    if (u) setUsername(u);
  }, [params]);

  // Don't render until we have both — avoids flash of wrong state
  if (!roomId || !username) {
    return (
      <div style={{
        background: "#0d0221", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#556688", fontFamily: "'Press Start 2P', monospace", fontSize: 10,
      }}>
        LOADING...
      </div>
    );
  }

  return <ActiveGame roomId={roomId} username={username} />;
}