'use client'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ServerPlayer } from '../hooks/useGameState'

type Props = { player: ServerPlayer | null }

const CAM_BACK   = 10
const CAM_HEIGHT = 7
const CAM_LERP   = 0.06

export function CameraRig({ player }: Props) {
  const { camera } = useThree()
  const targetPos  = useRef(new THREE.Vector3(0, CAM_HEIGHT, CAM_BACK))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(() => {
    if (!player) return

    // server: x/y are the horizontal axes → map y→z in Three.js
    const angle  = player.angle ?? 0
    const behindX = player.x - Math.sin(angle) * CAM_BACK
    const behindZ = player.y - Math.cos(angle) * CAM_BACK   // server y → three z

    targetPos.current.set(behindX, CAM_HEIGHT, behindZ)
    targetLook.current.set(player.x, 1.0, player.y)

    camera.position.lerp(targetPos.current, CAM_LERP)

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