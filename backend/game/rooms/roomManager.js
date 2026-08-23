const rooms = {}

export function createRoom(roomId) {
    if (!rooms[roomId]) {
        rooms[roomId] = {
            players: {},
            flag: {
                holderId: null,
                x: 0,
                z: 0,
            },
            bullets: [],
            obstacles: [],
            gameStartTime: null,
            gameDuration: 300000,
            worldSpeed: 1,
            interval: null,
        }
    }
    return rooms[roomId]
}

export function getRoom(roomId) {
    return rooms[roomId]
}

export function deleteRoom(roomId) {
    if (rooms[roomId]?.interval) {
        clearInterval(rooms[roomId].interval)
    }
    delete rooms[roomId]
}