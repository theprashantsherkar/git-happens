import { GAME_TICK } from "../constant.js"
import { isColliding } from "../collisions/collisions.js"
import { handleKill, handleFlagPickup } from "../engine.js"

export function startGameLoop(io, roomId, room) {

    room.gameStartTime = Date.now()

    room.interval = setInterval(() => {

        const now = Date.now()
        const gameDuration = room.gameDuration || 300000  // Fix: use room-specific duration
        const playersArray = Object.values(room.players)

        // ─── Possession Timer ─────────────────────────────────────────────────────
        if (room.flag.holderId) {
            const holder = room.players[room.flag.holderId]
            if (holder && holder.isAlive) {
                holder.possessionTime += GAME_TICK
            }
        }

        // ─── Collisions + Flag ────────────────────────────────────────────────────
        for (let i = 0; i < playersArray.length; i++) {
            for (let j = i + 1; j < playersArray.length; j++) {
                const p1 = playersArray[i]
                const p2 = playersArray[j]

                if (!p1.isAlive || !p2.isAlive) continue

                if (isColliding(p1, p2)) {
                    if (p1.hasWeapon && !p2.hasWeapon) {
                        handleKill(io, roomId, room, p1, p2)
                    } else if (p2.hasWeapon && !p1.hasWeapon) {
                        handleKill(io, roomId, room, p2, p1)
                    }
                }
            }

            // Flag pickup
            if (!room.flag.holderId && isColliding(playersArray[i], room.flag)) {
                handleFlagPickup(io, roomId, room, playersArray[i])
            }
        }

        // ─── Build Safe Player State ──────────────────────────────────────────────
        const safePlayers = playersArray.map(p => ({
            id: p.id,
            name: p.username,
            color: p.color,
            x: p.x,
            z: p.z,               // Fix: was sending y, GameScene reads z
            yPos: p.yPos || 0,
            angle: p.angle || 0,
            alive: p.isAlive,
            role: room.flag.holderId === p.id ? "carrier" : null,
            flagTime: p.possessionTime || 0,
            kills: p.kills || 0
        }))

        // ─── Emit State ───────────────────────────────────────────────────────────
        io.to(roomId).emit("room_state", {
            players: safePlayers,
            flag: {
                x: room.flag.x,
                z: room.flag.z,                    // Fix: use z not y
                carrierId: room.flag.holderId || null  // Fix: carrierId not holderId
            },
            bullets: room.bullets || [],
            obstacles: room.obstacles || [],
            elapsed: now - room.gameStartTime,
            Duration: gameDuration,                // Fix: capital D — matches what HUD reads
            worldSpeed: room.worldSpeed || 1
        })

        // ─── End Match ────────────────────────────────────────────────────────────
        if (now - room.gameStartTime >= gameDuration) {
            clearInterval(room.interval)

            const winner = determineWinner(room)

            io.to(roomId).emit("game_over", {
                winner: {
                    id: winner.id,
                    name: winner.username,
                    color: winner.color,
                    aggregate_possession_time: winner.possessionTime
                }
            })
        }

    }, GAME_TICK)
}

export function determineWinner(room) {
    const players = Object.values(room.players)
    return players.reduce((prev, curr) =>
        curr.possessionTime > prev.possessionTime ? curr : prev
    )
}
function buildLocalLeaderboard(room) { return Object.values(room.players).map(player => ({ username: player.username, possessionTime: player.possessionTime, kills: player.kills })).sort((a, b) => b.possessionTime - a.possessionTime) }