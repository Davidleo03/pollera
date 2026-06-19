'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { currentUser, initialized } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    if (!currentUser && pathname !== '/login') {
      router.replace('/login');
      return;
    }
    if (currentUser && pathname === '/login') {
      router.replace('/');
    }
  }, [currentUser, initialized, pathname, router]);

  if (!initialized) {
    return null;
  }

  if (!currentUser && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
