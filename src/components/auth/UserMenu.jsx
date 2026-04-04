import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Copy, GraduationCap, UserCircle, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function UserMenu() {
  const { displayName, role, teacher, student, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const avatarUrl = teacher?.avatar_url;

  const handleCopyCode = () => {
    if (teacher?.teacher_code) {
      navigator.clipboard.writeText(teacher.teacher_code);
      toast({ title: 'Codigo copiado', description: teacher.teacher_code });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3 py-1.5 hover:bg-purple-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300">
          <Avatar className="h-8 w-8">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
              {role === 'student' ? student?.avatar_emoji || initials : initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline max-w-[140px] truncate">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold">
                {role === 'student' ? student?.avatar_emoji || initials : initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {role === 'teacher' || role === 'admin' ? teacher?.email : `Alumno - ${student?.group_name}`}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(role === 'teacher' || role === 'admin') && (
          <>
            <DropdownMenuItem onClick={() => navigate('/perfil')}>
              <UserCircle className="mr-2 h-4 w-4" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Mi Panel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyCode}>
              <Copy className="mr-2 h-4 w-4" />
              Codigo: {teacher?.teacher_code}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {role === 'student' && (
          <>
            <DropdownMenuItem onClick={() => navigate('/mi-panel')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Mi Panel
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <GraduationCap className="mr-2 h-4 w-4" />
              {student?.group_name}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
