import { GAME_TICK } from "../constant.js"
import { isColliding } from "../collisions/collisions.js"
import { handleKill, handleFlagPickup } from "../engine.js"
import { User } from "../../models/userModels.js"
import { deleteRoom } from "./roomManager.js"

export function startGameLoop(io, roomId, room) {

    room.gameStartTime = Date.now()

    room.interval = setInterval(() => {

        const now = Date.now()
        const gameDuration = room.gameDuration || 300000
        const playersArray = Object.values(room.players)

        // ─── Possession Timer ─────────────────────────────────────────────────────
        if (room.flag && room.flag.holderId) {
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

                if (!p1 || !p2 || !p1.isAlive || !p2.isAlive) continue

                if (isColliding(p1, p2)) {
                    // Chaser kills Flag Carrier on physical contact
                    if (p1.hasWeapon && !p2.hasWeapon) {
                        handleKill(io, roomId, room, p1, p2)
                    } else if (p2.hasWeapon && !p1.hasWeapon) {
                        handleKill(io, roomId, room, p2, p1)
                    }
                }
            }

            // Flag pickup: unheld flag is picked up by any walking player
            if (room.flag && !room.flag.holderId && isColliding(playersArray[i], room.flag)) {
                handleFlagPickup(io, roomId, room, playersArray[i])
            }
        }

        // ─── Bullet Collisions & Movement ─────────────────────────────────────────
        if (room.bullets && room.bullets.length > 0) {
            const dt = GAME_TICK / 1000;
            const survivingBullets = [];

            for (const bullet of room.bullets) {
                bullet.x += (bullet.vx || 0) * dt;
                bullet.z += (bullet.vz || 0) * dt;

                let hit = false;
                for (const victim of playersArray) {
                    if (!victim.isAlive || victim.id === bullet.ownerId) continue;
                    if (isColliding(bullet, victim)) {
                        hit = true;
                        const shooter = room.players[bullet.ownerId];
                        if (shooter) {
                            handleKill(io, roomId, room, shooter, victim);
                        }
                        break;
                    }
                }

                const HALF_MAP = 74;
                if (!hit && Math.abs(bullet.x) <= HALF_MAP && Math.abs(bullet.z) <= HALF_MAP) {
                    survivingBullets.push(bullet);
                }
            }

            room.bullets = survivingBullets;
        }

        // ─── Build Safe Player State ──────────────────────────────────────────────
        const safePlayers = playersArray.map(p => ({
            id: p.id,
            name: p.username,
            color: p.color,
            x: p.x,
            z: p.z,
            yPos: p.yPos || 0,
            angle: p.angle || 0,
            alive: p.isAlive,
            role: room.flag && room.flag.holderId === p.id ? "carrier" : "chaser",
            flagTime: p.possessionTime || 0,
            kills: p.kills || 0
        }))

        // ─── Emit State ───────────────────────────────────────────────────────────
        io.to(roomId).emit("room_state", {
            players: safePlayers,
            flag: {
                x: room.flag ? room.flag.x : 0,
                z: room.flag ? room.flag.z : 0,
                carrierId: room.flag ? (room.flag.holderId || null) : null
            },
            bullets: room.bullets || [],
            obstacles: room.obstacles || [],
            elapsed: now - room.gameStartTime,
            Duration: gameDuration,
            worldSpeed: room.worldSpeed || 1
        })

        // ─── End Match ────────────────────────────────────────────────────────────
        if (now - room.gameStartTime >= gameDuration) {
            clearInterval(room.interval)

            const winner = determineWinner(room)

            // Persist match completion stats to MongoDB Atlas
            const bulkOps = playersArray.map(p => {
                const isWinner = winner && p.id === winner.id;
                const filter = p.userId ? { _id: p.userId } : { username: p.username };
                return {
                    updateOne: {
                        filter,
                        update: {
                            $inc: {
                                totalWins: isWinner ? 1 : 0,
                                totalKills: p.kills || 0,
                                totalPossessionTime: Math.floor((p.possessionTime || 0) / 1000)
                            }
                        }
                    }
                };
            });

            User.bulkWrite(bulkOps).catch(err => {
                console.error("Failed to persist match completion stats to MongoDB:", err);
            });

            io.to(roomId).emit("game_over", {
                winner: winner ? {
                    id: winner.id,
                    name: winner.username,
                    color: winner.color,
                    aggregate_possession_time: winner.possessionTime
                } : null
            })

            deleteRoom(roomId);
        }

    }, GAME_TICK)
}

export function determineWinner(room) {
    const players = Object.values(room.players)
    if (!players.length) return null
    return players.reduce((prev, curr) =>
        (curr.possessionTime || 0) > (prev.possessionTime || 0) ? curr : prev
    )
}