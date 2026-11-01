/**
 * Duelo 1 vs 1 del motor de mapas (GeoDuel): anfitrión e invitado montados a
 * la vez y unidos por un canal falso que, como Supabase, no hace eco al
 * emisor. Se juega una partida completa con relojes falsos.
 */
import React, { useContext } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, act, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const { DuelCtx } = vi.hoisted(() => {
  // eslint-disable-next-line global-require
  const { createContext: cc } = require('react');
  return { DuelCtx: cc(null) };
});

vi.mock('@/hooks/useDuel', () => ({ default: function useDuelMock() { return useContext(DuelCtx); } }));
vi.mock('@/components/duel/DuelChatBar', () => ({ default: () => null }));
vi.mock('@/components/ui/UserAvatar', () => ({ default: () => null }));
vi.mock('canvas-confetti', () => ({ default: () => {} }));

// eslint-disable-next-line import/first
import GeoDuel, { duelPoints, duelWinner, QUESTION_MS, DUEL_QUESTIONS } from '@/apps/_shared/geo/GeoDuel';


/* ───────── canal falso ───────── */
function makeBus() {
  const handlers = { host: [], guest: [] };
  const sent = { host: [], guest: [] };
  const presence = [{ id: 'h' }, { id: 'g' }];
  const channelFor = (side) => {
    const other = side === 'host' ? 'guest' : 'host';
    return {
      isConnected: true,
      presence,
      broadcast: (event, payload) => {
        sent[side].push(event);
        // Sin eco al emisor: solo lo recibe el otro.
        setTimeout(() => handlers[other].filter((h) => h.event === event).forEach((h) => h.fn(JSON.parse(JSON.stringify(payload)))), 0);
      },
      onBroadcast: (event, fn) => {
        handlers[side].push({ event, fn });
        return () => {};
      },
    };
  };
  return { host: channelFor('host'), guest: channelFor('guest'), sent };
}

/* ───────── app falsa ───────── */
const OPTIONS = ['París', 'Roma', 'Berlín', 'Lisboa'];
const fakeWorld = { layer: () => new Map(), views: { world: { x: 0, y: 0, w: 100, h: 50 } }, features: new Map(), nameOf: () => '' };
const fakeConfig = {
  shell: { accent: '#0ea5e9', accent2: '#10b981' },
  levelFor: () => 3,
  load: () => Promise.resolve(fakeWorld),
  buildRound: (_ctx, gameId, n) => Array.from({ length: n }, (_, i) => ({
    game: 'capitales',
    kind: 'choice',
    prompt: `Pregunta ${i + 1}`,
    subject: { type: 'text', text: `Capital ${i + 1}`, icon: 'capital' },
    options: OPTIONS.map((o) => ({ key: o, label: o })),
    answer: ['París'],
    answerLabel: 'París',
  })),
};

const player = (id, name, isHost) => ({ id, name, type: 'student', isHost, role: isHost ? 'host' : 'guest' });

function Mount({ value, onGameComplete }) {
  return (
    <DuelCtx.Provider value={value}>
      <MemoryRouter initialEntries={['/curso/primaria/5/ciencias-sociales/app/explorador-mundo?duel=d1']}>
        <Routes>
          <Route path="/curso/:level/:grade/:subjectId/app/:appId" element={<GeoDuel config={fakeConfig} onGameComplete={onGameComplete} />} />
        </Routes>
      </MemoryRouter>
    </DuelCtx.Provider>
  );
}

// Avanza el reloj en pasos cortos para que React aplique efectos entre medias.
const tick = async (ms) => {
  for (let t = 0; t < ms; t += 100) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => { await vi.advanceTimersByTimeAsync(Math.min(100, ms - t)); });
  }
};

describe('Duelo del motor de mapas', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    // mockReset (vitest.config) deja sin implementación el matchMedia del setup.
    window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('puntos: 100 por acierto + hasta 50 por rapidez', () => {
    expect(duelPoints(false, 0)).toBe(0);
    expect(duelPoints(true, 0)).toBe(150);
    expect(duelPoints(true, QUESTION_MS)).toBe(100);
    expect(duelPoints(true, QUESTION_MS / 2)).toBe(125);
  });

  it('ganador: puntos, luego aciertos, luego tiempo', () => {
    const base = (sa, sb, aa, ab) => ({ scores: { a: sa, b: sb }, answers: { a: aa, b: ab } });
    expect(duelWinner(base(300, 200, {}, {}), 'a', 'b')).toBe('a');
    expect(duelWinner(base(100, 100, { 0: { correct: true, ms: 9000 } }, { 0: { correct: false, ms: 1000 }, 1: { correct: true, ms: 1000 } }), 'a', 'b')).toBe('b');
    expect(duelWinner(base(100, 100, { 0: { correct: true, ms: 3000 } }, { 0: { correct: true, ms: 5000 } }), 'a', 'b')).toBe('a');
  });

  it('partida completa entre anfitrión e invitado', async () => {
    const bus = makeBus();
    const host = player('h', 'Ana', true);
    const guest = player('g', 'Leo', false);
    const reportHost = vi.fn(() => Promise.resolve());
    const reportGuest = vi.fn(() => Promise.resolve());
    const completeHost = vi.fn();
    const completeGuest = vi.fn();
    const hostDuel = { duelId: 'd1', me: host, rival: guest, channel: bus.host, reportResult: reportHost, loading: false, err: null };
    const guestDuel = { duelId: 'd1g', me: guest, rival: host, channel: bus.guest, reportResult: reportGuest, loading: false, err: null };

    const { container: hostBox } = render(<div data-testid="host"><Mount value={hostDuel} onGameComplete={completeHost} /></div>);
    const { container: guestBox } = render(<div data-testid="guest"><Mount value={guestDuel} onGameComplete={completeGuest} /></div>);
    await tick(50);

    // Cuenta atrás de 3 s y primera pregunta en los dos.
    await tick(3100);
    expect(within(hostBox).getByText('Pregunta 1')).toBeInTheDocument();
    expect(within(guestBox).getByText('Pregunta 1')).toBeInTheDocument();

    for (let i = 0; i < DUEL_QUESTIONS; i += 1) {
      // El anfitrión acierta siempre; el invitado falla las preguntas pares.
      await act(async () => { within(hostBox).getByText('París').click(); });
      await tick(300);
      await act(async () => { within(guestBox).getByText(i % 2 === 0 ? 'Roma' : 'París').click(); });
      await tick(100);
      // Revelado (ambos respondieron) y paso a la siguiente.
      expect(within(guestBox).getAllByText(/Respuesta correcta/).length).toBeGreaterThan(0);
      await tick(3000);
    }

    expect(within(hostBox).getByText('¡Has ganado el duelo!')).toBeInTheDocument();
    expect(within(guestBox).getByText('Has perdido el duelo')).toBeInTheDocument();
    expect(reportHost).toHaveBeenCalledTimes(1);
    expect(reportHost).toHaveBeenCalledWith('h');
    expect(reportGuest).not.toHaveBeenCalled();
    expect(completeHost).toHaveBeenCalledTimes(1);
    expect(completeHost.mock.calls[0][0].mode).toBe('duel');
    expect(completeGuest).not.toHaveBeenCalled();
    expect(bus.sent.guest.filter((e) => e === 'answer')).toHaveLength(DUEL_QUESTIONS);
    expect(screen.getAllByText(/puntos/).length).toBeGreaterThan(0);
  });

  it('si nadie responde, la pregunta se cierra al acabar el tiempo', async () => {
    const bus = makeBus();
    const hostDuel = { duelId: 'd2', me: player('h', 'Ana', true), rival: player('g', 'Leo', false), channel: bus.host, reportResult: vi.fn(() => Promise.resolve()), loading: false, err: null };
    const { container } = render(<Mount value={hostDuel} onGameComplete={vi.fn()} />);
    await tick(3200);
    expect(within(container).getByText('Pregunta 1')).toBeInTheDocument();
    await tick(QUESTION_MS + 600);
    expect(within(container).getByText('Se acabó el tiempo')).toBeInTheDocument();
    await tick(3000);
    expect(within(container).getByText('Pregunta 2')).toBeInTheDocument();
  });
});
