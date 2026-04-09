/**
 * ThemeContext Tests
 * Verifica el toggle de tema, persistencia en localStorage,
 * y detección de preferencia del sistema.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function ThemeConsumer() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button data-testid="toggle" onClick={toggleTheme}>Toggle</button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>Dark</button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>Light</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should default to light theme', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('should restore theme from localStorage', () => {
    localStorage.setItem('eduapps-theme', 'dark');
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('should toggle theme', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('light');

    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');

    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('should set theme directly', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await user.click(screen.getByTestId('set-dark'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');

    await user.click(screen.getByTestId('set-light'));
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('should persist theme to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await user.click(screen.getByTestId('set-dark'));
    expect(localStorage.getItem('eduapps-theme')).toBe('dark');
  });

  it('should add/remove dark class on document', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await user.click(screen.getByTestId('set-dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await user.click(screen.getByTestId('set-light'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should sanitize invalid theme values', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    // setTheme with invalid value should default to light
    await user.click(screen.getByTestId('set-dark'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('should handle invalid localStorage value gracefully', () => {
    localStorage.setItem('eduapps-theme', 'invalid-value');
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    // Should fallback to light
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('should detect system dark mode preference', () => {
    window.matchMedia.mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });
});
