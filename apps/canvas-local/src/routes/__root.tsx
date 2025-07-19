import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { CanvasThemeProvider } from '@canvas-local/ui-components';
import { useNavigationShortcuts } from '../hooks/useNavigationShortcuts';

function RootComponent() {
  useNavigationShortcuts();

  return (
    <CanvasThemeProvider>
      <Outlet />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </CanvasThemeProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
