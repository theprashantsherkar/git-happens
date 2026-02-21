export type Vec3 = [number, number, number]

export type PlayerRole = 'carrier' | 'chaser'

export type Player = {
  id: number
  name: string
  color: string
  // Path-based position: t = 0..1 along the spline, side = -1|0|1 lateral offset
  pathT: number        // 0 = start, 1 = end of loop
  side: number         // -1 left, 0 center, 1 right of path
  alive: boolean
  role: PlayerRole
  flagTime: number
  flagHoldStart: number | null
  kills: number
  isJumping: boolean
  jumpVelocity: number
  yPos: number         // vertical jump height
}

export type Obstacle = {
  id: number
  pathT: number        // position along the path
  side: number         // which lane
  type: 'tree' | 'rock' | 'log' | 'barrel'
}

export type Bullet = {
  id: number
  ownerId: number
  side: number
  pathT: number
  dt: number           // delta-T per second (positive = forward along path)
}

export type GamePhase = 'lobby' | 'playing' | 'ended'

export type GameConfig = {
  sessionMinutes: number
}