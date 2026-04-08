-- =====================================================================
-- Revisión rosco · Primaria · Matemáticas · 1º a 6º
-- 6 deletes + 19 updates. Asignatura estructuralmente sana.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 2º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Ocho veces diez.' WHERE id = 13675; -- ochenta
UPDATE rosco_questions SET definition = 'Tres veces diez.' WHERE id = 13699; -- treinta

-- =====================================================================
-- 3º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Línea paralela al horizonte.' WHERE id = 13768; -- horizontal
UPDATE rosco_questions SET definition = 'Ocho veces diez.' WHERE id = 13769; -- ochenta
UPDATE rosco_questions SET definition = 'Nueve veces diez.' WHERE id = 13799; -- noventa
UPDATE rosco_questions SET definition = 'Cinco veces diez.' WHERE id = 13800; -- cincuenta
UPDATE rosco_questions SET definition = 'Estación del año entre el verano y el invierno (contiene Ñ).' WHERE id = 13803; -- otoño
UPDATE rosco_questions SET definition = 'Diez más cinco.' WHERE id = 13816; -- quince
UPDATE rosco_questions SET definition = 'Adjetivo: de poco tamaño (contiene Q).' WHERE id = 13820; -- pequeño
UPDATE rosco_questions SET definition = 'Tres veces diez.' WHERE id = 13834; -- treinta

-- =====================================================================
-- 4º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Diez veces diez.' WHERE id = 13879; -- cien
UPDATE rosco_questions SET definition = 'Cantidad que cabe en un recipiente, medida en litros.' WHERE id = 13880; -- capacidad
UPDATE rosco_questions SET definition = 'Verbo: sumar o agregar algo (contiene Ñ).' WHERE id = 13940; -- añadir
UPDATE rosco_questions SET definition = 'Cantidad de repeticiones de una acción.' WHERE id = 13979; -- veces
UPDATE rosco_questions SET definition = 'Líneas rectas paralelas (contiene Y).' WHERE id = 13994; -- rayas
UPDATE rosco_questions SET definition = 'Verbo: dibujar líneas con un instrumento (contiene Z).' WHERE id = 13997; -- trazar

-- =====================================================================
-- 5º
-- =====================================================================
DELETE FROM rosco_questions WHERE id IN (
  14007, -- área duplicado
  14062, -- kilo duplicado
  14083  -- año duplicado
);

-- 14147 trazar: anotación interna + def absurda
UPDATE rosco_questions
SET definition = 'Verbo: dibujar líneas o figuras geométricas (contiene Z).'
WHERE id = 14147;

-- =====================================================================
-- 6º
-- =====================================================================
DELETE FROM rosco_questions WHERE id IN (
  14246, -- recta duplicado con def errónea
  14195  -- cuentas con anotación filtrada y no contiene J
);

UPDATE rosco_questions SET definition = 'Magnitud que indica cuánto líquido cabe en un recipiente.' WHERE id = 14191; -- capacidad
UPDATE rosco_questions SET definition = 'Conjunto que contiene todos los elementos posibles de un experimento.' WHERE id = 14260; -- universo

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
