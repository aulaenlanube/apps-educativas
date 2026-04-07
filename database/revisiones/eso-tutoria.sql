-- =====================================================================
-- Revisión rosco · ESO · Tutoría · 1º a 4º ESO
-- 3º ESO sufre regeneración casi completa: ~240 deletes + ~145 inserts.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1º ESO
-- =====================================================================
DELETE FROM rosco_questions WHERE id = 28913; -- toma de decisiones duplicado

-- =====================================================================
-- 4º ESO
-- =====================================================================
UPDATE rosco_questions SET solution = 'habilidades' WHERE id = 29580;

-- =====================================================================
-- 3º ESO · BORRADO MASIVO POR FILTRO
-- =====================================================================

-- Borrar todos los placeholders por solution
DELETE FROM rosco_questions
WHERE level='eso' AND subject_id='tutoria'
  AND grades = ARRAY[3]
  AND solution IN (
    'agua','banio maria','capa de ozono','dioxido de carbono','energia no renovable',
    'frecuencia cardiaca','gato','homo sapiens','isla','juegos olimpicos','kilo',
    'lugar geometrico','mano alzada','numero atomico','mañana','ojo','presion de grupo',
    'queso','rosa de los vientos','sol','toma de decisiones','uno','vaso de precipitados',
    'kiwi','examen','espacios y lineas','zona'
  );

-- Borrar 3 erratas adicionales en 3º
DELETE FROM rosco_questions WHERE id IN (
  29284, -- dureza (no es tutoría, es física)
  29292, -- 'ej.' (errata, no es palabra)
  29377  -- marco (def errónea)
);

-- =====================================================================
-- 3º ESO · INSERCIÓN DE CONTENIDO NUEVO
-- ~145 entradas con vocabulario LOMLOE de tutoría 3º ESO
-- =====================================================================

INSERT INTO rosco_questions (letter, type, definition, solution, subject_id, level, grades, difficulty) VALUES

-- LETRA A (+2)
('A','empieza','Vínculo afectivo de cariño entre dos personas iguales.','amistad','tutoria','eso',ARRAY[3],1),
('A','empieza','Acción de colaborar con quien lo necesita.','ayuda','tutoria','eso',ARRAY[3],1),

-- LETRA B (+5)
('B','empieza','Etapa educativa posterior a la ESO.','bachillerato','tutoria','eso',ARRAY[3],2),
('B','empieza','Distancia o desigualdad entre dos grupos sociales.','brecha','tutoria','eso',ARRAY[3],2),
('B','empieza','Valor de actuar bien con los demás.','bondad','tutoria','eso',ARRAY[3],1),
('B','empieza','Acoso escolar repetido y deliberado entre iguales.','bullying','tutoria','eso',ARRAY[3],2),
('B','empieza','Adjetivo: virtuoso, contrario a malo.','bueno','tutoria','eso',ARRAY[3],1),

-- LETRA C (+6)
('C','empieza','Acción de transmitir mensajes entre personas.','comunicación','tutoria','eso',ARRAY[3],2),
('C','empieza','Desacuerdo o enfrentamiento entre personas.','conflicto','tutoria','eso',ARRAY[3],1),
('C','empieza','Trabajar juntos por un objetivo común.','cooperación','tutoria','eso',ARRAY[3],2),
('C','empieza','Acoso a través de internet o redes sociales.','ciberacoso','tutoria','eso',ARRAY[3],2),
('C','empieza','Obligación voluntaria de cumplir un acuerdo.','compromiso','tutoria','eso',ARRAY[3],2),
('C','empieza','Seguridad que tenemos en alguien o en nosotros mismos.','confianza','tutoria','eso',ARRAY[3],1),

-- LETRA D (+3)
('D','empieza','Conversación entre dos o más personas.','diálogo','tutoria','eso',ARRAY[3],1),
('D','empieza','Variedad y diferencia entre personas.','diversidad','tutoria','eso',ARRAY[3],2),
('D','empieza','Sustancia que crea dependencia y daña la salud.','drogas','tutoria','eso',ARRAY[3],1),

-- LETRA E (+3)
('E','empieza','Trabajo o energía dedicados para lograr algo.','esfuerzo','tutoria','eso',ARRAY[3],1),
('E','empieza','Grupo de personas que trabajan juntas hacia un fin común.','equipo','tutoria','eso',ARRAY[3],1),
('E','empieza','Justicia que da a cada persona lo que necesita.','equidad','tutoria','eso',ARRAY[3],2),

-- LETRA F (+6)
('F','empieza','Grupo de personas unidas por parentesco.','familia','tutoria','eso',ARRAY[3],1),
('F','empieza','Estado de satisfacción y bienestar emocional.','felicidad','tutoria','eso',ARRAY[3],1),
('F','empieza','Sentimiento al no conseguir algo deseado.','frustración','tutoria','eso',ARRAY[3],2),
('F','empieza','Tiempo que está por venir.','futuro','tutoria','eso',ARRAY[3],1),
('F','empieza','Proceso de aprender y educarse.','formación','tutoria','eso',ARRAY[3],2),
('F','empieza','Cualidad de ser fuerte ante las dificultades.','fortaleza','tutoria','eso',ARRAY[3],2),

-- LETRA G (+6)
('G','empieza','Conjunto de características sociales asignadas a hombres y mujeres.','género','tutoria','eso',ARRAY[3],2),
('G','empieza','Conjunto de personas que se relacionan entre sí.','grupo','tutoria','eso',ARRAY[3],1),
('G','empieza','Sentimiento de agradecimiento hacia alguien.','gratitud','tutoria','eso',ARRAY[3],2),
('G','empieza','Cualidad de dar a los demás sin esperar nada a cambio.','generosidad','tutoria','eso',ARRAY[3],2),
('G','empieza','Acción de organizar (gestión emocional, del tiempo...).','gestión','tutoria','eso',ARRAY[3],2),
('G','empieza','Persona que orienta o aconseja a otra.','guía','tutoria','eso',ARRAY[3],1),

-- LETRA H (+6)
('H','empieza','Acciones repetidas que forman parte de la rutina diaria.','hábitos','tutoria','eso',ARRAY[3],2),
('H','empieza','Valor de decir siempre la verdad.','honestidad','tutoria','eso',ARRAY[3],2),
('H','empieza','Cualidad de no tener orgullo excesivo.','humildad','tutoria','eso',ARRAY[3],2),
('H','empieza','Capacidad de tomarse las cosas con alegría.','humor','tutoria','eso',ARRAY[3],1),
('H','empieza','Cuidado de la limpieza personal.','higiene','tutoria','eso',ARRAY[3],1),
('H','empieza','Conjunto de los seres humanos.','humanidad','tutoria','eso',ARRAY[3],2),

-- LETRA I (+6)
('I','empieza','Mismo trato y derechos para todas las personas.','igualdad','tutoria','eso',ARRAY[3],1),
('I','empieza','Integrar a todas las personas, sin excluir a nadie.','inclusión','tutoria','eso',ARRAY[3],2),
('I','empieza','Conjunto de rasgos que definen a una persona.','identidad','tutoria','eso',ARRAY[3],2),
('I','empieza','Falta de respeto a las diferencias de los demás.','intolerancia','tutoria','eso',ARRAY[3],2),
('I','empieza','Emoción de enfado o rabia intensa.','ira','tutoria','eso',ARRAY[3],1),
('I','empieza','Manera en que nos perciben los demás (... personal).','imagen','tutoria','eso',ARRAY[3],1),

-- LETRA J (+5)
('J','empieza','Valor de dar a cada uno lo que le corresponde.','justicia','tutoria','eso',ARRAY[3],1),
('J','empieza','Etapa de la vida entre la niñez y la edad adulta.','juventud','tutoria','eso',ARRAY[3],1),
('J','empieza','Capacidad de valorar entre lo correcto y lo incorrecto.','juicio','tutoria','eso',ARRAY[3],2),
('J','empieza','Actividad lúdica que enseña a relacionarse y a perder.','juego','tutoria','eso',ARRAY[3],1),
('J','empieza','Acción de presumir excesivamente de uno mismo.','jactancia','tutoria','eso',ARRAY[3],3),

-- LETRA K (+4)
('K','empieza','Concepto oriental de causa y efecto en la vida.','karma','tutoria','eso',ARRAY[3],2),
('K','empieza','Arte marcial japonés que enseña disciplina y autocontrol.','kárate','tutoria','eso',ARRAY[3],1),
('K','empieza','Conjunto de objetos preparados para una emergencia (... de primeros auxilios).','kit','tutoria','eso',ARRAY[3],1),
('K','empieza','Unidad de masa, importante para vigilar la salud.','kilo','tutoria','eso',ARRAY[3],1),

-- LETRA L (+6)
('L','empieza','Capacidad de elegir y actuar sin coacción.','libertad','tutoria','eso',ARRAY[3],1),
('L','empieza','Cumplir con la palabra dada y respaldar a quien confía.','lealtad','tutoria','eso',ARRAY[3],2),
('L','empieza','Capacidad de guiar a un grupo de personas.','liderazgo','tutoria','eso',ARRAY[3],2),
('L','empieza','Reglas que separan lo aceptable de lo inaceptable.','límites','tutoria','eso',ARRAY[3],2),
('L','empieza','Adicción a los juegos de azar y apuestas.','ludopatía','tutoria','eso',ARRAY[3],3),
('L','empieza','Hábito saludable que enriquece la mente.','lectura','tutoria','eso',ARRAY[3],1),

-- LETRA M (+6)
('M','empieza','Proceso para resolver conflictos con una tercera persona neutral.','mediación','tutoria','eso',ARRAY[3],2),
('M','empieza','Impulso interno para conseguir objetivos.','motivación','tutoria','eso',ARRAY[3],1),
('M','empieza','Conjunto de procesos cognitivos y emocionales.','mente','tutoria','eso',ARRAY[3],1),
('M','empieza','Técnica de atención plena al momento presente.','mindfulness','tutoria','eso',ARRAY[3],3),
('M','empieza','Etapa de desarrollo emocional y mental adulta.','madurez','tutoria','eso',ARRAY[3],2),
('M','empieza','Actitud de superioridad del hombre sobre la mujer.','machismo','tutoria','eso',ARRAY[3],2),

-- LETRA N (+6)
('N','empieza','Reglas que regulan la convivencia.','normas','tutoria','eso',ARRAY[3],1),
('N','empieza','Diálogo para llegar a un acuerdo entre partes.','negociación','tutoria','eso',ARRAY[3],2),
('N','empieza','Entorno natural que ayuda al bienestar emocional.','naturaleza','tutoria','eso',ARRAY[3],1),
('N','empieza','Persona que empieza algo nuevo.','novato','tutoria','eso',ARRAY[3],1),
('N','empieza','Relación afectiva de pareja entre adolescentes.','noviazgo','tutoria','eso',ARRAY[3],2),
('N','empieza','Sensación de inquietud antes de un examen.','nervios','tutoria','eso',ARRAY[3],1),

-- LETRA Ñ (+5, contiene Ñ)
('Ñ','contiene','Persona con la que se comparte una actividad o estudio (contiene Ñ).','compañero','tutoria','eso',ARRAY[3],1),
('Ñ','contiene','Acción de transmitir conocimientos a otros (contiene Ñ).','enseñanza','tutoria','eso',ARRAY[3],2),
('Ñ','contiene','Adjetivo: de tamaño o importancia reducida (contiene Ñ).','pequeño','tutoria','eso',ARRAY[3],1),
('Ñ','contiene','Persona en la etapa de la infancia (contiene Ñ).','niño','tutoria','eso',ARRAY[3],1),
('Ñ','contiene','Periodo de doce meses, un curso escolar dura uno (contiene Ñ).','año','tutoria','eso',ARRAY[3],1),

-- LETRA O (+5)
('O','empieza','Meta que se quiere conseguir.','objetivo','tutoria','eso',ARRAY[3],1),
('O','empieza','Tendencia a ver el lado positivo de las cosas.','optimismo','tutoria','eso',ARRAY[3],2),
('O','empieza','Capacidad de planificar el tiempo y las tareas.','organización','tutoria','eso',ARRAY[3],2),
('O','empieza','Momento favorable para hacer algo.','oportunidad','tutoria','eso',ARRAY[3],2),
('O','empieza','Punto de vista personal sobre un tema.','opinión','tutoria','eso',ARRAY[3],1),

-- LETRA P (+6)
('P','empieza','Estado de tranquilidad y ausencia de violencia.','paz','tutoria','eso',ARRAY[3],1),
('P','empieza','Opinión preconcebida sin conocer realmente.','prejuicio','tutoria','eso',ARRAY[3],2),
('P','empieza','Conjunto de medidas para evitar un daño.','prevención','tutoria','eso',ARRAY[3],2),
('P','empieza','Plan personal o profesional para el futuro.','proyecto','tutoria','eso',ARRAY[3],1),
('P','empieza','Influencia que intenta cambiar tu conducta (... de grupo).','presión','tutoria','eso',ARRAY[3],2),
('P','empieza','Trabajo al que alguien se dedica.','profesión','tutoria','eso',ARRAY[3],1),

-- LETRA Q (+5, contiene Q)
('Q','contiene','Armonía entre las distintas áreas de la vida (contiene Q).','equilibrio','tutoria','eso',ARRAY[3],2),
('Q','contiene','Parálisis emocional o mental ante una situación (contiene Q).','bloqueo','tutoria','eso',ARRAY[3],2),
('Q','contiene','Forma de organizar el estudio en puntos clave (contiene Q).','esquema','tutoria','eso',ARRAY[3],1),
('Q','contiene','Logro personal alcanzado con esfuerzo (contiene Q).','conquista','tutoria','eso',ARRAY[3],2),
('Q','contiene','Acto de poner una marca o categoría a una persona (contiene Q).','etiqueta','tutoria','eso',ARRAY[3],2),

-- LETRA R (+6)
('R','empieza','Reconocer el valor de los demás.','respeto','tutoria','eso',ARRAY[3],1),
('R','empieza','Capacidad de asumir las propias acciones.','responsabilidad','tutoria','eso',ARRAY[3],2),
('R','empieza','Capacidad de superar las adversidades.','resiliencia','tutoria','eso',ARRAY[3],3),
('R','empieza','Técnica para reducir el estrés y la tensión.','relajación','tutoria','eso',ARRAY[3],1),
('R','empieza','Posibilidad de sufrir un daño.','riesgo','tutoria','eso',ARRAY[3],1),
('R','empieza','Estímulo positivo que premia un comportamiento.','refuerzo','tutoria','eso',ARRAY[3],2),

-- LETRA S (+6)
('S','empieza','Estado de bienestar físico y mental.','salud','tutoria','eso',ARRAY[3],1),
('S','empieza','Apoyo a otros sin esperar nada a cambio.','solidaridad','tutoria','eso',ARRAY[3],2),
('S','empieza','Estados afectivos que experimentamos.','sentimientos','tutoria','eso',ARRAY[3],1),
('S','empieza','Conjunto de personas que conviven.','sociedad','tutoria','eso',ARRAY[3],1),
('S','empieza','Dimensión afectiva y biológica de la persona.','sexualidad','tutoria','eso',ARRAY[3],2),
('S','empieza','Calificación inferior al aprobado.','suspenso','tutoria','eso',ARRAY[3],1),

-- LETRA T (+5)
('T','empieza','Emoción de pena o aflicción.','tristeza','tutoria','eso',ARRAY[3],1),
('T','empieza','Profesor que orienta a un grupo de alumnos.','tutor','tutoria','eso',ARRAY[3],1),
('T','empieza','Dificultad para relacionarse en público.','timidez','tutoria','eso',ARRAY[3],1),
('T','empieza','Métodos para mejorar el aprendizaje (... de estudio).','técnicas','tutoria','eso',ARRAY[3],2),
('T','empieza','Actividad organizada para conseguir un fin (... en equipo).','trabajo','tutoria','eso',ARRAY[3],1),

-- LETRA U (+5)
('U','empieza','Acción de juntarse para algo común.','unión','tutoria','eso',ARRAY[3],1),
('U','empieza','Centro de estudios superiores.','universidad','tutoria','eso',ARRAY[3],1),
('U','empieza','Situación que requiere atención inmediata.','urgencia','tutoria','eso',ARRAY[3],1),
('U','empieza','Adjetivo: que sirve para algo.','útil','tutoria','eso',ARRAY[3],1),
('U','empieza','Cualidad de estar unidos como grupo.','unidad','tutoria','eso',ARRAY[3],1),

-- LETRA V (+6)
('V','empieza','Principios que guían la conducta de una persona.','valores','tutoria','eso',ARRAY[3],1),
('V','empieza','Capacidad de decidir y actuar libremente.','voluntad','tutoria','eso',ARRAY[3],2),
('V','empieza','Persona que sufre un daño o acoso.','víctima','tutoria','eso',ARRAY[3],1),
('V','empieza','Inclinación natural por una profesión.','vocación','tutoria','eso',ARRAY[3],2),
('V','empieza','Forma de existir o vivir.','vida','tutoria','eso',ARRAY[3],1),
('V','empieza','Uso de la fuerza para causar daño.','violencia','tutoria','eso',ARRAY[3],1),

-- LETRA W (+5, contiene W)
('W','contiene','Conexión inalámbrica para acceder a internet (contiene W).','wifi','tutoria','eso',ARRAY[3],1),
('W','contiene','Aplicación de mensajería más usada por adolescentes (contiene W).','whatsapp','tutoria','eso',ARRAY[3],1),
('W','contiene','Página de internet (contiene W).','web','tutoria','eso',ARRAY[3],1),
('W','contiene','Red social donde se publican mensajes cortos (contiene W).','twitter','tutoria','eso',ARRAY[3],2),
('W','contiene','Taller formativo de corta duración (contiene W).','workshop','tutoria','eso',ARRAY[3],3),

-- LETRA X (+5, contiene X)
('X','contiene','Vínculo emocional que une a las personas (contiene X).','conexión','tutoria','eso',ARRAY[3],2),
('X','contiene','Conocimiento adquirido por la práctica y la vida (contiene X).','experiencia','tutoria','eso',ARRAY[3],2),
('X','contiene','Manera de comunicar emociones y pensamientos (contiene X).','expresión','tutoria','eso',ARRAY[3],2),
('X','contiene','Prueba para evaluar lo aprendido (contiene X).','examen','tutoria','eso',ARRAY[3],1),
('X','contiene','Resultado positivo de un esfuerzo (contiene X).','éxito','tutoria','eso',ARRAY[3],1),

-- LETRA Y (+5)
('Y','contiene','Acción de colaborar con quien lo necesita (contiene Y).','ayuda','tutoria','eso',ARRAY[3],1),
('Y','contiene','Sostén emocional o material que se da a otra persona (contiene Y).','apoyo','tutoria','eso',ARRAY[3],1),
('Y','contiene','Prueba o intento previo para mejorar (contiene Y).','ensayo','tutoria','eso',ARRAY[3],2),
('Y','contiene','Plan organizado para alcanzar una meta (contiene Y).','proyecto','tutoria','eso',ARRAY[3],1),
('Y','empieza','Disciplina oriental que combina cuerpo y mente para relajarse.','yoga','tutoria','eso',ARRAY[3],1),

-- LETRA Z (+5)
('Z','empieza','Espacio o área (... de confort).','zona','tutoria','eso',ARRAY[3],1),
('Z','contiene','Falta de ganas de hacer cosas (contiene Z).','pereza','tutoria','eso',ARRAY[3],1),
('Z','contiene','Soporte de escritura usado en clase (contiene Z).','pizarra','tutoria','eso',ARRAY[3],1),
('Z','contiene','Capacidad de pensar y reflexionar (contiene Z).','razón','tutoria','eso',ARRAY[3],1),
('Z','contiene','Símbolo emocional, sede de los afectos (contiene Z).','corazón','tutoria','eso',ARRAY[3],1);

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
