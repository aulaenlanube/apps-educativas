import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate('/login')}
      className="flex items-center gap-2 border-purple-300 bg-purple-600 hover:bg-purple-700 text-white"
    >
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">Iniciar sesion</span>
    </Button>
  );
}
