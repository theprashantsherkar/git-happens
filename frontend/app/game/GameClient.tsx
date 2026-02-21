'use client'

import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'

const Game = dynamic(() => import('./game'), {
  ssr: false,
})

export default function GamePage() {
  const searchParams = useSearchParams()
  const session = searchParams.get('session') ?? '2'

  const sessionDuration = Number(session)
  const safeDuration = Number.isNaN(sessionDuration) ? 2 : sessionDuration

  return <Game sessionDuration={safeDuration} />
}