import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders Canvas Local heading', () => {
    render(<App />);
    expect(screen.getByText('Canvas Local')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<App />);
    expect(
      screen.getByText('Welcome to Canvas Local - Your desktop client for Canvas LMS'),
    ).toBeInTheDocument();
  });
});
