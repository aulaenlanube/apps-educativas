/* global globalThis */
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock import.meta.env
if (!import.meta.env.VITE_SUPABASE_URL) {
  import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
}

// Node >= 25 trae un localStorage global nativo (undefined sin --localstorage-file)
// que tapa al de jsdom: usamos el de jsdom.
for (const key of ['localStorage', 'sessionStorage']) {
  if (!globalThis[key] && globalThis.jsdom?.window?.[key]) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: globalThis.jsdom.window[key],
    });
  }
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = MockResizeObserver;
