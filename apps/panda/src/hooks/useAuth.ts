import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { Effect } from 'effect';

interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
  };
  domain: string;
  api_key: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthResult['user'] | null;
  domain: string | null;
}

// Effect-based auth service
const AuthService = {
  authenticate: (domain: string, email: string, apiKey: string) =>
    Effect.tryPromise({
      try: () => invoke<AuthResult>('authenticate', { domain, email, apiKey }),
      catch: (error) => new Error(String(error)),
    }),

  storeAuthToken: (domain: string, apiKey: string) =>
    Effect.tryPromise({
      try: () => invoke('store_auth_token', { domain, apiKey }),
      catch: (error) => new Error(String(error)),
    }),

  clearAuthToken: () =>
    Effect.tryPromise({
      try: () => invoke('clear_auth_token'),
      catch: (error) => new Error(String(error)),
    }),

  getStoredAuth: () =>
    Effect.tryPromise({
      try: () => invoke<AuthResult | null>('get_stored_auth'),
      catch: (error) => new Error(String(error)),
    }),
};

export function useAuth() {
  const queryClient = useQueryClient();

  // Check stored auth on mount
  const { data: authState, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const storedAuth = await Effect.runPromise(AuthService.getStoredAuth());
      if (storedAuth) {
        return {
          isAuthenticated: true,
          user: storedAuth.user,
          domain: storedAuth.domain,
        } as AuthState;
      }
      return {
        isAuthenticated: false,
        user: null,
        domain: null,
      } as AuthState;
    },
    staleTime: Number.POSITIVE_INFINITY, // Auth state doesn't go stale
  });

  const loginMutation = useMutation({
    mutationFn: async ({
      domain,
      email,
      apiKey,
    }: { domain: string; email: string; apiKey: string }) => {
      const result = await Effect.runPromise(
        AuthService.authenticate(domain, email, apiKey).pipe(
          Effect.tap(() => AuthService.storeAuthToken(domain, apiKey)),
        ),
      );
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth'], {
        isAuthenticated: true,
        user: data.user,
        domain: data.domain,
      });
      // Navigation will be handled by the component using this hook
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await Effect.runPromise(AuthService.clearAuthToken());
    },
    onSuccess: () => {
      // Clear all queries and auth state
      queryClient.clear();
      queryClient.setQueryData(['auth'], {
        isAuthenticated: false,
        user: null,
        domain: null,
      });
      // Navigation will be handled by the component using this hook
    },
  });

  return {
    authState: authState || { isAuthenticated: false, user: null, domain: null },
    isLoading,
    login: async (domain: string, email: string, apiKey: string) => {
      return new Promise<void>((resolve, reject) => {
        loginMutation.mutate(
          { domain, email, apiKey },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          },
        );
      });
    },
    logout: () => logoutMutation.mutate(),
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error?.message || null,
  };
}
