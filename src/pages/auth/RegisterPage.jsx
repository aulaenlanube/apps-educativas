import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/Header';
import { validatePassword, sanitizePlainText } from '@/lib/sanitize';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUpTeacher, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Las contrasenas no coinciden' });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({ variant: 'destructive', title: 'Error', description: passwordError });
      return;
    }

    const cleanName = sanitizePlainText(displayName, 80);
    if (!cleanName) {
      toast({ variant: 'destructive', title: 'Error', description: 'Introduce tu nombre' });
      return;
    }

    setLoading(true);
    const { error } = await signUpTeacher(email, password, cleanName);
    setLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al crear la cuenta',
        description: error.message
      });
    } else {
      setRegistered(true);
    }
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
          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
            {registered ? (
              <>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-white mx-auto mb-2" />
                  <h1 className="text-2xl font-bold text-white">Cuenta creada</h1>
                </div>
                <div className="p-6 space-y-4 text-center">
                  <p className="text-gray-700">
                    Hemos enviado un enlace de confirmacion a <strong>{email}</strong>.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para activar tu cuenta. Hasta que no confirmes tu email, no podras iniciar sesion.
                  </p>
                  <Link
                    to="/login"
                    className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Ir a Iniciar Sesion
                  </Link>
                </div>
              </>
            ) : (
            <>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
              <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
              <p className="text-blue-100 text-sm mt-1">Registrate como docente en EduApps</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="Tu nombre"
                    className="pl-10"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="register-email"
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
                <Label htmlFor="register-password">Contrasena</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimo 8 caracteres, con letra y digito"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar contrasena</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repite tu contrasena"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Ya tienes cuenta?{' '}
                <Link to="/login" className="text-purple-600 hover:text-purple-800 font-medium">
                  Inicia sesion
                </Link>
              </p>
            </form>
            </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
