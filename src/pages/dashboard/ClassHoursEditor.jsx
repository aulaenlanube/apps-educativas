import React, { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WEEKDAYS = [
  { id: 1, label: 'Lun' },
  { id: 2, label: 'Mar' },
  { id: 3, label: 'Mié' },
  { id: 4, label: 'Jue' },
  { id: 5, label: 'Vie' },
  { id: 6, label: 'Sáb' },
  { id: 7, label: 'Dom' },
];

const selectCls = 'h-9 rounded-md border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200';
const timeCls = 'h-9 rounded-md border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200';

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
    <div className="space-y-2">
      {hours.length === 0 && (
        <div className="text-center py-3 text-xs text-slate-400 border border-dashed border-slate-200 rounded-md">
          Sin franjas. Añade al menos 1 para permitir duelos y batallas.
        </div>
      )}
      {hours.map((h, idx) => {
        const mins = minutesOf(h);
        const invalid = mins <= 0;
        return (
          <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg border ${invalid ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
            <select className={selectCls} value={h.weekday} onChange={(e) => update(idx, 'weekday', Number(e.target.value))}>
              {WEEKDAYS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            <input type="time" className={timeCls} value={h.start_time}
                  onChange={(e) => update(idx, 'start_time', e.target.value)} />
            <span className="text-slate-400 text-sm">–</span>
            <input type="time" className={timeCls} value={h.end_time}
                  onChange={(e) => update(idx, 'end_time', e.target.value)} />
            <span className={`text-[11px] tabular-nums ${invalid ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>
              {invalid ? 'inválido' : fmtDuration(mins)}
            </span>
            <button type="button" onClick={() => remove(idx)}
                    className="ml-auto p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    title="Quitar franja">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
        <div className="text-[11px]">
          <span className={overLimit ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
            Total: {fmtDuration(total)} / 4 h
          </span>
          {!overLimit && remaining > 0 && (
            <span className="text-slate-400"> · te quedan {fmtDuration(remaining)}</span>
          )}
          {overLimit && (
            <span className="text-rose-500"> · excedes {fmtDuration(total - MAX_WEEKLY_MINUTES)}</span>
          )}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={add} disabled={remaining <= 0}>
          <Plus className="w-4 h-4 mr-1" /> Añadir franja
        </Button>
      </div>
    </div>
  );
}
