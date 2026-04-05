import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, Rocket, MailCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/Header';

const RegisterFreePage = () => {
  const navigate = useNavigate();
  const { signUpFreeUser, isAuthenticated } = useAuth();
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

    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Error', description: 'La contrasena debe tener al menos 6 caracteres' });
      return;
    }

    setLoading(true);
    const { error } = await signUpFreeUser(email, password, displayName);
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
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
            {registered ? (
              <>
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-center">
                  <MailCheck className="w-12 h-12 text-white mx-auto mb-2" />
                  <h1 className="text-2xl font-bold text-white">Revisa tu correo</h1>
                </div>
                <div className="p-6 space-y-4 text-center">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-800 font-semibold text-base mb-2">
                      Hemos enviado un enlace de verificacion a:
                    </p>
                    <p className="text-amber-900 font-bold text-lg">{email}</p>
                  </div>

                  <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-700 text-sm">Para activar tu cuenta:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                      <li>Abre tu aplicacion de correo electronico</li>
                      <li>Busca el email de <strong>EduApps</strong> (revisa tambien la carpeta de spam)</li>
                      <li>Haz clic en el enlace de confirmacion del email</li>
                      <li>Vuelve aqui e inicia sesion</li>
                    </ol>
                  </div>

                  <p className="text-red-500 text-sm font-medium">
                    No podras iniciar sesion hasta que confirmes tu email.
                  </p>

                  <Link
                    to="/login"
                    className="inline-block mt-4 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all"
                  >
                    Ir a Iniciar Sesion
                  </Link>
                </div>
              </>
            ) : (
            <>
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-center">
              <Rocket className="w-8 h-8 text-white mx-auto mb-1" />
              <h1 className="text-2xl font-bold text-white">Cuenta Libre</h1>
              <p className="text-orange-100 text-sm mt-1">Practica y guarda tu progreso en todas las materias</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="free-name">Tu nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="free-name"
                    type="text"
                    placeholder="Como quieres que te llamemos"
                    className="pl-10"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
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
                    placeholder="Minimo 6 caracteres"
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

              <div className="space-y-2">
                <Label htmlFor="free-confirm">Confirmar contrasena</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="free-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repite tu contrasena"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 text-xs flex items-start gap-2">
                  <MailCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Tras registrarte, deberas ir a tu correo electronico y hacer clic en el enlace de verificacion para poder acceder.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta Libre'}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Ya tienes cuenta?{' '}
                <Link to="/login" className="text-pink-600 hover:text-pink-800 font-medium">
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

export default RegisterFreePage;
