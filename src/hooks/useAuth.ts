// src/hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_KEY = 'isLoggedIn_ResumeAce'; // Unique key for this app

export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (redirectPath?: string) => void;
  logout: () => void;
  checkAuth: () => boolean; // Renamed for clarity, this is the synchronous check
}

export function useAuth(): AuthState {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Synchronous check for auth status from localStorage
  const checkAuth = useCallback((): boolean => {
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      const authStatus = storedAuth === 'true';
      // Update state if it differs, but primarily return current status
      // This helps avoid stale closures in useEffect if checkAuth is called directly
      if (isLoggedIn !== authStatus) {
        setIsLoggedIn(authStatus);
      }
      return authStatus;
    }
    return false;
  }, [isLoggedIn]); // isLoggedIn dependency to ensure it can update state correctly if needed

  // Effect to set initial auth state on mount and handle client-side only logic
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      setIsLoggedIn(storedAuth === 'true');
    }
    setIsLoading(false);
  }, []);


  const login = useCallback((redirectPath: string = '/candidate-portal') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsLoggedIn(true);
      router.push(redirectPath);
    }
  }, [router]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
      setIsLoggedIn(false);
      router.push('/login'); // Redirect to login page on logout
    }
  }, [router]);

  return { isLoggedIn, isLoading, login, logout, checkAuth };
}
