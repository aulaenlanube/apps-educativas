import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Lock, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';

const GroupLoginPage = () => {
  const { groupCode } = useParams();
  const navigate = useNavigate();
  const { signInStudent, studentSetPassword, isAuthenticated, isStudent } = useAuth();
  const { toast } = useToast();

  const [groupInfo, setGroupInfo] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Flujo crear contrasena
  const [step, setStep] = useState('login'); // login | password | setPassword
  const [pendingStudentId, setPendingStudentId] = useState(null);
  const [pendingDisplayName, setPendingDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Redirigir si ya autenticado
  useEffect(() => {
    if (isAuthenticated && isStudent) navigate('/mi-panel');
  }, [isAuthenticated, isStudent, navigate]);

  // Cargar info del grupo
  useEffect(() => {
    if (!groupCode) return;
    let cancelled = false;
    setLoadingGroup(true);
    (async () => {
      try {
        const { data, error } = await supabase.rpc('get_group_public_info', { p_group_code: groupCode.toUpperCase() });
        if (cancelled) return;
        if (error || !data) {
          setNotFound(true);
        } else {
          setGroupInfo(data);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoadingGroup(false);
      }
    })();
    return () => { cancelled = true; };
  }, [groupCode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const code = groupInfo?.group_code || groupCode.toUpperCase();

    if (step === 'login') {
      const result = await signInStudent(code, username, '');
      setLoading(false);
      if (result.needsPassword) {
        setPendingStudentId(result.studentId);
        setPendingDisplayName(result.displayName);
        setStep('setPassword');
        return;
      }
      if (result.error) {
        if (result.error.message === 'Contrasena incorrecta') {
          setStep('password');
          return;
        }
        toast({ variant: 'destructive', title: 'Error', description: result.error.message });
        return;
      }
      navigate('/mi-panel');
    } else if (step === 'password') {
      const result = await signInStudent(code, username, password);
      setLoading(false);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error.message });
        return;
      }
      navigate('/mi-panel');
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      toast({ variant: 'destructive', title: 'Error', description: 'La contrasena debe tener al menos 4 caracteres' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Las contrasenas no coinciden' });
      return;
    }
    setLoading(true);
    const code = groupInfo?.group_code || groupCode.toUpperCase();
    const result = await studentSetPassword(pendingStudentId, code, username, newPassword);
    setLoading(false);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error.message });
      return;
    }
    toast({ title: 'Contrasena creada', description: 'Ya puedes acceder con tu contrasena' });
    navigate('/mi-panel');
  };

  return (
    <div>
      <Header />
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {loadingGroup ? (
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-12 text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Buscando grupo...</p>
            </div>
          ) : notFound ? (
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Grupo no encontrado</h2>
              <p className="text-slate-500 mb-6">
                El codigo <span className="font-mono font-bold">{groupCode?.toUpperCase()}</span> no corresponde a ningun grupo.
              </p>
              <Link to="/login" className="text-indigo-600 hover:underline text-sm font-medium">
                Ir al login general
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
              {/* Cabecera con info del grupo */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center">
                <div className="text-4xl mb-2">{groupInfo.teacher_emoji || '👨‍🏫'}</div>
                <h1 className="text-xl font-bold text-white">{groupInfo.group_name}</h1>
                <p className="text-emerald-100 text-sm mt-1">
                  Profesor: {groupInfo.teacher_name}
                </p>
                <div className="mt-2 inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-mono text-white/90">{groupInfo.group_code}</span>
                </div>
              </div>

              <div className="p-6">
                {step === 'setPassword' ? (
                  <form onSubmit={handleSetPassword} className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-sm text-slate-600">
                        Hola <strong>{pendingDisplayName}</strong>, crea tu contrasena para acceder
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Nueva contrasena</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Minimo 4 caracteres"
                          className="pl-10 pr-10"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          required minLength={4}
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar contrasena</Label>
                      <Input
                        type="password"
                        placeholder="Repite la contrasena"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                      {loading ? 'Creando...' : 'Crear contrasena y entrar'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gl-username">Nombre de usuario</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="gl-username"
                          type="text"
                          placeholder="Tu nombre de usuario"
                          className="pl-10"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    {step === 'password' && (
                      <div className="space-y-2">
                        <Label htmlFor="gl-password">Contrasena</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="gl-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Tu contrasena"
                            className="pl-10 pr-10"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoFocus
                            required
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading || !username.trim()}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    >
                      {loading ? 'Verificando...' : step === 'password' ? 'Entrar' : 'Continuar'}
                    </Button>
                  </form>
                )}

                <div className="mt-4 text-center">
                  <Link to="/login" className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    Ir al login general
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GroupLoginPage;
