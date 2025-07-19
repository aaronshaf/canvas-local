import type React from 'react';
import { canvas } from '@instructure/ui-themes';
import { InstUISettingsProvider } from '@instructure/emotion';

interface CanvasThemeProviderProps {
  children: React.ReactNode;
}

export const CanvasThemeProvider: React.FC<CanvasThemeProviderProps> = ({ children }) => {
  return <InstUISettingsProvider theme={canvas}>{children}</InstUISettingsProvider>;
};
