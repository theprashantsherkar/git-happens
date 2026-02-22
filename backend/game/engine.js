import { MAP_WIDTH, MAP_HEIGHT, RESPAWN_TIME } from "./constant.js"

export function handleKill(io, roomId, room, killer, victim) {
    victim.isAlive = false

    if (room.flag.holderId === victim.id) {
        room.flag.holderId = null
        room.flag.x = victim.x
        room.flag.y = victim.y
    }

    setTimeout(() => {
        victim.isAlive = true
        victim.x = Math.random() * MAP_WIDTH
        victim.y = Math.random() * MAP_HEIGHT
    }, RESPAWN_TIME)
}


export function handleFlagPickup(io, roomId, room, player) {
    room.flag.holderId = player.id
    player.hasFlag = true
    player.hasWeapon = false
}
