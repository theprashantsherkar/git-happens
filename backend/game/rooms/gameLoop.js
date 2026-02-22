import { GAME_TICK, GAME_DURATION } from "../constant.js"
import { isColliding } from "../collisions/collisions.js"
import { handleKill, handleFlagPickup } from "../engine.js"
import { User } from "../../models/userModels.js"

export function startGameLoop(io, roomId, room) {

    room.gameStartTime = Date.now()

    room.interval = setInterval(() => {

        const now = Date.now()
        const players = Object.values(room.players)

        // ✅ Possession Timer
        if (room.flag.holderId) {
            const holder = room.players[room.flag.holderId]
            if (holder && holder.isAlive) {
                holder.possessionTime += GAME_TICK
            }
        }

        // ✅ Collision checks
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {

                const p1 = players[i]
                const p2 = players[j]

                if (!p1.isAlive || !p2.isAlive) continue

                if (isColliding(p1, p2)) {
                    if (p1.hasWeapon && !p2.hasWeapon) {
                        handleKill(io, roomId, room, p1, p2)
                    } else if (p2.hasWeapon && !p1.hasWeapon) {
                        handleKill(io, roomId, room, p2, p1)
                    }
                }
            }

            // ✅ Flag pickup
            if (!room.flag.holderId && isColliding(players[i], room.flag)) {
                handleFlagPickup(io, roomId, room, players[i])
            }
        }

        const leaderboard = buildLocalLeaderboard(room)
        io.to(roomId).emit("leaderboard_update", leaderboard)
        // ✅ Emit updated state
        io.to(roomId).emit("room_state", room)

        // 🔥 THIS IS THE LINE YOU ARE ASKING ABOUT
        if (now - room.gameStartTime >= GAME_DURATION) {
            clearInterval(room.interval)
            finalizeMatch(room)
            io.to(roomId).emit("game_over", room)
        }

    }, GAME_TICK)
}



export async function finalizeMatch(room) {

    const players = Object.values(room.players)

    // 🏆 Determine winner by possession time
    const winner = players.reduce((prev, curr) =>
        curr.possessionTime > prev.possessionTime ? curr : prev
    )

    for (const player of players) {
        const user = await User.findById(player.userId)
        if (!user) continue

        user.totalKills += player.kills || 0
        user.totalPossessionTime += player.possessionTime
        user.totalWins += player.userId === winner.userId ? 1 : 0

        await user.save()
    }
}


function buildLocalLeaderboard(room) {
    return Object.values(room.players)
        .map(player => ({
            username: player.username,
            possessionTime: player.possessionTime,
            kills: player.kills
        }))
        .sort((a, b) => b.possessionTime - a.possessionTime)
}