export const PLAYER_COLORS = ['#FFD700', '#00E5FF', '#FF4444', '#44FF88']
export const PLAYER_NAMES = ['Flash', 'Nova', 'Blaze', 'Storm']

// Path movement speed (t units per second, path is 0..1)
export const BASE_SPEED = 0.04
export const SPEED_RAMP = 0.000015  // per second

// Carrier starts ahead, chasers behind
export const CARRIER_START_T = 0.08
export const CHASER_SPREAD = 0.025  // spacing between chasers

// Lateral lanes (offset from path center in world units)
export const SIDE_OFFSET = 2.2

// Bullet speed along path
export const BULLET_SPEED = 0.55  // t-units/sec

// Obstacle density (probability per tick)
export const OBSTACLE_INTERVAL = 0.04  // every ~0.04 t units, try spawn

// Jump
export const JUMP_VELOCITY = 9
export const GRAVITY = 26

// Respawn
export const RESPAWN_DELAY = 3500

// Collision radius in t-units
export const HIT_RADIUS_T = 0.018
export const HIT_RADIUS_SIDE = 0.8

// Obstacle types
export const OBSTACLE_TYPES = ['tree', 'rock', 'log', 'barrel'] as const

// Camera (isometric)
export const CAM_HEIGHT = 22
export const CAM_BACK = 14
export const CAM_SIDE = 18