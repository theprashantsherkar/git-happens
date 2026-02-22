export type PlayerRole = 'carrier' | 'chaser'

export type Player = {
  id: number
  name: string
  color: string
  hasGun: boolean 
  x: number            
  z: number           
  angle: number      
  vx: number           
  vz: number           
  alive: boolean
  role: PlayerRole
  flagTime: number     
  lastShotAt: number 
  flagHoldStart: number | null
  kills: number
  isJumping: boolean
  jumpVelocity: number
  speedMultiplier: number
  yPos: number
}

export type Obstacle = {
  id: number
  x: number
  z: number
  type: 'tree' | 'rock' | 'log' | 'barrel' | 'pothole' | 'animal' | 'river'
}

export type Bullet = {
  id: number
  ownerId: number
  x: number
  z: number
  vx: number
  vz: number
}

export type Flag = {
  x: number
  z: number
  carrierId: number | null
}

export type GamePhase = 'lobby' | 'playing' | 'ended'

export type GameConfig = {
  sessionMinutes: number
}