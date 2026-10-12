// Galería del kit de paneles — SOLO en desarrollo (ruta /__dash-kit).
//   ?role=student|teacher|free · &theme=dark
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flame, Coins, Trophy, Gamepad2, Clock, Target, Star, BarChart3, ListChecks, MessageCircle, User, Award, Swords, Zap, BookOpen } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import {
  DashPage, DashHero, DashDock, DashCard, StatTile, ProgressRing, MiniBars, MeterRow, QuestCard,
  Pill, DashButton, DashEmpty, SectionGrid,
} from '@/components/dashboard/kit';

export default function DashKitGallery() {
  const [params] = useSearchParams();
  const role = params.get('role') || 'student';
  const dark = params.get('theme') === 'dark';
  const [tab, setTab] = useState('resumen');
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); document.documentElement.dataset.fx = 'high'; }, [dark]);
  const days = Array.from({ length: 30 }, (_, i) => ({ label: `d${i}`, value: Math.round(Math.abs(Math.sin(i * 1.7)) * 9 + (i % 7 === 0 ? 0 : 2)) }));
  return (
    <DashPage role={role}>
      <DashHero
        avatar={<UserAvatar selectedAvatarCode="astronauta" avatarEmoji="🦊" size="xl" />}
        title="¡Hola, Lucía!"
        subtitle="3º ESO B · Lengua y Literatura"
        chips={<><Pill>@lucia.martin</Pill><Pill icon={Star}>Top 3 de la clase</Pill></>}
        level={23}
        xp={18420}
        xpNext={21500}
        stats={[
          { icon: Flame, value: 12, label: 'Racha', tone: 'orange' },
          { icon: Coins, value: '8,28', label: 'Nota', tone: 'emerald' },
          { icon: Trophy, value: 20, label: 'Insignias', tone: 'amber' },
        ]}
        mascot={role === 'student'}
        actions={<><DashButton icon={Gamepad2} variant="sky">Explorar apps</DashButton><DashButton icon={Zap} variant="amber">Batalla</DashButton><DashButton icon={Swords} variant="rose">Duelo</DashButton></>}
      />
      <DashDock
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'resumen', label: 'Resumen', icon: BarChart3 },
          { id: 'tareas', label: 'Misiones', icon: ListChecks, badge: 2 },
          { id: 'logros', label: 'Logros', icon: Award },
          { id: 'mensajes', label: 'Mensajes', icon: MessageCircle, badge: 3 },
          { id: 'perfil', label: 'Perfil', icon: User },
        ]}
      />
      <SectionGrid cols={4}>
        <StatTile icon={Gamepad2} value={64} label="Partidas" sub="48 práctica · 16 examen" tone="blue" />
        <StatTile icon={Clock} value="4 h 55 min" label="Tiempo total" sub="Sesión más larga: 9 min" tone="violet" />
        <StatTile icon={Target} value={86.5} format={(v) => `${v.toFixed(1)} %`} label="Precisión" sub="768 de 888" tone="emerald" progress={0.865} />
        <StatTile icon={Trophy} value="10/10" label="Mejor nota" sub="Media examen 8,3" tone="amber" />
      </SectionGrid>
      <SectionGrid cols={2}>
        <DashCard icon={Flame} title="Actividad" subtitle="Últimos 30 días" tone="orange">
          <MiniBars data={days} tone="orange" />
        </DashCard>
        <DashCard icon={BookOpen} title="Por asignatura" tone="indigo" actions={<Pill>5 asignaturas</Pill>}>
          <MeterRow label="Lengua" value={43} max={43} right="43 · 84,9 %" tone="violet" />
          <MeterRow label="Biología" value={8} max={43} right="8 · 86,7 %" tone="emerald" />
          <MeterRow label="Inglés" value={8} max={43} right="8 · 94,7 %" tone="blue" />
          <MeterRow label="Historia" value={4} max={43} right="4 · 87,2 %" tone="amber" />
        </DashCard>
      </SectionGrid>
      <DashCard icon={ListChecks} title="Misiones" subtitle="Tareas de tu profe" tone="amber">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <QuestCard appId="crucigrama" title="Crucigrama del Lazarillo" subtitle="Crucigrama · nota mínima 5" due="Vence mañana" reward="Peso ×2" onPlay={() => {}} />
          <QuestCard appId="ahorcado" title="Ahorcado: vocabulario" subtitle="Ahorcado" status="done" nota={9.2} due="Entregada" onPlay={() => {}} playLabel="Mejorar" />
          <QuestCard appId="sopa-de-letras" title="Ortografía b/v" subtitle="Sopa de letras" status="overdue" nota={3.5} due="Venció hace 2 días" onPlay={() => {}} />
          <QuestCard appId="snake" title="Duelo: Snake" subtitle="Duelo contra rival oculto" status="duel" reward="+0,10 si ganas" onPlay={() => {}} playLabel="Entrar" />
        </div>
      </DashCard>
      <SectionGrid cols={3}>
        <DashCard icon={Award} title="Nota actual" tone="emerald">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ProgressRing value={8.28} size={140} stroke={10}><span style={{ fontSize: 34 }}>8,28</span></ProgressRing>
          </div>
        </DashCard>
        <DashCard icon={MessageCircle} title="Mensajes" tone="pink"><DashEmpty title="Sin mensajes">Cuando tu profe te escriba, aparecerá aquí.</DashEmpty></DashCard>
        <DashCard icon={Star} title="Botones" tone="violet">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <DashButton>Primario</DashButton><DashButton variant="soft">Suave</DashButton><DashButton variant="emerald" size="sm">Verde</DashButton>
          </div>
        </DashCard>
      </SectionGrid>
    </DashPage>
  );
}
