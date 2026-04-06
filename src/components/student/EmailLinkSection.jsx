import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Seccion para vincular email al alumno usando Supabase Auth.
 * Flujo:
 * 1. Alumno introduce email + contraseña
 * 2. Se crea usuario en auth.users con supabase.auth.signUp()
 * 3. Supabase envia email de verificacion automaticamente
 * 4. Se guarda auth_user_id en la tabla students
 * 5. Cuando el alumno confirma el email, se marca email_verified = true
 */
export default function EmailLinkSection({ student, studentInfo, onUpdated }) {
  const { updateStudentLocal } = useAuth();
  const { toast } = useToast();

  const currentEmail = studentInfo?.email || student?.email || null;
  const isVerified = studentInfo?.email_verified || student?.email_verified || false;
  const hasAuthLink = !!student?.auth_user_id;

  const [step, setStep] = useState(
    isVerified ? 'done' :
    currentEmail && !isVerified ? 'pending' :
    'input'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Comprobar si el email fue verificado (polling suave al estar en pending)
  useEffect(() => {
    if (step !== 'pending' || !student?.auth_user_id) return;

    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Si hay sesion activa de auth y el email esta confirmado
      if (user?.email_confirmed_at) {
        await supabase.rpc('student_confirm_email', { p_auth_user_id: student.auth_user_id });
        updateStudentLocal({ email_verified: true });
        setStep('done');
        toast({ title: 'Email verificado!' });
        onUpdated?.();
      }
    };

    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [step, student?.auth_user_id]);

  const handleLinkEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast({ variant: 'destructive', title: 'Error', description: 'Introduce un email valido' });
      return;
    }
    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Error', description: 'La contrasena debe tener al menos 6 caracteres' });
      return;
    }

    setLoading(true);

    // Verificar que el email no esté en uso por un docente
    const { data: teachers } = await supabase.from('teachers').select('id').eq('email', email.trim().toLowerCase()).limit(1);
    if (teachers && teachers.length > 0) {
      setLoading(false);
      toast({ variant: 'destructive', title: 'Error', description: 'Este email ya esta en uso por un docente' });
      return;
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { student_id: student.id, role: 'student_linked' },
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      setLoading(false);
      toast({ variant: 'destructive', title: 'Error', description: authError.message });
      return;
    }

    if (!authData?.user?.id) {
      setLoading(false);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear la cuenta' });
      return;
    }

    // Vincular auth_user_id al alumno
    const { data: linkResult, error: linkError } = await supabase.rpc('student_link_auth_user', {
      p_student_id: student.id,
      p_group_id: student.group_id,
      p_auth_user_id: authData.user.id,
      p_email: email.trim(),
    });

    setLoading(false);

    if (linkError || linkResult?.error) {
      toast({ variant: 'destructive', title: 'Error', description: linkError?.message || linkResult?.error });
      return;
    }

    // Cerrar sesion de Supabase Auth (el alumno usa auth custom, no queremos interferir)
    await supabase.auth.signOut();

    updateStudentLocal({ email: email.trim().toLowerCase(), auth_user_id: authData.user.id, email_verified: false });
    setStep('pending');
    toast({ title: 'Email registrado', description: 'Revisa tu bandeja de entrada para verificar tu email' });
  };

  const handleResendVerification = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: currentEmail,
    });
    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Email reenviado', description: 'Revisa tu bandeja de entrada' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
    >
      <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
        <Mail className="w-5 h-5 text-indigo-500" />
        Vincular email
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Vincula tu email para poder iniciar sesion de forma independiente, recuperar tu contrasena, unirte a otros grupos y practicar por tu cuenta.
      </p>

      {step === 'input' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="link-email" className="text-sm">Tu email</Label>
            <Input id="link-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alumno@email.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="link-pw" className="text-sm">Contrasena para tu cuenta</Label>
            <Input id="link-pw" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimo 6 caracteres" />
            <p className="text-[11px] text-slate-400">Esta sera tu contrasena para iniciar sesion con email</p>
          </div>
          <Button onClick={handleLinkEmail} disabled={loading || !email.trim() || password.length < 6}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <Send className="w-4 h-4 mr-1.5" />
            {loading ? 'Vinculando...' : 'Vincular email'}
          </Button>
        </div>
      )}

      {step === 'pending' && (
        <div className="space-y-3">
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Pendiente de verificacion</p>
                <p className="text-xs text-amber-600 mt-1">
                  Hemos enviado un email a <strong>{currentEmail}</strong>. Haz clic en el enlace del email para verificar tu cuenta.
                </p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleResendVerification} disabled={loading} className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
            {loading ? 'Enviando...' : 'Reenviar email de verificacion'}
          </Button>
        </div>
      )}

      {step === 'done' && (
        <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4 border border-green-200">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">{currentEmail}</p>
            <p className="text-xs text-green-600">Email verificado. Puedes iniciar sesion con tu email y contrasena.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
