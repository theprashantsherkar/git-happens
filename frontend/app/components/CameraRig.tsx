'use client'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from '../types'
import { getPathPosition, getPathYaw } from '../utils/path'
import { LANE_WIDTH, CAM_OFFSET_Y, CAM_OFFSET_Z, CAM_LERP } from '../constants'

type Props = { players: Player[] }

export function CameraRig({ players }: Props) {
  const { camera } = useThree()
  const targetPos  = useRef(new THREE.Vector3())
  const targetLook = useRef(new THREE.Vector3())
  const currentPos = useRef<THREE.Vector3 | null>(null)

  useFrame(() => {
    // Follow the carrier; fallback to first alive player
    const carrier = players.find(p => p.role === 'carrier' && p.alive)
                 ?? players.find(p => p.alive)
    if (!carrier) return

    const subjectPos = getPathPosition(carrier.pathT, carrier.side, carrier.yPos, LANE_WIDTH)
    const yaw        = getPathYaw(carrier.pathT)

    // Camera sits behind and above the subject, offset along the path tangent
    const sinY = Math.sin(yaw)
    const cosY = Math.cos(yaw)

    targetPos.current.set(
      subjectPos.x - sinY * CAM_OFFSET_Z,
      subjectPos.y + CAM_OFFSET_Y,
      subjectPos.z - cosY * CAM_OFFSET_Z,
    )

    // Look at a point slightly ahead of the carrier
    targetLook.current.set(
      subjectPos.x + sinY * 4,
      subjectPos.y + 1,
      subjectPos.z + cosY * 4,
    )

    // Initialise on first frame
    if (!currentPos.current) {
      currentPos.current = targetPos.current.clone()
      camera.position.copy(currentPos.current)
    }

    // Smooth lerp
    camera.position.lerp(targetPos.current, CAM_LERP)
    camera.lookAt(targetLook.current)
  })

  return null
}