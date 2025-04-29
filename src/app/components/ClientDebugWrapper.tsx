'use client';

import dynamic from 'next/dynamic';

// Importer dynamiquement le composant DebugLogger (côté client uniquement)
const DebugLogger = dynamic(() => import('./DebugLogger'), {
  ssr: false,
});

export default function ClientDebugWrapper() {
  return <DebugLogger />;
}
