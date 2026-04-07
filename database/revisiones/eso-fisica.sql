-- =====================================================================
-- Revisión rosco · ESO · Física y Química · 1º a 4º ESO
-- Generado por revisión manual. NO ejecutar sin revisar el .md adjunto.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1º ESO
-- =====================================================================

-- Letra K: borrar kilogramo placeholders y duplicado de kilo
DELETE FROM rosco_questions WHERE id IN (
  18099, -- kilo (duplica con kilogramo 18096)
  18101, -- kilogramo def níquel
  18102, -- kilogramo def coque
  18103  -- kilogramo def bloque
);

-- Letra W: 18228 watt duplicado
DELETE FROM rosco_questions WHERE id = 18228;

-- =====================================================================
-- 2º ESO
-- =====================================================================

-- Letra K: borrar kilogramo placeholders
DELETE FROM rosco_questions WHERE id IN (
  18379, -- kilogramo def níquel
  18380  -- kilogramo def coque
);

-- Errata 'kínética' -> 'kinetic' (anglicismo, encaja en K)
UPDATE rosco_questions
SET solution = 'kinetic',
    definition = 'Energía del movimiento, en inglés (cinética con K).'
WHERE id = 18376;

-- 18283 bullir duplicado
DELETE FROM rosco_questions WHERE id = 18283;

-- 18326 fusión: cambiar a 'fusión nuclear' para diferenciar de 18321
UPDATE rosco_questions
SET solution = 'fusión nuclear',
    definition = 'Reacción nuclear de unión de núcleos ligeros que ocurre en las estrellas.'
WHERE id = 18326;

-- 18406/18407 numero atomico: borrar 18407 y corregir tilde en 18406
DELETE FROM rosco_questions WHERE id = 18407;
UPDATE rosco_questions
SET solution = 'número atómico'
WHERE id = 18406;

-- 18405 newton (científico): cambiar a 'isaac' para diferenciar de 18412 newton (unidad)
UPDATE rosco_questions
SET solution = 'isaac',
    definition = 'Nombre del científico inglés Newton, descubridor de la gravedad.'
WHERE id = 18405;

-- =====================================================================
-- 3º ESO
-- =====================================================================

-- Letra K: borrar kilogramo placeholder
DELETE FROM rosco_questions WHERE id = 18655;

-- 18606 fusión: diferenciar
UPDATE rosco_questions
SET solution = 'fusión nuclear',
    definition = 'Reacción nuclear de unión de núcleos ligeros (estrellas).'
WHERE id = 18606;

-- 18646 joule (físico): diferenciar a 'james'
UPDATE rosco_questions
SET solution = 'james',
    definition = 'Nombre de pila del físico inglés Joule, estudioso de la energía (contiene J).'
WHERE id = 18646;

-- 18822 'capa de ozono' Z con def de hertz
UPDATE rosco_questions
SET solution = 'hertz',
    definition = 'Unidad de frecuencia del Sistema Internacional, símbolo Hz (contiene Z).'
WHERE id = 18822;

-- Mayúsculas truncadas: bajar a minúscula
UPDATE rosco_questions SET solution = 'nivel' WHERE id = 18680;
UPDATE rosco_questions SET solution = 'nube' WHERE id = 18686;
UPDATE rosco_questions SET solution = 'tubo' WHERE id = 18759;

-- =====================================================================
-- 4º ESO
-- =====================================================================

-- Letra K: borrar kilogramo placeholders
DELETE FROM rosco_questions WHERE id IN (
  18932, -- kilogramo def cinética
  18933  -- kilogramo def quilate del oro
);

-- 19096 'capa de ozono' Z con def de hertz
UPDATE rosco_questions
SET solution = 'hertz',
    definition = 'Unidad de frecuencia del Sistema Internacional, símbolo Hz (contiene Z).'
WHERE id = 19096;

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
