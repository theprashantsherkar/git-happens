function startGameLoop(io, roomId, room) {
    room.gameStartTime = Date.now()

    const interval = setInterval(() => {

        const now = Date.now()

        if (room.flag.holderId) {
            const holder = room.players[room.flag.holderId]
            if (holder) {
                holder.possessionTime += 100
            }
        }

        io.to(roomId).emit("leaderboard_update", getLeaderboard(room))

        if (now - room.gameStartTime >= room.gameDuration) {
            clearInterval(interval)
            io.to(roomId).emit("game_over", getLeaderboard(room))
        }

    }, 100)
}

function getLeaderboard(room) {
    return Object.values(room.players)
        .sort((a, b) => b.possessionTime - a.possessionTime)
}

export default startGameLoop;
