// Galería de ilustraciones — SOLO en desarrollo (ruta /__art, ver main.jsx).
// Compara el icono antiguo con el nuevo (reposo y hover forzado) sobre las
// mismas superficies que usa la web. La usa tools/art-shots.mjs para sacar
// capturas: /__art?set=grade-primaria | subject-set1 | app-set2 …
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArtFrame from '@/components/art/ArtFrame';
import GradeCardIcon from '@/components/GradeCardIcon';
import SubjectIcon from '@/components/SubjectIcon';
import AppIcon from '@/components/AppIcon';
import BadgeIcon, { BADGE_SVGS } from '@/components/ui/BadgeIcon';
import BADGE_OVERRIDES from '@/components/icons/badge';
import badge1 from '@/components/icons/badge/set1';
import badge2 from '@/components/icons/badge/set2';
import badge3 from '@/components/icons/badge/set3';
import SETS from './art-sets.json';
import gradePrimaria from '@/components/icons/grade/primaria';
import gradeSecundaria from '@/components/icons/grade/secundaria';
import subject1 from '@/components/icons/subject/set1';
import subject2 from '@/components/icons/subject/set2';
import subject3 from '@/components/icons/subject/set3';
import subject4 from '@/components/icons/subject/set4';
import app1 from '@/components/icons/app/set1';
import app2 from '@/components/icons/app/set2';
import app3 from '@/components/icons/app/set3';

const MAPS = {
  'grade-primaria': gradePrimaria,
  'grade-secundaria': gradeSecundaria,
  'subject-set1': subject1,
  'subject-set2': subject2,
  'subject-set3': subject3,
  'subject-set4': subject4,
  'app-set1': app1,
  'app-set2': app2,
  'app-set3': app3,
  'badge-set1': badge1,
  'badge-set2': badge2,
  'badge-set3': badge3,
};

const keyOf = (path) => {
  const m = path.match(/icons\/(\w+)\/(\w+)\.jsx$/);
  return m ? `${m[1]}-${m[2]}` : path;
};
const IDS = Object.fromEntries(Object.entries(SETS).map(([p, ids]) => [keyOf(p), ids]));

const GRADE_BG = {
  'primaria-1': 'from-red-400 to-pink-500', 'primaria-2': 'from-orange-400 to-red-500', 'primaria-3': 'from-yellow-400 to-orange-500',
  'primaria-4': 'from-green-400 to-yellow-500', 'primaria-5': 'from-blue-400 to-green-500', 'primaria-6': 'from-purple-400 to-blue-500',
  'eso-1': 'from-indigo-500 to-purple-600', 'eso-2': 'from-purple-500 to-pink-600', 'eso-3': 'from-pink-500 to-red-600', 'eso-4': 'from-red-500 to-orange-600',
  'bachillerato-1': 'from-emerald-600 to-teal-700', 'bachillerato-2': 'from-teal-600 to-cyan-700', 'ad-1': 'from-teal-500 via-cyan-600 to-indigo-600',
};

const Label = ({ children }) => (
  <div style={{ font: '600 11px/1.2 ui-monospace, monospace', color: '#cbd5e1', marginBottom: 6 }}>{children}</div>
);

const Missing = ({ size }) => (
  <div style={{ width: size, height: size, display: 'grid', placeItems: 'center', border: '2px dashed rgba(255,255,255,.35)', borderRadius: 12, color: '#fff', font: '600 11px sans-serif' }}>pendiente</div>
);

function NewIcon({ Icon, size, hover }) {
  if (!Icon) return <Missing size={size} />;
  return (
    <div className={hover ? 'art-force-hover' : ''}>
      <ArtFrame style={{ width: size, height: size }}><Icon /></ArtFrame>
    </div>
  );
}

const RARITIES = ['common', 'rare', 'epic', 'legendary', 'mythic'];

function BadgeRow({ code, has }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
      <div><Label>{code}</Label><BadgeIcon code={code} rarity="epic" size={36} /></div>
      {has ? RARITIES.map((r) => (
        <div key={r}><Label>{r}</Label><BadgeIcon code={code} rarity={r} size={r === 'epic' ? 88 : 56} /></div>
      )) : <Missing size={88} />}
      {has && <div><Label>animada ×1,6</Label><BadgeIcon code={code} rarity="epic" size={140} animated /></div>}
    </div>
  );
}

function GradeRow({ id, Icon }) {
  const [type, grade] = [id.replace(/-\d+$/, ''), id.match(/\d+$/)[0]];
  const card = (child, label) => (
    <div>
      <Label>{label}</Label>
      <div className={`bg-gradient-to-br ${GRADE_BG[id]}`} style={{ width: 230, height: 230, borderRadius: 28, display: 'grid', placeItems: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.45), 0 18px 40px -18px rgba(0,0,0,.6)' }}>
        {child}
      </div>
    </div>
  );
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
      {card(<GradeCardIcon type={type} grade={grade} />, `${id} · componente`)}
      {card(<NewIcon Icon={Icon} size={160} />, 'nuevo')}
      {card(<NewIcon Icon={Icon} size={160} hover />, 'nuevo · hover')}
    </div>
  );
}

const SURFACES = {
  light: { background: 'rgba(255,255,255,.92)', boxShadow: 'inset 0 1px 0 #fff, 0 10px 30px -12px rgba(15,10,60,.5)' },
  dark: { background: 'rgba(24,20,52,.92)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 10px 30px -12px rgba(0,0,0,.6)' },
};

function SmallRow({ kind, id, Icon }) {
  const size = kind === 'subject' ? 58 : 64;
  const Old = kind === 'subject' ? <SubjectIcon subjectId={id} /> : <AppIcon appId={id} size={size} />;
  const tile = (child, surface, label, pad = 14) => (
    <div>
      <Label>{label}</Label>
      <div style={{ ...SURFACES[surface], padding: pad, borderRadius: 20, display: 'grid', placeItems: 'center' }}>{child}</div>
    </div>
  );
  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {tile(Old, 'light', `${id} · componente`)}
      {tile(<NewIcon Icon={Icon} size={size} />, 'light', 'nuevo')}
      {tile(<NewIcon Icon={Icon} size={size} hover />, 'light', 'hover')}
      {tile(<NewIcon Icon={Icon} size={size} />, 'dark', 'oscuro')}
      {tile(<NewIcon Icon={Icon} size={size * 2.25} />, 'light', 'zoom ×2,25', 10)}
    </div>
  );
}

export default function ArtGallery() {
  const [params] = useSearchParams();
  const set = params.get('set') || 'grade-primaria';
  const only = params.get('only');
  const ids = (IDS[set] || []).filter((x) => !only || only.split(',').includes(x));
  const map = MAPS[set] || {};
  const kind = set.split('-')[0];

  useEffect(() => {
    const prev = document.documentElement.dataset.fx;
    document.documentElement.dataset.fx = 'high';
    return () => { document.documentElement.dataset.fx = prev; };
  }, []);

  if (set === 'badge') {
    const codes = [...Object.keys(BADGE_OVERRIDES), ...Object.keys(BADGE_SVGS)];
    const from = Number(params.get('from') || 0);
    const to = Number(params.get('to') || codes.length);
    const rarity = params.get('rarity') || 'common';
    return (
      <div style={{ minHeight: '100vh', padding: 28, background: '#f5f3ff' }}>
        <h1 style={{ font: '800 20px system-ui', margin: '0 0 16px' }}>Insignias {from}–{to} de {codes.length} · {rarity}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 120px)', gap: 16 }}>
          {codes.slice(from, to).map((c) => (
            <div key={c} style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
              <BadgeIcon code={c} rarity={rarity} size={88} />
              <span style={{ font: '600 10px ui-monospace, monospace', color: '#4c1d95', textAlign: 'center' }}>{c}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: 28, background: 'linear-gradient(160deg, #0f0c29, #1e1b4b 55%, #2e1065)' }}>
      <h1 style={{ color: '#fff', font: '800 22px system-ui', margin: '0 0 6px' }}>Galería de ilustraciones · {set}</h1>
      <p style={{ color: '#a5b4fc', font: '500 13px system-ui', margin: '0 0 24px' }}>
        Sets: {Object.keys(IDS).join(' · ')}. Filtra con ?only=id1,id2
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {ids.map((id) => (kind === 'grade'
          ? <GradeRow key={id} id={id} Icon={map[id]} />
          : kind === 'badge'
            ? <BadgeRow key={id} code={id} has={!!map[id]} />
            : <SmallRow key={id} kind={kind} id={id} Icon={map[id]} />))}
      </div>
    </div>
  );
}
