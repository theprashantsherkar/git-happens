import { createRoom, getRoom } from "../game/roomManager.js"
import { startGameLoop } from "../game/gameLoop.js"
import { MAX_PLAYERS_PER_ROOM, MAX_MOVE_DISTANCE, MAP_HEIGHT } from "../game/constant.js"


export default function registerHandlers(io, socket) {

    socket.on("join_room", ({ roomId, username }) => {

        const room = createRoom(roomId)

        if (Object.keys(room.players).length >= MAX_PLAYERS_PER_ROOM) {
            return socket.emit("room_full")
        }

        const spawnX = Math.random() * MAP_WIDTH
        const spawnY = Math.random() * MAP_HEIGHT

        room.players[socket.id] = {
            id: socket.id,
            username,
            x: spawnX,
            y: spawnY,
            possessionTime: 0,
            hasFlag: false,
            hasWeapon: true,
            isAlive: true,
            lastMoveTime: Date.now()
        }

        socket.join(roomId)

        socket.emit("joined_successfully", {
            playerId: socket.id
        })

        io.to(roomId).emit("room_state", room)

        if (Object.keys(room.players).length === MAX_PLAYERS_PER_ROOM) {
            startGameLoop(io, roomId, room)
            io.to(roomId).emit("game_start")
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

}


import { MAP_WIDTH, MAP_HEIGHT } from "../game/constants.js"

function clampPosition(x, y) {
    return {
        x: Math.max(0, Math.min(MAP_WIDTH, x)),
        y: Math.max(0, Math.min(MAP_HEIGHT, y))
    }
}