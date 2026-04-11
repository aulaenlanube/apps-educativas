-- =============================================================================
-- SEED PAREJAS — 2º BACHILLERATO
-- Completa huecos para llegar a 25-30 parejas por asignatura
-- Cada pareja cumple exclusividad semántica con el resto del combo
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ARTE (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('arte', 'bachillerato', '{2}', 'El nacimiento de Venus', 'Botticelli'),
('arte', 'bachillerato', '{2}', 'La escuela de Atenas', 'Rafael'),
('arte', 'bachillerato', '{2}', 'La libertad guiando al pueblo', 'Delacroix'),
('arte', 'bachillerato', '{2}', 'La fuente', 'Duchamp'),
('arte', 'bachillerato', '{2}', 'La danza', 'Matisse'),
('arte', 'bachillerato', '{2}', 'Villa Saboya', 'Le Corbusier');

-- -----------------------------------------------------------------------------
-- BIOLOGIA (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('biologia', 'bachillerato', '{2}', 'Operón lac', 'Regulación génica en bacterias'),
('biologia', 'bachillerato', '{2}', 'Macrófago', 'Fagocitosis inespecífica'),
('biologia', 'bachillerato', '{2}', 'Inmunoglobulina', 'Estructura en Y'),
('biologia', 'bachillerato', '{2}', 'Bacteriófago', 'Virus que infecta bacterias'),
('biologia', 'bachillerato', '{2}', 'Saccharomyces', 'Levadura de la fermentación'),
('biologia', 'bachillerato', '{2}', 'Antibiótico', 'Elimina bacterias patógenas');

-- -----------------------------------------------------------------------------
-- DIBUJO TECNICO (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('dibujo-tecnico', 'bachillerato', '{2}', 'AutoCAD', 'Software CAD 2D y 3D'),
('dibujo-tecnico', 'bachillerato', '{2}', 'SolidWorks', 'Modelado paramétrico 3D'),
('dibujo-tecnico', 'bachillerato', '{2}', 'Línea de tierra', 'Intersección de planos en diédrico'),
('dibujo-tecnico', 'bachillerato', '{2}', 'Abatimiento', 'Giro de un plano sobre otro'),
('dibujo-tecnico', 'bachillerato', '{2}', 'Acotación', 'Indicación de medidas en plano'),
('dibujo-tecnico', 'bachillerato', '{2}', 'Óvalo', 'Curva cerrada de cuatro centros');

-- -----------------------------------------------------------------------------
-- ECONOMIA-EMPRESA (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('economia-empresa', 'bachillerato', '{2}', 'Amortización', 'Depreciación contable del inmovilizado'),
('economia-empresa', 'bachillerato', '{2}', 'Benchmarking', 'Comparación con mejores prácticas'),
('economia-empresa', 'bachillerato', '{2}', 'CRM', 'Gestión de relaciones con clientes'),
('economia-empresa', 'bachillerato', '{2}', 'Just in Time', 'Producción ajustada a la demanda'),
('economia-empresa', 'bachillerato', '{2}', 'Cuenta de resultados', 'Ingresos menos gastos del ejercicio'),
('economia-empresa', 'bachillerato', '{2}', 'Cooperativa', 'Socios con un voto cada uno');

-- -----------------------------------------------------------------------------
-- FILOSOFIA (24 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('filosofia', 'bachillerato', '{2}', 'Eterno retorno', 'Tesis nietzscheana del tiempo cíclico'),
('filosofia', 'bachillerato', '{2}', 'Juicio sintético a priori', 'Tipo de juicio en la Crítica kantiana');

-- -----------------------------------------------------------------------------
-- FISICA (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('fisica', 'bachillerato', '{2}', 'Fisión nuclear', 'División de un núcleo pesado'),
('fisica', 'bachillerato', '{2}', 'Fusión nuclear', 'Unión de núcleos ligeros'),
('fisica', 'bachillerato', '{2}', 'Lente convergente', 'Distancia focal positiva'),
('fisica', 'bachillerato', '{2}', 'Lente divergente', 'Distancia focal negativa'),
('fisica', 'bachillerato', '{2}', 'Bobina', 'Genera campo magnético al circular corriente'),
('fisica', 'bachillerato', '{2}', 'Desintegración alfa', 'Emisión de un núcleo de helio');

-- -----------------------------------------------------------------------------
-- FRANCES (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('frances', 'bachillerato', '{2}', 'Toutefois', 'Con todo'),
('frances', 'bachillerato', '{2}', 'Grâce à', 'Gracias a'),
('frances', 'bachillerato', '{2}', 'Simone de Beauvoir', 'Le Deuxième Sexe'),
('frances', 'bachillerato', '{2}', 'Jean-Paul Sartre', 'La Nausée'),
('frances', 'bachillerato', '{2}', 'Saint-Exupéry', 'Le Petit Prince'),
('frances', 'bachillerato', '{2}', 'Dès lors', 'A partir de entonces');

-- -----------------------------------------------------------------------------
-- GEOGRAFIA (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('geografia', 'bachillerato', '{2}', 'Sistema Central', 'Gredos y Guadarrama'),
('geografia', 'bachillerato', '{2}', 'Duero', 'Desemboca en Oporto'),
('geografia', 'bachillerato', '{2}', 'Clima de montaña', 'Temperaturas bajas por altitud'),
('geografia', 'bachillerato', '{2}', 'AVE', 'Red de alta velocidad ferroviaria'),
('geografia', 'bachillerato', '{2}', 'Sector primario', 'Extracción de recursos naturales'),
('geografia', 'bachillerato', '{2}', 'Pesca de altura', 'Lejos de la costa varios días');

-- -----------------------------------------------------------------------------
-- HISTORIA-ESPANA (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('historia-espana', 'bachillerato', '{2}', 'Trienio Liberal', '1820-1823'),
('historia-espana', 'bachillerato', '{2}', 'Sexenio Democrático', '1868-1874'),
('historia-espana', 'bachillerato', '{2}', 'Pacto de San Sebastián', '1930'),
('historia-espana', 'bachillerato', '{2}', 'Ley para la Reforma Política', '1976'),
('historia-espana', 'bachillerato', '{2}', '23-F', 'Intento de golpe de Tejero'),
('historia-espana', 'bachillerato', '{2}', 'Pactos de la Moncloa', '1977');

-- -----------------------------------------------------------------------------
-- INGLES (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('ingles', 'bachillerato', '{2}', 'Furthermore', 'Es más'),
('ingles', 'bachillerato', '{2}', 'Owing to', 'Debido a'),
('ingles', 'bachillerato', '{2}', 'Overcome', 'Superar'),
('ingles', 'bachillerato', '{2}', 'Straightforward', 'Sencillo y directo'),
('ingles', 'bachillerato', '{2}', 'Come across', 'Encontrarse por casualidad'),
('ingles', 'bachillerato', '{2}', 'Simile', 'Símil');

-- -----------------------------------------------------------------------------
-- LATIN (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('latin', 'bachillerato', '{2}', 'Marcial', 'Epigramas'),
('latin', 'bachillerato', '{2}', 'Terencio', 'Comedia de costumbres'),
('latin', 'bachillerato', '{2}', 'Quintiliano', 'Institutio oratoria'),
('latin', 'bachillerato', '{2}', 'Veni vidi vici', 'Llegué, vi, vencí'),
('latin', 'bachillerato', '{2}', 'Gerundivo', 'Adjetivo verbal de obligación'),
('latin', 'bachillerato', '{2}', 'Dativo', 'Caso del complemento indirecto');

-- -----------------------------------------------------------------------------
-- LENGUA (24 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('lengua', 'bachillerato', '{2}', 'Miguel Hernández', 'El rayo que no cesa'),
('lengua', 'bachillerato', '{2}', 'Generación del 98', 'Regeneracionismo tras el Desastre');

-- -----------------------------------------------------------------------------
-- MATEMATICAS (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('matematicas', 'bachillerato', '{2}', 'Producto escalar', 'u·v = |u||v|cos(α)'),
('matematicas', 'bachillerato', '{2}', 'Producto vectorial', 'Resultado perpendicular al plano'),
('matematicas', 'bachillerato', '{2}', 'Regla de Cramer', 'Resolución por determinantes'),
('matematicas', 'bachillerato', '{2}', 'Integración por partes', '∫u dv = uv - ∫v du'),
('matematicas', 'bachillerato', '{2}', 'Teorema de Bayes', 'Probabilidad condicionada inversa'),
('matematicas', 'bachillerato', '{2}', 'Distribución binomial', 'B(n,p)');

-- -----------------------------------------------------------------------------
-- PROGRAMACION (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('programacion', 'bachillerato', '{2}', 'Patrón Singleton', 'Una única instancia de la clase'),
('programacion', 'bachillerato', '{2}', 'MVC', 'Modelo-Vista-Controlador'),
('programacion', 'bachillerato', '{2}', 'React', 'Librería de interfaces componentes'),
('programacion', 'bachillerato', '{2}', 'SQL Injection', 'Ataque por inyección en consultas'),
('programacion', 'bachillerato', '{2}', 'Hashing', 'Cifrado unidireccional de contraseñas'),
('programacion', 'bachillerato', '{2}', 'REST', 'Arquitectura de servicios web');

-- -----------------------------------------------------------------------------
-- QUIMICA (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('quimica', 'bachillerato', '{2}', 'Kc', 'Constante de equilibrio en concentraciones'),
('quimica', 'bachillerato', '{2}', 'Kp', 'Constante de equilibrio en presiones'),
('quimica', 'bachillerato', '{2}', 'Catalizador', 'Disminuye la energía de activación'),
('quimica', 'bachillerato', '{2}', 'Kps', 'Producto de solubilidad'),
('quimica', 'bachillerato', '{2}', 'Disolución tampón', 'Resiste cambios de pH'),
('quimica', 'bachillerato', '{2}', 'Benceno', 'Hidrocarburo aromático cíclico');

-- -----------------------------------------------------------------------------
-- TECNOLOGIA (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('tecnologia', 'bachillerato', '{2}', 'Puerta AND', 'Salida 1 solo si ambas entradas son 1'),
('tecnologia', 'bachillerato', '{2}', 'Puerta OR', 'Salida 1 si alguna entrada es 1'),
('tecnologia', 'bachillerato', '{2}', 'Flip-flop', 'Biestable de memoria digital'),
('tecnologia', 'bachillerato', '{2}', 'Machine Learning', 'Aprendizaje automático de máquinas'),
('tecnologia', 'bachillerato', '{2}', 'IoT', 'Internet de las cosas'),
('tecnologia', 'bachillerato', '{2}', 'Raspberry Pi', 'Ordenador de placa única');

-- -----------------------------------------------------------------------------
-- VALENCIANO (20 -> 26)
-- -----------------------------------------------------------------------------
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('valenciano', 'bachillerato', '{2}', 'Vicent Andrés Estellés', 'Llibre de meravelles'),
('valenciano', 'bachillerato', '{2}', 'Mercè Rodoreda', 'La plaça del Diamant'),
('valenciano', 'bachillerato', '{2}', 'Isabel-Clara Simó', 'Narrativa contemporània valenciana'),
('valenciano', 'bachillerato', '{2}', 'Manuel Baixauli', 'L''home manuscrit'),
('valenciano', 'bachillerato', '{2}', 'Ferran Torrent', 'Novel·la negra valenciana'),
('valenciano', 'bachillerato', '{2}', 'Salvador Espriu', 'La pell de brau');
