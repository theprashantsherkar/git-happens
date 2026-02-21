// ─── Player setup ─────────────────────────────────────────────────────────────
export const PLAYER_COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#EAB308']
export const PLAYER_NAMES  = ['Blue', 'Red', 'Green', 'Yellow']

// ─── Movement ─────────────────────────────────────────────────────────────────
export const BASE_SPEED      = 0.04   // path-T units per second at game start
export const SPEED_RAMP      = 0.0003 // extra speed per second of elapsed time
export const CARRIER_START_T = 0.5    // where carrier spawns on the spline (0..1)
export const CHASER_SPREAD   = 0.04   // how far behind each chaser spawns

// ─── Physics ──────────────────────────────────────────────────────────────────
export const JUMP_VELOCITY = 8     // initial upward velocity (units/s)
export const GRAVITY       = 20    // downward acceleration (units/s²)

// ─── Combat ───────────────────────────────────────────────────────────────────
export const BULLET_SPEED  = 0.35  // path-T per second
export const RESPAWN_DELAY = 3000  // ms before a dead player revives

// ─── Hit detection ────────────────────────────────────────────────────────────
export const HIT_RADIUS_T    = 0.015  // path-T tolerance for hit
export const HIT_RADIUS_SIDE = 0.6   // lateral tolerance

// ─── Obstacles ────────────────────────────────────────────────────────────────
export const OBSTACLE_TYPES = ['tree', 'rock', 'log', 'barrel'] as const

// ─── World geometry ───────────────────────────────────────────────────────────
export const LANE_WIDTH      = 2.2   // world units between lane centres
export const TRACK_RADIUS    = 0.55  // visual track half-width
export const PLAYER_HEIGHT   = 1.8   // total height of stick figure

// ─── Camera ───────────────────────────────────────────────────────────────────
export const CAM_OFFSET_Y    = 9     // height above carrier
export const CAM_OFFSET_Z    = 14    // behind carrier
export const CAM_LERP        = 0.06  // smoothing factor per frame

// ─── Session options (minutes) ────────────────────────────────────────────────
export const SESSION_OPTIONS = [2, 5, 10, 20] as const