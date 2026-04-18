import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export default function EditAssignmentDialog({ open, onOpenChange, assignment, onUpdated }) {
  const { toast } = useToast();
  const [weight, setWeight] = useState(1);
  const [term, setTerm] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && assignment) {
      setWeight(Number(assignment.weight) || 1);
      setTerm(Number(assignment.term) || 1);
    }
  }, [open, assignment]);

  const handleSave = async () => {
    if (!assignment?.id) return;
    setLoading(true);
    const { data, error } = await supabase.rpc('teacher_update_assignment', {
      p_assignment_id: assignment.id,
      p_weight: weight,
      p_term: term,
    });
    setLoading(false);
    if (error || data?.error) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message || data?.error });
    } else {
      toast({ title: 'Tarea actualizada' });
      onOpenChange(false);
      onUpdated?.();
    }
  };

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-purple-500" />
            Editar tarea
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {assignment.title || assignment.app_name}
            </p>
            {assignment.title && (
              <p className="text-xs text-slate-500 truncate">{assignment.app_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Peso en la nota final</Label>
            <div className="flex gap-2">
              {[
                { v: 1, label: 'x1', hint: 'Normal' },
                { v: 2, label: 'x2', hint: 'Cuenta doble' },
                { v: 3, label: 'x3', hint: 'Cuenta triple' },
              ].map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setWeight(opt.v)}
                  className={`flex-1 flex flex-col items-center py-2 rounded-xl border transition-all ${
                    weight === opt.v
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white border-transparent shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300'
                  }`}
                >
                  <span className="text-lg font-bold leading-tight">{opt.label}</span>
                  <span className={`text-[11px] ${weight === opt.v ? 'text-white/80' : 'text-slate-400'}`}>{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Evaluación</Label>
            <div className="flex gap-2">
              {[
                { v: 1, label: '1ª Evaluación' },
                { v: 2, label: '2ª Evaluación' },
                { v: 3, label: '3ª Evaluación' },
              ].map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setTerm(opt.v)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                    term === opt.v
                      ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white border-transparent shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
