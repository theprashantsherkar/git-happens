import { createRoom, getRoom } from "../game/rooms/roomManager.js"
import { determineWinner, startGameLoop } from "../game/rooms/gameLoop.js"
import { MAX_PLAYERS_PER_ROOM, MAX_MOVE_DISTANCE } from "../game/constant.js"
import { addToQueue, createMatch, removeFromQueue } from "../game/matchmaking/matchmaking.js"

const PLAYER_COLORS = ["#ff2d78", "#00f5ff", "#ffd700", "#3dba4e"];

const SPAWN_POINTS = [
    { x: -25, z:  25, angle: 0 },
    { x:  25, z:  25, angle: Math.PI / 2 },
    { x: -25, z: -25, angle: -Math.PI / 2 },
    { x:  25, z: -25, angle: Math.PI }
];

export default function registerHandlers(io, socket) {

    // ─── Private Room ───────────────────────────────────────────────────────────
    socket.on("join_room", ({ roomId, duration, username }) => {
        const room = createRoom(roomId)

        if (Object.keys(room.players).length >= MAX_PLAYERS_PER_ROOM) {
            return socket.emit("room_full")
        }

        const colorIndex = Object.keys(room.players).length;
        const spawn = SPAWN_POINTS[colorIndex % SPAWN_POINTS.length];

        room.players[socket.id] = {
            id: socket.id,
            username: username || socket.username || `Player ${colorIndex + 1}`,
            color: PLAYER_COLORS[colorIndex],
            x: spawn.x,
            z: spawn.z,
            yPos: 0,
            angle: spawn.angle,
            possessionTime: 0,
            hasFlag: false,
            hasWeapon: true,
            isAlive: true,
            kills: 0,
            lastMoveTime: Date.now()
        }

        socket.join(roomId)

        socket.emit("joined_successfully", { playerId: socket.id })

        io.to(roomId).emit("room_update", {
            playerCount: Object.keys(room.players).length,
            maxPlayers: MAX_PLAYERS_PER_ROOM
        })

        if (Object.keys(room.players).length >= MAX_PLAYERS_PER_ROOM) {
            room.gameDuration = (parseInt(duration) || 5) * 60 * 1000;
            io.to(roomId).emit("game_start")
            startGameLoop(io, roomId, room)
        }
    })

    // ─── Matchmaking ────────────────────────────────────────────────────────────
    socket.on("find_match", ({ duration }) => {
        removeFromQueue(socket.id)

        addToQueue({
            socketId: socket.id,
            userId: socket.userId,
            username: socket.username || `Player_${socket.id.slice(0, 4)}`
        });

        const players = createMatch();
        if (!players) return;  // Stay in queue until 4 players match

        const roomId = `room_${Date.now()}`;
        const room = createRoom(roomId);
        room.gameDuration = (parseInt(duration) || 5) * 60 * 1000;

        players.forEach((p, index) => {
            const s = io.sockets.sockets.get(p.socketId);
            if (!s) return;

            s.join(roomId);
            const spawn = SPAWN_POINTS[index % SPAWN_POINTS.length];

            room.players[p.socketId] = {
                id: p.socketId,
                username: p.username,
                color: PLAYER_COLORS[index],
                x: spawn.x,
                z: spawn.z,
                yPos: 0,
                angle: spawn.angle,
                possessionTime: 0,
                hasFlag: false,
                hasWeapon: true,
                isAlive: true,
                kills: 0,
                lastMoveTime: Date.now()
            };
        });

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
    const HALF_MAP = 74;
    return {
        x: Math.max(-HALF_MAP, Math.min(HALF_MAP, x)),
        z: Math.max(-HALF_MAP, Math.min(HALF_MAP, z))
    }
}