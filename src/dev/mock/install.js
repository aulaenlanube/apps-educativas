// ─────────────────────────────────────────────────────────────────────────────
// Instala el modo mock (SOLO desarrollo): parchea EN SITIO el cliente único de
// Supabase (src/lib/supabase.js) para que rpc / from / channel / auth devuelvan
// fixtures. No se toca AuthContext: el flujo real (onAuthStateChange →
// from('teachers') para docente/libre; sessionStorage 'student_session' para
// alumno) construye `teacher` / `user` / `freeUser` / `student` con el mismo
// shape que en producción.
//
// Cada método parcheado comprueba la bandera en cada llamada: tras `signOut()`
// (o `?mock=off`) vuelve a delegar en el cliente real sin recargar.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from '@/lib/supabase';
import { buildWorld } from './fixtures/world.js';
import { createQueryBuilder } from './queryBuilder.js';
import { createChannelStub } from './realtimeStub.js';
import {
  createRpcResolver, createTableResolver, PASSTHROUGH_RPCS, PASSTHROUGH_TABLES, RPC_HANDLERS,
} from './handlers/index.js';
import {
  MOCK_STORAGE_KEY, readMockRole, clearMockRole, seedMockStudentSession,
  clearStudentSessionForNonStudentRole, restoreRealStudentSession,
} from './flag.js';

// Pequeña latencia artificial para que los estados de carga se vean como en real.
const LATENCY_MS = 60;

let installed = null;

async function loadAvatarCatalog() {
  try {
    const res = await fetch('/data/avatars.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch (err) {
    console.warn('[dev-mock] No se pudo leer /data/avatars.json; la colección de avatares saldrá vacía.', err);
    return [];
  }
}

function mockSession(ctx) {
  if (ctx.role === 'student') return null;
  const user = ctx.role === 'teacher' ? ctx.world.teacherUser : ctx.world.freeAuthUser;
  return {
    access_token: 'dev-mock-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'dev-mock-refresh-token',
    user,
  };
}

function patchSupabase(client, ctx) {
  const isActive = () => readMockRole() === ctx.role;
  const rpcResolver = createRpcResolver(ctx);
  const tableResolver = createTableResolver(ctx);

  const real = {
    rpc: client.rpc.bind(client),
    from: client.from.bind(client),
    channel: client.channel.bind(client),
    removeChannel: client.removeChannel.bind(client),
    removeAllChannels: client.removeAllChannels.bind(client),
  };

  // ── Datos ───────────────────────────────────────────────────────────────
  client.rpc = (fn, args = {}, options = {}) => {
    if (!isActive() || PASSTHROUGH_RPCS.has(fn)) return real.rpc(fn, args, options);
    return createQueryBuilder(`rpc:${fn}`, () => rpcResolver(fn, args), { latencyMs: LATENCY_MS, initialOp: 'rpc' });
  };

  client.from = (table) => {
    if (!isActive()) return real.from(table);
    if (PASSTHROUGH_TABLES.has(table)) {
      // Solo lectura: si algo intentara escribir, fallaría aquí y no en la BD real.
      const realBuilder = real.from(table);
      return { select: (...a) => realBuilder.select(...a) };
    }
    return createQueryBuilder(table, (state) => tableResolver(table, state), { latencyMs: LATENCY_MS });
  };

  // ── Realtime ────────────────────────────────────────────────────────────
  client.channel = (name, opts) => (isActive() ? createChannelStub(name) : real.channel(name, opts));
  client.removeChannel = (ch) => (isActive() ? Promise.resolve('ok') : real.removeChannel(ch));
  client.removeAllChannels = () => (isActive() ? Promise.resolve([]) : real.removeAllChannels());

  // ── Auth ────────────────────────────────────────────────────────────────
  const auth = client.auth;
  const realAuth = {};
  ['onAuthStateChange', 'getUser', 'getSession', 'signOut', 'signInWithPassword', 'signUp',
    'signInWithOAuth', 'resetPasswordForEmail', 'resend', 'updateUser'].forEach((m) => {
    if (typeof auth[m] === 'function') realAuth[m] = auth[m].bind(auth);
  });
  const listeners = new Set();
  const disabled = (what) => ({
    data: { user: null, session: null },
    error: { name: 'DevMockError', status: 400, message: `[dev-mock] ${what} no está disponible en modo mock. Sal con ?mock=off.` },
  });

  auth.onAuthStateChange = (callback) => {
    if (!isActive()) return realAuth.onAuthStateChange(callback);
    const entry = { callback };
    listeners.add(entry);
    // También escuchamos al cliente real, pero solo reenviamos sus eventos
    // cuando el mock ya no está activo (p. ej. login real tras salir del mock).
    const realSub = realAuth.onAuthStateChange((event, session) => {
      if (!isActive()) callback(event, session);
    });
    setTimeout(() => {
      if (isActive() && listeners.has(entry)) callback('INITIAL_SESSION', mockSession(ctx));
    }, 0);
    return {
      data: {
        subscription: {
          id: 'dev-mock-subscription',
          callback,
          unsubscribe: () => {
            listeners.delete(entry);
            realSub?.data?.subscription?.unsubscribe?.();
          },
        },
      },
    };
  };
  auth.getSession = async () => (isActive() ? { data: { session: mockSession(ctx) }, error: null } : realAuth.getSession());
  auth.getUser = async () => (isActive() ? { data: { user: mockSession(ctx)?.user ?? null }, error: null } : realAuth.getUser());
  auth.signOut = async (...a) => {
    if (!isActive()) return realAuth.signOut(...a);
    clearMockRole();
    restoreRealStudentSession();
    listeners.forEach((l) => { try { l.callback('SIGNED_OUT', null); } catch { /* noop */ } });
    console.info('[dev-mock] signOut: modo mock desactivado (el cliente vuelve a ser el real).');
    return { error: null };
  };
  auth.signInWithPassword = async (...a) => {
    if (!isActive()) return realAuth.signInWithPassword(...a);
    const session = mockSession(ctx);
    return session ? { data: { user: session.user, session }, error: null } : disabled('El login con email');
  };
  auth.signUp = async (...a) => (isActive() ? disabled('El registro') : realAuth.signUp(...a));
  auth.signInWithOAuth = async (...a) => (isActive() ? disabled('El login con Google') : realAuth.signInWithOAuth(...a));
  auth.resetPasswordForEmail = async (...a) => (isActive() ? { data: {}, error: null } : realAuth.resetPasswordForEmail(...a));
  if (realAuth.resend) auth.resend = async (...a) => (isActive() ? { data: {}, error: null } : realAuth.resend(...a));
  if (realAuth.updateUser) auth.updateUser = async (...a) => (isActive() ? { data: { user: mockSession(ctx)?.user ?? null }, error: null } : realAuth.updateUser(...a));
}

export async function installDevMock(role) {
  if (installed) return installed;
  const avatars = await loadAvatarCatalog();
  const world = buildWorld({ avatars });
  const meId = role === 'teacher' ? world.IDS.teacherEdu : role === 'free' ? world.IDS.freeMarta : world.IDS.lucia;
  const ctx = {
    world,
    role,
    meId,
    state: { selectedAvatar: new Map() },
    unknownRpcs: new Set(),
    unknownTables: new Set(),
  };

  if (role === 'student') seedMockStudentSession(world.studentSession);
  else clearStudentSessionForNonStudentRole();

  patchSupabase(supabase, ctx);
  installed = { role, world, ctx };

  // Ayuda para depurar desde la consola del navegador.
  window.__eduappsDevMock = {
    role,
    world,
    unknownRpcs: ctx.unknownRpcs,
    unknownTables: ctx.unknownTables,
    mockedRpcs: Object.keys(RPC_HANDLERS).sort(),
    storageKey: MOCK_STORAGE_KEY,
  };
  const who = { student: 'Lucía Martín (alumna, 3º ESO B)', teacher: 'Edu Torregrosa (docente)', free: 'Marta Ruiz (usuaria libre)' }[role];
  console.info(`%c[dev-mock] Modo mock ACTIVO como ${who}. Sal con ?mock=off`, 'color:#a855f7;font-weight:bold');
  return installed;
}
