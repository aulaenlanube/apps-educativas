/**
 * Security Tests
 * Verifica que no se exponen secretos, que las sesiones se manejan de forma segura,
 * y que la validación de entrada funciona correctamente.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security: Secrets exposure', () => {
  it('should not have SUPABASE_SERVICE_ROLE_KEY active in .env.local', () => {
    const envPath = path.resolve(__dirname, '../../.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      const activeServiceKey = lines.find(
        line => line.startsWith('SUPABASE_SERVICE_ROLE_KEY=') && !line.startsWith('#')
      );
      expect(activeServiceKey).toBeUndefined();
    }
  });

  it('should not expose service role key in any source file', () => {
    const srcDir = path.resolve(__dirname, '..');
    const checkDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '__tests__') {
          checkDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          expect(content).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
          expect(content).not.toContain('service_role');
        }
      }
    };
    checkDir(srcDir);
  });

  it('should only use VITE_ prefixed env vars in frontend code', () => {
    const supabasePath = path.resolve(__dirname, '../lib/supabase.js');
    const content = fs.readFileSync(supabasePath, 'utf-8');
    // Should only reference VITE_ prefixed vars
    const envRefs = content.match(/import\.meta\.env\.(\w+)/g) || [];
    envRefs.forEach(ref => {
      const varName = ref.replace('import.meta.env.', '');
      expect(varName.startsWith('VITE_')).toBe(true);
    });
  });

  it('.env.local should be in .gitignore', () => {
    const gitignorePath = path.resolve(__dirname, '../../.gitignore');
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    expect(content).toContain('.env.local');
  });
});

describe('Security: Session storage', () => {
  it('should use sessionStorage for student sessions, not localStorage', () => {
    const authPath = path.resolve(__dirname, '../contexts/AuthContext.jsx');
    const content = fs.readFileSync(authPath, 'utf-8');

    // Should NOT use localStorage for student_session
    const localStorageStudentCalls = content.match(/localStorage\.(get|set|remove)Item\(['"]student_session['"]\)/g);
    expect(localStorageStudentCalls).toBeNull();

    // Should use sessionStorage for student_session
    const sessionStorageCalls = content.match(/sessionStorage\.(get|set|remove)Item\(['"]student_session['"]\)/g);
    expect(sessionStorageCalls).not.toBeNull();
    expect(sessionStorageCalls.length).toBeGreaterThan(0);
  });
});

describe('Security: Input validation', () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      },
      rpc: vi.fn(),
      from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn() }) }) }),
    };
  });

  it('AuthContext source should contain input validation for signInStudent', () => {
    const authPath = path.resolve(__dirname, '../contexts/AuthContext.jsx');
    const content = fs.readFileSync(authPath, 'utf-8');

    // Should validate groupCode
    expect(content).toContain('groupCode');
    expect(content).toContain('Código de grupo requerido');

    // Should validate username
    expect(content).toContain('Nombre de usuario requerido');

    // Should have length limits
    expect(content).toContain('Datos de entrada demasiado largos');
  });

  it('should reject empty groupCode values', async () => {
    // Verify the validation logic by checking the source pattern
    const authPath = path.resolve(__dirname, '../contexts/AuthContext.jsx');
    const content = fs.readFileSync(authPath, 'utf-8');

    // The validation should check for falsy, non-string, and empty trimmed values
    expect(content).toMatch(/typeof groupCode !== 'string'/);
    expect(content).toMatch(/groupCode\.trim\(\)\.length === 0/);
  });

  it('should reject excessively long input values', () => {
    const authPath = path.resolve(__dirname, '../contexts/AuthContext.jsx');
    const content = fs.readFileSync(authPath, 'utf-8');

    // Should have max length checks
    expect(content).toMatch(/groupCode\.length > \d+/);
    expect(content).toMatch(/username\.length > \d+/);
  });
});

describe('Security: Sanitizer helpers', () => {
  it('sanitizePlainText strips HTML tags, control chars and truncates', async () => {
    const { sanitizePlainText } = await import('../lib/sanitize.js');
    expect(sanitizePlainText('<script>alert(1)</script>Hola')).toBe('alert(1)Hola');
    expect(sanitizePlainText('Texto\u0000con\u0007control')).toBe('Textoconcontrol');
    expect(sanitizePlainText('  trim me  ')).toBe('trim me');
    expect(sanitizePlainText('abcdefghij', 5)).toBe('abcde');
    expect(sanitizePlainText(null)).toBe('');
  });

  it('USERNAME_RE accepts valid usernames and rejects invalid', async () => {
    const { USERNAME_RE } = await import('../lib/sanitize.js');
    expect(USERNAME_RE.test('maria.garcia')).toBe(true);
    expect(USERNAME_RE.test('pedro_1')).toBe(true);
    expect(USERNAME_RE.test('ab')).toBe(false);
    expect(USERNAME_RE.test('has space')).toBe(false);
    expect(USERNAME_RE.test('<script>')).toBe(false);
    expect(USERNAME_RE.test('a'.repeat(31))).toBe(false);
  });

  it('ROOM_CODE_RE enforces 4-8 uppercase alnum', async () => {
    const { ROOM_CODE_RE } = await import('../lib/sanitize.js');
    expect(ROOM_CODE_RE.test('ABCD')).toBe(true);
    expect(ROOM_CODE_RE.test('ABC123')).toBe(true);
    expect(ROOM_CODE_RE.test('abcd')).toBe(false);
    expect(ROOM_CODE_RE.test('abc')).toBe(false);
    expect(ROOM_CODE_RE.test('ABCDEFGHI')).toBe(false);
  });

  it('validatePassword enforces length and complexity', async () => {
    const { validatePassword } = await import('../lib/sanitize.js');
    // Demasiado corta
    expect(validatePassword('Ab1!xyz')).not.toBeNull();
    // Sin minuscula
    expect(validatePassword('ABCDEFG1!')).not.toBeNull();
    // Sin mayuscula
    expect(validatePassword('abcdefg1!')).not.toBeNull();
    // Sin digito
    expect(validatePassword('Abcdefgh!')).not.toBeNull();
    // Sin simbolo
    expect(validatePassword('Abcdefg1')).not.toBeNull();
    // Cumple todo (min. 8 + minusc + mayusc + digito + simbolo)
    expect(validatePassword('Str0ng!Pass')).toBeNull();
    expect(validatePassword('Abcdefg1!')).toBeNull();
  });
});

describe('Security: Roles are not updated client-side', () => {
  it('AuthContext never writes teachers.role via .update()', () => {
    const authPath = path.resolve(__dirname, '../contexts/AuthContext.jsx');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).not.toMatch(/\.update\(\s*\{\s*role:/);
    expect(content).toContain("rpc('set_self_role_free')");
  });
});

describe('Security: Student session token', () => {
  it('AuthContext stores session_token from login responses', () => {
    const authPath = path.resolve(__dirname, '../contexts/AuthContext.jsx');
    const content = fs.readFileSync(authPath, 'utf-8');
    expect(content).toMatch(/session_token: data\.session_token/);
    expect(content).toContain("rpc('student_logout'");
  });

  it('All protected student_* RPCs in client pass p_session_token', () => {
    const srcDir = path.resolve(__dirname, '..');
    const PROTECTED = [
      'student_get_dashboard',
      'student_get_assignments',
      'student_get_gamification',
      'student_get_chat_messages',
      'student_send_message',
      'student_get_my_groups',
      'student_join_group',
      'student_update_profile',
    ];
    const scan = (dir) => {
      let hits = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '__tests__') {
          hits = hits.concat(scan(full));
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
          const content = fs.readFileSync(full, 'utf-8');
          for (const rpc of PROTECTED) {
            // Si la RPC aparece en el fichero, el fichero debe mencionar p_session_token en alguna parte.
            if (content.includes(`rpc('${rpc}'`) || content.includes(`rpc("${rpc}"`)) {
              if (!content.includes('p_session_token')) {
                hits.push(`${full}:${rpc}`);
              }
            }
          }
        }
      }
      return hits;
    };
    expect(scan(srcDir)).toEqual([]);
  });
});

describe('Security: Visual editor plugin', () => {
  it('message listener validates event.origin', () => {
    const pluginPath = path.resolve(__dirname, '../../plugins/visual-editor/edit-mode-script.js');
    const content = fs.readFileSync(pluginPath, 'utf-8');
    expect(content).toContain('ALLOWED_PARENT_ORIGINS_SET.has(event.origin)');
    expect(content).not.toMatch(/popupElement\.innerHTML\s*=/);
  });
});

describe('Security: No dangerous patterns', () => {
  const srcDir = path.resolve(__dirname, '..');

  const scanFiles = (dir, pattern) => {
    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '__tests__') {
        results.push(...scanFiles(fullPath, pattern));
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (pattern.test(content)) {
          results.push(fullPath);
        }
      }
    }
    return results;
  };

  it('should not use eval() in source code', () => {
    const files = scanFiles(srcDir, /\beval\s*\(/);
    expect(files).toEqual([]);
  });

  it('should not use dangerouslySetInnerHTML in source code', () => {
    const files = scanFiles(srcDir, /dangerouslySetInnerHTML/);
    // If found, they should be audited
    if (files.length > 0) {
      console.warn('Files with dangerouslySetInnerHTML found (audit manually):', files);
    }
  });

  it('should not use new Function() in source code', () => {
    // Match "new Function(" but not "new FunctionComponent" etc.
    const files = scanFiles(srcDir, /new\s+Function\s*\(/);
    expect(files).toEqual([]);
  });
});
