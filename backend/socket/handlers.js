import { createRoom, getRoom } from "../game/rooms/roomManager.js"
import { finalizeMatch, startGameLoop } from "../game/rooms/gameLoop.js"
import { MAX_PLAYERS_PER_ROOM, MAX_MOVE_DISTANCE, MAP_HEIGHT, MAP_WIDTH } from "../game/constant.js"
import { addToQueue, createMatch, removeFromQueue } from "../game/matchmaking/matchmaking.js"
export default function registerHandlers(io, socket) {

    // ── join_room ────────────────────────────────────────────────────────────
    socket.on("join_room", ({ roomId, username }) => {
        const room = createRoom(roomId)

        if (Object.keys(room.players).length >= MAX_PLAYERS_PER_ROOM) {
            return socket.emit("room_full")
        }

        const playerIndex = Object.keys(room.players).length // 0,1,2,3
        const spawnX = Math.random() * MAP_WIDTH
        const spawnY = Math.random() * MAP_HEIGHT

        room.players[socket.id] = {
            id: socket.id,
            username,
            playerIndex,          // ← NEW: position in the 4-player array
            x: spawnX,
            y: spawnY,
            angle: 0,
            possessionTime: 0,
            hasFlag: false,
            hasWeapon: true,
            isAlive: true,
            lastMoveTime: Date.now()
        }

        socket.join(roomId)

        // Tell THIS client their own identity
        socket.emit("joined_successfully", {
            playerId: socket.id,
            playerIndex,          // ← NEW
        })

        io.to(roomId).emit("room_state", room)

        if (Object.keys(room.players).length === MAX_PLAYERS_PER_ROOM) {
            startGameLoop(io, roomId, room)
            io.to(roomId).emit("game_start")
        }
    })

    // ── find_match ───────────────────────────────────────────────────────────
    socket.on("find_match", () => {
        addToQueue({
            socketId: socket.id,
            userId: socket.userId,
            username: socket.username
        })

        const players = createMatch()
        if (!players) return

        const roomId = `room_${Date.now()}`
        const room = createRoom(roomId)

        players.forEach((p, playerIndex) => {  // ← playerIndex from forEach
            const s = io.sockets.sockets.get(p.socketId)
            if (!s) return

            s.join(roomId)

            room.players[p.socketId] = {
                id: p.socketId,
                username: p.username,
                playerIndex,              // ← NEW: 0,1,2,3 in match order
                x: Math.random() * MAP_WIDTH,
                y: Math.random() * MAP_HEIGHT,
                angle: 0,
                possessionTime: 0,
                hasFlag: false,
                hasWeapon: true,
                isAlive: true,
                lastMoveTime: Date.now()
            }

            // Tell each client their own index and the room
            s.emit("match_found", {
                roomId,
                playerIndex,              // ← NEW: each client gets their own
                playerId: p.socketId,
            })
        })

        startGameLoop(io, roomId, room)
        // game_start is broadcast after loop begins so clients are ready
        io.to(roomId).emit("game_start", { roomId })
    })

    // ── move (input-based, not position-based) ────────────────────────────────
    // Client sends intent: which keys are held. Server applies movement.
    socket.on("input", ({ roomId, keys, angle }) => {
        const room = getRoom(roomId)
        if (!room) return

        const player = room.players[socket.id]
        if (!player || !player.isAlive) return

        // Store latest input — game loop reads this each tick
        player.pendingInput = { keys, angle }
    })

    // Keep the old "move" for backwards compat but validate distance
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

    // ── shoot ────────────────────────────────────────────────────────────────
    socket.on("shoot", ({ roomId }) => {
        const room = getRoom(roomId)
        if (!room) return

        const player = room.players[socket.id]
        if (!player || !player.isAlive || !player.hasWeapon || player.hasFlag) return

        // Flag the shoot intent — game loop resolves hit detection
        player.pendingShoot = true
    })

    // ── chat ─────────────────────────────────────────────────────────────────
    socket.on("send_message", ({ roomId, message }) => {
        if (!message || message.trim() === "") return
        const room = getRoom(roomId)
        if (!room) return
        const player = room.players[socket.id]
        if (!player) return

        io.to(roomId).emit("receive_message", {
            username: player.username,
            message: message.trim(),
            timestamp: Date.now()
        })
    })

    // ── match_ended ──────────────────────────────────────────────────────────
    socket.on("match_ended", ({ roomId }) => {
        const room = getRoom(roomId)
        if (room) {
            finalizeMatch(room)
            io.to(roomId).emit("game_over", room)
        }
    })

    // ── disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
        // Mark player as disconnected in any active rooms
        // Room cleanup is handled by roomManager TTL
    })
}

function clampPosition(x, y) {
    return {
        x: Math.max(0, Math.min(MAP_WIDTH, x)),
        y: Math.max(0, Math.min(MAP_HEIGHT, y))
    }
}