const queue = []

export const createMatch = () => {
    if (queue.length >= 4) {
        return queue.splice(0, 4)
    }
    return null
}

export const addToQueue = (player) => {
    queue.push(player)
}

export const removeFromQueue = (socketId) => {
    const index = queue.findIndex(p => p.socketId === socketId)
    if (index !== -1) {
        queue.splice(index, 1)
    }
}
