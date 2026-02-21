import * as THREE from 'three'

// ─── Winding path spline ──────────────────────────────────────────────────────
const CONTROL_POINTS: [number, number, number][] = [
  [-30, 0,  20],  // Start: blue fortress
  [-22, 0,  14],
  [-14, 0,   8],
  [ -6, 0,   4],
  [  2, 0,   2],
  [ 10, 0,  -2],
  [ 16, 0,  -8],  // Curve right
  [ 12, 0, -14],
  [  6, 0, -18],
  [  2, 0, -24],  // S-curve center
  [ 10, 0, -30],
  [ 18, 0, -32],
  [ 24, 0, -26],
  [ 28, 0, -20],  // Top-right: gold fortress
  [ 26, 0, -14],
  [ 20, 0,  -8],
  [ 14, 0,  -4],
  [ 22, 0,   2],
  [ 28, 0,   8],
  [ 26, 0,  14],  // Red fortress right
  [ 18, 0,  18],
  [ 10, 0,  20],
  [  2, 0,  18],
  [ -4, 0,  24],
  [ -8, 0,  30],  // Green fortress bottom
  [-14, 0,  28],
  [-22, 0,  24],
  [-28, 0,  20],
]

const vectors = CONTROL_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z))
export const PATH_SPLINE = new THREE.CatmullRomCurve3(vectors, true, 'catmullrom', 0.5)

export function getPathPosition(
  t: number,
  side: number,
  yExtra: number,
  sideOffset: number
): THREE.Vector3 {
  const ct = ((t % 1) + 1) % 1
  const point = PATH_SPLINE.getPoint(ct)
  const tangent = PATH_SPLINE.getTangent(ct)
  const up = new THREE.Vector3(0, 1, 0)
  const right = new THREE.Vector3().crossVectors(tangent, up).normalize()
  return new THREE.Vector3(
    point.x + right.x * side * sideOffset,
    point.y + yExtra,
    point.z + right.z * side * sideOffset
  )
}

export function getPathYaw(t: number): number {
  const ct = ((t % 1) + 1) % 1
  const tangent = PATH_SPLINE.getTangent(ct)
  return Math.atan2(tangent.x, tangent.z)
}