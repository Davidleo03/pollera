'use client';

import React from 'react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* Sidebar se importa en app/page.tsx */}
      <main className="flex-1 ml-56 min-h-screen bg-background">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
