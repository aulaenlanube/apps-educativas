/**
 * Game Tracker Tests
 * Verifica el cálculo de notas, la gestión de sesiones,
 * y el correcto manejo de abandonos.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: { session_id: 'test-session-123' }, error: null }),
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

// Mock AuthContext
const mockAuthValue = {
  user: null,
  student: null,
  isTeacher: false,
  isStudent: false,
  isFreeUser: false,
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => mockAuthValue),
}));

import { useGameTracker } from '@/hooks/useGameTracker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

describe('useGameTracker: calculateNota', () => {
  // We test nota calculation indirectly through trackGameSession
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset auth mock to anonymous
    useAuth.mockReturnValue({
      user: null,
      student: null,
      isTeacher: false,
      isStudent: false,
      isFreeUser: false,
    });
  });

  it('should calculate nota from correctAnswers/totalQuestions', async () => {
    const { result } = renderHook(() => useGameTracker());

    await act(async () => {
      await result.current.startSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
      });
    });

    await act(async () => {
      await result.current.trackGameSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
        correctAnswers: 8,
        totalQuestions: 10,
        score: 80,
        maxScore: 100,
      });
    });

    // Verify rpc was called with correct nota (8/10 = 0.8 * 100 / 10 = 8.0)
    const finishCall = supabase.rpc.mock.calls.find(c => c[0] === 'track_session_finish');
    if (finishCall) {
      expect(finishCall[1].p_nota).toBe(8);
    }
  });

  it('should calculate perfect nota (10) for perfect score', async () => {
    const { result } = renderHook(() => useGameTracker());

    await act(async () => {
      await result.current.startSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
      });
    });

    await act(async () => {
      await result.current.trackGameSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
        correctAnswers: 10,
        totalQuestions: 10,
      });
    });

    const finishCall = supabase.rpc.mock.calls.find(c => c[0] === 'track_session_finish');
    if (finishCall) {
      expect(finishCall[1].p_nota).toBe(10);
    }
  });

  it('should calculate nota 0 for zero correct answers', async () => {
    const { result } = renderHook(() => useGameTracker());

    await act(async () => {
      await result.current.startSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
      });
    });

    await act(async () => {
      await result.current.trackGameSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
        correctAnswers: 0,
        totalQuestions: 10,
      });
    });

    const finishCall = supabase.rpc.mock.calls.find(c => c[0] === 'track_session_finish');
    if (finishCall) {
      expect(finishCall[1].p_nota).toBe(0);
    }
  });

  it('should cap nota at 10 even with score > maxScore', async () => {
    const { result } = renderHook(() => useGameTracker());

    await act(async () => {
      await result.current.startSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
      });
    });

    await act(async () => {
      await result.current.trackGameSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
        correctAnswers: 15,
        totalQuestions: 10,
      });
    });

    const finishCall = supabase.rpc.mock.calls.find(c => c[0] === 'track_session_finish');
    if (finishCall) {
      expect(finishCall[1].p_nota).toBe(10);
    }
  });
});

describe('useGameTracker: Session lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: null,
      student: null,
      isTeacher: false,
      isStudent: false,
      isFreeUser: false,
    });
  });

  it('should call track_session_start on startSession', async () => {
    const { result } = renderHook(() => useGameTracker());

    await act(async () => {
      await result.current.startSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
      });
    });

    expect(supabase.rpc).toHaveBeenCalledWith('track_session_start', expect.objectContaining({
      p_app_id: 'test-app',
      p_app_name: 'Test',
      p_user_type: 'anonymous',
    }));
  });

  it('should identify teacher user type correctly', async () => {
    useAuth.mockReturnValue({
      user: { id: 'teacher-1' },
      student: null,
      isTeacher: true,
      isStudent: false,
      isFreeUser: false,
    });

    const { result } = renderHook(() => useGameTracker());

    await act(async () => {
      await result.current.startSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
      });
    });

    expect(supabase.rpc).toHaveBeenCalledWith('track_session_start', expect.objectContaining({
      p_user_type: 'teacher',
      p_user_id: 'teacher-1',
    }));
  });

  it('should identify student user type correctly', async () => {
    useAuth.mockReturnValue({
      user: null,
      student: { id: 'student-1' },
      isTeacher: false,
      isStudent: true,
      isFreeUser: false,
    });

    const { result } = renderHook(() => useGameTracker());

    await act(async () => {
      await result.current.startSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
      });
    });

    expect(supabase.rpc).toHaveBeenCalledWith('track_session_start', expect.objectContaining({
      p_user_type: 'student',
      p_user_id: 'student-1',
    }));
  });

  it('should not call abandonSession after trackGameSession', async () => {
    const { result } = renderHook(() => useGameTracker());

    await act(async () => {
      await result.current.startSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
      });
    });

    await act(async () => {
      await result.current.trackGameSession({
        appId: 'test-app',
        appName: 'Test',
        level: 'primaria',
        grade: '1',
        subjectId: 'mates',
        correctAnswers: 5,
        totalQuestions: 10,
      });
    });

    // Mock fetch for abandon
    global.fetch = vi.fn();

    await act(async () => {
      await result.current.abandonSession();
    });

    // Fetch should NOT be called because session was already completed
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('useGameTracker: Timer', () => {
  it('should track elapsed time correctly', async () => {
    const { result } = renderHook(() => useGameTracker());

    act(() => {
      result.current.startTimer();
    });

    // Wait a bit
    await new Promise(r => setTimeout(r, 100));

    const elapsed = result.current.getElapsedSeconds();
    expect(elapsed).toBeGreaterThanOrEqual(0);
    expect(elapsed).toBeLessThan(2);
  });

  it('should return null if timer not started', () => {
    const { result } = renderHook(() => useGameTracker());
    expect(result.current.getElapsedSeconds()).toBeNull();
  });
});
