'use client';

import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div className="flex">
      <main className={`flex-1 min-h-screen bg-background ${isMobile ? 'ml-0 pt-16' : 'ml-56'}`}>
        <div className={`${isMobile ? 'p-4' : 'p-8'}`}>
          {children}
        </div>
      </main>
    </div>
  );
}