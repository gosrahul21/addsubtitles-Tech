"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';

type User = {
  id: string;
  email: string;
  subscriptionTier: string;
  createdAt?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => { },
  loading: true,
  logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Attempt to load the user session on mount
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // 1. Axios Interceptor for 401s
    const reqInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
          originalRequest._retry = true;
          try {
            await axios.post(`${apiUrl}/auth/refresh`, {}, { withCredentials: true });
            return axios(originalRequest);
          } catch (refreshError) {
            setUser(null);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    // 2. Fetch Interceptor for 401s
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let response = await originalFetch(...args);
      const url = args[0] as string;
      
      if (response.status === 401 && typeof url === 'string' && url.includes(apiUrl) && !url.includes('/auth/refresh')) {
        try {
          await axios.post(`${apiUrl}/auth/refresh`, {}, { withCredentials: true });
          
          // Re-create the request if it was consumed, otherwise just re-run
          const req = new Request(args[0], args[1]);
          response = await originalFetch(req);
        } catch (e) {
          setUser(null);
        }
      }
      return response;
    };

    const initializeAuth = async () => {
      // Skip proactive refresh if the user explicitly just logged out
      const didLogout = sessionStorage.getItem('logged_out') === 'true';

      if (!didLogout) {
        try {
          // Proactively refresh the token on app load
          await axios.post(`${apiUrl}/auth/refresh`, {}, { withCredentials: true });
        } catch (err) {
          // If refresh fails (e.g. no session), we just continue and let /users/me fail
        }
      }

      try {
        const res = await axios.get(`${apiUrl}/users/me`, { withCredentials: true });
        // Successfully loaded session — clear any stale logout flag
        sessionStorage.removeItem('logged_out');
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const handleLogout = async () => {
      try {
        sessionStorage.setItem('logged_out', 'true');
        await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true });
      } catch (e) { /* swallow */ } finally {
        setUser(null);
      }
    };
    // Expose logout on window so it can be triggered from page.tsx or anywhere
    (window as any).__authLogout = handleLogout;

    return () => {
      axios.interceptors.response.eject(reqInterceptor);
      window.fetch = originalFetch;
      delete (window as any).__authLogout;
    };
  }, []);

  const logout = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    sessionStorage.setItem('logged_out', 'true');
    try {
      await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true });
    } catch (e) { /* swallow */ } finally {
      setUser(null);
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1234567890-mock-client-id.apps.googleusercontent.com';

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
      </GoogleOAuthProvider>
    </AuthContext.Provider>
  );
}
