import { COLLISION_RADIUS } from '../constant.js'

export function isColliding(a, b, radius = 30) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy) < COLLISION_RADIUS
}
