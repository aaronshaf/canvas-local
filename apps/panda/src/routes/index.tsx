import React from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '@panda/ui-components';
import { useAuth } from '../hooks/useAuth';
import type { RouterContext } from '../types/router';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    // If already authenticated, redirect to dashboard
    const auth = (context as RouterContext).auth;
    if (auth?.authState.isAuthenticated) {
      throw redirect({
        to: '/dashboard',
      });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = Route.useNavigate();
  const { login, isLoading, loginError, authState } = useAuth();

  React.useEffect(() => {
    if (authState.isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [authState.isAuthenticated, navigate]);

  return <LoginForm onLogin={login} isLoading={isLoading} error={loginError} />;
}
