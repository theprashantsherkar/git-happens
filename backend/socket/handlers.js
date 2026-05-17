import { createRoom, getRoom } from "../game/rooms/roomManager.js"
import { finalizeMatch, startGameLoop } from "../game/rooms/gameLoop.js"
import { MAX_PLAYERS_PER_ROOM, MAX_MOVE_DISTANCE, MAP_HEIGHT, MAP_WIDTH } from "../game/constant.js"
import { addToQueue, createMatch, removeFromQueue } from "../game/matchmaking/matchmaking.js"

export default function registerHandlers(io, socket) {

    socket.on("join_room", ({ roomId, username }) => {
        const room = createRoom(roomId)
        const playerName = username || socket.username || 'Player'

        if (Object.keys(room.players).length >= MAX_PLAYERS_PER_ROOM) {
            return socket.emit("room_full")
        }

        const playerIndex = Object.keys(room.players).length

        room.players[socket.id] = {
            id: socket.id,
            userId: socket.userId,
            username: playerName,
            playerIndex,
            x: Math.random() * MAP_WIDTH,
            y: Math.random() * MAP_HEIGHT,
            possessionTime: 0,
            hasFlag: false,
            hasWeapon: true,
            isAlive: true,
            kills: 0,
            lastMoveTime: Date.now()
        }

        socket.join(roomId)
        socket.roomId = roomId

        socket.emit("joined_successfully", { playerId: socket.id, playerIndex })

        io.to(roomId).emit("room_state", room)

        if (Object.keys(room.players).length === MAX_PLAYERS_PER_ROOM) {
            startGameLoop(io, roomId, room)
            Object.values(room.players).forEach((player) => {
                io.to(player.id).emit("game_start", { roomId, playerIndex: player.playerIndex })
            })
        }
    })

    socket.on("move", ({ roomId, x, y }) => {
        const room = getRoom(roomId)
        if (!room) return

        const player = room.players[socket.id]
        if (!player || !player.isAlive) return

        const dx = x - player.x
        const dy = y - player.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > MAX_MOVE_DISTANCE) return

        const clamped = clampPosition(x, y)
        player.x = clamped.x
        player.y = clamped.y
    })

    socket.on("find_match", () => {
        addToQueue({
            socketId: socket.id,
            userId: socket.userId,
            username: socket.username || 'Player'
        })

        const players = createMatch()
        if (players) {
            const roomId = `room_${Date.now()}`
            const room = createRoom(roomId)
            players.forEach((p, playerIndex) => {
                const s = io.sockets.sockets.get(p.socketId)
                if (!s) return
                s.join(roomId)
                room.players[p.socketId] = {
                    id: p.socketId,
                    userId: p.userId,
                    username: p.username,
                    playerIndex,
                    x: Math.random() * MAP_WIDTH,
                    y: Math.random() * MAP_HEIGHT,
                    possessionTime: 0,
                    hasFlag: false,
                    hasWeapon: true,
                    isAlive: true,
                    kills: 0,
                    lastMoveTime: Date.now()
                }
                s.roomId = roomId
                s.emit("match_found", { roomId, playerIndex })
            })
            startGameLoop(io, roomId, room)
        }
    })

    socket.on("join_chat", ({ roomId }) => {
        socket.join(roomId) // always join so sync events reach this client
        const room = getRoom(roomId)
        if (!room) return
        const players = Object.values(room.players).map(p => ({
            playerIndex: p.playerIndex,
            username: p.username,
        }))
        socket.emit("room_players_data", { players })
    })

    socket.on("sync_player", ({ roomId, playerState }) => {
        const room = getRoom(roomId)
        if (!room) return
        const player = room.players[socket.id]
        if (!player) return
        // Update server-side copy so latecomers get fresh data
        Object.assign(player, playerState)
        // Relay position to everyone else in the room
        socket.to(roomId).emit("player_synced", {
            playerIndex: player.playerIndex,
            state: playerState,
        })
    })

    socket.on("sync_kill", ({ roomId, victimIndex, killerIndex, respawnX, respawnZ, wasCarrier, ts }) => {
        const room = getRoom(roomId)
        if (!room) return
        // Relay to all OTHER clients (killer already applied it locally)
        socket.to(roomId).emit("kill_synced", { victimIndex, killerIndex, respawnX, respawnZ, wasCarrier, ts })
    })

    socket.on("sync_flag", ({ roomId, flag }) => {
        const room = getRoom(roomId)
        if (!room) return
        socket.to(roomId).emit("flag_synced", { flag })
    })

    socket.on("send_message", ({ roomId, message, username: providedUsername }) => {
        if (!message || message.trim() === "") return

        const room = getRoom(roomId)
        if (!room) return

        const player = room.players[socket.id]
        const username = providedUsername || player?.username || socket.username || 'Player'

        io.to(roomId).emit("receive_message", {
            username,
            message: message.trim(),
            timestamp: Date.now()
        })
    })

    socket.on("match_ended", ({ roomId }) => {
        const room = getRoom(roomId)
        if (room) {
            finalizeMatch(room)
            io.to(roomId).emit("game_over", room)
        }
    })

    socket.on("leave_game", ({ roomId }) => {
        const room = getRoom(roomId)
        if (!room) return
        const player = room.players[socket.id]
        if (!player) return
        socket.to(roomId).emit("player_left", { playerIndex: player.playerIndex })
        delete room.players[socket.id]
        socket.leave(roomId)
        socket.roomId = null
    })

    socket.on("disconnect", () => {
        removeFromQueue(socket.id)
        // Notify room if player disconnects by closing the tab
        if (socket.roomId) {
            const room = getRoom(socket.roomId)
            if (room && room.players[socket.id]) {
                const player = room.players[socket.id]
                socket.to(socket.roomId).emit("player_left", { playerIndex: player.playerIndex })
                delete room.players[socket.id]
            }
        }
    })
}

function clampPosition(x, y) {
    return {
        x: Math.max(0, Math.min(MAP_WIDTH, x)),
        y: Math.max(0, Math.min(MAP_HEIGHT, y))
    }
}
