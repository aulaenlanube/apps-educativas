import React, { useState, useEffect } from 'react';
import { Pencil, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import AppIcon, { hasAppIcon } from '@/components/AppIcon';
import { DashButton } from '@/components/dashboard/kit';
import { Step, WeightPicker, TermPicker } from './AssignTaskDialog';
import './teacherPanels.css';

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
      <DialogContent className="tp-root tp-dialog tp-dialog--sm">
        <header className="tp-dhead">
          <div className="tp-dhead__row">
            <span className="tp-dhead__icon"><Pencil size={24} /></span>
            <div className="tp-dhead__text">
              <DialogTitle className="tp-dhead__title">Editar tarea</DialogTitle>
              <DialogDescription className="tp-dhead__sub">Ajusta cuánto pesa y en qué evaluación cuenta</DialogDescription>
            </div>
          </div>
        </header>

        <div className="tp-dbody">
          <div className="tp-taskcard">
            {hasAppIcon(assignment.app_id)
              ? <AppIcon appId={assignment.app_id} size={48} />
              : <span className="tp-apptile__fallback">🎮</span>}
            <div style={{ minWidth: 0 }}>
              <p className="tp-taskcard__name">{assignment.title || assignment.app_name}</p>
              {assignment.title && <p className="tp-taskcard__app">{assignment.app_name}</p>}
            </div>
          </div>

          <div className="tp-steps" style={{ marginTop: 22 }}>
            <Step n={1} title="Peso en la nota final">
              <WeightPicker value={weight} onChange={setWeight} />
            </Step>
            <Step n={2} title="Evaluación">
              <TermPicker value={term} onChange={setTerm} />
            </Step>
          </div>
        </div>

        <footer className="tp-dfoot">
          <div className="tp-dfoot__actions">
            <DashButton variant="soft" onClick={() => onOpenChange(false)}>Cancelar</DashButton>
            <DashButton onClick={handleSave} disabled={loading} icon={Save}>
              {loading ? 'Guardando...' : 'Guardar'}
            </DashButton>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
