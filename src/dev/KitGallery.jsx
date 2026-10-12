// Galería del kit de interfaz de juego — SOLO en desarrollo (ruta /__kit).
// Muestra cada pieza de src/apps/_shared/kit con datos de ejemplo para revisar
// el diseño sin tener que jugar una partida entera. ?theme=dark para el oscuro.
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trophy, Flame, Clock, Target, Type, AlignLeft, Zap, RefreshCw, LayoutGrid } from 'lucide-react';
import {
  GameShell, GameHeader, Hud, HudStat, Lives, ProgressDots, ProgressBar, Panel, Chip, KeyTile,
  AnswerOption, GameButton, Segmented, ModeSelect, RoundBanner, ResultsScreen, FeedbackItem,
  GameLoading, GameEmpty,
} from '@/apps/_shared/kit';
import { AppMetaProvider } from '@/apps/_shared/kit/AppMetaContext';

const META = { appId: 'anagramas', name: '🔤 Anagramas', description: 'Ordena las letras desordenadas para descubrir la palabra escondida.', level: 'primaria', grade: '4' };

export default function KitGallery() {
  const [params] = useSearchParams();
  const dark = params.get('theme') === 'dark';
  const section = params.get('section') || 'all';
  const [seg, setSeg] = useState('a');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.dataset.fx = 'high';
  }, [dark]);
  const show = (k) => section === 'all' || section === k;

  return (
    <AppMetaProvider value={META}>
      <div style={{ minHeight: '100vh', padding: 28, display: 'flex', flexDirection: 'column', gap: 28, background: dark ? '#0b0a24' : 'linear-gradient(180deg,#3b6fb6,#1b2a4a)' }}>
        {show('modes') && (
          <GameShell>
            <ModeSelect
              onSelect={() => {}}
              onHelp={() => {}}
              onStudy={() => {}}
              modes={[
                { id: 'easy', tone: 'easy', title: 'Fácil', desc: 'Con pistas y sin límite de tiempo.', features: ['Pistas ilimitadas', 'Sin cronómetro'] },
                { id: 'medium', tone: 'medium', title: 'Medio', desc: 'Algunas ayudas y un poco de prisa.', features: ['1 pista por palabra', '60 s por palabra'] },
                { id: 'exam', tone: 'exam', title: 'Examen', desc: '10 palabras sin ayudas. Nota sobre 10.', features: ['Nota sobre 10', 'Puntos por rapidez'] },
              ]}
              extra={<Segmented value={seg} onChange={setSeg} options={[{ value: 'a', label: 'Palabras', icon: Type }, { value: 'b', label: 'Frases', icon: AlignLeft }]} />}
            />
          </GameShell>
        )}

        {show('play') && (
          <GameShell accent="#0ea5e9" accent2="#6366f1">
            <GameHeader
              mode="medium"
              onHelp={() => {}}
              onStudy={() => {}}
              right={(
                <Hud>
                  <HudStat icon={Trophy} tone="score" value={1250} label="Puntos" />
                  <HudStat icon={Flame} tone="streak" value={4} label="Racha" />
                  <HudStat icon={Clock} tone="time" value="0:42" label="Tiempo" />
                </Hud>
              )}
            />
            <ProgressDots total={10} current={4} results={[true, true, false, true]} />
            <ProgressBar value={0.62} tone="warn" label="Tiempo restante" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Panel variant="screen" style={{ display: 'grid', placeItems: 'center', minHeight: 120 }}>
                <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: '.2em' }}>L A P I Z</span>
              </Panel>
              <Panel variant="surface">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((l, i) => (
                    <KeyTile key={l} state={['idle', 'correct', 'wrong', 'selected', 'hint', 'idle', 'idle'][i]}>{l}</KeyTile>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}><Lives total={5} left={3} /></div>
              </Panel>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <AnswerOption letter="A">Mamífero</AnswerOption>
              <AnswerOption letter="B" state="correct">Ave</AnswerOption>
              <AnswerOption letter="C" state="wrong">Reptil</AnswerOption>
              <AnswerOption letter="D" state="selected">Anfibio</AnswerOption>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <GameButton icon={Zap}>Comprobar</GameButton>
              <GameButton variant="success">Correcto</GameButton>
              <GameButton variant="danger">Rendirse</GameButton>
              <GameButton variant="warning">Pista</GameButton>
              <GameButton variant="soft" icon={LayoutGrid}>Cambiar modo</GameButton>
              <GameButton variant="ghost" icon={RefreshCw}>Saltar</GameButton>
              <Chip>Tema: Lengua</Chip><Chip tone="accent">Palabra</Chip><Chip tone="good">+10</Chip><Chip tone="bad">-1</Chip>
            </div>
            <RoundBanner show status="won" title="¡Correcto!" subtitle="+120 puntos · racha de 4" action={() => {}} actionLabel="Siguiente" />
            <RoundBanner show status="lost" title="¡Casi!" subtitle="La respuesta era: LÁPIZ" action={() => {}} actionLabel="Siguiente" />
          </GameShell>
        )}

        {show('results') && [9.2, 6, 3.4].map((n) => (
          <GameShell key={n}>
            <ResultsScreen
              nota={n}
              points={Math.round(n * 187)}
              stats={[
                { icon: Target, tone: 'good', label: 'Aciertos', value: `${Math.round(n)}/10` },
                { icon: Flame, tone: 'streak', label: 'Mejor racha', value: 5 },
                { icon: Clock, tone: 'time', label: 'Tiempo', value: '2:14' },
              ]}
              actions={[{ label: 'Repetir examen', onClick: () => {} }, { label: 'Cambiar de modo', onClick: () => {}, icon: LayoutGrid, variant: 'soft' }]}
            >
              <FeedbackItem index={1} ok title="MARIPOSA">Insecto con alas de colores.</FeedbackItem>
              <FeedbackItem index={2} ok={false} title="CIGÜEÑA">Tu respuesta: CIGUENA</FeedbackItem>
            </ResultsScreen>
          </GameShell>
        ))}

        {show('states') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <GameShell><GameLoading /></GameShell>
            <GameShell><GameEmpty title="Aún no hay palabras">No hay contenido para esta asignatura todavía.</GameEmpty></GameShell>
          </div>
        )}
      </div>
    </AppMetaProvider>
  );
}
