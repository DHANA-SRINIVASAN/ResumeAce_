// src/components/auth-guard.tsx
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingIndicator } from '@/components/loading-indicator';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): ReactNode {
  const { isLoggedIn, isLoading, checkAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Perform the check only after the initial loading is complete
    if (!isLoading) {
      constisAuthenticated = checkAuth(); // Get current auth status
      if (!isAuthenticated) {
        // Store the current path to redirect back after login
        // Avoid storing if already on login/signup to prevent loops
        if (pathname !== '/login' && pathname !== '/signup') {
          localStorage.setItem('redirectAfterLogin', pathname);
        }
        router.replace('/login');
      }
    }
  }, [isLoading, router, checkAuth, pathname]); // Include pathname in dependencies

  // If still loading auth state, or if user is not logged in (and redirection is in progress)
  if (isLoading || !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingIndicator text="Authenticating..." />
      </div>
    );
  }

  // If logged in, render the children
  return children;
}
