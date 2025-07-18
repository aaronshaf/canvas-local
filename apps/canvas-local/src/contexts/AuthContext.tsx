import React, { createContext, useContext, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  domain: string | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (domain: string, email: string, apiKey: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    domain: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (domain: string, email: string, apiKey: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call Tauri backend to authenticate
      const result = await invoke<{
        user: { id: string; name: string; email: string };
        domain: string;
      }>('authenticate', {
        domain,
        email,
        apiKey,
      });

      setAuthState({
        isAuthenticated: true,
        user: result.user,
        domain: result.domain,
      });

      // Store auth info securely using Tauri's secure storage
      await invoke('store_auth_token', { domain, apiKey });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      // Clear stored auth token
      await invoke('clear_auth_token');

      setAuthState({
        isAuthenticated: false,
        user: null,
        domain: null,
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for stored auth on mount
  React.useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const storedAuth = await invoke<{
          domain: string;
          user: { id: string; name: string; email: string };
        } | null>('get_stored_auth');

        if (storedAuth) {
          setAuthState({
            isAuthenticated: true,
            user: storedAuth.user,
            domain: storedAuth.domain,
          });
        }
      } catch (err) {
        console.error('Error checking stored auth:', err);
      }
    };

    checkStoredAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
