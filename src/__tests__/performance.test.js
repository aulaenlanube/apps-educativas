/**
 * Performance Tests
 * Verifica que las optimizaciones de rendimiento están en su sitio:
 * memoización, lazy loading, CSS estático, y React.memo.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Performance: Context memoization', () => {
  it('AuthContext should memoize its value with useMemo', () => {
    const filePath = path.resolve(__dirname, '../contexts/AuthContext.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('useMemo');
    expect(content).toMatch(/const value = useMemo\(\(\)/);
  });

  it('ThemeContext should memoize its value with useMemo', () => {
    const filePath = path.resolve(__dirname, '../contexts/ThemeContext.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('useMemo');
  });

  it('AuthContext should import useMemo', () => {
    const filePath = path.resolve(__dirname, '../contexts/AuthContext.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/import.*useMemo.*from\s+['"]react['"]/);
  });

  it('ThemeContext should import useMemo', () => {
    const filePath = path.resolve(__dirname, '../contexts/ThemeContext.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toMatch(/import.*useMemo.*from\s+['"]react['"]/);
  });
});

describe('Performance: CSS keyframes are static', () => {
  it('icon-animations.css should exist with all keyframes', () => {
    const filePath = path.resolve(__dirname, '../styles/icon-animations.css');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf-8');

    // All required keyframes should be present
    const requiredKeyframes = [
      'ai-float', 'ai-pulse', 'ai-glow', 'ai-spin', 'ai-swing',
      'ai-bob', 'ai-shimmer', 'ai-draw', 'ai-bounce', 'ai-wiggle',
      'ai-breathe', 'ai-blink', 'ai-flicker', 'ai-scan', 'ai-wave', 'ai-orbit',
    ];

    requiredKeyframes.forEach(name => {
      expect(content).toContain(`@keyframes ${name}`);
    });
  });

  it('icon-animations.css should be imported in index.css', () => {
    const filePath = path.resolve(__dirname, '../index.css');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain("icon-animations.css");
  });

  it('AppIcon.jsx should NOT inject styles at runtime', () => {
    const filePath = path.resolve(__dirname, '../components/AppIcon.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).not.toContain('document.createElement');
    expect(content).not.toContain('document.head.appendChild');
    expect(content).not.toContain('injectAiStyles');
  });

  it('AppIconSet2.jsx should NOT inject styles at runtime', () => {
    const filePath = path.resolve(__dirname, '../components/AppIconSet2.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).not.toContain('document.createElement');
    expect(content).not.toContain('document.head.appendChild');
    expect(content).not.toContain('injectAi2Styles');
  });

  it('AppIconSet3.jsx should NOT inject styles at runtime', () => {
    const filePath = path.resolve(__dirname, '../components/AppIconSet3.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).not.toContain('document.createElement');
    expect(content).not.toContain('document.head.appendChild');
    expect(content).not.toContain('injectAi3Styles');
  });
});

describe('Performance: React.memo on frequently rendered components', () => {
  it('AppIcon should use React.memo', () => {
    const filePath = path.resolve(__dirname, '../components/AppIcon.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('memo');
    expect(content).toMatch(/const AppIcon = memo\(/);
  });
});

describe('Performance: Lazy loading coverage', () => {
  it('commonApps.js should have zero static component imports', () => {
    const filePath = path.resolve(__dirname, '../apps/config/commonApps.js');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Count lines with "import X from '../" (static imports of app components)
    const lines = content.split('\n');
    const staticImportLines = lines.filter(line =>
      line.match(/^import\s+\w+\s+from\s+['"]\.\.\// ) &&
      !line.includes('config/')
    );

    expect(staticImportLines).toEqual([]);
  });

  it('main.jsx should lazy-load all pages except HomePage and critical layout', () => {
    const filePath = path.resolve(__dirname, '../main.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // These pages should be lazy loaded
    const lazyPages = [
      'SubjectPage', 'AppListPage', 'AppRunnerPage', 'LoginPage',
      'RegisterPage', 'RegisterFreePage', 'DashboardPage', 'ProfilePage',
      'AdminPanel', 'QuizBattleHost', 'QuizBattlePlayer',
      'StudentDashboard', 'FreeUserDashboard',
    ];

    lazyPages.forEach(page => {
      expect(content).toMatch(new RegExp(`const ${page} = lazy`));
    });
  });

  it('AppRunnerPage should wrap app component in Suspense', () => {
    const filePath = path.resolve(__dirname, '../pages/AppRunnerPage.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('<Suspense');
    expect(content).toContain('AppToRender');
  });
});

describe('Performance: Bundle optimization', () => {
  it('vite.config.js should have manual chunks for heavy deps', () => {
    const filePath = path.resolve(__dirname, '../../vite.config.js');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should chunk Three.js separately
    expect(content).toContain("'three'");
    expect(content).toContain('@react-three');

    // Should chunk Supabase separately
    expect(content).toContain("'supabase'");
    expect(content).toContain('@supabase');

    // Should chunk animations separately
    expect(content).toContain("'animations'");
    expect(content).toContain('framer-motion');
  });
});

describe('Performance: ConfettiProvider cleanup', () => {
  it('ConfettiProvider should clean up DOM on unmount', () => {
    const filePath = path.resolve(__dirname, '../apps/_shared/ConfettiProvider.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should have cleanup in useEffect for DOM portal
    expect(content).toContain('document.body.removeChild');

    // Should have cleanup for resize listener
    expect(content).toContain('removeEventListener');
  });

  it('ConfettiProvider should clean up timer', () => {
    const filePath = path.resolve(__dirname, '../apps/_shared/ConfettiProvider.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('clearTimeout');
  });
});
