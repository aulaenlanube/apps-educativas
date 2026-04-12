import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Mail, Lock, Eye, EyeOff, Hash, ArrowLeft, ShieldCheck, Rocket, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signInTeacher, signInFreeUser, signInWithGoogle, signInStudent, signInStudentEmail, resetPassword, resetStudentPassword, studentSetPassword, switchStudentGroup, isAuthenticated, isTeacher, isStudent, isFreeUser, signInWithGoogleAsFree } = useAuth();
  const { toast } = useToast();

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(isTeacher ? '/dashboard' : isStudent ? '/mi-panel' : isFreeUser ? '/mi-zona' : '/');
    }
  }, [isAuthenticated, isTeacher, isStudent, isFreeUser, navigate]);

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
          <div className="bg-white dark:bg-slate-800 dark:text-gray-200 rounded-2xl shadow-xl border border-purple-100 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
              <h1 className="text-2xl font-bold text-white">Iniciar Sesion</h1>
              <p className="text-blue-100 text-sm mt-1">Accede a tu cuenta de EduApps</p>
            </div>

            <Tabs defaultValue="teacher" className="p-6">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="teacher" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <GraduationCap className="w-4 h-4" />
                  Soy Docente
                </TabsTrigger>
                <TabsTrigger value="student" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Users className="w-4 h-4" />
                  Soy Alumno
                </TabsTrigger>
                <TabsTrigger value="free" className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <Rocket className="w-4 h-4" />
                  Soy Libre
                </TabsTrigger>
              </TabsList>

              <TabsContent value="teacher">
                <TeacherLoginForm
                  onSignIn={signInTeacher}
                  onGoogleSignIn={signInWithGoogle}
                  onResetPassword={resetPassword}
                  navigate={navigate}
                  toast={toast}
                />
              </TabsContent>

              <TabsContent value="student">
                <StudentLoginForm
                  onSignIn={signInStudent}
                  onSignInEmail={signInStudentEmail}
                  onResetPassword={resetStudentPassword}
                  onSetPassword={studentSetPassword}
                  onSwitchGroup={switchStudentGroup}
                  navigate={navigate}
                  toast={toast}
                />
              </TabsContent>

              <TabsContent value="free">
                <FreeUserLoginForm
                  onSignIn={signInFreeUser}
                  onGoogleSignIn={signInWithGoogleAsFree}
                  onResetPassword={resetPassword}
                  navigate={navigate}
                  toast={toast}
                />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function TeacherLoginForm({ onSignIn, onGoogleSignIn, onResetPassword, navigate, toast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await onSignIn(email, password);
    setLoading(false);

    if (error) {
      let description = error.message;
      if (error.message === 'Invalid login credentials') {
        description = 'Email o contrasena incorrectos';
      } else if (error.code === 'email_not_confirmed' || error.message === 'Email not confirmed') {
        description = 'Debes confirmar tu email antes de iniciar sesion. Revisa tu bandeja de entrada.';
      }
      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesion',
        description
      });
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogle = async () => {
    const { error } = await onGoogleSignIn();
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  if (showForgot) return (
    <div className="space-y-4">
      <div className="text-center pb-2">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-bold text-gray-800">Recuperar contrasena</h3>
        <p className="text-sm text-gray-500 mt-1">Te enviaremos un enlace para restablecer tu contrasena</p>
      </div>

      {!resetSent ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="teacher-reset-email">Tu email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="teacher-reset-email" type="email" placeholder="tu@email.com" className="pl-10"
                value={resetEmail} onChange={e => setResetEmail(e.target.value)} autoFocus />
            </div>
          </div>
          <Button
            onClick={async () => {
              if (!resetEmail.trim()) return;
              setLoading(true);
              const { error } = await onResetPassword(resetEmail.trim());
              setLoading(false);
              if (error) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
              } else {
                setResetSent(true);
              }
            }}
            disabled={loading || !resetEmail.trim()}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            {loading ? 'Enviando...' : 'Enviar enlace de recuperacion'}
          </Button>
        </div>
      ) : (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-800">Email enviado</p>
          <p className="text-xs text-green-600 mt-1">Revisa tu bandeja de entrada en <strong>{resetEmail}</strong></p>
        </div>
      )}

      <button type="button" onClick={() => { setShowForgot(false); setResetSent(false); setResetEmail(''); }}
        className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al login
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="teacher-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="teacher-email"
            type="email"
            placeholder="tu@email.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="teacher-password">Contrasena</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="teacher-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Tu contrasena"
            className="pl-10 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
      </Button>

      <button type="button" onClick={() => { setShowForgot(true); setResetEmail(email); }}
        className="w-full text-center text-xs text-purple-500 hover:text-purple-700 transition-colors">
        He olvidado mi contrasena
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">O continuar con</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar con Google
      </Button>

      <p className="text-center text-sm text-gray-500 mt-4">
        No tienes cuenta?{' '}
        <Link to="/registro" className="text-purple-600 hover:text-purple-800 font-medium">
          Registrate aqui
        </Link>
      </p>
    </form>
  );
}

function StudentLoginForm({ onSignIn, onSignInEmail, onResetPassword, onSetPassword, onSwitchGroup, navigate, toast }) {
  const [groupCode, setGroupCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [pendingGroups, setPendingGroups] = useState([]);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Estado para flujo de crear contrasena (primer login o tras reset)
  const [step, setStep] = useState('login'); // 'login' | 'password' | 'setPassword' | 'selectGroup'
  const [pendingStudentId, setPendingStudentId] = useState(null);
  const [pendingDisplayName, setPendingDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Paso 1: verificar usuario + codigo de grupo (sin contrasena)
    if (step === 'login') {
      const result = await onSignIn(groupCode, username, '');
      setLoading(false);

      if (result.needsPassword) {
        // Alumno sin contrasena -> ir a crear contrasena
        setPendingStudentId(result.studentId);
        setPendingDisplayName(result.displayName);
        setStep('setPassword');
        return;
      }

      if (result.error) {
        // Si el error es "Contrasena incorrecta", significa que SI tiene contrasena -> pedir contrasena
        if (result.error.message === 'Contrasena incorrecta') {
          setStep('password');
          return;
        }
        toast({ variant: 'destructive', title: 'Error', description: result.error.message });
        return;
      }

      // Login exitoso (no deberia llegar aqui con password vacia, pero por si acaso)
      toast({ title: 'Bienvenido!' });
      navigate('/mi-panel');
      return;
    }

    // Paso 2: login con contrasena
    if (step === 'password') {
      const result = await onSignIn(groupCode, username, password);
      setLoading(false);

      if (result.needsPassword) {
        setPendingStudentId(result.studentId);
        setPendingDisplayName(result.displayName);
        setStep('setPassword');
        return;
      }

      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error.message });
        return;
      }

      toast({ title: 'Bienvenido!' });
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
    const result = await onSetPassword(pendingStudentId, groupCode, username, newPassword);
    setLoading(false);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error.message });
      return;
    }

    toast({ title: 'Bienvenido!', description: 'Contrasena creada correctamente' });
    navigate('/');
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await onSignInEmail(emailInput, emailPassword);
    setLoading(false);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error.message });
      return;
    }

    const groups = result.groups || [];
    if (groups.length > 1) {
      setPendingGroups(groups);
      setStep('selectGroup');
      return;
    }

    toast({ title: 'Bienvenido!' });
    navigate('/mi-panel');
  };

  const handleSelectGroup = (group) => {
    onSwitchGroup(group);
    toast({ title: group ? `Grupo: ${group.group_name}` : 'Practica libre' });
    navigate('/mi-panel');
  };

  const handleBack = () => {
    setStep('login');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPendingStudentId(null);
    setPendingGroups([]);
  };

  // Pantalla seleccionar grupo (tras email login multi-grupo)
  if (step === 'selectGroup') {
    return (
      <div className="space-y-4">
        <div className="text-center pb-2">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-gray-800">Elige tu grupo</h3>
          <p className="text-sm text-gray-500 mt-1">Selecciona donde quieres entrar</p>
        </div>

        <div className="space-y-2">
          {pendingGroups.map(g => (
            <button key={g.group_id} onClick={() => handleSelectGroup(g)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{g.group_name}</p>
                <p className="text-xs text-slate-400">{g.teacher_name} · {g.group_code}</p>
              </div>
            </button>
          ))}

          <button onClick={() => handleSelectGroup(null)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Practicar libre</p>
              <p className="text-xs text-slate-400">Juega sin grupo</p>
            </div>
          </button>
        </div>

        <button type="button" onClick={handleBack}
          className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>
    );
  }

  // Pantalla de crear contrasena (primer login)
  if (step === 'setPassword') {
    return (
      <form onSubmit={handleSetPassword} className="space-y-4">
        <div className="text-center pb-2">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-gray-800">Hola, {pendingDisplayName}!</h3>
          <p className="text-sm text-gray-500 mt-1">Crea tu contrasena para acceder</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">Nueva contrasena</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="new-password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Minimo 4 caracteres"
              className="pl-10 pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={4}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Repetir contrasena</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="confirm-password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Repite tu contrasena"
              className="pl-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500">Las contrasenas no coinciden</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || newPassword.length < 4 || newPassword !== confirmPassword}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
        >
          {loading ? 'Creando...' : 'Crear contrasena y entrar'}
        </Button>

        <button
          type="button"
          onClick={handleBack}
          className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </form>
    );
  }

  // Pantalla de introducir contrasena (ya tiene contrasena)
  if (step === 'password') {
    return (
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="text-center pb-2">
          <p className="text-sm text-gray-500">
            Introduce tu contrasena para <span className="font-semibold text-gray-700">@{username}</span>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-password">Contrasena</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="student-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tu contrasena"
              className="pl-10 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        <button
          type="button"
          onClick={handleBack}
          className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </form>
    );
  }

  // Pantalla recuperar contrasena
  if (showForgotPassword) return (
    <div className="space-y-4">
      <div className="text-center pb-2">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-bold text-gray-800">Recuperar contrasena</h3>
        <p className="text-sm text-gray-500 mt-1">Te enviaremos un enlace para restablecer tu contrasena</p>
      </div>

      {!resetSent ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="reset-email">Tu email vinculado</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="reset-email" type="email" placeholder="tu@email.com" className="pl-10"
                value={resetEmail} onChange={e => setResetEmail(e.target.value)} autoFocus />
            </div>
          </div>
          <Button
            onClick={async () => {
              if (!resetEmail.trim()) return;
              setLoading(true);
              const { error } = await onResetPassword(resetEmail.trim());
              setLoading(false);
              if (error) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
              } else {
                setResetSent(true);
              }
            }}
            disabled={loading || !resetEmail.trim()}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            {loading ? 'Enviando...' : 'Enviar enlace de recuperacion'}
          </Button>
        </div>
      ) : (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-800">Email enviado</p>
          <p className="text-xs text-green-600 mt-1">Revisa tu bandeja de entrada en <strong>{resetEmail}</strong></p>
        </div>
      )}

      <button type="button" onClick={() => { setShowForgotPassword(false); setResetSent(false); setResetEmail(''); }}
        className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al login
      </button>
    </div>
  );

  // Pantalla inicial: codigo de grupo + usuario (o email si useEmail)
  if (useEmail) return (
    <form onSubmit={handleEmailLogin} className="space-y-4">
      <div className="text-center pb-2">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
          <Mail className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-bold text-gray-800">Acceso con email</h3>
        <p className="text-sm text-gray-500 mt-1">Usa tu email vinculado</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-login">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input id="email-login" type="email" placeholder="tu@email.com" className="pl-10"
            value={emailInput} onChange={e => setEmailInput(e.target.value)} required autoFocus />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-pw">Contrasena</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input id="email-pw" type={showEmailPassword ? 'text' : 'password'} placeholder="Tu contrasena" className="pl-10 pr-10"
            value={emailPassword} onChange={e => setEmailPassword(e.target.value)} required />
          <button type="button" onClick={() => setShowEmailPassword(!showEmailPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" disabled={loading || !emailInput.trim() || !emailPassword}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
        {loading ? 'Entrando...' : 'Iniciar sesion'}
      </Button>

      <button type="button" onClick={() => setShowForgotPassword(true)}
        className="w-full text-center text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
        He olvidado mi contrasena
      </button>

      <button type="button" onClick={() => setUseEmail(false)}
        className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Usar codigo de grupo
      </button>
    </form>
  );

  // Pantalla inicial: codigo de grupo + usuario
  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="group-code">Codigo de grupo</Label>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="group-code"
            type="text"
            placeholder="GRP-XXXX"
            className="pl-10 uppercase font-mono"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
            required
          />
        </div>
        <p className="text-xs text-gray-400">Tu profesor te dara este codigo</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="student-username">Nombre de usuario</Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="student-username"
            type="text"
            placeholder="Tu nombre de usuario"
            className="pl-10"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || !groupCode.trim() || !username.trim()}
        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
      >
        {loading ? 'Verificando...' : 'Continuar'}
      </Button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-400">o</span></div>
      </div>

      <button type="button" onClick={() => setUseEmail(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-indigo-200 rounded-xl text-sm text-indigo-600 font-medium hover:bg-indigo-50 transition-colors">
        <Mail className="w-4 h-4" />
        Iniciar sesion con email
      </button>
    </form>
  );

}

function FreeUserLoginForm({ onSignIn, onGoogleSignIn, onResetPassword, navigate, toast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await onSignIn(email, password);
    setLoading(false);

    if (error) {
      let description = error.message;
      if (error.message === 'Invalid login credentials') {
        description = 'Email o contrasena incorrectos';
      } else if (error.code === 'email_not_confirmed' || error.message === 'Email not confirmed') {
        description = 'Debes confirmar tu email antes de iniciar sesion. Revisa tu bandeja de entrada.';
      }
      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesion',
        description
      });
    } else {
      navigate('/mi-zona');
    }
  };

  const handleGoogle = async () => {
    const { error } = await onGoogleSignIn();
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  if (showForgot) return (
    <div className="space-y-4">
      <div className="text-center pb-2">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Lock className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-bold text-gray-800">Recuperar contrasena</h3>
        <p className="text-sm text-gray-500 mt-1">Te enviaremos un enlace para restablecer tu contrasena</p>
      </div>

      {!resetSent ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="free-reset-email">Tu email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input id="free-reset-email" type="email" placeholder="tu@email.com" className="pl-10"
                value={resetEmail} onChange={e => setResetEmail(e.target.value)} autoFocus />
            </div>
          </div>
          <Button
            onClick={async () => {
              if (!resetEmail.trim()) return;
              setLoading(true);
              const { error } = await onResetPassword(resetEmail.trim());
              setLoading(false);
              if (error) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
              } else {
                setResetSent(true);
              }
            }}
            disabled={loading || !resetEmail.trim()}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            {loading ? 'Enviando...' : 'Enviar enlace de recuperacion'}
          </Button>
        </div>
      ) : (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-800">Email enviado</p>
          <p className="text-xs text-green-600 mt-1">Revisa tu bandeja de entrada en <strong>{resetEmail}</strong></p>
        </div>
      )}

      <button type="button" onClick={() => { setShowForgot(false); setResetSent(false); setResetEmail(''); }}
        className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al login
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center pb-2">
        <p className="text-sm text-gray-500">
          Accede con tu cuenta libre para practicar y guardar tu progreso en todas las materias.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="free-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="free-email"
            type="email"
            placeholder="tu@email.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="free-password">Contrasena</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="free-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Tu contrasena"
            className="pl-10 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
      >
        {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
      </Button>

      <button type="button" onClick={() => { setShowForgot(true); setResetEmail(email); }}
        className="w-full text-center text-xs text-pink-500 hover:text-pink-700 transition-colors">
        He olvidado mi contrasena
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">O continuar con</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar con Google
      </Button>

      <p className="text-center text-sm text-gray-500 mt-4">
        No tienes cuenta?{' '}
        <Link to="/registro-libre" className="text-pink-600 hover:text-pink-800 font-medium">
          Registrate aqui
        </Link>
      </p>
    </form>
  );
}

export default LoginPage;
