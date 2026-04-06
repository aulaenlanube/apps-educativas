-- Función para crear un usuario administrador (solo admins pueden ejecutar)
CREATE OR REPLACE FUNCTION admin_create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_display_name TEXT
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Solo admins pueden crear otros admins
  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN json_build_object('error', 'No autorizado');
  END IF;

  IF EXISTS (SELECT 1 FROM public.teachers WHERE email = p_email) THEN
    RETURN json_build_object('error', 'Ya existe un usuario con ese email');
  END IF;

  v_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    json_build_object('full_name', p_display_name, 'role', 'admin')::jsonb,
    '', '', ''
  );

  IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = v_user_id) THEN
    INSERT INTO public.teachers (id, email, display_name, teacher_code, role)
    VALUES (v_user_id, p_email, p_display_name, generate_teacher_code(), 'admin');
  END IF;

  UPDATE public.teachers SET role = 'admin' WHERE id = v_user_id AND role != 'admin';

  RETURN json_build_object('success', true, 'user_id', v_user_id);
EXCEPTION WHEN unique_violation THEN
  RETURN json_build_object('error', 'Ya existe un usuario con ese email en el sistema de autenticacion');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION admin_create_admin_user TO authenticated;
