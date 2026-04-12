-- ================================================================
-- SEED: Bachillerato gaps pequeños (Runner, Intruso, Parejas)
-- Cursos: Tutoría 1º y 2º Bach, Ed. Física 2º Bach
-- ================================================================

-- ============= TUTORÍA 1º BACH =============
-- Runner (10 categorías × 10 palabras)
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('tutoria', 'bachillerato', '{1}', 'Gestion del estres', '["respiracion","relajacion","mindfulness","meditacion","pausas","sueno","deporte","organizacion","desconexion","journaling"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Tecnicas de estudio avanzadas', '["pomodoro","cornell","feynman","repaso espaciado","flashcards","palacio mental","sq3r","mapa conceptual","autoexamen","recuperacion activa"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Carreras universitarias', '["medicina","derecho","ingenieria","arquitectura","psicologia","fisica","biologia","filologia","veterinaria","economia"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Habilidades blandas', '["asertividad","empatia","oratoria","liderazgo","negociacion","cooperacion","adaptabilidad","creatividad","pensamiento critico","gestion tiempo"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Fake news y medios', '["bulo","verificacion","fuentes","sesgo","clickbait","titular","fact checking","contexto","contraste","autor"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Salud mental adolescente', '["ansiedad","depresion","autoestima","resiliencia","apoyo","terapia","prevencion","autocuidado","equilibrio","bienestar"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Valores eticos', '["honestidad","justicia","libertad","tolerancia","solidaridad","dignidad","integridad","lealtad","gratitud","humildad"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Habitos saludables jovenes', '["dieta","hidratacion","descanso","ejercicio","higiene","postura","desconexion digital","moderacion","rutina","relaciones"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Ciudadania democratica', '["voto","constitucion","derechos","deberes","participacion","sufragio","pluralismo","igualdad","justicia","libertad expresion"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Orientacion EBAU', '["fase general","fase especifica","nota corte","parametros","ponderacion","matricula","preinscripcion","universidades","grados","pruebas"]'::jsonb);

-- Intruso (10 sets)
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('tutoria', 'bachillerato', '{1}', 'Tecnicas para gestionar el estres', '["respiracion diafragmatica","mindfulness","meditacion","yoga","paseos","sueno reparador","organizacion","musica relajante","escritura","pausas activas","ejercicio moderado","desconexion digital","tai chi","relajacion progresiva"]'::jsonb, '["cafeina en exceso","trasnochar","discutir","saltarse comidas","rumiar pensamientos","procrastinar","sobrecarga de tareas"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Tecnicas de estudio eficaces', '["pomodoro","flashcards","cornell","feynman","repaso espaciado","mapa conceptual","esquema","resumen","autoexamen","recuperacion activa","subrayado jerarquico","lectura comprensiva","palacio mental","sq3r"]'::jsonb, '["copiar al companero","memorizar sin entender","estudiar con tv","dejar todo para el final","chuleta","distracciones","usar el movil"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Carreras universitarias reconocidas', '["medicina","derecho","arquitectura","ingenieria informatica","psicologia","biologia","fisica","filologia","matematicas","quimica","economia","historia","bellas artes","enfermeria"]'::jsonb, '["adivinacion","astrologia","cartomancia","ufologia","alquimia","brujeria","quiromancia"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Habilidades blandas laborales', '["comunicacion","trabajo en equipo","liderazgo","empatia","negociacion","adaptabilidad","creatividad","pensamiento critico","resolucion de problemas","gestion del tiempo","asertividad","oratoria","iniciativa","resiliencia"]'::jsonb, '["altura","peso","color de ojos","edad","complexion","talla de zapato","fuerza bruta"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Senales de fake news', '["titular alarmista","sin fuente","ortografia deficiente","imagen manipulada","web desconocida","datos sin contexto","sesgo evidente","sin autor","cita inventada","pide compartir","clickbait","exceso de emociones","ausencia de fecha","opinion disfrazada"]'::jsonb, '["fuentes contrastadas","periodista identificado","datos verificables","enlaces oficiales","fecha clara","contexto amplio","referencias academicas"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Conductas protectoras salud mental', '["pedir ayuda","dormir bien","ejercicio","relaciones sanas","rutina","aficiones","autocuidado","terapia","respiracion","hablar sentimientos","contacto social","gratitud","mindfulness","limites digitales"]'::jsonb, '["aislarse","consumir alcohol","reprimir emociones","trasnochar","autoexigencia extrema","comparacion constante","rumiar"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Valores eticos universales', '["honestidad","justicia","libertad","tolerancia","solidaridad","dignidad","integridad","lealtad","responsabilidad","respeto","empatia","gratitud","humildad","compromiso"]'::jsonb, '["egoismo","envidia","soberbia","mentira","crueldad","avaricia","cinismo"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Elementos del sistema democratico', '["voto secreto","constitucion","division de poderes","pluralismo","libertad de prensa","derechos humanos","elecciones libres","parlamento","sufragio universal","estado de derecho","igualdad ante la ley","participacion ciudadana","oposicion","alternancia"]'::jsonb, '["censura","partido unico","dictador","culto al lider","tortura","represion","autoritarismo"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Conceptos EBAU', '["fase general","fase especifica","nota de corte","parametros de ponderacion","matricula","preinscripcion","comentario de texto","examen tipo test","matricula de honor","nota media","calificacion","asignaturas","tribunal","convocatoria"]'::jsonb, '["recreo","dibujos animados","guarderia","educacion infantil","juguetes","merienda","cuento"]'::jsonb),
('tutoria', 'bachillerato', '{1}', 'Finanzas personales basicas', '["presupuesto","ahorro","ingresos","gastos","nomina","irpf","impuestos","cuenta bancaria","interes","deuda","hipoteca","tarjeta","inversion","pension"]'::jsonb, '["regalos infinitos","dinero infinito","suerte loteria","prestamos abusivos","compras impulsivas","capricho","despilfarro"]'::jsonb);

-- Parejas (25)
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('tutoria', 'bachillerato', '{1}', 'EBAU', 'Examen de acceso a la universidad'),
('tutoria', 'bachillerato', '{1}', 'Nota de corte', 'Puntuacion minima para entrar en una carrera'),
('tutoria', 'bachillerato', '{1}', 'Ponderacion', 'Peso de una asignatura en la fase especifica'),
('tutoria', 'bachillerato', '{1}', 'Tecnica Pomodoro', 'Bloques de 25 minutos con pausas'),
('tutoria', 'bachillerato', '{1}', 'Metodo Cornell', 'Apuntes divididos en columnas'),
('tutoria', 'bachillerato', '{1}', 'Tecnica Feynman', 'Explicar un concepto con palabras sencillas'),
('tutoria', 'bachillerato', '{1}', 'Repaso espaciado', 'Revisar contenido en intervalos crecientes'),
('tutoria', 'bachillerato', '{1}', 'Flashcards', 'Tarjetas de pregunta y respuesta'),
('tutoria', 'bachillerato', '{1}', 'Mindfulness', 'Atencion plena al momento presente'),
('tutoria', 'bachillerato', '{1}', 'Respiracion diafragmatica', 'Tecnica para reducir la ansiedad'),
('tutoria', 'bachillerato', '{1}', 'Asertividad', 'Expresar lo que piensas respetando al otro'),
('tutoria', 'bachillerato', '{1}', 'Resiliencia', 'Capacidad de superar la adversidad'),
('tutoria', 'bachillerato', '{1}', 'Procrastinar', 'Posponer de forma injustificada'),
('tutoria', 'bachillerato', '{1}', 'Fake news', 'Noticia falsa difundida como verdadera'),
('tutoria', 'bachillerato', '{1}', 'Fact checking', 'Verificacion de hechos'),
('tutoria', 'bachillerato', '{1}', 'Sesgo cognitivo', 'Error sistematico en el pensamiento'),
('tutoria', 'bachillerato', '{1}', 'Pensamiento critico', 'Evaluar la informacion antes de aceptarla'),
('tutoria', 'bachillerato', '{1}', 'Vocacion', 'Inclinacion profunda hacia una profesion'),
('tutoria', 'bachillerato', '{1}', 'IRPF', 'Impuesto sobre la renta de las personas fisicas'),
('tutoria', 'bachillerato', '{1}', 'Presupuesto personal', 'Planificacion de ingresos y gastos'),
('tutoria', 'bachillerato', '{1}', 'Sufragio universal', 'Derecho al voto para toda la ciudadania'),
('tutoria', 'bachillerato', '{1}', 'Division de poderes', 'Separacion entre ejecutivo, legislativo y judicial'),
('tutoria', 'bachillerato', '{1}', 'Derechos humanos', 'Garantias inherentes a toda persona'),
('tutoria', 'bachillerato', '{1}', 'Mapa conceptual', 'Conceptos unidos mediante enlaces jerarquicos'),
('tutoria', 'bachillerato', '{1}', 'Oratoria', 'Arte de hablar en publico con eficacia');


-- ============= TUTORÍA 2º BACH =============
-- Runner (10 categorías × 10 palabras)
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('tutoria', 'bachillerato', '{2}', 'Preparacion EBAU', '["simulacro","cronograma","repasos","examenes","tribunal","convocatoria","nota","calificacion","cupo","ponderaciones"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Salidas profesionales', '["investigador","ingeniero","abogado","medico","docente","empresario","diplomatico","consultor","economista","tecnico"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Finanzas adultas', '["hipoteca","declaracion","nomina","irpf","seguro","plan pensiones","fondo","bolsa","interes","inversion"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Psicologia positiva', '["fortalezas","flujo","autoeficacia","gratitud","optimismo","proposito","significado","logro","savoring","mindset"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Prevencion adicciones', '["alcohol","tabaco","cannabis","ludopatia","movil","redes","vapeo","pornografia","trabajo","cafeina"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Tramites universidad', '["preinscripcion","matricula","traslado","beca","alojamiento","erasmus","convalidacion","expediente","credencial","mentor"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Metodologia cientifica', '["hipotesis","experimento","variables","control","replica","muestra","datos","analisis","conclusion","revision"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Etica digital', '["privacidad","huella","cookies","consentimiento","rgpd","doxxing","deepfake","troll","anonimato","cifrado"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Emprendimiento', '["idea","plan negocio","mercado","cliente","modelo","viabilidad","inversion","socio","startup","pitch"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Habitos adultos', '["autonomia","puntualidad","compromiso","iniciativa","responsabilidad","proactividad","disciplina","autocuidado","planificacion","balance"]'::jsonb);

-- Intruso (10 sets)
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('tutoria', 'bachillerato', '{2}', 'Estrategias de preparacion EBAU', '["cronograma","simulacros","bancos de preguntas","examenes de anos previos","repaso espaciado","grupos de estudio","tutorias","mapas conceptuales","resumenes activos","descanso programado","tecnicas relajacion","dieta equilibrada","sueno adecuado","planificacion inversa"]'::jsonb, '["trasnochar noche previa","saltar comidas","aislamiento total","pensamientos catastroficos","copiar","chuletas","consumir estimulantes"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Conceptos financieros adultos', '["nomina","irpf","seguridad social","hipoteca","plan de pensiones","fondo de inversion","cuenta corriente","tarjeta de debito","bolsa","interes compuesto","amortizacion","prestamo","dividendo","etf"]'::jsonb, '["hada madrina","dinero magico","pocion de riqueza","cofre pirata","amuleto","cuento","lampara magica"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Fortalezas de la psicologia positiva', '["gratitud","optimismo","perseverancia","curiosidad","creatividad","amor","bondad","justicia","liderazgo","prudencia","autorregulacion","esperanza","humor","espiritualidad"]'::jsonb, '["pesimismo","rencor","envidia","crueldad","pereza","hostilidad","cinismo"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Factores de riesgo en adicciones', '["baja autoestima","grupo de iguales","estres","disponibilidad","publicidad","curiosidad","ansiedad","impulsividad","falta de limites","problemas familiares","aburrimiento","imitacion","busqueda sensaciones","evasion"]'::jsonb, '["alta autoestima","red de apoyo","deporte regular","aficiones saludables","comunicacion familiar","objetivos claros","autocuidado"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Tramites para entrar en la universidad', '["preinscripcion","matricula","beca","traslado de expediente","credencial EBAU","acreditacion idioma","alojamiento","convalidacion","nota media","carta motivacion","pruebas especificas","plazos","justificante pago","documentacion"]'::jsonb, '["recogida juguetes","clase de plastilina","recreo","dibujos animados","merienda","guarderia","cuentacuentos"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Pasos del metodo cientifico', '["observacion","pregunta","hipotesis","experimento","control de variables","recogida de datos","analisis","conclusion","revision por pares","replica","publicacion","contrastacion","reformulacion","teoria"]'::jsonb, '["adivinacion","prejuicio","opinion infundada","rumor","creencia dogmatica","autoridad ciega","tradicion"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Proteccion de datos y RGPD', '["consentimiento","derecho al olvido","minimizacion","finalidad","base legitimadora","responsable tratamiento","encargado","portabilidad","anonimizacion","cifrado","registro de actividades","delegado proteccion","brecha seguridad","notificacion"]'::jsonb, '["recoger sin permiso","difundir datos","vender informacion","acceso libre total","sin limite temporal","rastreo oculto","suplantacion"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Elementos de un plan de negocio', '["resumen ejecutivo","propuesta de valor","analisis de mercado","publico objetivo","competencia","modelo de ingresos","plan financiero","marketing","equipo","operaciones","hitos","riesgos","estrategia","ventaja competitiva"]'::jsonb, '["horoscopo","tarot","suerte","intuicion sin datos","rumores","corazonada unica","superchería"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Habilidades adultas responsables', '["autonomia","puntualidad","cumplimiento compromisos","planificacion","iniciativa","gestion economica","autocuidado","toma decisiones","asumir consecuencias","resolver problemas","comunicacion","empatia","proactividad","disciplina"]'::jsonb, '["dependencia absoluta","impuntualidad","incumplimiento","improvisacion total","pasividad","despilfarro","desidia"]'::jsonb),
('tutoria', 'bachillerato', '{2}', 'Conductas dopaminergicas saludables', '["deporte","lectura","musica","conversacion","logro personal","naturaleza","creatividad","meditacion","sueno","cocinar","aficiones","voluntariado","viajes","aprendizaje"]'::jsonb, '["scroll infinito","binge watching","apuestas","porno compulsivo","videojuegos excesivos","notificaciones constantes","comida ultraprocesada"]'::jsonb);

-- Parejas (25)
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('tutoria', 'bachillerato', '{2}', 'Hipoteca', 'Prestamo a largo plazo para comprar vivienda'),
('tutoria', 'bachillerato', '{2}', 'Nomina', 'Documento con el detalle del salario mensual'),
('tutoria', 'bachillerato', '{2}', 'Plan de pensiones', 'Ahorro a largo plazo para la jubilacion'),
('tutoria', 'bachillerato', '{2}', 'Interes compuesto', 'Intereses que generan nuevos intereses'),
('tutoria', 'bachillerato', '{2}', 'RGPD', 'Reglamento europeo de proteccion de datos'),
('tutoria', 'bachillerato', '{2}', 'Deepfake', 'Video falso generado por inteligencia artificial'),
('tutoria', 'bachillerato', '{2}', 'Doxxing', 'Difusion publica de datos privados'),
('tutoria', 'bachillerato', '{2}', 'Huella digital', 'Rastro que dejamos en internet'),
('tutoria', 'bachillerato', '{2}', 'Flow', 'Estado de concentracion optima en una tarea'),
('tutoria', 'bachillerato', '{2}', 'Autoeficacia', 'Creencia en la propia capacidad para lograr metas'),
('tutoria', 'bachillerato', '{2}', 'Ludopatia', 'Adiccion patologica al juego'),
('tutoria', 'bachillerato', '{2}', 'Vapeo', 'Inhalacion de aerosol de cigarrillos electronicos'),
('tutoria', 'bachillerato', '{2}', 'Erasmus', 'Programa europeo de movilidad estudiantil'),
('tutoria', 'bachillerato', '{2}', 'Preinscripcion', 'Solicitud previa de plaza universitaria'),
('tutoria', 'bachillerato', '{2}', 'Beca', 'Ayuda economica para estudios'),
('tutoria', 'bachillerato', '{2}', 'Revision por pares', 'Evaluacion cientifica entre expertos'),
('tutoria', 'bachillerato', '{2}', 'Hipotesis', 'Suposicion que se intenta verificar'),
('tutoria', 'bachillerato', '{2}', 'Variable de control', 'Factor que se mantiene constante en un experimento'),
('tutoria', 'bachillerato', '{2}', 'Pitch', 'Presentacion breve de una idea de negocio'),
('tutoria', 'bachillerato', '{2}', 'Startup', 'Empresa emergente de alto crecimiento'),
('tutoria', 'bachillerato', '{2}', 'Propuesta de valor', 'Lo que diferencia un producto del resto'),
('tutoria', 'bachillerato', '{2}', 'Viabilidad', 'Posibilidad real de que un proyecto funcione'),
('tutoria', 'bachillerato', '{2}', 'Proactividad', 'Tomar la iniciativa antes de que pidan'),
('tutoria', 'bachillerato', '{2}', 'Balance vida-trabajo', 'Equilibrio entre lo personal y lo profesional'),
('tutoria', 'bachillerato', '{2}', 'Mentoria', 'Acompanamiento de alguien con mas experiencia');


-- ============= ED. FÍSICA 2º BACH =============
-- Runner (10 categorías × 10 palabras)
INSERT INTO runner_categories (subject_id, level, grades, category_name, words) VALUES
('ed-fisica', 'bachillerato', '{2}', 'Fisiologia avanzada', '["mitocondria","atp","lactato","glucogeno","hemoglobina","capilarizacion","hipertrofia","hiperplasia","sarcomero","creatina"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Nutricion deportiva', '["carga glucogeno","ventana anabolica","hidratacion","electrolitos","whey","caseina","bcaa","creatinina","maltodextrina","geles"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Biomecanica', '["palanca","torque","inercia","momento","vector","cinematica","cinetica","centro masas","goniometro","angulo"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Umbrales metabolicos', '["umbral aerobico","umbral anaerobico","vt1","vt2","maxlass","steady state","cociente respiratorio","lactacidemia","eva","ppo"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Psicologia deportiva', '["focus","activacion","imagineria","autocharla","rutina","flow","visualizacion","confianza","concentracion","cohesion"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Sustancias dopantes', '["eritropoyetina","esteroides","testosterona","hormona crecimiento","beta bloqueantes","diureticos","estimulantes","anabolizantes","narcoticos","insulina"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Deporte adaptado', '["boccia","goalball","paraciclismo","paratriatlon","baloncesto silla","tenis silla","esgrima silla","natacion adaptada","futbol ciegos","powerlifting"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Recuperacion activa', '["sauna","crioterapia","masaje","foam roller","estiramiento","bano contraste","compresion","descarga","sueno","electroestimulacion"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Entrenamiento concurrente', '["aerobico","fuerza","interferencia","orden","recuperacion","periodizacion","bloques","microciclo","mesociclo","macrociclo"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Prevencion lesiones', '["calentamiento","propiocepcion","vendaje","core","movilidad","fortalecimiento","tecnica","descanso","calzado","carga progresiva"]'::jsonb);

-- Intruso (10 sets)
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('ed-fisica', 'bachillerato', '{2}', 'Elementos fisiologicos del musculo', '["sarcomero","actina","miosina","titina","sarcolema","mitocondria","reticulo sarcoplasmico","calcio","atp","fibra lenta","fibra rapida","miofibrilla","tendon de union","placa motora"]'::jsonb, '["nefrona","alveolo","cristalino","cornea","neurona dopaminergica","hepatocito","linfocito"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Suplementos nutricionales deportivos', '["whey protein","caseina","bcaa","creatina","beta alanina","cafeina","maltodextrina","geles energeticos","electrolitos","nitrato","glutamina","colageno","omega 3","multivitaminico"]'::jsonb, '["eritropoyetina","testosterona sintetica","nandrolona","hormona crecimiento","estanozolol","anfetaminas","efedrina"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Sustancias prohibidas por la WADA', '["eritropoyetina","esteroides anabolicos","testosterona exogena","hormona crecimiento","beta bloqueantes","diureticos","anfetaminas","efedrina","narcoticos","cannabis en competicion","insulina","gh","nandrolona","estanozolol"]'::jsonb, '["agua","plátano","arroz","cafe natural","gel maltodextrina","sales minerales","whey protein"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Conceptos de biomecanica', '["palanca","fulcro","torque","momento de fuerza","centro de gravedad","eje de rotacion","inercia","vector","cinematica","cinetica","angulo articular","trayectoria","aceleracion","velocidad angular"]'::jsonb, '["mitocondria","enzima","vitamina","hormona","gen","proteina","neurotransmisor"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Umbrales y marcadores fisiologicos', '["umbral aerobico","umbral anaerobico","vt1","vt2","vo2max","maxlass","frecuencia cardiaca maxima","steady state","cociente respiratorio","lactato","consumo oxigeno","ppo","eficiencia mecanica","percepcion esfuerzo"]'::jsonb, '["glucosa basal","colesterol ldl","creatinina renal","bilirrubina","tsh","prl","ast"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Tecnicas de psicologia deportiva', '["visualizacion","imagineria","autocharla","rutina precompetitiva","establecimiento metas","respiracion","relajacion","control activacion","focus atencional","concentracion","confianza","cohesion equipo","mindfulness","reencuadre"]'::jsonb, '["sobreentrenamiento","ignorar sintomas","negar emociones","aislamiento","agresividad","abuso verbal","tirar la toalla"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Deportes paralimpicos', '["boccia","goalball","paraciclismo","paratriatlon","baloncesto en silla","tenis en silla","esgrima en silla","natacion adaptada","futbol para ciegos","powerlifting","atletismo adaptado","remo adaptado","judo para ciegos","taekwondo adaptado"]'::jsonb, '["formula 1","polo ecuestre","caza","poker","esgrima olimpica","patinaje hielo","rugby 15"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Estrategias de recuperacion', '["sueno reparador","hidratacion","nutricion post","masaje","foam roller","estiramientos suaves","sauna","crioterapia","bano de contraste","compresion","electroestimulacion","descarga activa","descanso pasivo","meditacion"]'::jsonb, '["trasnochar","ayuno prolongado","alcohol","entrenamiento intenso repetido","sobrecarga","ignorar dolor","estres cronico"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Conceptos de periodizacion', '["microciclo","mesociclo","macrociclo","bloque","carga","descarga","pico","tapering","volumen","intensidad","densidad","supercompensacion","recuperacion","progresion"]'::jsonb, '["horoscopo","talismán","ritual magico","amuleto","sorteo","azar","casualidad"]'::jsonb),
('ed-fisica', 'bachillerato', '{2}', 'Factores clave en prevencion de lesiones', '["calentamiento","propiocepcion","core estable","movilidad articular","tecnica correcta","carga progresiva","descanso adecuado","calzado apropiado","vendaje funcional","fortalecimiento equilibrado","hidratacion","nutricion","sueno","control estres"]'::jsonb, '["saltarse calentamiento","progresion brusca","mala tecnica","sobreentreno","deshidratacion","dormir poco","fatiga acumulada"]'::jsonb);

-- Parejas (25)
INSERT INTO parejas_items (subject_id, level, grades, term_a, term_b) VALUES
('ed-fisica', 'bachillerato', '{2}', 'Mitocondria', 'Orgánulo donde se produce ATP aerobico'),
('ed-fisica', 'bachillerato', '{2}', 'Sarcomero', 'Unidad contractil del musculo esqueletico'),
('ed-fisica', 'bachillerato', '{2}', 'Hipertrofia', 'Aumento del tamano de las fibras musculares'),
('ed-fisica', 'bachillerato', '{2}', 'Umbral anaerobico', 'Punto de acumulacion de lactato en sangre'),
('ed-fisica', 'bachillerato', '{2}', 'VT1', 'Primer umbral ventilatorio aerobico'),
('ed-fisica', 'bachillerato', '{2}', 'Cociente respiratorio', 'Relacion entre CO2 producido y O2 consumido'),
('ed-fisica', 'bachillerato', '{2}', 'Creatina', 'Suplemento que mejora fosfocreatina muscular'),
('ed-fisica', 'bachillerato', '{2}', 'Carga de glucogeno', 'Estrategia nutricional previa a pruebas de resistencia'),
('ed-fisica', 'bachillerato', '{2}', 'Ventana anabolica', 'Periodo post ejercicio para reponer nutrientes'),
('ed-fisica', 'bachillerato', '{2}', 'Eritropoyetina', 'Hormona dopante que estimula globulos rojos'),
('ed-fisica', 'bachillerato', '{2}', 'Estanozolol', 'Esteroide anabolizante prohibido'),
('ed-fisica', 'bachillerato', '{2}', 'Pasaporte biologico', 'Control antidopaje basado en perfiles personales'),
('ed-fisica', 'bachillerato', '{2}', 'Torque', 'Momento de fuerza aplicada sobre un eje'),
('ed-fisica', 'bachillerato', '{2}', 'Centro de gravedad', 'Punto donde se concentra el peso del cuerpo'),
('ed-fisica', 'bachillerato', '{2}', 'Palanca de tercer genero', 'Fuerza entre fulcro y resistencia'),
('ed-fisica', 'bachillerato', '{2}', 'Propiocepcion', 'Percepcion interna de la posicion corporal'),
('ed-fisica', 'bachillerato', '{2}', 'Foam roller', 'Rodillo para liberacion miofascial'),
('ed-fisica', 'bachillerato', '{2}', 'Crioterapia', 'Aplicacion de frio con fines terapeuticos'),
('ed-fisica', 'bachillerato', '{2}', 'Tapering', 'Reduccion de carga previa a la competicion'),
('ed-fisica', 'bachillerato', '{2}', 'Supercompensacion', 'Adaptacion mejorada tras un periodo de recuperacion'),
('ed-fisica', 'bachillerato', '{2}', 'Entrenamiento concurrente', 'Combinar fuerza y resistencia en el mismo plan'),
('ed-fisica', 'bachillerato', '{2}', 'Boccia', 'Deporte paralimpico de precision con bolas'),
('ed-fisica', 'bachillerato', '{2}', 'Goalball', 'Deporte paralimpico para deportistas ciegos con cascabeles'),
('ed-fisica', 'bachillerato', '{2}', 'Imagineria', 'Tecnica mental de recreacion del gesto deportivo'),
('ed-fisica', 'bachillerato', '{2}', 'Rutina precompetitiva', 'Secuencia de acciones justo antes de competir');
