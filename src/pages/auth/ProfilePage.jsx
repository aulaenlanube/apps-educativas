import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Mail, KeyRound, GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Header from '@/components/layout/Header';

const ProfilePage = () => {
  const { teacher, user, updateTeacherProfile, fetchTeacherProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [displayName, setDisplayName] = useState(teacher?.display_name || '');
  const [bio, setBio] = useState(teacher?.bio || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const initials = teacher?.display_name
    ? teacher.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'El nombre no puede estar vacio' });
      return;
    }

    setSaving(true);
    const { error } = await updateTeacherProfile({
      display_name: displayName.trim(),
      bio: bio.trim(),
    });
    setSaving(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Perfil actualizado' });
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Error', description: 'Solo se permiten imagenes' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Error', description: 'La imagen no puede superar 2MB' });
      return;
    }

    setUploadingAvatar(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // Subir imagen a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploadingAvatar(false);
      toast({ variant: 'destructive', title: 'Error al subir imagen', description: uploadError.message });
      return;
    }

    // Obtener URL publica
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Añadir timestamp para evitar cache
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    // Actualizar perfil con la nueva URL
    const { error: updateError } = await updateTeacherProfile({ avatar_url: avatarUrl });
    setUploadingAvatar(false);

    if (updateError) {
      toast({ variant: 'destructive', title: 'Error', description: updateError.message });
    } else {
      toast({ title: 'Imagen de perfil actualizada' });
    }

    // Limpiar input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyCode = () => {
    if (teacher?.teacher_code) {
      navigator.clipboard.writeText(teacher.teacher_code);
      toast({ title: 'Codigo copiado', description: teacher.teacher_code });
    }
  };

  return (
    <div>
      <Header subtitle="Mi Perfil" />

      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Tarjeta de perfil */}
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
              {/* Banner superior */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 relative" />

              {/* Avatar */}
              <div className="px-6 -mt-16 relative z-10">
                <div className="relative inline-block">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                    {teacher?.avatar_url ? (
                      <AvatarImage src={teacher.avatar_url} alt={teacher.display_name} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Boton subir foto */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-1 right-1 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-purple-50 transition-colors disabled:opacity-50"
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent" />
                    ) : (
                      <Camera className="w-4 h-4 text-purple-600" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Formulario */}
              <div className="p-6 pt-4 space-y-6">
                {/* Info no editable */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {teacher?.email}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-2 bg-purple-50 rounded-lg px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                    {teacher?.teacher_code}
                  </button>
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Nombre</Label>
                  <Input
                    id="profile-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>

                {/* Bio / Descripcion */}
                <div className="space-y-2">
                  <Label htmlFor="profile-bio">Sobre mi</Label>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuentanos algo sobre ti... Que asignaturas impartes, en que centro trabajas, tus intereses educativos..."
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-400 text-right">{bio.length}/500</p>
                </div>

                {/* Boton guardar */}
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {saving ? (
                    'Guardando...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Info adicional */}
            <div className="mt-4 bg-white/60 rounded-xl p-4 border border-purple-100">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-purple-500 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-700">Tu codigo de profesor: <span className="text-purple-700 font-bold">{teacher?.teacher_code}</span></p>
                  <p className="mt-1">Comparte este codigo con tus alumnos para que puedan iniciar sesion en la plataforma.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
