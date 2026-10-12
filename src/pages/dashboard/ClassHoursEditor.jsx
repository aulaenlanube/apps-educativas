import React, { useMemo } from 'react';
import { Plus, Trash2, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import './TeacherDashboard.css';

const WEEKDAYS = [
  { id: 1, label: 'Lun' },
  { id: 2, label: 'Mar' },
  { id: 3, label: 'Mié' },
  { id: 4, label: 'Jue' },
  { id: 5, label: 'Vie' },
  { id: 6, label: 'Sáb' },
  { id: 7, label: 'Dom' },
];

export const MAX_WEEKLY_MINUTES = 240; // 4 horas totales
export const MIN_CLASS_HOURS = 1;

export function normalizeHoursFromRpc(list) {
  return (list || []).map(h => ({
    weekday: Number(h.weekday),
    start_time: String(h.start_time || '09:00').slice(0, 5),
    end_time:   String(h.end_time   || '10:00').slice(0, 5),
  }));
}

function minutesOf(h) {
  if (!h?.start_time || !h?.end_time) return 0;
  const [sh, sm] = h.start_time.split(':').map(Number);
  const [eh, em] = h.end_time.split(':').map(Number);
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
}

export function totalMinutes(hours) {
  return (hours || []).reduce((acc, h) => acc + minutesOf(h), 0);
}

function fmtDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export default function ClassHoursEditor({ hours, onChange }) {
  const total = useMemo(() => totalMinutes(hours), [hours]);
  const remaining = Math.max(0, MAX_WEEKLY_MINUTES - total);
  const overLimit = total > MAX_WEEKLY_MINUTES;

  const add = () => {
    onChange([...hours, { weekday: 1, start_time: '09:00', end_time: '10:00' }]);
  };
  const remove = (idx) => onChange(hours.filter((_, i) => i !== idx));
  const update = (idx, field, value) => onChange(hours.map((h, i) => (i === idx ? { ...h, [field]: value } : h)));

  return (
    <div className="tdb-hours">
      {hours.length === 0 && (
        <div className="tdb-hours__empty">
          <CalendarClock size={16} />
          Sin franjas. Añade al menos 1 para permitir duelos y batallas.
        </div>
      )}
      {hours.map((h, idx) => {
        const mins = minutesOf(h);
        const invalid = mins <= 0;
        return (
          <div key={idx} className={`tdb-slotrow ${invalid ? 'is-invalid' : ''}`}>
            <div className="tdb-slotrow__days" role="radiogroup" aria-label={`Día de la franja ${idx + 1}`}>
              {WEEKDAYS.map(d => (
                <button
                  key={d.id}
                  type="button"
                  role="radio"
                  aria-checked={h.weekday === d.id}
                  className={`tdb-day ${h.weekday === d.id ? 'is-on' : ''}`}
                  onClick={() => update(idx, 'weekday', Number(d.id))}
                >
                  {d.label}
                </button>
              ))}
              <button type="button" onClick={() => remove(idx)}
                      className="tdb-slotrow__del"
                      title="Quitar franja">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="tdb-slotrow__times">
              <input type="time" value={h.start_time} aria-label="Hora de inicio"
                    onChange={(e) => update(idx, 'start_time', e.target.value)} />
              <span className="tdb-slotrow__sep">–</span>
              <input type="time" value={h.end_time} aria-label="Hora de fin"
                    onChange={(e) => update(idx, 'end_time', e.target.value)} />
              <span className={`tdb-slotrow__dur ${invalid ? 'is-bad' : ''}`}>
                {invalid ? 'inválido' : fmtDuration(mins)}
              </span>
            </div>
          </div>
        );
      })}
      <div className="tdb-hours__foot">
        <div className="tdb-hours__meter">
          <div className="tdb-hours__meta">
            <span className={overLimit ? 'is-bad' : ''}>
              Total: <strong>{fmtDuration(total)}</strong> / 4 h
            </span>
            {!overLimit && remaining > 0 && (
              <span>te quedan {fmtDuration(remaining)}</span>
            )}
            {overLimit && (
              <span className="is-bad">excedes {fmtDuration(total - MAX_WEEKLY_MINUTES)}</span>
            )}
          </div>
          <span className={`tdb-hours__track ${overLimit ? 'is-bad' : ''}`}>
            <i style={{ transform: `scaleX(${Math.min(1, total / MAX_WEEKLY_MINUTES)})` }} />
          </span>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={add} disabled={remaining <= 0}>
          <Plus className="w-4 h-4 mr-1" /> Añadir franja
        </Button>
      </div>
    </div>
  );
}
