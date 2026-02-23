import { createRoom, getRoom } from "../game/rooms/roomManager.js"
import { determineWinner, startGameLoop } from "../game/rooms/gameLoop.js"
import { MAX_PLAYERS_PER_ROOM, MAX_MOVE_DISTANCE, MAP_HEIGHT, MAP_WIDTH } from "../game/constant.js"
import { addToQueue, createMatch, removeFromQueue } from "../game/matchmaking/matchmaking.js"

const PLAYER_COLORS = ["#ff2d78", "#00f5ff", "#ffd700", "#3dba4e"];

export default function registerHandlers(io, socket) {

    // ─── Private Room ───────────────────────────────────────────────────────────
    socket.on("join_room", ({ roomId, duration, username }) => {
        const room = createRoom(roomId)

        if (Object.keys(room.players).length >= MAX_PLAYERS_PER_ROOM) {
            return socket.emit("room_full")
        }

        const colorIndex = Object.keys(room.players).length;

        room.players[socket.id] = {
            id: socket.id,
            // Fix: was receiving 'username' but callers were sending 'duration' as username
            username: username || socket.username || `Player ${colorIndex + 1}`,
            color: PLAYER_COLORS[colorIndex],
            x: Math.random() * MAP_WIDTH,
            z: Math.random() * MAP_HEIGHT,   // Fix: use z not y — GameScene reads z
            yPos: 0,
            angle: 0,
            possessionTime: 0,
            hasFlag: false,
            hasWeapon: true,
            isAlive: true,
            kills: 0,
            lastMoveTime: Date.now()
        }

        socket.join(roomId)

        socket.emit("joined_successfully", { playerId: socket.id })

        // Broadcast updated player count to the room
        io.to(roomId).emit("room_update", {
            playerCount: Object.keys(room.players).length,
            maxPlayers: MAX_PLAYERS_PER_ROOM
        })

        if (Object.keys(room.players).length >= MAX_PLAYERS_PER_ROOM) {
            // Set duration from the room join params
            room.gameDuration = (parseInt(duration) || 5) * 60 * 1000;

            // Fix: emit game_start BEFORE starting the loop so clients
            // transition out of WaitingRoom before state ticks arrive
            io.to(roomId).emit("game_start")
            startGameLoop(io, roomId, room)
        }
    })

    // ─── Matchmaking ────────────────────────────────────────────────────────────
    socket.on("find_match", ({ duration }) => {
        // Remove from any existing queue slot first (prevents duplicates on reconnect)
        removeFromQueue(socket.id)

        addToQueue({
            socketId: socket.id,
            userId: socket.userId,
            // Fix: username now attached to socket by auth middleware
            username: socket.username || `Player_${socket.id.slice(0, 4)}`
        });

        const players = createMatch();
        if (!players) return;  // not enough players yet, stay in queue

        const roomId = `room_${Date.now()}`;
        const room = createRoom(roomId);
        room.gameDuration = (parseInt(duration) || 5) * 60 * 1000;

        players.forEach((p, index) => {
            const s = io.sockets.sockets.get(p.socketId);
            if (!s) return;

            s.join(roomId);

            room.players[p.socketId] = {
                id: p.socketId,
                username: p.username,
                color: PLAYER_COLORS[index],
                x: Math.random() * MAP_WIDTH,
                z: Math.random() * MAP_HEIGHT,  // Fix: z not y
                yPos: 0,
                angle: 0,
                possessionTime: 0,
                hasFlag: false,
                hasWeapon: true,
                isAlive: true,
                kills: 0,
                lastMoveTime: Date.now()
            };
        });

        // Fix: emit match_found first, then game_start after a short delay
        // so all clients have time to register their game_start listener
        io.to(roomId).emit("match_found", { roomId });

        setTimeout(() => {
            io.to(roomId).emit("game_start");
            startGameLoop(io, roomId, room);
        }, 500);
    });

    // ─── Movement ───────────────────────────────────────────────────────────────
    socket.on("move", ({ roomId, x, z, angle }) => {
        const room = getRoom(roomId)
        if (!room) return

        const player = room.players[socket.id]
        if (!player || !player.isAlive) return

        const dx = x - player.x
        const dz = z - player.z
        const distance = Math.sqrt(dx * dx + dz * dz)

        if (distance > MAX_MOVE_DISTANCE) return

        const clamped = clampPosition(x, z)
        player.x = clamped.x
        player.z = clamped.z
        if (angle !== undefined) player.angle = angle
    })

    // ─── Chat ───────────────────────────────────────────────────────────────────
    socket.on("send_message", ({ roomId, message }) => {
        if (!message || message.trim() === "") return

        const room = getRoom(roomId);
        if (!room) return

        const player = room.players[socket.id]
        if (!player) return

        io.to(roomId).emit("receive_message", {
            username: player.username,
            message: message.trim(),
            timestamp: Date.now()
        })
    })

    // ─── Disconnect ─────────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
        removeFromQueue(socket.id)
    })
}

function clampPosition(x, z) {
    return {
        x: Math.max(0, Math.min(MAP_WIDTH, x)),
        z: Math.max(0, Math.min(MAP_HEIGHT, z))
    }
}