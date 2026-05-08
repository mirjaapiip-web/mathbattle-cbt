'use client';

import { Suspense } from 'react';
import SoloGameContent from './solo-game-content';

export const dynamic = 'force-dynamic';

export default function SoloGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading game...</p>
        </div>
      </div>
    }>
      <SoloGameContent />
    </Suspense>
  );
}
