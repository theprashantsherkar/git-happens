const queue = []; // a simple queue to hold players with their details waiting for a match

const createMatch = () => {
    if (queue.length >= 4) {
        return queue.splice(0, 4) // take the first 4 players from the queue to create a match
    }
    return null // not enough players to create a match
}

const addToQueue = (player) => {
    queue.push(player)
}

const removeFromQueue = (socketId) => {
    const index = queue.findIndex(p => p.socketId === socketId)
    if (index !== -1) {
        queue.splice(index, 1);
    }
}