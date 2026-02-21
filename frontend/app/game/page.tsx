import FlagRun from './game'

export default function GamePage({
  searchParams,
}: {
  searchParams?: { duration?: string }
}) {
  const duration = searchParams?.duration
    ? parseInt(searchParams.duration, 10)
    : undefined

  return <FlagRun sessionDuration={duration} />
}