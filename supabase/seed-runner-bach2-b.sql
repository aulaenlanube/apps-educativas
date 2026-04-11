-- Runner categories seed — 2º Bachillerato (tanda B)
-- 12 categorías nuevas (2 por asignatura) evitando solapes semánticos
-- con las categorías ya existentes en bachillerato-{subject}-2.json

-- =========================================================================
-- MATEMÁTICAS (2º Bach)
-- =========================================================================
-- Evita solapes con: Integrales, Geometria analitica, Estadistica,
-- Inferencia, Ecuaciones diferenciales, Continuidad, Algebra lineal, Distribuciones
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('matematicas', 'bachillerato', '{2}', 'Técnicas de integración', '["cambio","inmediata","logaritmica","exponencial","potencial","irracional","raiz","fraccion","descomposicion","reduccion"]'),
('matematicas', 'bachillerato', '{2}', 'Vectores en el espacio', '["vector","modulo","coordenadas","escalar","vectorial","mixto","base","ortogonal","unitario","combinacion"]');

-- =========================================================================
-- PROGRAMACIÓN (2º Bach)
-- =========================================================================
-- Evita solapes con: Lenguajes, Estructuras de datos, POO, Ordenacion,
-- Operadores, Palabras reservadas, Desarrollo web, Bases de datos
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('programacion', 'bachillerato', '{2}', 'Patrones de diseño', '["singleton","factory","observer","decorator","adapter","strategy","facade","proxy","builder","iterator"]'),
('programacion', 'bachillerato', '{2}', 'Testing y seguridad', '["unitario","integracion","mock","cobertura","assert","cifrado","hash","token","firma","auditoria"]');

-- =========================================================================
-- QUÍMICA (2º Bach)
-- =========================================================================
-- Evita solapes con: Redox, Nomenclatura, Termodinamica, Equilibrio, Cinetica,
-- Grupos funcionales, Reacciones organicas, Acido-base
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('quimica', 'bachillerato', '{2}', 'Isomería orgánica', '["isomero","estructural","cadena","posicion","funcional","geometrico","optico","cis","trans","quiral"]'),
('quimica', 'bachillerato', '{2}', 'Biomoléculas', '["glucosa","sacarosa","almidon","celulosa","aminoacido","peptido","proteina","lipido","trigliceridos","nucleotido"]');

-- =========================================================================
-- TECNOLOGÍA (2º Bach)
-- =========================================================================
-- Evita solapes con: Componentes, Renovables, Materiales, Mecanismos,
-- Programacion, Sostenibilidad, Automatizacion, Magnitudes electricas
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('tecnologia', 'bachillerato', '{2}', 'Electrónica digital', '["puerta","biestable","flipflop","contador","registro","multiplexor","decodificador","booleano","binario","hexadecimal"]'),
('tecnologia', 'bachillerato', '{2}', 'Internet de las cosas', '["nodo","pasarela","protocolo","mqtt","zigbee","bluetooth","wifi","cloud","latencia","telemetria"]');

-- =========================================================================
-- VALENCIANO (2º Bach)
-- =========================================================================
-- Evita solapes con: Figures retoriques, Autors, Generes, Connectors,
-- Moviments, Vocabulari academic, Tipologies, Tirant lo Blanc
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('valenciano', 'bachillerato', '{2}', 'Metrica i versificacio', '["vers","estrofa","rima","cesura","sinalefa","accent","hemistiqui","decasillab","alexandri","quartet"]'),
('valenciano', 'bachillerato', '{2}', 'Varietats linguistiques', '["dialecte","idiolecte","registre","estandard","coloquial","formal","argot","jerga","diglossia","bilinguisme"]');

-- =========================================================================
-- ARTE (2º Bach)
-- =========================================================================
-- Evita solapes con: Griego/Romano, Romanico/Gotico, Renacimiento, Impresionismo,
-- Contemporaneo, Espanol, Arquitectura XX, Barroco, Neoclasicismo, Vanguardias
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('arte', 'bachillerato', '{2}', 'Tecnicas pictoricas', '["oleo","acuarela","temple","fresco","pastel","gouache","encaustica","acrilico","aguada","tinta"]'),
('arte', 'bachillerato', '{2}', 'Escultura y materiales', '["marmol","bronce","talla","modelado","fundicion","relieve","busto","ecuestre","patina","yeso"]');
