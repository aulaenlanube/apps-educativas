/**
 * App Resolution & Lazy Loading Tests
 * Verifica que findAppById funciona correctamente, que las apps se registran
 * correctamente, y que los componentes usan lazy loading.
 */
import { describe, it, expect } from 'vitest';
import { findAppById, primariaApps, esoApps, bachilleratoApps } from '@/apps/appList';
import fs from 'fs';
import path from 'path';

describe('App Resolution: findAppById', () => {
  it('should find an app in primaria by id', () => {
    // Pick any app that exists in primaria grade 1
    const apps1 = primariaApps['1'];
    if (apps1) {
      const firstSubject = Object.keys(apps1)[0];
      const firstApp = apps1[firstSubject]?.[0];
      if (firstApp) {
        const result = findAppById(firstApp.id, 'primaria', '1');
        expect(result).not.toBeNull();
        expect(result.app.id).toBe(firstApp.id);
        expect(result.level).toBe('primaria');
      }
    }
  });

  it('should find an app in eso by id', () => {
    const apps1 = esoApps['1'];
    if (apps1) {
      const firstSubject = Object.keys(apps1)[0];
      const firstApp = apps1[firstSubject]?.[0];
      if (firstApp) {
        const result = findAppById(firstApp.id, 'eso', '1');
        expect(result).not.toBeNull();
        expect(result.app.id).toBe(firstApp.id);
      }
    }
  });

  it('should return null for non-existent app', () => {
    const result = findAppById('non-existent-app-xyz', 'primaria', '1');
    expect(result).toBeNull();
  });

  it('should return null for non-existent level', () => {
    const result = findAppById('sumas-primaria-1', 'universidad', '1');
    expect(result).toBeNull();
  });

  it('should find app when subjectId is provided', () => {
    const apps1 = primariaApps['1'];
    if (apps1) {
      const firstSubject = Object.keys(apps1)[0];
      const firstApp = apps1[firstSubject]?.[0];
      if (firstApp) {
        const result = findAppById(firstApp.id, 'primaria', '1', firstSubject);
        expect(result).not.toBeNull();
        expect(result.subjectId).toBe(firstSubject);
      }
    }
  });

  it('should search across all subjects when no subjectId provided', () => {
    // Find an app in any subject of grade 3
    const apps3 = primariaApps['3'];
    if (apps3) {
      const subjects = Object.keys(apps3);
      // Pick from last subject to test general search
      const lastSubject = subjects[subjects.length - 1];
      const app = apps3[lastSubject]?.[0];
      if (app) {
        const result = findAppById(app.id, 'primaria', '3');
        expect(result).not.toBeNull();
        expect(result.app.id).toBe(app.id);
      }
    }
  });
});

describe('App Resolution: All apps have required fields', () => {
  const allLevels = [
    { name: 'primaria', apps: primariaApps, grades: ['1', '2', '3', '4', '5', '6'] },
    { name: 'eso', apps: esoApps, grades: ['1', '2', '3', '4'] },
    { name: 'bachillerato', apps: bachilleratoApps, grades: ['1', '2'] },
  ];

  allLevels.forEach(({ name, apps, grades }) => {
    grades.forEach(grade => {
      const subjects = apps[grade] || {};
      Object.entries(subjects).forEach(([subjectId, appList]) => {
        appList.forEach(app => {
          it(`${name}/${grade}/${subjectId}: "${app.id}" should have id, name, description, component`, () => {
            expect(app.id).toBeDefined();
            expect(typeof app.id).toBe('string');
            expect(app.id.length).toBeGreaterThan(0);

            expect(app.name).toBeDefined();
            expect(typeof app.name).toBe('string');

            expect(app.description).toBeDefined();
            expect(typeof app.description).toBe('string');

            expect(app.component).toBeDefined();
          });
        });
      });
    });
  });
});

describe('App Resolution: No duplicate IDs within a subject', () => {
  const allLevels = [
    { name: 'primaria', apps: primariaApps },
    { name: 'eso', apps: esoApps },
    { name: 'bachillerato', apps: bachilleratoApps },
  ];

  allLevels.forEach(({ name, apps }) => {
    Object.entries(apps).forEach(([grade, subjects]) => {
      Object.entries(subjects).forEach(([subjectId, appList]) => {
        it(`${name}/${grade}/${subjectId}: no duplicate app IDs`, () => {
          const ids = appList.map(a => a.id);
          const unique = new Set(ids);
          expect(ids.length).toBe(unique.size);
        });
      });
    });
  });
});

describe('Lazy Loading: commonApps uses React.lazy', () => {
  it('commonApps.js should use lazy() for component imports', () => {
    const filePath = path.resolve(__dirname, '../apps/config/commonApps.js');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should import lazy from react
    expect(content).toMatch(/import\s*\{\s*lazy\s*\}\s*from\s*['"]react['"]/);

    // Should use lazy() for component definitions
    const lazyCallCount = (content.match(/lazy\(\(\)\s*=>\s*import\(/g) || []).length;
    expect(lazyCallCount).toBeGreaterThan(50); // We have 67+ apps

    // Should NOT have direct static imports of app components
    const staticImports = content.match(/^import\s+\w+\s+from\s+['"]\.\.\/(?!.*config)/gm) || [];
    expect(staticImports.length).toBe(0);
  });

  it('main.jsx should use lazy() for route pages', () => {
    const filePath = path.resolve(__dirname, '../main.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should import lazy and Suspense
    expect(content).toContain('lazy');
    expect(content).toContain('Suspense');

    // Should lazy-load page components
    const lazyPageCount = (content.match(/lazy\(\(\)\s*=>\s*import\(/g) || []).length;
    expect(lazyPageCount).toBeGreaterThanOrEqual(10); // We have ~13 route pages
  });

  it('AppRunnerPage should have Suspense wrapper for app components', () => {
    const filePath = path.resolve(__dirname, '../pages/AppRunnerPage.jsx');
    const content = fs.readFileSync(filePath, 'utf-8');

    expect(content).toContain('Suspense');
    expect(content).toContain('fallback');
  });
});
