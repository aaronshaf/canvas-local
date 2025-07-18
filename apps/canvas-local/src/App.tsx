import { CanvasThemeProvider, LoginForm } from '@canvas-local/ui-components';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { authState, login, logout, isLoading, error } = useAuth();

  if (!authState.isAuthenticated) {
    return (
      <CanvasThemeProvider>
        <LoginForm onLogin={login} isLoading={isLoading} error={error} />
      </CanvasThemeProvider>
    );
  }

  return (
    <CanvasThemeProvider>
      <main className="container">
        <h1>Canvas Local</h1>
        <p>Welcome, {authState.user?.name || 'User'}!</p>
        <p>Connected to: {authState.domain}</p>

        <button type="button" onClick={logout} disabled={isLoading}>
          {isLoading ? 'Logging out...' : 'Logout'}
        </button>
      </main>
    </CanvasThemeProvider>
  );
}

export default App;
