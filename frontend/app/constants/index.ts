// ─── Player setup ─────────────────────────────────────────────────────────────
export const PLAYER_COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#EAB308']
export const PLAYER_NAMES  = ['Blue', 'Red', 'Green', 'Yellow']

// ─── World ────────────────────────────────────────────────────────────────────
export const WORLD_SIZE    = 80     // half-extent: map is -80..+80 on X and Z
export const PLAYER_HEIGHT = 1.65   // head height

// ─── Movement ─────────────────────────────────────────────────────────────────
export const MOVE_SPEED    = 12     // units/s forward
export const TURN_SPEED    = 2.2    // rad/s turning
export const JUMP_VELOCITY = 8      // initial upward velocity
export const GRAVITY       = 20     // downward acceleration (units/s²)

// ─── Combat ───────────────────────────────────────────────────────────────────
export const BULLET_SPEED    = 30   // units/s
export const BULLET_LIFE     = 2.5  // seconds before despawn
export const SHOOT_COOLDOWN  = 350  // ms between shots
export const HIT_RADIUS      = 1.5  // units, bullet hit detection
export const RESPAWN_DELAY   = 3000 // ms

// ─── Flag ─────────────────────────────────────────────────────────────────────
export const FLAG_PICKUP_RADIUS = 2.5  // units to auto-collect flag