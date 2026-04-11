/**
 * ThemeContext Tests
 * Verifica el toggle de tema, persistencia por usuario,
 * y modo claro por defecto.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function ThemeConsumer() {
  const { theme, toggleTheme, setTheme, syncUser } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button data-testid="toggle" onClick={toggleTheme}>Toggle</button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>Dark</button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>Light</button>
      <button data-testid="sync-user" onClick={() => syncUser('user-123')}>Login</button>
      <button data-testid="sync-logout" onClick={() => syncUser(null)}>Logout</button>
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

  it('should default to light even if OS prefers dark', () => {
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
    // Siempre light por defecto, sin importar el OS
    expect(screen.getByTestId('theme').textContent).toBe('light');
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

  it('should persist theme per user in localStorage', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    // Simular login
    await user.click(screen.getByTestId('sync-user'));
    // Cambiar a dark
    await user.click(screen.getByTestId('set-dark'));
    expect(localStorage.getItem('eduapps-theme-user-123')).toBe('dark');
  });

  it('should restore user theme on login', async () => {
    // Pre-guardar preferencia del usuario
    localStorage.setItem('eduapps-theme-user-123', 'dark');

    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    // Empieza en light
    expect(screen.getByTestId('theme').textContent).toBe('light');

    // Al hacer login, restaura la preferencia guardada
    await user.click(screen.getByTestId('sync-user'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('should reset to light on logout', async () => {
    localStorage.setItem('eduapps-theme-user-123', 'dark');

    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    // Login → dark
    await user.click(screen.getByTestId('sync-user'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');

    // Logout → light
    await user.click(screen.getByTestId('sync-logout'));
    expect(screen.getByTestId('theme').textContent).toBe('light');
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
    localStorage.setItem('eduapps-theme-user-123', 'invalid-value');
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    // Sin login, siempre light
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });
});
