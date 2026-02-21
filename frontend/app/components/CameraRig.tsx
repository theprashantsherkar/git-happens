'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Player } from '../types'
import { SIDE_OFFSET } from '../constants'
import { getPathPosition } from '../utils/path'

type Props = { carrier: Player | undefined }

export function CameraRig({ carrier }: Props) {
  const { camera } = useThree()
  const camPos = useRef(new THREE.Vector3(0, 22, 18))
  const lookAt = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((_, delta) => {
    let targetFocus: THREE.Vector3

    if (carrier) {
      targetFocus = getPathPosition(carrier.pathT, carrier.side, 0, SIDE_OFFSET)
    } else {
      targetFocus = new THREE.Vector3(0, 0, 0)
    }

    // Isometric-style: camera stays at fixed offset from focus point
    const idealCamPos = new THREE.Vector3(
      targetFocus.x - 14,
      targetFocus.y + 22,
      targetFocus.z + 18
    )

    camPos.current.lerp(idealCamPos, delta * 2.5)
    lookAt.current.lerp(targetFocus, delta * 3)

    camera.position.copy(camPos.current)
    camera.lookAt(lookAt.current)
  })

  return null
}