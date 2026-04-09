-- Limpia los datos insertados por la ejecución parcial de ejecutar-bach-parte2.sql
-- El error fue en línea 2194, así que se insertaron los bloques anteriores.
-- Borramos todo rosco de bachillerato que NO venga de parte1 ni del seed original,
-- es decir, borramos todo y luego reinsertamos con parte2 corregida.

-- Los datos de parte1 (lengua, filosofia, matematicas, fisica, quimica) tienen
-- subject_id IN ('lengua','filosofia','matematicas','fisica','quimica')
-- Los datos del seed original ya están mezclados.
-- Lo más seguro: borrar TODOS los rosco de bachillerato y reinsertar desde cero.

DELETE FROM rosco_questions WHERE level = 'bachillerato';

-- Después ejecutar en orden:
-- 1. ejecutar-bach-parte1.sql
-- 2. ejecutar-bach-parte2.sql (ya corregida)
