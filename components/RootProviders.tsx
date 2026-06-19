'use client';

import { AuthProvider } from '@/context/AuthContext';
import { AdminProvider } from '@/context/AdminContext';
import { AuthGate } from '@/components/AuthGate';

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminProvider>
        <AuthGate>
          {children}
        </AuthGate>
      </AdminProvider>
    </AuthProvider>
  );
}
