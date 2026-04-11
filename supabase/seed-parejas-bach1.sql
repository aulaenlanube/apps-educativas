-- Seed parejas Bachillerato 1º — completando huecos hasta 25-30 por combo
-- Regla crítica: exclusividad semántica dentro de cada combo (subject/curso)

-- =====================================================================
-- BIOLOGÍA (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('biologia', 'bachillerato', '{1}', 'Glucólisis', 'Degradación de la glucosa en citoplasma'),
('biologia', 'bachillerato', '{1}', 'Ciclo de Krebs', 'Oxidación del acetil-CoA en la matriz mitocondrial'),
('biologia', 'bachillerato', '{1}', 'ARN mensajero', 'Transporta la información del núcleo al ribosoma'),
('biologia', 'bachillerato', '{1}', 'Codón', 'Triplete de bases que codifica un aminoácido'),
('biologia', 'bachillerato', '{1}', 'Enzima', 'Biocatalizador de naturaleza proteica'),
('biologia', 'bachillerato', '{1}', 'Gen recesivo', 'Solo se expresa en homocigosis');

-- =====================================================================
-- DIBUJO TÉCNICO (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('dibujo-tecnico', 'bachillerato', '{1}', 'Mediatriz', 'Perpendicular por el punto medio de un segmento'),
('dibujo-tecnico', 'bachillerato', '{1}', 'Bisectriz', 'Divide un ángulo en dos partes iguales'),
('dibujo-tecnico', 'bachillerato', '{1}', 'Polígono regular', 'Todos los lados y ángulos iguales'),
('dibujo-tecnico', 'bachillerato', '{1}', 'Acotación', 'Normalización UNE para indicar medidas'),
('dibujo-tecnico', 'bachillerato', '{1}', 'Arco capaz', 'Lugar geométrico de ángulos iguales sobre un segmento'),
('dibujo-tecnico', 'bachillerato', '{1}', 'Óvalo', 'Curva cerrada formada por cuatro arcos de circunferencia');

-- =====================================================================
-- ECONOMÍA (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('economia', 'bachillerato', '{1}', 'Elasticidad precio', 'Sensibilidad de la demanda ante el precio'),
('economia', 'bachillerato', '{1}', 'Competencia perfecta', 'Muchos oferentes y producto homogéneo'),
('economia', 'bachillerato', '{1}', 'Externalidad negativa', 'Contaminación no compensada al tercero'),
('economia', 'bachillerato', '{1}', 'Renta per cápita', 'PIB dividido entre población'),
('economia', 'bachillerato', '{1}', 'Desempleo friccional', 'Tiempo de búsqueda entre empleos'),
('economia', 'bachillerato', '{1}', 'Prima de riesgo', 'Diferencial respecto al bono alemán');

-- =====================================================================
-- EDUCACIÓN FÍSICA (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('ed-fisica', 'bachillerato', '{1}', 'Sistema aeróbico', 'Energía prolongada con oxígeno'),
('ed-fisica', 'bachillerato', '{1}', 'Sistema anaeróbico láctico', 'Energía intensa con producción de lactato'),
('ed-fisica', 'bachillerato', '{1}', 'Sistema ATP-PC', 'Energía explosiva de los primeros segundos'),
('ed-fisica', 'bachillerato', '{1}', 'Tendinitis', 'Inflamación de un tendón por sobreuso'),
('ed-fisica', 'bachillerato', '{1}', 'Frecuencia cardíaca máxima', '220 menos la edad'),
('ed-fisica', 'bachillerato', '{1}', 'Método continuo', 'Entrenamiento sin pausas a ritmo constante');

-- =====================================================================
-- FILOSOFÍA (tenía 24, +2 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('filosofia', 'bachillerato', '{1}', 'Hume', 'Crítica a la causalidad'),
('filosofia', 'bachillerato', '{1}', 'Nietzsche', 'Muerte de Dios y superhombre');

-- =====================================================================
-- FÍSICA (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('fisica', 'bachillerato', '{1}', 'Primera ley de Newton', 'Principio de inercia'),
('fisica', 'bachillerato', '{1}', 'Tercera ley de Newton', 'Acción y reacción'),
('fisica', 'bachillerato', '{1}', 'Ley de gravitación universal', 'F = G·m₁·m₂/r²'),
('fisica', 'bachillerato', '{1}', 'Período de un péndulo', 'T = 2π·√(L/g)'),
('fisica', 'bachillerato', '{1}', 'Efecto Doppler', 'Variación de frecuencia por movimiento relativo'),
('fisica', 'bachillerato', '{1}', 'Ley de Hooke', 'F = k·x en un muelle elástico');

-- =====================================================================
-- FRANCÉS (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('frances', 'bachillerato', '{1}', 'Par conséquent', 'En consecuencia'),
('frances', 'bachillerato', '{1}', 'Tandis que', 'Mientras que'),
('frances', 'bachillerato', '{1}', 'Grâce à', 'Gracias a'),
('frances', 'bachillerato', '{1}', 'Stendhal', 'Le Rouge et le Noir'),
('frances', 'bachillerato', '{1}', 'Alexandre Dumas', 'Les Trois Mousquetaires'),
('frances', 'bachillerato', '{1}', 'Antoine de Saint-Exupéry', 'Le Petit Prince');

-- =====================================================================
-- HISTORIA DEL MUNDO (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('historia-mundo', 'bachillerato', '{1}', 'Revolución Rusa', '1917'),
('historia-mundo', 'bachillerato', '{1}', 'Lenin', 'Líder bolchevique'),
('historia-mundo', 'bachillerato', '{1}', 'Stalin', 'Dictador soviético de los planes quinquenales'),
('historia-mundo', 'bachillerato', '{1}', 'Churchill', 'Primer ministro británico en la II Guerra Mundial'),
('historia-mundo', 'bachillerato', '{1}', 'Crisis de los misiles', 'Cuba 1962'),
('historia-mundo', 'bachillerato', '{1}', 'Mao Zedong', 'Revolución comunista china');

-- =====================================================================
-- INGLÉS (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('ingles', 'bachillerato', '{1}', 'Furthermore', 'Es más'),
('ingles', 'bachillerato', '{1}', 'Whereas', 'Mientras que'),
('ingles', 'bachillerato', '{1}', 'Despite', 'A pesar de'),
('ingles', 'bachillerato', '{1}', 'Come across', 'Encontrar por casualidad'),
('ingles', 'bachillerato', '{1}', 'Overwhelming', 'Abrumador'),
('ingles', 'bachillerato', '{1}', 'Simile', 'Símil literario');

-- =====================================================================
-- LATÍN (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('latin', 'bachillerato', '{1}', 'Manus, manus', '4ª declinación'),
('latin', 'bachillerato', '{1}', 'Res, rei', '5ª declinación'),
('latin', 'bachillerato', '{1}', 'Neptuno', 'Poseidón'),
('latin', 'bachillerato', '{1}', 'Ceres', 'Deméter'),
('latin', 'bachillerato', '{1}', 'Termas', 'Baños públicos romanos'),
('latin', 'bachillerato', '{1}', 'Domus', 'Vivienda urbana de familia acomodada');

-- =====================================================================
-- LENGUA (tenía 24, +2 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('lengua', 'bachillerato', '{1}', 'Personificación', 'Atribuir cualidades humanas a seres inanimados'),
('lengua', 'bachillerato', '{1}', 'Complemento indirecto', 'Se sustituye por le, les');

-- =====================================================================
-- LITERATURA UNIVERSAL (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('literatura-universal', 'bachillerato', '{1}', 'Esquilo', 'Orestíada'),
('literatura-universal', 'bachillerato', '{1}', 'Petrarca', 'Cancionero'),
('literatura-universal', 'bachillerato', '{1}', 'Molière', 'El avaro'),
('literatura-universal', 'bachillerato', '{1}', 'Oscar Wilde', 'El retrato de Dorian Gray'),
('literatura-universal', 'bachillerato', '{1}', 'Edgar Allan Poe', 'El cuervo'),
('literatura-universal', 'bachillerato', '{1}', 'García Márquez', 'Cien años de soledad');

-- =====================================================================
-- MATEMÁTICAS (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('matematicas', 'bachillerato', '{1}', 'Derivada de una constante', '0'),
('matematicas', 'bachillerato', '{1}', 'Derivada de tan(x)', '1 + tan²(x)'),
('matematicas', 'bachillerato', '{1}', 'Integral de 1/x', 'ln|x| + C'),
('matematicas', 'bachillerato', '{1}', 'Mínimo relativo', 'f''(x)=0 y f''''(x)>0'),
('matematicas', 'bachillerato', '{1}', 'Determinante de matriz triangular', 'Producto de la diagonal'),
('matematicas', 'bachillerato', '{1}', 'Teorema de Bolzano', 'Existencia de raíz en un intervalo continuo');

-- =====================================================================
-- PROGRAMACIÓN (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('programacion', 'bachillerato', '{1}', 'Constante', 'Valor que no cambia durante la ejecución'),
('programacion', 'bachillerato', '{1}', 'Abstracción', 'Ocultar complejidad mostrando lo esencial'),
('programacion', 'bachillerato', '{1}', 'DELETE', 'Eliminar registros de una tabla'),
('programacion', 'bachillerato', '{1}', 'UPDATE', 'Modificar registros existentes'),
('programacion', 'bachillerato', '{1}', 'JavaScript', 'Lenguaje interactivo del navegador'),
('programacion', 'bachillerato', '{1}', 'GitHub', 'Plataforma para alojar repositorios remotos');

-- =====================================================================
-- TECNOLOGÍA (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('tecnologia', 'bachillerato', '{1}', 'Bobina', 'Almacena energía en campo magnético'),
('tecnologia', 'bachillerato', '{1}', 'Fusible', 'Protege el circuito ante sobreintensidad'),
('tecnologia', 'bachillerato', '{1}', 'Relé', 'Interruptor accionado electromagnéticamente'),
('tecnologia', 'bachillerato', '{1}', 'Servomotor', 'Motor con control preciso de posición'),
('tecnologia', 'bachillerato', '{1}', 'Polea', 'Cambia la dirección de una fuerza'),
('tecnologia', 'bachillerato', '{1}', 'Neumática', 'Tecnología basada en el aire comprimido');

-- =====================================================================
-- VALENCIANO (tenía 20, +6 = 26)
-- =====================================================================
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('valenciano', 'bachillerato', '{1}', 'Vicent Andrés Estellés', 'Llibre de meravelles'),
('valenciano', 'bachillerato', '{1}', 'Jaume Roig', 'Espill'),
('valenciano', 'bachillerato', '{1}', 'Isabel de Villena', 'Vita Christi'),
('valenciano', 'bachillerato', '{1}', 'Per tant', 'En conseqüència'),
('valenciano', 'bachillerato', '{1}', 'Comparació', 'Relació mitjançant nexe com'),
('valenciano', 'bachillerato', '{1}', 'Rondalla', 'Narració tradicional d arrel popular');
