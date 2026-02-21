import { createRoom, getRoom } from "./rooms/roomManager.js"

export default function registerSocketHandlers(io) {

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id)

        socket.on("join_room", ({ roomId, username }) => {
            const room = createRoom(roomId)

            room.players[socket.id] = {
                id: socket.id,
                username,
                x: 100,
                y: 100,
                possessionTime: 0,
                hasFlag: false,
                hasWeapon: true,
                isAlive: true
            }

            socket.join(roomId)
            io.to(roomId).emit("state_update", room)
        })

        socket.on("move", ({ roomId, x, y }) => {
            const room = getRoom(roomId)
            if (!room) return

            const player = room.players[socket.id]
            if (!player || !player.isAlive) return

            player.x = x
            player.y = y

            socket.to(roomId).emit("player_moved", {
                id: socket.id,
                x,
                y
            })
        })

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id)
        })

    })
}
