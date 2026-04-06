-- Añadir avatar_emoji y avatar_color a la tabla teachers
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '👨‍🏫';
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT 'from-blue-500 to-purple-500';
