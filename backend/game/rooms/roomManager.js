const rooms = {}

export function createRoom(roomId) {
    if (!rooms[roomId]) {
        rooms[roomId] = {
            players: {},
            flag: {
                holderId: null,
                x: 400,
                y: 300
            },
            gameStartTime: null,
            gameDuration: 300000
        }
    }
    return rooms[roomId]
}

export function getRoom(roomId) {
    return rooms[roomId]
}
