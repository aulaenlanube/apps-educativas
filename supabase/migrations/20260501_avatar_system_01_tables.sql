-- =====================================================
-- AVATAR SYSTEM — paso 1: tablas, columnas, RLS, índices
-- =====================================================

CREATE TABLE IF NOT EXISTS public.avatar_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  rarity text NOT NULL CHECK (rarity IN ('common','rare','epic','legendary','mythic')),
  points_bonus numeric(3,2) NOT NULL DEFAULT 0.10
    CHECK (points_bonus >= 0 AND points_bonus <= 0.50),
  image_lg text NOT NULL,
  image_md text NOT NULL,
  image_sm text NOT NULL,
  unlock_label text,
  unlock_requirement jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_avatar_definitions_active_sort
  ON public.avatar_definitions(active, sort_order);

CREATE TABLE IF NOT EXISTS public.student_avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  avatar_id  uuid NOT NULL REFERENCES public.avatar_definitions(id) ON DELETE CASCADE,
  earned_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, avatar_id)
);

CREATE INDEX IF NOT EXISTS idx_student_avatars_student
  ON public.student_avatars(student_id);

CREATE TABLE IF NOT EXISTS public.teacher_avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  avatar_id  uuid NOT NULL REFERENCES public.avatar_definitions(id) ON DELETE CASCADE,
  earned_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, avatar_id)
);

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS selected_avatar_code text
    REFERENCES public.avatar_definitions(code) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE public.teachers
  ADD COLUMN IF NOT EXISTS selected_avatar_code text
    REFERENCES public.avatar_definitions(code) ON UPDATE CASCADE ON DELETE SET NULL;

-- RLS: catálogo lectura pública; tablas de propiedad legibles por todos
ALTER TABLE public.avatar_definitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS avatar_defs_read ON public.avatar_definitions;
CREATE POLICY avatar_defs_read ON public.avatar_definitions FOR SELECT USING (true);

ALTER TABLE public.student_avatars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS student_avatars_read ON public.student_avatars;
CREATE POLICY student_avatars_read ON public.student_avatars FOR SELECT USING (true);

ALTER TABLE public.teacher_avatars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS teacher_avatars_read ON public.teacher_avatars;
CREATE POLICY teacher_avatars_read ON public.teacher_avatars FOR SELECT USING (true);
