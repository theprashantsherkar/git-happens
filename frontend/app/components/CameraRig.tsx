'use client'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from '../types'

type Props = { players: Player[]; playerIndex: number }

const CAM_BACK   = 10
const CAM_HEIGHT = 7
const CAM_LERP   = 0.06

export function CameraRig({ players, playerIndex }: Props) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, CAM_HEIGHT, CAM_BACK))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(() => {
    const local = players[playerIndex] ?? players[0]
    if (!local) return

    // Desired camera position: behind the player in the direction they face
    const behindX = local.x - Math.sin(local.angle) * CAM_BACK
    const behindZ = local.z - Math.cos(local.angle) * CAM_BACK

    targetPos.current.set(behindX, CAM_HEIGHT, behindZ)
    targetLook.current.set(local.x, 1.0, local.z)

    // Smooth camera movement
    camera.position.lerp(targetPos.current, CAM_LERP)

    // Smooth look-at
    const currentLook = new THREE.Vector3()
    camera.getWorldDirection(currentLook)
    const desiredDir = new THREE.Vector3(
      targetLook.current.x - camera.position.x,
      targetLook.current.y - camera.position.y,
      targetLook.current.z - camera.position.z
    ).normalize()

    const lerpedDir = currentLook.lerp(desiredDir, CAM_LERP * 2)
    camera.lookAt(
      camera.position.x + lerpedDir.x,
      camera.position.y + lerpedDir.y,
      camera.position.z + lerpedDir.z
    )
  })

  return null
}