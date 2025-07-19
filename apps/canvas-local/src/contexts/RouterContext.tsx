import { RouterProvider as TanStackRouterProvider } from '@tanstack/react-router';
import { router } from '../router';
import { useAuth } from '../hooks/useAuth';

export function AppRouter() {
  const auth = useAuth();

  return <TanStackRouterProvider router={router} context={{ auth }} />;
}
