-- ============================================================
-- Migration: Plantillas de "Preguntas en vivo"
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  -- Cada pregunta: { question, correct, options[], correctIndex, difficulty, source }
  -- source = 'rosco' o 'custom'
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  question_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qt_teacher ON public.quiz_templates(teacher_id, created_at DESC);

ALTER TABLE public.quiz_templates ENABLE ROW LEVEL SECURITY;

-- Profesores solo ven/editan sus propias plantillas
CREATE POLICY "qt_select_own" ON public.quiz_templates
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "qt_insert_own" ON public.quiz_templates
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "qt_update_own" ON public.quiz_templates
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "qt_delete_own" ON public.quiz_templates
  FOR DELETE USING (teacher_id = auth.uid());

-- ── RPC: listar plantillas del profesor ──
CREATE OR REPLACE FUNCTION get_teacher_quiz_templates(
  p_teacher_id UUID
) RETURNS JSON AS $$
BEGIN
  RETURN COALESCE(
    (SELECT json_agg(row_to_json(t) ORDER BY t.updated_at DESC)
     FROM (
       SELECT id, name, description, question_count, created_at, updated_at
       FROM public.quiz_templates
       WHERE teacher_id = p_teacher_id
     ) t),
    '[]'::json
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_teacher_quiz_templates TO authenticated;

-- ── RPC: obtener una plantilla completa (con preguntas) ──
CREATE OR REPLACE FUNCTION get_quiz_template(
  p_template_id UUID,
  p_teacher_id UUID
) RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT row_to_json(t)
    FROM (
      SELECT id, name, description, questions, question_count, created_at, updated_at
      FROM public.quiz_templates
      WHERE id = p_template_id AND teacher_id = p_teacher_id
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_quiz_template TO authenticated;

-- ── RPC: guardar plantilla (crear o actualizar) ──
CREATE OR REPLACE FUNCTION save_quiz_template(
  p_teacher_id UUID,
  p_template_id UUID,       -- NULL para crear nueva
  p_name TEXT,
  p_description TEXT,
  p_questions JSONB
) RETURNS JSON AS $$
DECLARE
  v_id UUID;
  v_count INTEGER;
BEGIN
  v_count := jsonb_array_length(COALESCE(p_questions, '[]'::jsonb));

  IF p_template_id IS NOT NULL THEN
    UPDATE public.quiz_templates
    SET name = p_name,
        description = COALESCE(p_description, ''),
        questions = COALESCE(p_questions, '[]'::jsonb),
        question_count = v_count,
        updated_at = now()
    WHERE id = p_template_id AND teacher_id = p_teacher_id
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
      RETURN json_build_object('error', 'Template not found');
    END IF;
  ELSE
    INSERT INTO public.quiz_templates (teacher_id, name, description, questions, question_count)
    VALUES (p_teacher_id, p_name, COALESCE(p_description, ''), COALESCE(p_questions, '[]'::jsonb), v_count)
    RETURNING id INTO v_id;
  END IF;

  RETURN json_build_object('success', true, 'id', v_id, 'question_count', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION save_quiz_template TO authenticated;

-- ── RPC: eliminar plantilla ──
CREATE OR REPLACE FUNCTION delete_quiz_template(
  p_template_id UUID,
  p_teacher_id UUID
) RETURNS JSON AS $$
BEGIN
  DELETE FROM public.quiz_templates
  WHERE id = p_template_id AND teacher_id = p_teacher_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Template not found');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_quiz_template TO authenticated;
