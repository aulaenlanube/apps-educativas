/**
 * AuthContext Tests
 * Verifica memoización, estados derivados, sesiones de estudiante,
 * y el correcto manejo del ciclo de vida de autenticación.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock supabase before importing AuthContext — vi.hoisted runs before mock hoisting
const { mockSupabase, mockUnsubscribe } = vi.hoisted(() => {
  const mockUnsubscribe = vi.fn();
  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn().mockResolvedValue({}),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
    rpc: vi.fn(),
  };
  return { mockSupabase, mockUnsubscribe };
});

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Helper component to access auth context in tests
function AuthConsumer({ onAuth }) {
  const auth = useAuth();
  React.useEffect(() => {
    onAuth(auth);
  });
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="role">{auth.role || 'none'}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
    </div>
  );
}

function renderWithAuth(onAuth = vi.fn()) {
  return render(
    <AuthProvider>
      <AuthConsumer onAuth={onAuth} />
    </AuthProvider>
  );
}

describe('AuthContext: Initialization', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // Reset mocks with default implementations
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockImplementation(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    }));
    mockSupabase.auth.signOut.mockResolvedValue({});
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }));
    mockSupabase.rpc.mockReset();
    mockUnsubscribe.mockClear();
  });

  it('should start in loading state', () => {
    mockSupabase.auth.getSession.mockImplementation(() => new Promise(() => {})); // never resolves
    renderWithAuth();
    expect(screen.getByTestId('loading').textContent).toBe('true');
  });

  it('should finish loading after init', async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  it('should be unauthenticated with no session', async () => {
    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('role').textContent).toBe('none');
    });
  });

  it('should restore student session from sessionStorage', async () => {
    const studentData = { id: 'student-1', display_name: 'Test Student', group_code: 'ABC' };
    sessionStorage.setItem('student_session', JSON.stringify(studentData));

    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByTestId('role').textContent).toBe('student');
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
  });

  it('should handle corrupted sessionStorage gracefully', async () => {
    sessionStorage.setItem('student_session', 'invalid-json{{{');

    renderWithAuth();
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
    // Corrupted data should be removed
    expect(sessionStorage.getItem('student_session')).toBeNull();
  });
});

describe('AuthContext: Derived state', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // Reset mocks with default implementations
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockImplementation(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    }));
    mockSupabase.auth.signOut.mockResolvedValue({});
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }));
    mockSupabase.rpc.mockReset();
    mockUnsubscribe.mockClear();
  });

  it('should correctly derive student role', async () => {
    const studentData = { id: 's1', display_name: 'Ana' };
    sessionStorage.setItem('student_session', JSON.stringify(studentData));

    const onAuth = vi.fn();
    renderWithAuth(onAuth);

    await waitFor(() => {
      const latestAuth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
      expect(latestAuth.isStudent).toBe(true);
      expect(latestAuth.isTeacher).toBe(false);
      expect(latestAuth.isFreeUser).toBe(false);
      expect(latestAuth.role).toBe('student');
    });
  });

  it('should correctly derive teacher role', async () => {
    const teacherProfile = { id: 'teacher-1', display_name: 'Prof', role: 'teacher' };
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'teacher-1' } } },
    });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: teacherProfile }),
        }),
      }),
    });

    const onAuth = vi.fn();
    renderWithAuth(onAuth);

    await waitFor(() => {
      const latestAuth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
      expect(latestAuth.isTeacher).toBe(true);
      expect(latestAuth.role).toBe('teacher');
    });
  });

  it('should correctly derive admin role', async () => {
    const adminProfile = { id: 'admin-1', display_name: 'Admin', role: 'admin' };
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-1' } } },
    });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: adminProfile }),
        }),
      }),
    });

    const onAuth = vi.fn();
    renderWithAuth(onAuth);

    await waitFor(() => {
      const latestAuth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
      expect(latestAuth.isAdmin).toBe(true);
      expect(latestAuth.role).toBe('admin');
    });
  });

  it('should correctly derive free user role', async () => {
    const freeProfile = { id: 'free-1', display_name: 'Free User', role: 'free' };
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'free-1' } } },
    });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: freeProfile }),
        }),
      }),
    });

    const onAuth = vi.fn();
    renderWithAuth(onAuth);

    await waitFor(() => {
      const latestAuth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
      expect(latestAuth.isFreeUser).toBe(true);
      expect(latestAuth.role).toBe('free');
    });
  });
});

describe('AuthContext: Input validation', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // Reset mocks with default implementations
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockImplementation(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    }));
    mockSupabase.auth.signOut.mockResolvedValue({});
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }));
    mockSupabase.rpc.mockReset();
    mockUnsubscribe.mockClear();
  });

  it('should reject empty groupCode in signInStudent', async () => {
    const onAuth = vi.fn();
    renderWithAuth(onAuth);

    await waitFor(() => {
      const auth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
      expect(auth.loading).toBe(false);
    });

    const auth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
    const result = await auth.signInStudent('', 'user', 'pass');
    expect(result.error).toBeDefined();
    expect(result.error.message).toContain('Código de grupo requerido');
  });

  it('should reject empty username in signInStudent', async () => {
    const onAuth = vi.fn();
    renderWithAuth(onAuth);

    await waitFor(() => {
      const auth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
      expect(auth.loading).toBe(false);
    });

    const auth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
    const result = await auth.signInStudent('ABC', '', 'pass');
    expect(result.error).toBeDefined();
    expect(result.error.message).toContain('Nombre de usuario requerido');
  });

  it('should reject overly long input', async () => {
    const onAuth = vi.fn();
    renderWithAuth(onAuth);

    await waitFor(() => {
      const auth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
      expect(auth.loading).toBe(false);
    });

    const auth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
    const longString = 'A'.repeat(101);
    const result = await auth.signInStudent('ABC', longString, 'pass');
    expect(result.error).toBeDefined();
    expect(result.error.message).toContain('demasiado largos');
  });

  it('should not call supabase RPC with invalid input', async () => {
    const onAuth = vi.fn();
    renderWithAuth(onAuth);

    await waitFor(() => {
      const auth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
      expect(auth.loading).toBe(false);
    });

    const auth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
    await auth.signInStudent(null, 'user', 'pass');

    expect(mockSupabase.rpc).not.toHaveBeenCalledWith('student_login', expect.anything());
  });
});

describe('AuthContext: Sign out', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // Reset mocks with default implementations
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockImplementation(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    }));
    mockSupabase.auth.signOut.mockResolvedValue({});
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }));
    mockSupabase.rpc.mockReset();
    mockUnsubscribe.mockClear();
  });

  it('should clear student session from sessionStorage on sign out', async () => {
    const studentData = { id: 's1', display_name: 'Ana' };
    sessionStorage.setItem('student_session', JSON.stringify(studentData));

    const onAuth = vi.fn();
    renderWithAuth(onAuth);

    await waitFor(() => {
      const auth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
      expect(auth.isStudent).toBe(true);
    });

    const auth = onAuth.mock.calls[onAuth.mock.calls.length - 1][0];
    await act(async () => {
      await auth.signOut();
    });

    expect(sessionStorage.getItem('student_session')).toBeNull();
  });
});

describe('AuthContext: Memoization', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // Reset mocks with default implementations
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockImplementation(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    }));
    mockSupabase.auth.signOut.mockResolvedValue({});
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }));
    mockSupabase.rpc.mockReset();
    mockUnsubscribe.mockClear();
  });

  it('should memoize context value (useMemo present in source)', () => {
    const fs = require('fs');
    const authPath = require('path').resolve(__dirname, '../contexts/AuthContext.jsx');
    const content = fs.readFileSync(authPath, 'utf-8');

    // Should use useMemo for value
    expect(content).toContain('useMemo');
    expect(content).toMatch(/const value = useMemo/);
  });
});

describe('AuthContext: Subscription cleanup', () => {
  it('should unsubscribe from auth state changes on unmount', async () => {
    mockUnsubscribe.mockClear();

    const { unmount } = renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
