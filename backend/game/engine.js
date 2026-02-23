import { MAP_WIDTH, MAP_HEIGHT, RESPAWN_TIME } from "./constant.js"

export function handleKill(io, roomId, room, killer, victim) {
    victim.isAlive = false
    killer.kills = (killer.kills || 0) + 1

    // Drop flag at victim's position when killed
    if (room.flag.holderId === victim.id) {
        room.flag.holderId = null
        victim.hasFlag = false
        victim.hasWeapon = true
        // Fix: use z not y — all player positions use x/z
        room.flag.x = victim.x
        room.flag.z = victim.z
    }

    setTimeout(() => {
        victim.isAlive = true
        victim.x = Math.random() * MAP_WIDTH
        victim.z = Math.random() * MAP_HEIGHT  // Fix: was y
        victim.hasWeapon = true
    }, RESPAWN_TIME)
}

export function handleFlagPickup(io, roomId, room, player) {
    room.flag.holderId = player.id
    player.hasFlag = true
    player.hasWeapon = false
}