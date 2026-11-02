import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginButton() {
  const navigate = useNavigate();

  return (
    <Button
      size="sm"
      onClick={() => navigate('/login')}
      className="flex items-center gap-2 h-10 px-4 rounded-full border-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_24px_-12px_rgba(168,85,247,0.8)]"
    >
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">Iniciar sesión</span>
    </Button>
  );
}
