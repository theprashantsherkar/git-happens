const queue = [];

const createMatch = () => {
    if (queue.length >= 4) {
        return queue.splice(0, 4)
    }
    return null
}

const addToQueue = (player) => {
    queue.push(player)
}

const removeFromQueue = (socketId) => {
    const index = queue.findIndex(p => p.socketId === socketId)
    if (index !== -1) {
        queue.splice(index, 1)
    }
}

export { createMatch, addToQueue, removeFromQueue }