'use client';
import dynamic from 'next/dynamic';

const Game = dynamic(() => import('../Game'), { ssr: false });

import { useSearchParams } from 'next/navigation';

export default function GamePage() {
  const searchParams = useSearchParams();
  const session = searchParams.get('session') || '2';
  return <Game sessionDuration={parseInt(session, 10)} />;
}
