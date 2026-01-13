import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BancoRecursosTutoria.css';

const BancoRecursosTutoria = () => {
    const [activeBlock, setActiveBlock] = useState('block1');
    const [activeSessionIdx, setActiveSessionIdx] = useState(0);
    const [expandedRubrics, setExpandedRubrics] = useState({});

    const toggleRubric = (id) => {
        setExpandedRubrics(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleBlockChange = (blockId) => {
        setActiveBlock(blockId);
        setActiveSessionIdx(0);
        setExpandedRubrics({});
    };

    const blocks = [
        {
            id: 'block1',
            title: 'Hábitos de Estudio',
            desc: 'Optimización del tiempo y técnicas de aprendizaje activo para el éxito académico.',
            color: '#4f46e5',
            icon: 'fa-regular fa-clock',
            sessions: [
                {
                    title: 'Dominando el Tiempo',
                    duration: '50 min',
                    resource: {
                        title: 'La Matriz de Eisenhower',
                        icon: 'fa-solid fa-layer-group',
                        text: 'Una potente herramienta de gestión del tiempo que permite clasificar las tareas diarias en cuatro cuadrantes basándose en dos ejes: urgencia e importancia. Este recurso ayuda a los estudiantes a visualizar dónde están perdiendo el tiempo y qué tareas deben priorizar para reducir el estrés.'
                    },
                    individual: {
                        title: 'Auditoría de mi Tiempo',
                        icon: 'fa-solid fa-user',
                        text: 'Cada alumno elabora una lista de sus actividades habituales de una semana típica. Luego, debe trasladar cada tarea a la matriz de Eisenhower, analizando críticamente el tiempo que dedica al ocio pasivo frente al estudio activo y las responsabilidades personales.',
                        rubric: [
                            { criterion: 'Clasificación', excellent: 'Distingue perfectamente entre urgencia e importancia.', improvable: 'Confunde los conceptos de la matriz.' },
                            { criterion: 'Autocrítica', excellent: 'Identifica claramente sus propios distractores.', improvable: 'No reconoce áreas de mejora personal.' }
                        ]
                    },
                    group: {
                        title: 'Ladrones de Tiempo',
                        icon: 'fa-solid fa-users',
                        text: 'En pequeños grupos, los estudiantes comparten sus mayores distractores (redes sociales, videojuegos, interrupciones externas). Juntos, deben debatir y proponer tres "estrategias antídoto" realistas que todos se comprometan a probar durante la próxima semana.',
                        rubric: [
                            { criterion: 'Trabajo en equipo', excellent: 'Escucha y valora las ideas de los demás.', improvable: 'No participa o impone su criterio.' },
                            { criterion: 'Resolución', excellent: 'Propone antídotos originales y aplicables.', improvable: 'Propuestas vagas o poco realistas.' }
                        ]
                    }
                },
                {
                    title: 'Aprender a Aprender',
                    duration: '50 min',
                    resource: {
                        title: 'Pomodoro y Active Recall',
                        icon: 'fa-solid fa-brain',
                        text: 'Introducción a técnicas de estudio con base neurocientífica. La técnica Pomodoro combate la procrastinación mediante bloques de enfoque de 25 minutos, mientras que el Recuerdo Activo (Active Recall) se presenta como el método más eficaz para transferir información a la memoria a largo plazo.'
                    },
                    individual: {
                        title: 'Mi Tarde de Estudio',
                        icon: 'fa-solid fa-calendar-check',
                        text: 'El estudiante diseña un horario de tarde concreto para afrontar una materia difícil. Debe planificar exactamente en qué momentos aplicará los descansos Pomodoro y redactar 5 preguntas clave de la materia para practicar el recuerdo activo sin mirar los apuntes.',
                        rubric: [
                            { criterion: 'Planificación', excellent: 'Estructura equilibrada de tiempo y esfuerzo.', improvable: 'Mala gestión de descansos y bloques.' },
                            { criterion: 'Calidad preguntas', excellent: 'Preguntas desafiantes que cubren lo esencial.', improvable: 'Preguntas demasiado simples o irrelevantes.' }
                        ]
                    },
                    group: {
                        title: 'Coach de Estudio',
                        icon: 'fa-solid fa-user-graduate',
                        text: 'Dinámica de "role-playing" por parejas. Un alumno actúa como tutor y el otro como estudiante agobiado. El tutor debe recomendar qué técnicas neurocientíficas (flashcards, mapas mentales, pomodoro) se adaptan mejor al problema específico planteado por su compañero.',
                        rubric: [
                            { criterion: 'Asesoramiento', excellent: 'Aplica técnicas explicadas con rigor.', improvable: 'Consejos genéricos sin base técnica.' },
                            { criterion: 'Empatía', excellent: 'Muestra comprensión real del problema ajeno.', improvable: 'Comportamiento frío o poco colaborativo.' }
                        ]
                    }
                },
                {
                    title: 'Entorno de Concentración',
                    duration: '50 min',
                    resource: {
                        title: 'Ergonomía y Ambiente',
                        icon: 'fa-solid fa-desk',
                        text: 'Análisis de los factores externos que influyen en el rendimiento cerebral. Se explora la importancia de una iluminación adecuada, una silla ergonómica que evite dolores de espalda y la creación de un "santuario de estudio" libre de dispositivos electrónicos innecesarios.'
                    },
                    individual: {
                        title: 'Checklist de mi Cuarto',
                        icon: 'fa-solid fa-list-check',
                        text: 'Utilizando una lista de verificación, el alumno evalúa su propio espacio de estudio. Debe puntuar aspectos como el orden de la mesa, la ventilación y la ausencia de ruidos, y comprometerse a realizar tres mejoras físicas inmediatas antes de la próxima sesión.',
                        rubric: [
                            { criterion: 'Análisis detallado', excellent: 'Identifica mejoras sutiles en su entorno.', improvable: 'Análisis muy superficial o descuidado.' },
                            { criterion: 'Compromiso', excellent: 'Mejoras altamente realistas y eficaces.', improvable: 'Propuestas vagas o irrealizables.' }
                        ]
                    },
                    group: {
                        title: 'El Aula Ideal',
                        icon: 'fa-solid fa-school-flag',
                        text: 'Debate grupal sobre cómo el ambiente de clase ayuda o dificulta el trabajo. Los grupos proponen un "decálogo del silencio y el orden" para los momentos de estudio autónomo en el instituto, buscando un consenso que beneficie a todos los perfiles de aprendizaje.',
                        rubric: [
                            { criterion: 'Aportación grupal', excellent: 'Propone normas justas para todos.', improvable: 'Solo piensa en sus propias necesidades.' },
                            { criterion: 'Consenso', excellent: 'Facilita el acuerdo mediante el diálogo.', improvable: 'Dificulta la toma de decisiones común.' }
                        ]
                    }
                },
                {
                    title: 'Lectura Eficaz',
                    duration: '50 min',
                    resource: {
                        title: 'Método SQ3R',
                        icon: 'fa-solid fa-book-open-reader',
                        text: 'Técnica de lectura comprensiva que divide el proceso en cinco pasos: Inspeccionar (Survey), Preguntar (Question), Leer (Read), Recitar (Recite) y Revisar (Review). Permite una asimilación profunda del contenido técnico.'
                    },
                    individual: {
                        title: 'Esquema de un Texto',
                        icon: 'fa-solid fa-file-invoice',
                        text: 'El alumno elige un tema complejo de una materia real y aplica el método SQ3R para extraer las ideas principales. Debe entregar un esquema visual o mapa conceptual que sintetice toda la información relevante sin copiar frases literales.',
                        rubric: [
                            { criterion: 'Síntesis', excellent: 'Extrae ideas clave con precisión magistral.', improvable: 'Copia párrafos enteros sin resumir.' },
                            { criterion: 'Estructura', excellent: 'Jerarquía visual clara y lógica.', improvable: 'Esquema desordenado o inconexo.' }
                        ]
                    },
                    group: {
                        title: 'Enseñanza Cruzada',
                        icon: 'fa-solid fa-chalkboard-user',
                        text: 'Por parejas, cada alumno explica al otro una parte del tema que ha esquematizado. El objetivo es que ambos comprendan el tema completo a través de la explicación del compañero, reforzando el aprendizaje mediante la docencia.',
                        rubric: [
                            { criterion: 'Claridad expositiva', excellent: 'Explicación fluida y muy comprensible.', improvable: 'Se traba o no conoce el tema.' },
                            { criterion: 'Escucha activa', excellent: 'Replantea dudas inteligentes sobre lo oído.', improvable: 'No presta atención al compañero.' }
                        ]
                    }
                },
                {
                    title: 'Gestión de Exámenes',
                    duration: '50 min',
                    resource: {
                        title: 'Ansiedad y Rendimiento',
                        icon: 'fa-solid fa-wind',
                        text: 'Recurso sobre cómo gestionar los nervios antes y durante una prueba. Se enseñan técnicas de respiración diafragmática y estrategias para abordar el examen: lectura general, gestión del tiempo por pregunta y revisión final.'
                    },
                    individual: {
                        title: 'Simulacro de Examen',
                        icon: 'fa-solid fa-stopwatch',
                        text: 'El estudiante diseña un mini-examen de 5 preguntas sobre un tema que esté estudiando. Debe cronometrar cuánto tardaría en responder cada una y planificar en qué orden las abordaría para maximizar su puntuación.',
                        rubric: [
                            { criterion: 'Estrategia', excellent: 'Orden lógico para asegurar el aprobado.', improvable: 'No planifica el tiempo por pregunta.' },
                            { criterion: 'Realismo', excellent: 'Preguntas con nivel de dificultad adecuado.', improvable: 'Preguntas demasiado fáciles o vagas.' }
                        ]
                    },
                    group: {
                        title: 'Quiz Grupal de Repaso',
                        icon: 'fa-solid fa-gamepad',
                        text: 'Uso de plataformas de gamificación (Kahoot, Quizizz) para realizar un repaso conjunto. La clase compite de forma sana resolviendo dudas comunes, permitiendo al tutor identificar en qué puntos hay más confusión grupal.',
                        rubric: [
                            { criterion: 'Participación', excellent: 'Inplicación total y actitud positiva.', improvable: 'Actitud pasiva o disruptiva.' },
                            { criterion: 'Conocimiento', excellent: 'Acierta en preguntas clave del tema.', improvable: 'Demuestra falta de estudio previo.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block2',
            title: 'Cohesión Grupal',
            desc: 'Dinámicas para fomentar el conocimiento mutuo y el sentido de pertenencia al grupo.',
            color: '#8b5cf6',
            icon: 'fa-solid fa-people-group',
            sessions: [
                {
                    title: 'Rompiendo el Hielo',
                    duration: '50 min',
                    resource: {
                        title: 'Dinámica de la Telaraña',
                        icon: 'fa-solid fa-diagram-project',
                        text: 'Uso pedagógico de un ovillo de lana para visibilizar las interconexiones humanas dentro del aula. Cada vez que alguien comparte un interés común con otro, le lanza la lana, creando una red física que demuestra que todos estamos conectados por intereses, miedos o aficiones.'
                    },
                    individual: {
                        title: 'Mi Tarjeta "Oculta"',
                        icon: 'fa-solid fa-user',
                        text: 'El alumno escribe en una tarjeta tres aspectos positivos de su personalidad o talentos que cree que el resto del grupo desconoce. Esta actividad busca fomentar el autodescubrimiento y preparar el terreno para una presentación grupal segura y honesta.',
                        rubric: [
                            { criterion: 'Introspección', excellent: 'Comparte aspectos de valor y profundidad.', improvable: 'Datos irrelevantes o muy superficiales.' },
                            { criterion: 'Claridad', excellent: 'Expone sus ideas de forma nítida.', improvable: 'Mensaje confuso o desordenado.' }
                        ]
                    },
                    group: {
                        title: '¿Quién es quién?',
                        icon: 'fa-solid fa-users',
                        text: 'Dinámica de presentación anónima. Se mezclan las tarjetas "ocultas" de todos y se reparten al azar. Los estudiantes deben moverse por el aula realizando preguntas sutiles para descubrir quién es el verdadero autor de la tarjeta que les ha tocado, fomentando la conversación con compañeros nuevos.',
                        rubric: [
                            { criterion: 'Socialización', excellent: 'Interactúa con respeto y entusiasmo.', improvable: 'Muestra desgana o falta de respeto.' },
                            { criterion: 'Deducción', excellent: 'Utiliza la lógica para identificar al autor.', improvable: 'No hace preguntas relevantes.' }
                        ]
                    }
                },
                {
                    title: 'Construyendo Equipo',
                    duration: '50 min',
                    resource: {
                        title: 'Roles de Belbin',
                        icon: 'fa-solid fa-puzzle-piece',
                        text: 'Introducción al concepto de trabajo en equipo profesional. Se explica que la eficacia de un grupo no depende de que todos sean "los mejores", sino de que exista una diversidad de roles equilibrada: personas que idean, personas que organizan y personas que ejecutan.'
                    },
                    individual: {
                        title: 'Mi Rol Ideal',
                        icon: 'fa-solid fa-fingerprint',
                        text: 'Tras analizar los roles básicos de Belbin, el alumno reflexiona sobre su comportamiento natural en trabajos de grupo anteriores. Debe identificar en qué roles se siente más cómodo y redactar una pequeña fortaleza y una debilidad que aporta al colectivo.',
                        rubric: [
                            { criterion: 'Consciencia de rol', excellent: 'Identifica su aporte real al equipo.', improvable: 'Desconoce sus propias tendencias sociales.' },
                            { criterion: 'Sinceridad', excellent: 'Reconoce debilidades con honestidad.', improvable: 'No admite áreas de mejora.' }
                        ]
                    },
                    group: {
                        title: 'Desafío Marshmallow',
                        icon: 'fa-solid fa-tower-observation',
                        text: 'Actividad práctica cooperativa: construir la torre más alta posible con espaguetis y nubes de azúcar. El objetivo no es solo ganar, sino observar cómo se comunica el equipo, cómo se toman las decisiones y quién asume cada rol de forma natural bajo presión.',
                        rubric: [
                            { criterion: 'Cooperación', excellent: 'Trabaja de forma coordinada y calma.', improvable: 'Genera tensión o no colabora.' },
                            { criterion: 'Comunicación', excellent: 'Transmite instrucciones claras al grupo.', improvable: 'No se comunica con sus compañeros.' }
                        ]
                    }
                },
                {
                    title: 'Identidad de Grupo',
                    duration: '50 min',
                    resource: {
                        title: 'Símbolos y Valores',
                        icon: 'fa-solid fa-shield-halved',
                        text: 'Exploración de la importancia de los símbolos y la identidad compartida para aumentar el bienestar y la cohesión. Se presentan ejemplos de cómo los valores comunes (respeto, ayuda, esfuerzo) actúan como cemento social en un grupo clase.'
                    },
                    individual: {
                        title: 'Mi Aporte al Grupo',
                        icon: 'fa-solid fa-hand-holding-heart',
                        text: 'Reflexión individual en la que cada alumno escribe una acción concreta y positiva que se compromete a realizar esta semana para mejorar el clima de convivencia, ya sea ayudar a un compañero con dudas o fomentar el orden en el aula.',
                        rubric: [
                            { criterion: 'Compromiso social', excellent: 'Propuesta clara, positiva y realizable.', improvable: 'Propuesta inexistente o negativa.' },
                            { criterion: 'Impacto', excellent: 'La acción mejora realmente el clima.', improvable: 'Acción irrelevante para el grupo.' }
                        ]
                    },
                    group: {
                        title: 'Escudo de Clase',
                        icon: 'fa-solid fa-pen-nib',
                        text: 'Creación artística de un símbolo o emblema que represente los valores elegidos por la mayoría. El grupo debe debatir qué colores y formas definen mejor su espíritu, trabajando la negociación y la creatividad para llegar a un diseño final consensuado.',
                        rubric: [
                            { criterion: 'Representatividad', excellent: 'El diseño refleja la identidad grupal.', improvable: 'El diseño es aleatorio o excluyente.' },
                            { criterion: 'Consenso', excellent: 'Llega a un acuerdo creativo común.', improvable: 'No hay acuerdo en el diseño final.' }
                        ]
                    }
                },
                {
                    title: 'Comunicación No Verbal',
                    duration: '50 min',
                    resource: {
                        title: 'Lenguaje Corporal',
                        icon: 'fa-solid fa-hands-asl-interpreting',
                        text: 'Análisis de cómo nuestro cuerpo comunica más que nuestras palabras. Se exploran conceptos como la proxémica (espacio personal), el contacto visual y la postura abierta frente a la cerrada en situaciones sociales.'
                    },
                    individual: {
                        title: 'Observador de Gestos',
                        icon: 'fa-regular fa-eye',
                        text: 'Durante un recreo o en casa, el alumno debe observar (sin juzgar) la comunicación no verbal de tres personas. Debe anotar qué emociones cree que transmitían solo con sus gestos y posturas, sin oír sus palabras.',
                        rubric: [
                            { criterion: 'Capacidad analítica', excellent: 'Detecta microgestos y señales sutiles.', improvable: 'Solo identifica señales obvias.' },
                            { criterion: 'Empatía visual', excellent: 'Asocia correctamente gesto con emoción.', improvable: 'Interpretación aleatoria o sin base.' }
                        ]
                    },
                    group: {
                        title: 'Mímica de Confianza',
                        icon: 'fa-solid fa-mask',
                        text: 'Dinámicas de confianza por parejas donde uno guía al otro (que va con los ojos cerrados) usando solo señales táctiles o sonidos suaves. Ayuda a fortalecer el vínculo de seguridad y responsabilidad entre compañeros.',
                        rubric: [
                            { criterion: 'Cuidado del otro', excellent: 'Protege a su pareja con total atención.', improvable: 'Pone en riesgo o se burla del compañero.' },
                            { criterion: 'Confianza', excellent: 'Se deja guiar con calma y seguridad.', improvable: 'Muestra resistencia o miedo excesivo.' }
                        ]
                    }
                },
                {
                    title: 'Proyecto Común',
                    duration: '50 min',
                    resource: {
                        title: 'Metodología Agile',
                        icon: 'fa-solid fa-arrows-to-circle',
                        text: 'Introducción a la gestión de proyectos en equipo. Se enseñan conceptos como el tablero Kanban (Para hacer, En proceso, Hecho) para organizar tareas de forma visual y evitar que unas personas trabajen más que otras.'
                    },
                    individual: {
                        title: 'Mi Tarea en el Kanban',
                        icon: 'fa-solid fa-thumbtack',
                        text: 'Cada alumno elige una responsabilidad concreta para un proyecto de clase (ej: decorar el aula, organizar un evento). Debe definir exactamente qué pasos dará y cuándo los completará, subiéndolos al tablero virtual o físico del grupo.',
                        rubric: [
                            { criterion: 'Definición', excellent: 'Tarea clara, medible y con plazo.', improvable: 'Tarea vaga o demasiado general.' },
                            { criterion: 'Responsabilidad', excellent: 'Se compromete con un rol necesario.', improvable: 'Elige tareas irrelevantes.' }
                        ]
                    },
                    group: {
                        title: 'El Sprint de Clase',
                        icon: 'fa-solid fa-bolt-lightning',
                        text: 'Reunión rápida de equipo para coordinar el avance del proyecto. Cada miembro explica qué ha hecho, qué va a hacer y si tiene algún bloqueo, practicando la síntesis y la ayuda mutua entre subgrupos.',
                        rubric: [
                            { criterion: 'Capacidad de síntesis', excellent: 'Informa de su estado en menos de 1 min.', improvable: 'Se alarga o no sabe qué decir.' },
                            { criterion: 'Colaboración', excellent: 'Ofrece ayuda ante bloqueos ajenos.', improvable: 'Ignora los problemas de los demás.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block3',
            title: 'Convivencia y Debate',
            desc: 'Mejora del clima del aula mediante el diálogo, la asamblea y el consenso democrático.',
            color: '#f59e0b',
            icon: 'fa-regular fa-comments',
            sessions: [
                {
                    title: 'Asamblea de Clase',
                    duration: '50 min',
                    resource: {
                        title: 'Estructura Democrática',
                        icon: 'fa-solid fa-gavel',
                        text: 'Guía práctica para institucionalizar la asamblea como órgano de decisión. Se explican los roles necesarios: moderador (gestiona turnos), secretario (levanta acta) y observador (vela por el tono respetuoso). Es la base para la convivencia democrática en el aula.'
                    },
                    individual: {
                        title: 'Propuestas de Mejora',
                        icon: 'fa-solid fa-user',
                        text: 'Cada alumno redacta una propuesta de mejora real para el funcionamiento de la clase o el instituto. La propuesta debe ser constructiva (no una queja vacía), detallando el problema observado, la solución sugerida y qué beneficios aportaría al bien común.',
                        rubric: [
                            { criterion: 'Calidad propuesta', excellent: 'Plantea problemas reales con soluciones viables.', improvable: 'Se limita a la queja sin propuesta.' },
                            { criterion: 'Estructura', excellent: 'Redacción clara, lógica y bien expuesta.', improvable: 'Mensaje confuso o difícil de entender.' }
                        ]
                    },
                    group: {
                        title: 'Votación de Normas',
                        icon: 'fa-solid fa-users',
                        text: 'A través de un debate asambleario, el grupo analiza todas las propuestas individuales. El objetivo es consensuar un "Contrato de Convivencia" con un máximo de 5 normas clave que todos se comprometan a respetar, trabajando la negociación y la cisión mutua.',
                        rubric: [
                            { criterion: 'Democracia', excellent: 'Respeta escrupulosamente los turnos.', improvable: 'Boicotea la asamblea.' },
                            { criterion: 'Argumentación', excellent: 'Defiende sus ideas con respeto y lógica.', improvable: 'Impone su criterio sin razonar.' }
                        ]
                    }
                },
                {
                    title: 'Debate Ético',
                    duration: '50 min',
                    resource: {
                        title: 'Técnicas de Argumentación',
                        icon: 'fa-solid fa-comments',
                        text: 'Recurso sobre cómo construir argumentos sólidos basados en la lógica y la evidencia, evitando las falacias personales. Se enseña a escuchar la postura del otro no para responder, sino para comprender su lógica interna.'
                    },
                    individual: {
                        title: 'El Abogado del Diablo',
                        icon: 'fa-solid fa-user-ninja',
                        text: 'Actividad de flexibilidad cognitiva. Tras elegir un tema polémico, el alumno debe redactar tres argumentos de peso a favor de la postura contraria a la suya personal. Esto fomenta la empatía intelectual y ayuda a entender la complejidad de los conflictos.',
                        rubric: [
                            { criterion: 'Flexibilidad mental', excellent: 'Entiende y expone la lógica ajena.', improvable: 'Incapaz de argumentar la opinión contraria.' },
                            { criterion: 'Empatía', excellent: 'Se pone en el lugar del otro con respeto.', improvable: 'Muestra intolerancia a ideas ajenas.' }
                        ]
                    },
                    group: {
                        title: 'Debate en Pecera',
                        icon: 'fa-solid fa-circle-nodes',
                        text: 'Un grupo de alumnos debate en el centro (la pecera) mientras el resto rodea el círculo observando en silencio. Al terminar, los observadores analizan no quién ha "ganado", sino quién ha usado mejores argumentos y cómo se ha gestionado el turno de palabra.',
                        rubric: [
                            { criterion: 'Argumentación', excellent: 'Usa datos y lógica, no descalificados.', improvable: 'Usa falacias o gritos.' },
                            { criterion: 'Observación', excellent: 'Analiza con agudeza el debate externo.', improvable: 'Se distrae o no presta atención.' }
                        ]
                    }
                },
                {
                    title: 'Mediación Escolar',
                    duration: '50 min',
                    resource: {
                        title: 'Técnica del Puente',
                        icon: 'fa-solid fa-bridge',
                        text: 'Presentación de la mediadora como vía pacífica de resolución. Se explica el proceso de tres pasos: 1) Cada parte cuenta su versión sin interrupción. 2) Se parafrasea lo oído para asegurar comprensión. 3) Se buscan puntos compartidos para tender un puente de acuerdo.'
                    },
                    individual: {
                        title: 'Guion de Mediación',
                        icon: 'fa-solid fa-file-pen',
                        text: 'El alumno debe redactar las frases exactas que usaría para iniciar un proceso de mediación neutral. Debe cuidar el lenguaje para no parecer que juzga a ninguna de las partes y proponer preguntas abiertas que ayuden a que los implicados se entiendan.',
                        rubric: [
                            { criterion: 'Neutralidad', excellent: 'Mantiene una postura objetiva y calmada.', improvable: 'Toma partido por una de las partes.' },
                            { criterion: 'Lenguaje', excellent: 'Usa frases asertivas y no juiciosas.', improvable: 'Usa términos que generan más conflicto.' }
                        ]
                    },
                    group: {
                        title: 'Role-Play de Conflicto',
                        icon: 'fa-solid fa-people-arrows',
                        text: 'Simulacro práctico por tríos (dos partes en conflicto y un mediador). Se ensaya la resolución de un conflicto cotidiano del instituto, permitiendo a los alumnos experimentar en un entorno seguro la eficacia de la mediación frente a la confrontación directa.',
                        rubric: [
                            { criterion: 'Eficacia mediación', excellent: 'Llega a un acuerdo justo y compartido.', improvable: 'El conflicto no se resuelve.' },
                            { criterion: 'Técnica', excellent: 'Sigue correctamente los pasos del puente.', improvable: 'Olvida las fases de la mediación.' }
                        ]
                    }
                },
                {
                    title: 'El Decálogo Digital',
                    duration: '50 min',
                    resource: {
                        title: 'Convivencia en el Grupo',
                        icon: 'fa-solid fa-mobile-screen-button',
                        text: 'Análisis de la convivencia en entornos no presenciales (WhatsApp, Discord). Se exploran los malentendidos por falta de tono vocal y la importancia de no difundir rumores o capturas de pantalla que dañen a terceros.'
                    },
                    individual: {
                        title: 'Mi Código de Redes',
                        icon: 'fa-solid fa-user-shield',
                        text: 'El estudiante redacta sus propias normas de uso para los grupos de clase. Debe incluir límites sobre horarios de mensajes, tipos de contenido compartido y qué hacer ante un comentario que falte al respeto a alguien.',
                        rubric: [
                            { criterion: 'Ética digital', excellent: 'Propone normas que protegen a todos.', improvable: 'Normas egoístas o poco claras.' },
                            { criterion: 'Asertividad', excellent: 'Sabe cómo frenar un conflicto online.', improvable: 'No ofrece soluciones a la toxicidad.' }
                        ]
                    },
                    group: {
                        title: 'Consenso del Grupo-Clase',
                        icon: 'fa-solid fa-comments',
                        text: 'Debate grupal para unificar los códigos individuales en un solo "Decálogo de Redes de la Clase". El objetivo es que todos se sientan cómodos en el grupo virtual y sepan cómo actuar ante el ciberacoso o la exclusión.',
                        rubric: [
                            { criterion: 'Negociación', excellent: 'Llega a acuerdos por el bien común.', improvable: 'No cede o impone su visión.' },
                            { criterion: 'Compromiso', excellent: 'Acepta voluntariamente las normas.', improvable: 'Muestra indiferencia al acuerdo.' }
                        ]
                    }
                },
                {
                    title: 'Prevención de Conflictos',
                    duration: '50 min',
                    resource: {
                        title: 'Detección Temprana',
                        icon: 'fa-solid fa-magnifying-glass-chart',
                        text: 'Recurso para identificar señales de alarma antes de que un roce se convierta en acoso. Se analiza la diferencia entre un conflicto puntual (normal) y el acoso (sistemático, intencionado y con desequilibrio de poder).'
                    },
                    individual: {
                        title: 'Radar de Convivencia',
                        icon: 'fa-solid fa-tower-broadcast',
                        text: 'El alumno debe identificar situaciones cotidianas (en el aula o patio) que podrían generar malestar. Debe proponer una acción discreta y positiva para "enfriar" esas situaciones antes de que escalen.',
                        rubric: [
                            { criterion: 'Agudeza social', excellent: 'Detecta tensiones sutiles con madurez.', improvable: 'Solo ve el conflicto cuando estalla.' },
                            { criterion: 'Prudencia', excellent: 'Propone intervenciones seguras y sabias.', improvable: 'Acciones que pueden empeorar el roce.' }
                        ]
                    },
                    group: {
                        title: 'Buzón de Ideas',
                        icon: 'fa-solid fa-inbox',
                        text: 'Creación de un sistema físico o digital donde el grupo pueda proponer mejoras o alertar de subgrupos aislados de forma protegida. Se debate cómo gestionar este buzón para que sea una herramienta de ayuda y no de delación.',
                        rubric: [
                            { criterion: 'Visión constructiva', excellent: 'Usa la herramienta para mejorar el clima.', improvable: 'Cree que no es necesaria o la boicotea.' },
                            { criterion: 'Empatía grupal', excellent: 'Se preocupa por los compañeros aislados.', improvable: 'Solo le importa su grupo de amigos.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block4',
            title: 'Igualdad y Coeducación',
            desc: 'Análisis crítico de estereotipos y fomento de la igualdad real entre hombres y mujeres.',
            color: '#ec4899',
            icon: 'fa-solid fa-venus-mars',
            sessions: [
                {
                    title: 'Publicidad Crítica',
                    duration: '50 min',
                    resource: {
                        title: 'El Test de Bechdel',
                        icon: 'fa-solid fa-tv',
                        text: 'Introducción a una herramienta de análisis cinematográfico y publicitario que revela la falta de representación femenina. El test consiste en comprobar si aparecen al menos dos mujeres, si hablan entre ellas y si dicha conversación trata de algo que no sea un hombre.'
                    },
                    individual: {
                        title: 'Cazadores de Sesgos',
                        icon: 'fa-solid fa-user',
                        text: 'El alumno analiza un anuncio actual (en vídeo o imagen) buscando estereotipos de género: ¿Qué roles desempeñan? ¿A quién se dirige el producto? Debe escribir una reflexión crítica sobre cómo ese anuncio perpetúa o rompe los esquemas tradicionales de hombre y mujer.',
                        rubric: [
                            { criterion: 'Análisis crítico', excellent: 'Identifica sesgos sutiles y profundos.', improvable: 'No ve más allá de lo evidente.' },
                            { criterion: 'Reflexión', excellent: 'Plantea una crítica social fundamentada.', improvable: 'No conecta el anuncio con la sociedad.' }
                        ]
                    },
                    group: {
                        title: 'Publicidad Inclusiva',
                        icon: 'fa-solid fa-users',
                        text: 'En grupos, los alumnos deben elegir un anuncio sexista analizado previamente y rediseñar su narrativa para hacerlo inclusivo e igualitario. Deben presentar un "storyboard" o un cartel final que demuestre que se puede vender un producto sin recurrir a estereotipos dañinos.',
                        rubric: [
                            { criterion: 'Creatividad social', excellent: 'Propuesta original que rompe moldes.', improvable: 'La propuesta sigue siendo estereotipada.' },
                            { criterion: 'Mensaje', excellent: 'Comunica igualdad de forma efectiva.', improvable: 'Mensaje confuso o poco claro.' }
                        ]
                    }
                },
                {
                    title: 'Nuevas Masculinidades',
                    duration: '50 min',
                    resource: {
                        title: 'Rompiendo el Molde',
                        icon: 'fa-solid fa-mask',
                        text: 'Recurso que explora el concepto de "masculinidad tóxica" frente a las masculinidades diversas. Se analiza cómo la presión social obliga a los hombres a reprimir emociones o actuar con agresividad para ser aceptados, y los beneficios de una identidad masculina libre y empática.'
                    },
                    individual: {
                        title: 'Mi Yo sin Estereotipos',
                        icon: 'fa-solid fa-user-check',
                        text: 'Reflexión íntima sobre los gustos, aficiones o rasgos de personalidad que el alumno a veces oculta por miedo a no encajar en lo que se espera de su género. El objetivo es validar la autenticidad personal por encima de las expectativas sociales impuestas.',
                        rubric: [
                            { criterion: 'Sinceridad', excellent: 'Muestra una gran honestidad personal.', improvable: 'Respuestas evasivas o de compromiso.' },
                            { criterion: 'Profundidad', excellent: 'Analiza la raíz de sus miedos sociales.', improvable: 'Se queda en la superficie.' }
                        ]
                    },
                    group: {
                        title: 'Cita con la Igualdad',
                        icon: 'fa-solid fa-comments-dollar',
                        text: 'Dinámica de debate en pequeños grupos sobre situaciones cotidianas: ¿Quién debe dar el primer paso? ¿Es el control una forma de amor? Los grupos deben argumentar sus respuestas basándose en el respeto mutuo y la autonomía personal.',
                        rubric: [
                            { criterion: 'Respeto', excellent: 'Valora la autonomía de todas las personas.', improvable: 'Mantiene prejuicios o ideas de control.' },
                            { criterion: 'Argumentación', excellent: 'Defiende la igualdad con argumentos sólidos.', improvable: 'No sabe justificar su postura.' }
                        ]
                    }
                },
                {
                    title: 'Referentes Ocultos',
                    duration: '50 min',
                    resource: {
                        title: 'Mujeres en la Historia',
                        icon: 'fa-solid fa-dna',
                        text: 'Presentación de figuras femeninas clave en la ciencia, el arte y la política cuyos logros fueron históricamente invisibilizados. Se analiza el "efecto Matilda" (la negación de los descubrimientos de las mujeres) y la importancia de tener referentes diversos.'
                    },
                    individual: {
                        title: 'Mi Heroína Favorita',
                        icon: 'fa-solid fa-magnifying-glass',
                        text: 'Cada estudiante realiza una breve investigación sobre una mujer relevante en un campo que le interese (gaming, deporte, ciencia, etc.). Debe redactar una pequeña biografía destacando sus logros y las dificultades que tuvo que superar para ser reconocida.',
                        rubric: [
                            { criterion: 'Calidad investigación', excellent: 'Datos relevantes y bien estructurados.', improvable: 'Información escasa o mal copiada.' },
                            { criterion: 'Estructura', excellent: 'Biografía clara, coherente y bien escrita.', improvable: 'Texto desordenado o con errores.' }
                        ]
                    },
                    group: {
                        title: 'Galería del Talento',
                        icon: 'fa-solid fa-images',
                        text: 'Con toda la información recogida, la clase crea un "muro de referentes" (digital o físico). Los alumnos deben presentar brevemente a su heroína al resto del grupo, explicando por qué su legado es fundamental para el progreso de la sociedad actual.',
                        rubric: [
                            { criterion: 'Divulgación', excellent: 'Transmite el mérito de la referente con pasión.', improvable: 'Presentación apática o desordenada.' },
                            { criterion: 'Presentación', excellent: 'Material visual y diseño excelentes.', improvable: 'Material pobre o descuidado.' }
                        ]
                    }
                },
                {
                    title: 'Corresponsabilidad',
                    duration: '50 min',
                    resource: {
                        title: 'La Carga Mental',
                        icon: 'fa-solid fa-brain-circuit',
                        text: 'Explicación del concepto de carga mental: no es solo hacer la tarea, sino planificarla y recordarla. Se analiza cómo las tareas domésticas y de cuidado están repartidas en la sociedad y el impacto de esta desigualdad en la carrera profesional de las mujeres.'
                    },
                    individual: {
                        title: 'Inventario de Casa',
                        icon: 'fa-solid fa-clipboard-list',
                        text: 'El alumno elabora un listado de todas las tareas que se hacen en su casa durante un día (compra, limpieza, cocina, recados). Debe anotar quién hace cada cosa y reflexionar sobre si el reparto es equitativo y cómo podría colaborar más.',
                        rubric: [
                            { criterion: 'Análisis de datos', excellent: 'Identifica la carga mental invisible.', improvable: 'Solo anota las tareas obvias.' },
                            { criterion: 'Autocrítica', excellent: 'Propone un cambio real en su actitud.', improvable: 'Se justifica o no ve desigualdad.' }
                        ]
                    },
                    group: {
                        title: 'La Casa Ideal',
                        icon: 'fa-solid fa-house-chimney-window',
                        text: 'En grupos mixtos, deben diseñar un cuadrante de tareas para un piso compartido ficticio. El objetivo es que sea 100% igualitario, incluyendo el cuidado de mascotas, plantas o la gestión de facturas, trabajando la negociación de roles.',
                        rubric: [
                            { criterion: 'Equidad', excellent: 'Reparto justo y sin sesgos de género.', improvable: 'Asigna roles tradicionales por hábito.' },
                            { criterion: 'Razonamiento', excellent: 'Justifica por qué el reparto es sano.', improvable: 'No sabe explicar su propuesta.' }
                        ]
                    }
                },
                {
                    title: 'Hitos Científicos',
                    duration: '50 min',
                    resource: {
                        title: 'Nobel silenciados',
                        icon: 'fa-solid fa-vial',
                        text: 'Recurso sobre descubrimientos científicos fundamentales realizados por mujeres que no recibieron el crédito en su momento (ej: Lise Meitner, Rosalind Franklin). Se analiza cómo el entorno académico también ha sufrido sesgos históricos.'
                    },
                    individual: {
                        title: 'Rescatando un Hito',
                        icon: 'fa-solid fa-magnifying-glass-chart',
                        text: 'El estudiante busca un descubrimiento científico y a la mujer que participó en él. Debe redactar un breve artículo de "divulgación justa" donde explique el hallazgo y por qué el nombre de ella debe ser recordado al mismo nivel que sus colegas varones.',
                        rubric: [
                            { criterion: 'Rigor histórico', excellent: 'Datos exactos y bien documentados.', improvable: 'Información escasa o mal contrastada.' },
                            { criterion: 'Divulgación', excellent: 'Explica el hito con pasión y claridad.', improvable: 'Texto aburrido o poco claro.' }
                        ]
                    },
                    group: {
                        title: 'Podcast de la Historia',
                        icon: 'fa-solid fa-microphone-lines',
                        text: 'Grabación de una mini-entrevista ficticia (o guion) donde una de estas científicas explica su trabajo a la sociedad actual. El grupo debe destacar la relevancia de su invento para la tecnología o salud que usamos hoy en día.',
                        rubric: [
                            { criterion: 'Comunicación', excellent: 'Transmite la importancia del logro.', improvable: 'No logra captar el interés.' },
                            { criterion: 'Creatividad', excellent: 'Guion original y muy bien ambientado.', improvable: 'Guion pobre o copiado.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block5',
            title: 'Bienestar y Salud',
            desc: 'Gestión del bienestar digital, nutricional y físico para una vida equilibrada.',
            color: '#10b981',
            icon: 'fa-solid fa-heart-pulse',
            sessions: [
                {
                    title: 'Desconexión Digital',
                    duration: '50 min',
                    resource: {
                        title: 'Dopamina y Pantallas',
                        icon: 'fa-solid fa-mobile-screen',
                        text: 'Explicación del mecanismo de recompensa inmediata del cerebro y cómo las redes sociales están diseñadas para generar dependencia mediante "likes" y notificaciones. Se analizan los efectos de la sobreestimulación digital en la concentración y el estado de ánimo.'
                    },
                    individual: {
                        title: 'Mi Tiempo de Uso',
                        icon: 'fa-solid fa-user',
                        text: 'El alumno consulta las estadísticas reales de uso de su móvil durante la última semana. Debe anotar cuántas horas dedica a cada app y reflexionar sobre qué actividades (lectura, deporte, charla) ha dejado de hacer por estar frente a la pantalla.',
                        rubric: [
                            { criterion: 'Honestidad con datos', excellent: 'Analiza objetivamente su consumo digital.', improvable: 'Niega o ignora la realidad de sus datos.' },
                            { criterion: 'Reflexión', excellent: 'Identifica consecuencias reales del abuso.', improvable: 'No ve impacto negativo en su vida.' }
                        ]
                    },
                    group: {
                        title: 'Reto 24h Detox',
                        icon: 'fa-solid fa-users',
                        text: 'La clase diseña colectivamente un "plan de desconexión" para el próximo fin de semana. Deben acordar un reto (ej: no usar el móvil después de las 9 PM) y proponer tres actividades alternativas divertidas que no requieran dispositivos tecnológicos.',
                        rubric: [
                            { criterion: 'Propuesta creativa', excellent: 'Alternativas al móvil muy motivadoras.', improvable: 'Propuestas aburridas o irrealizables.' },
                            { criterion: 'Viabilidad', excellent: 'Plan realista para el fin de semana.', improvable: 'Plan imposible de cumplir.' }
                        ]
                    }
                },
                {
                    title: 'Nutrición Consciente',
                    duration: '50 min',
                    resource: {
                        title: 'Etiquetas y Ultraprocesados',
                        icon: 'fa-solid fa-basket-shopping',
                        text: 'Una guía visual para descifrar las etiquetas nutricionales. Se aprende a identificar el azúcar oculto bajo nombres técnicos y a distinguir entre un alimento real y un producto ultraprocesado diseñado para ser hiperpalatable pero poco nutritivo.'
                    },
                    individual: {
                        title: 'Buscando Azúcares',
                        icon: 'fa-solid fa-cubes-stacked',
                        text: 'Cada alumno elige un producto que consume habitualmente (refresco, galletas, cereales) y calcula, basándose en la información nutricional, cuántos terrones de azúcar contiene por ración. El resultado visual ayuda a tomar conciencia de lo que ingerimos.',
                        rubric: [
                            { criterion: 'Precisión técnica', excellent: 'Cálculo exacto y bien razonado.', improvable: 'Errores graves en la lectura de etiquetas.' },
                            { criterion: 'Análisis', excellent: 'Comprende el impacto del azúcar en salud.', improvable: 'No conecta datos con bienestar.' }
                        ]
                    },
                    group: {
                        title: 'Menú Top Saludable',
                        icon: 'fa-solid fa-utensils',
                        text: 'En grupos de trabajo, los estudiantes deben diseñar una propuesta de almuerzo ideal para el recreo que sea equilibrada, económica y fácil de preparar. Deben "vender" su propuesta al resto de la clase destacando sus beneficios nutricionales y su sabor.',
                        rubric: [
                            { criterion: 'Equilibrio nutricional', excellent: 'Propuesta sana, rica y factible.', improvable: 'Propuesta poco saludable o imposible.' },
                            { criterion: 'Presentación', excellent: 'Diseño de menú atractivo y profesional.', improvable: 'Menú poco trabajado visualmente.' }
                        ]
                    }
                },
                {
                    title: 'Descanso de Calidad',
                    duration: '50 min',
                    resource: {
                        title: 'Higiene del Sueño',
                        icon: 'fa-solid fa-moon',
                        text: 'Recurso sobre la neurobiología del sueño. Se explica por qué dormir 8-9 horas es vital para que el cerebro elimine toxinas y consolide los recuerdos de lo estudiado. Se analizan enemigos del descanso como la luz azul de las pantallas o las cenas copiosas.'
                    },
                    individual: {
                        title: 'Mi Rutina Nocturna',
                        icon: 'fa-solid fa-bed',
                        text: 'El alumno analiza su comportamiento en la hora previa a acostarse. Debe identificar un hábito perjudicial (ej: mirar TikTok en la cama) y redactar una nueva "rutina de calma" que incluya tres pasos sencillos para facilitar un sueño reparador.',
                        rubric: [
                            { criterion: 'Diseño de hábitos', excellent: 'Propone una rutina de calma muy eficaz.', improvable: 'No propone cambios significativos.' },
                            { criterion: 'Viabilidad', excellent: 'Hitos sencillos y fáciles de aplicar.', improvable: 'Rutina demasiado compleja o irreal.' }
                        ]
                    },
                    group: {
                        title: 'El Sueño del Guerrero',
                        icon: 'fa-solid fa-battery-full',
                        text: 'Debate grupal sobre la realidad de los horarios adolescentes. Se comparten las dificultades para dormir pronto y se buscan soluciones realistas que el grupo pueda implementar, como dejar el grupo de WhatsApp de la clase en silencio a partir de cierta hora.',
                        rubric: [
                            { criterion: 'Visión colectiva', excellent: 'Propone compromisos que ayudan a todos.', improvable: 'Muestra indiferencia por el descanso grupal.' },
                            { criterion: 'Colaboración', excellent: 'Participa activamente en el debate.', improvable: 'Se mantiene al margen del grupo.' }
                        ]
                    }
                },
                {
                    title: 'Primeros Auxilios Emocionales',
                    duration: '50 min',
                    resource: {
                        title: 'Kit de Emergencia',
                        icon: 'fa-solid fa-kit-medical',
                        text: 'Guía sobre cómo actuar ante un ataque de ansiedad propio o de un compañero. Se enseñan técnicas de anclaje (5-4-3-2-1), respiración controlada y la importancia de pedir ayuda profesional sin estigmas.'
                    },
                    individual: {
                        title: 'Mi Caja de Calma',
                        icon: 'fa-solid fa-box-open',
                        text: 'El alumno diseña una lista de 5 cosas que le ayudan a recuperar la calma (música, un lugar, una persona, una actividad). Debe explicar por qué esos elementos son efectivos para él y tenerlos localizados para momentos de estrés.',
                        rubric: [
                            { criterion: 'Autodescubrimiento', excellent: 'Identifica recursos de calma eficaces.', improvable: 'Lista genérica o sin sentido personal.' },
                            { criterion: 'Detalle', excellent: 'Explica el porqué de cada elección.', improvable: 'Descripción escasa o pobre.' }
                        ]
                    },
                    group: {
                        title: 'Cuidadores de Clase',
                        icon: 'fa-solid fa-hand-holding-heart',
                        text: 'Debate grupal sobre cómo podemos apoyarnos entre nosotros en épocas de exámenes o problemas personales. Se acuerda un protocolo de ayuda mutua discreto que fomente la seguridad emocional en el aula.',
                        rubric: [
                            { criterion: 'Empatía colectiva', excellent: 'Propone formas de ayuda maduras.', improvable: 'Muestra indiferencia al dolor ajeno.' },
                            { criterion: 'Responsabilidad', excellent: 'Se compromete con el cuidado grupal.', improvable: 'No asume ningún rol de apoyo.' }
                        ]
                    }
                },
                {
                    title: 'Higiene Postural',
                    duration: '50 min',
                    resource: {
                        title: 'Salud de la Espalda',
                        icon: 'fa-solid fa-child',
                        text: 'Recurso visual sobre la ergonomía en el uso de portátiles y móviles. Se analiza el "cuello de texto" (text neck) y cómo una mala postura afecta no solo al físico, sino también a la fatiga mental y el sueño.'
                    },
                    individual: {
                        title: 'Check de Postura',
                        icon: 'fa-solid fa-user-check',
                        text: 'El estudiante evalúa su postura habitual mientras estudia o usa el móvil. Debe proponer dos cambios físicos (ej: altura de la silla o pantalla) y redactar un recordatorio para corregirse durante la sesión de estudio.',
                        rubric: [
                            { criterion: 'Consciencia física', excellent: 'Detecta sus propios vicios posturales.', improvable: 'No reconoce errores en su postura.' },
                            { criterion: 'Viabilidad', excellent: 'Cambios sencillos y aplicables ya.', improvable: 'Propuestas imposibles o caras.' }
                        ]
                    },
                    group: {
                        title: 'Pausa Activa',
                        icon: 'fa-solid fa-person-walking',
                        text: 'La clase aprende una serie de estiramientos rápidos (3 min) que se pueden hacer sin levantarse de la silla. Se debate cuándo es mejor hacer estas pausas para mantener la energía y la concentración altas.',
                        rubric: [
                            { criterion: 'Participación', excellent: 'Realiza los ejercicios con rigor.', improvable: 'Se burla o no participa.' },
                            { criterion: 'Análisis de fatiga', excellent: 'Entiende cuándo su cuerpo pide pausa.', improvable: 'Ignora las señales de su cuerpo.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block6',
            title: 'Gestión Emocional',
            desc: 'Inteligencia emocional, autoconocimiento y herramientas frente al estrés.',
            color: '#06b6d4',
            icon: 'fa-solid fa-face-smile-beam',
            sessions: [
                {
                    title: 'Etiquetado Emocional',
                    duration: '50 min',
                    resource: {
                        title: 'Rueda de Plutchik',
                        icon: 'fa-solid fa-brain',
                        text: 'Exploración del mapa de las emociones humanas. Se enseña a diferenciar entre emociones básicas y sus combinaciones, ayudando a los estudiantes a ampliar su vocabulario emocional para expresar con precisión qué sienten en cada momento.'
                    },
                    individual: {
                        title: 'Diario de Emociones',
                        icon: 'fa-solid fa-user',
                        text: 'El alumno selecciona tres situaciones vividas en la última semana y trata de etiquetar las emociones exactas sentidas. Debe describir no solo el nombre de la emoción, sino en qué parte del cuerpo la notó y qué pensamiento la provocó.',
                        rubric: [
                            { criterion: 'Precisión emocional', excellent: 'Usa términos exactos y variados.', improvable: 'Se limita a "bien" o "mal".' },
                            { criterion: 'Conexión física', excellent: 'Identifica sensaciones corporales claras.', improvable: 'No asocia emoción con cuerpo.' }
                        ]
                    },
                    group: {
                        title: 'Teatro de Sentimientos',
                        icon: 'fa-solid fa-users',
                        text: 'Por equipos, los alumnos representan mímicamente una situación que genere una emoción compleja. El resto de la clase debe adivinarla y debatir qué estrategias de regulación podrían aplicarse en ese escenario específico para no dejarse llevar por el impulso.',
                        rubric: [
                            { criterion: 'Empatía proyectada', excellent: 'Logra transmitir la emoción con eficacia.', improvable: 'No se toma en serio la representación.' },
                            { criterion: 'Análisis', excellent: 'Propone estrategias de regulación sabias.', improvable: 'No ofrece soluciones al conflicto.' }
                        ]
                    }
                },
                {
                    title: 'Resiliencia Activa',
                    duration: '50 min',
                    resource: {
                        title: 'Mentalidad de Crecimiento',
                        icon: 'fa-solid fa-sprout',
                        text: 'Introducción al concepto de Carol Dweck sobre cómo percibimos nuestra inteligencia. Se analiza la diferencia entre una mentalidad fija ("yo no sirvo para esto") y una de crecimiento ("todavía no sé hacerlo, pero puedo aprender si me esfuerzo").'
                    },
                    individual: {
                        title: 'Mi "Todavía No"',
                        icon: 'fa-solid fa-seedling',
                        text: 'El estudiante identifica una materia o habilidad que se le resiste y le genera frustración. Debe reescribir sus pensamientos automáticos negativos usando el lenguaje de crecimiento, trazando un pequeño plan de acción con dos pasos técnicos para mejorar.',
                        rubric: [
                            { criterion: 'Cambio mental', excellent: 'Transforma la frustración en oportunidad.', improvable: 'Mantiene un lenguaje derrotista.' },
                            { criterion: 'Planificación', excellent: 'Pasos técnicos claros para mejorar sola.', improvable: 'No sabe cómo empezar a cambiar.' }
                        ]
                    },
                    group: {
                        title: 'Muro de los Éxitos',
                        icon: 'fa-solid fa-rectangle-list',
                        text: 'Dinámica de grupo para normalizar el error. Cada alumno comparte una vez que falló en el pasado y qué aprendió de esa experiencia. El grupo construye una "cadena de aprendizaje" donde se celebra la perseverancia por encima del resultado inmediato.',
                        rubric: [
                            { criterion: 'Valor pedagógico del error', excellent: 'Extrae una lección profunda del fallo.', improvable: 'No ve aprendizaje en el error.' },
                            { criterion: 'Reflexión', excellent: 'Muestra vulnerabilidad y valentía.', improvable: 'Muestra indiferencia o burla.' }
                        ]
                    }
                },
                {
                    title: 'Escucha Empática',
                    duration: '50 min',
                    resource: {
                        title: 'Validación Emocional',
                        icon: 'fa-solid fa-ear-listen',
                        text: 'Recurso sobre las claves de una buena comunicación interpersonal. Se enseña que validar no es dar la razón, sino reconocer que el sentimiento de la otra persona tiene sentido. Se analizan frases que cierran la comunicación frente a frases que la abren.'
                    },
                    individual: {
                        title: '¿Saber Escuchar?',
                        icon: 'fa-solid fa-user-gear',
                        text: 'Autoevaluación crítica sobre los hábitos personales de escucha: "¿Interrumpo con frecuencia?", "¿Doy consejos sin que me los pidan?". El alumno debe elegir un hábito negativo y proponer una técnica de escucha activa para aplicar en casa o con amigos.',
                        rubric: [
                            { criterion: 'Autoevaluación', excellent: 'Detecta fallos propios con gran madurez.', improvable: 'Cree que siempre escucha bien.' },
                            { criterion: 'Propuesta', excellent: 'Técnica de escucha activa muy concreta.', improvable: 'Propuesta vaga o de compromiso.' }
                        ]
                    },
                    group: {
                        title: 'Radio Confidente',
                        icon: 'fa-solid fa-radio',
                        text: 'Simulación de un consultorio radiofónico. Un alumno cuenta un problema anónimo y el "locutor" debe practicar la escucha activa y la validación emocional, evitando juzgar. Al final, se analiza en grupo qué respuestas hicieron sentir mejor al emisor.',
                        rubric: [
                            { criterion: 'Validación emocional', excellent: 'Acompaña sin juzgar ni dar lecciones.', improvable: 'Juzga o interrumpe con consejos.' },
                            { criterion: 'Escucha', excellent: 'Demuestra haber oído todos los matices.', improvable: 'Ignora partes clave del relato.' }
                        ]
                    }
                },
                {
                    title: 'Brújula de Valores',
                    duration: '50 min',
                    resource: {
                        title: 'Valores Personales',
                        icon: 'fa-solid fa-compass',
                        text: 'Exploración de qué principios rigen nuestras decisiones (honestidad, lealtad, esfuerzo, diversión). Se explica que conocer nuestros valores nos ayuda a decir NO a lo que no nos conviene y a sentirnos orgullosos de nosotros mismos.'
                    },
                    individual: {
                        title: 'Mi Top 5',
                        icon: 'fa-solid fa-ranking-star',
                        text: 'El alumno elige sus 5 valores fundamentales de una lista extensa. Debe explicar con un ejemplo personal por qué cada valor es importante en su vida y cómo le ayuda a ser la persona que quiere ser.',
                        rubric: [
                            { criterion: 'Identidad', excellent: 'Valores bien definidos y auténticos.', improvable: 'Elige al azar o por cumplir.' },
                            { criterion: 'Justificación', excellent: 'Ejemplos reales y muy coherentes.', improvable: 'No sabe explicar por qué los elige.' }
                        ]
                    },
                    group: {
                        title: 'Subasta de Valores',
                        icon: 'fa-solid fa-gavel',
                        text: 'Dinámica de grupo donde deben "comprar" valores con un presupuesto limitado. El debate se centra en qué valores son imprescindibles para que una sociedad funcione, obligando a priorizar y negociar lo que se considera fundamental.',
                        rubric: [
                            { criterion: 'Argumentación ética', excellent: 'Defiende valores con lógica social.', improvable: 'No sabe justificar su "compra".' },
                            { criterion: 'Negociación', excellent: 'Llega a acuerdos grupales por el bien común.', improvable: 'Se cierra en su propia visión.' }
                        ]
                    }
                },
                {
                    title: 'Control de Impulsos',
                    duration: '50 min',
                    resource: {
                        title: 'Técnica del Semáforo',
                        icon: 'fa-solid fa-traffic-light',
                        text: 'Herramienta para la gestión de la ira o el enfado: Rojo (Para, respira), Ámbar (Piensa alternativas) y Verde (Actúa con calma). Se analiza el secuestro de la amígdala y cómo recuperar el control cortical.'
                    },
                    individual: {
                        title: 'Mi Escenario Rojo',
                        icon: 'fa-solid fa-bolt',
                        text: 'El estudiante describe una situación que le hace "perder los papeles". Debe aplicar mentalmente el semáforo y redactar qué pasaría si usara el color Ámbar antes de reaccionar, visualizando un final positivo.',
                        rubric: [
                            { criterion: 'Autocontrol', excellent: 'Visualiza una respuesta madura y sana.', improvable: 'Se recrea en la reacción impulsiva.' },
                            { criterion: 'Análisis', excellent: 'Detecta el disparador exacto del enfado.', improvable: 'No sabe por qué se enfada.' }
                        ]
                    },
                    group: {
                        title: 'El Detective del Enfado',
                        icon: 'fa-solid fa-magnifying-glass',
                        text: 'Por equipos, analizan casos de conflictos ficticios. Deben identificar en qué punto los personajes se saltaron el semáforo y proponer cómo deberían haber actuado para resolver la situación de forma pacífica y asertiva.',
                        rubric: [
                            { criterion: 'Resolución de conflictos', excellent: 'Ofrece soluciones creativas y calmadas.', improvable: 'Propone soluciones violentas o nulas.' },
                            { criterion: 'Empatía', excellent: 'Entiende el enfado de ambas partes.', improvable: 'Solo ve la razón de un lado.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block7',
            title: 'Educación Afectiva',
            desc: 'Relaciones saludables, consentimiento y respeto a la diversidad.',
            color: '#f43f5e',
            icon: 'fa-solid fa-heart',
            sessions: [
                {
                    title: 'Amor vs Control',
                    duration: '50 min',
                    resource: {
                        title: 'Mitos Románticos',
                        icon: 'fa-solid fa-heart-crack',
                        text: 'Análisis de las fábulas sociales que normalizan la toxicidad en la pareja. Se desmontan mitos como "la media naranja" (que genera dependencia), "los celos como signo de amor" (que justifican el control) y "el amor lo puede todo" (que impide poner límites sanos).'
                    },
                    individual: {
                        title: 'Mis Red Flags',
                        icon: 'fa-solid fa-flag',
                        text: 'El alumno debe identificar "banderas rojas" o señales de alerta en una relación (ya sea de pareja o amistad). Debe describir conductas concretas que considera inaceptables y reflexionar sobre la importancia de la autonomía y el respeto al espacio personal.',
                        rubric: [
                            { criterion: 'Criterio', excellent: 'Establece límites claros y sanos.', improvable: 'Justifica conductas tóxicas.' },
                            { criterion: 'Reflexión', excellent: 'Comprende el valor de la autonomía.', improvable: 'No ve la importancia de los límites.' }
                        ]
                    },
                    group: {
                        title: 'Análisis de Letras',
                        icon: 'fa-solid fa-music',
                        text: 'Audición y análisis de canciones actuales de éxito. El grupo debe identificar mensajes que promueven la posesividad, el control o la falta de respeto. Como contrapartida, deben proponer cómo sería la letra de una canción que celebrara un amor libre y equitativo.',
                        rubric: [
                            { criterion: 'Crítica', excellent: 'Detecta control y falta de respeto.', improvable: 'Normaliza el mensaje.' },
                            { criterion: 'Propuesta', excellent: 'Letra alternativa sana y original.', improvable: 'No ofrece una alternativa clara.' }
                        ]
                    }
                },
                {
                    title: 'El Consentimiento',
                    duration: '50 min',
                    resource: {
                        title: 'La Metáfora del Té',
                        icon: 'fa-solid fa-mug-hot',
                        text: 'Uso de un recurso pedagógico viral para explicar el consentimiento de forma clara: si alguien no quiere un té, no le obligas a beberlo. Se profundiza en los tres pilares del consentimiento: debe ser entusiasta (no solo resignado), reversible en cualquier momento e informado.'
                    },
                    individual: {
                        title: 'Límites Personales',
                        icon: 'fa-solid fa-user-lock',
                        text: 'Reflexión escrita sobre situaciones en las que el alumno se ha sentido presionado a decir "sí" cuando quería decir "no". Debe practicar la redacción de frases asertivas para marcar límites con seguridad, sin necesidad de dar explicaciones excesivas ni sentirse culpable.',
                        rubric: [
                            { criterion: 'Asertividad', excellent: 'Propone formas claras de decir no.', improvable: 'No sabe cómo poner límites.' },
                            { criterion: 'Claridad', excellent: 'Expresa sus necesidades sin culpa.', improvable: 'Muestra inseguridad al negarse.' }
                        ]
                    },
                    group: {
                        title: 'Casos y Diálogos',
                        icon: 'fa-solid fa-comments',
                        text: 'Debate grupal sobre dilemas éticos y sociales comunes entre adolescentes. El objetivo es identificar si en cada caso hay o no un consentimiento real y entusiasta, fomentando la empatía y la responsabilidad afectiva con los demás.',
                        rubric: [
                            { criterion: 'Ética', excellent: 'Prioriza el respeto y el bienestar.', improvable: 'Mantiene dudas sobre el NO.' },
                            { criterion: 'Colaboración', excellent: 'Aporta visiones empáticas al grupo.', improvable: 'No participa en el análisis ético.' }
                        ]
                    }
                },
                {
                    title: 'Diversidad Afectiva',
                    duration: '50 min',
                    resource: {
                        title: 'La Galleta del Género',
                        icon: 'fa-solid fa-cookie-bite',
                        text: 'Recurso visual que ayuda a clarificar conceptos a menudo confundidos: identidad de género (quién soy), expresión de género (cómo me muestro), orientación afectivo-sexual (quién me atrae) y sexo biológico (mis características físicas).'
                    },
                    individual: {
                        title: 'Mi Mapa de Respeto',
                        icon: 'fa-solid fa-map',
                        text: 'El estudiante redacta un "decálogo del buen aliado" con acciones prácticas para asegurar que el aula sea un espacio seguro para cualquier persona, independientemente de su identidad u orientación. Debe ser un compromiso personal con el respeto a la diversidad.',
                        rubric: [
                            { criterion: 'Inclusión', excellent: 'Acciones proactivas y amables.', improvable: 'Se limita a "no molestar".' },
                            { criterion: 'Compromiso', excellent: 'Acciones firmes para un aula segura.', improvable: 'Propuestas vagas o de compromiso.' }
                        ]
                    },
                    group: {
                        title: 'Glosario Aliado',
                        icon: 'fa-solid fa-book-open',
                        text: 'La clase colabora en la creación de un diccionario visual donde definen términos clave sobre diversidad de forma sencilla y positiva. El objetivo es erradicar el uso de etiquetas despectivas y fomentar un lenguaje que valide la realidad de todos los compañeros.',
                        rubric: [
                            { criterion: 'Claridad', excellent: 'Definiciones correctas y útiles.', improvable: 'Confusión de conceptos.' },
                            { criterion: 'Originalidad', excellent: 'Uso de apoyos visuales muy creativos.', improvable: 'Glosario pobre o solo texto.' }
                        ]
                    }
                },
                {
                    title: 'Diversidad Familiar',
                    duration: '50 min',
                    resource: {
                        title: 'Nuevos Modelos',
                        icon: 'fa-solid fa-house-user',
                        text: 'Recurso sobre la pluralidad de estructuras familiares en la sociedad actual: monoparentales, reconstituidas, extensas, homoparentales, etc. Se subraya que lo que define a una familia es el vínculo de amor y cuidado, no solo la genética.'
                    },
                    individual: {
                        title: 'Mi Constelación',
                        icon: 'fa-solid fa-star',
                        text: 'El alumno dibuja su red de apoyo familiar (pueden ser familiares directos o personas de confianza). Debe destacar qué valor le aporta cada persona y por qué se siente seguro o querido en esa red personal.',
                        rubric: [
                            { criterion: 'Gratitud', excellent: 'Reconoce y valora el cuidado recibido.', improvable: 'Muestra indiferencia a su entorno.' },
                            { criterion: 'Análisis vincular', excellent: 'Identifica roles de apoyo positivos.', improvable: 'Descripción superficial del esquema.' }
                        ]
                    },
                    group: {
                        title: 'Árbol de la Diversidad',
                        icon: 'fa-solid fa-tree',
                        text: 'La clase construye un árbol gigante donde cada rama representa un tipo de estructura familiar. El debate se centra en normalizar todas las realidades presentes en el aula, fomentando el respeto y la inclusión absoluta.',
                        rubric: [
                            { criterion: 'Respeto a la diversidad', excellent: 'Integra todas las realidades con naturalidad.', improvable: 'Muestra prejuicios o exclusión.' },
                            { criterion: 'Inclusión', excellent: 'Usa un lenguaje acogedor y positivo.', improvable: 'Usa términos que estigmatizan.' }
                        ]
                    }
                },
                {
                    title: 'Amor y Pantallas',
                    duration: '50 min',
                    resource: {
                        title: 'Cine vs Realidad',
                        icon: 'fa-solid fa-clapperboard',
                        text: 'Análisis de cómo las películas y series juveniles idealizan relaciones que en la vida real serían tóxicas. Se exploran tropos como "el chico malo que cambia por ella" o "la persistencia ante el NO como signo de pasión".'
                    },
                    individual: {
                        title: 'Crítica de Serie',
                        icon: 'fa-solid fa-user-pen',
                        text: 'El estudiante elige una relación de una serie famosa y le hace un "check-up de salud". Debe identificar qué comportamientos son sanos y cuáles son peligrosos o irreales, justificando su opinión con los conceptos aprendidos.',
                        rubric: [
                            { criterion: 'Análisis crítico', excellent: 'Detecta toxicidades sutiles en la ficción.', improvable: 'Idealiza comportamientos de control.' },
                            { criterion: 'Rigor', excellent: 'Usa términos técnicos vistos en clase.', improvable: 'Opinión puramente subjetiva.' }
                        ]
                    },
                    group: {
                        title: 'Guionista por Igualdad',
                        icon: 'fa-solid fa-scroll',
                        text: 'Por equipos, reescriben una escena famosa de una película para que sea sana y respetuosa sin perder el interés. Deben centrarse en cómo los personajes se comunican sus deseos y respetan los límites del otro de forma asertiva.',
                        rubric: [
                            { criterion: 'Creatividad ética', excellent: 'Logra un guion ameno y muy saludable.', improvable: 'El guion sigue siendo tóxico o aburrido.' },
                            { criterion: 'Mensaje', excellent: 'Transmite valores de respeto claros.', improvable: 'Mensaje confuso o poco educativo.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block8',
            title: 'Autoconocimiento',
            desc: 'Fortalezas, debilidades y herramientas para construir la identidad personal.',
            color: '#a855f7',
            icon: 'fa-solid fa-id-card',
            sessions: [
                {
                    title: 'Ventana de Johari',
                    duration: '50 min',
                    resource: {
                        title: 'Las 4 Áreas',
                        icon: 'fa-solid fa-table-cells-large',
                        text: 'Un modelo psicológico que divide la personalidad en cuatro áreas: el área pública (lo que yo y otros sabemos), el área ciega (lo que otros ven pero yo no), el área oculta (lo que yo sé y otros no) y el área desconocida. Es vital para entender cómo mejorar nuestra comunicación y honestidad.'
                    },
                    individual: {
                        title: 'Autorretrato Oculto',
                        icon: 'fa-solid fa-user',
                        text: 'El alumno reflexiona sobre su "área oculta". Debe identificar tres fortalezas, sueños o temores que no suele compartir con los demás por timidez o miedo al juicio. El ejercicio ayuda a reconocer que todos tenemos una profundidad que no siempre es visible a simple vista.',
                        rubric: [
                            { criterion: 'Profundidad', excellent: 'Muestra una gran capacidad de introspección.', improvable: 'Respuestas muy superficiales.' },
                            { criterion: 'Claridad', excellent: 'Expone sus sentimientos con nitidez.', improvable: 'Mensaje confuso o evasivo.' }
                        ]
                    },
                    group: {
                        title: 'Cualidades a Espalda',
                        icon: 'fa-solid fa-lightbulb',
                        text: 'Cada alumno pega un folio en su espalda. Los demás compañeros deben circular por el aula escribiendo una cualidad positiva que aprecien en esa persona. Al final, cada uno lee su folio, descubriendo su "área ciega" a través del feedback positivo y sincero del grupo.',
                        rubric: [
                            { criterion: 'Feedback positivo', excellent: 'Aporta comentarios sinceros y valiosos.', improvable: 'Participación escasa o poco seria.' },
                            { criterion: 'Compañerismo', excellent: 'Muestra aprecio real por los demás.', improvable: 'Comentarios fríos o irrelevantes.' }
                        ]
                    }
                },
                {
                    title: 'Mis Fortalezas',
                    duration: '50 min',
                    resource: {
                        title: 'Test de Personajes',
                        icon: 'fa-solid fa-user-astronaut',
                        text: 'Dinámica proyectiva que usa arquetipos de ficción (superhéroes, líderes, sabios, exploradores) para ayudar a los jóvenes a identificar sus propios talentos. Se analiza cómo cada fortaleza tiene un valor único y necesario para el funcionamiento de cualquier sociedad o equipo.'
                    },
                    individual: {
                        title: 'Mi Superpoder',
                        icon: 'fa-solid fa-bolt',
                        text: 'El estudiante define su "superpoder" personal: una habilidad que le resulta natural y gratificante (ej: saber escuchar, ser rápido resolviendo problemas lógicos, tener mucha paciencia). Debe describir un ejemplo real de su vida diaria donde ese superpoder haya sido de ayuda.',
                        rubric: [
                            { criterion: 'Autodefinición', excellent: 'Identifica y ejemplifica su talento con claridad.', improvable: 'No reconoce talentos propios.' },
                            { criterion: 'Originalidad', excellent: 'Talento bien definido y no genérico.', improvable: 'Talento muy vago o poco analizado.' }
                        ]
                    },
                    group: {
                        title: 'Liga de la Justicia',
                        icon: 'fa-solid fa-users-gear',
                        text: 'En grupos, los alumnos deben combinar sus superpoderes individuales para resolver un "reto imposible" planteado por el tutor. El objetivo es ver cómo la suma de talentos diversos permite superar obstáculos que ninguna persona podría vencer por sí sola.',
                        rubric: [
                            { criterion: 'Sinergia', excellent: 'Combina talentos de forma magistral.', improvable: 'Trabaja de forma aislada.' },
                            { criterion: 'Coordinación', excellent: 'Liderazgo compartido y eficaz.', improvable: 'Desorden total en el grupo.' }
                        ]
                    }
                },
                {
                    title: 'Autoconcepto Digital',
                    duration: '50 min',
                    resource: {
                        title: 'Instagram vs Realidad',
                        icon: 'fa-solid fa-camera-retro',
                        text: 'Recurso que analiza la construcción de la identidad en la era de los filtros. Se explora cómo la comparación constante con vidas aparentemente perfectas en redes sociales afecta a la autoestima y genera una distorsión de la propia imagen corporal y personal.'
                    },
                    individual: {
                        title: 'Mi Perfil Honesto',
                        icon: 'fa-solid fa-id-badge',
                        text: 'El alumno debe redactar una biografía de red social o un perfil personal que destaque sus valores, sus hobbies reales y sus imperfecciones asumidas con humor. El objetivo es valorar la propia identidad real por encima de la proyección idealizada que solemos buscar online.',
                        rubric: [
                            { criterion: 'Autenticidad', excellent: 'Muestra una identidad real y atractiva.', improvable: 'Cae en la idealización o la falsedad.' },
                            { criterion: 'Sinceridad', excellent: 'Humor y honestidad en sus fallos.', improvable: 'No admite ninguna imperfección.' }
                        ]
                    },
                    group: {
                        title: 'Debate del Like',
                        icon: 'fa-solid fa-thumbs-up',
                        text: 'Discusión grupal sobre la dependencia de la aprobación externa. Se comparten sentimientos sobre la ansiedad de los "likes" y el miedo al rechazo digital. El grupo debe buscar estrategias para que su valor personal no dependa de un número de interacciones en una pantalla.',
                        rubric: [
                            { criterion: 'Reflexión crítica digital', excellent: 'Propone límites sanos al uso de redes.', improvable: 'Mantiene una dependencia total del Like.' },
                            { criterion: 'Propuesta', excellent: 'Estrategias de valor propio potentes.', improvable: 'No ofrece soluciones a la ansiedad.' }
                        ]
                    }
                },
                {
                    title: 'Mi Yo Futuro',
                    duration: '50 min',
                    resource: {
                        title: 'Visualización Guiada',
                        icon: 'fa-solid fa-wand-sparkles',
                        text: 'Técnica de psicología positiva para proyectarse en el futuro. Se enseña a imaginar no solo lo que uno "tendrá", sino quién "será": qué valores mantendrá, qué impacto tendrá en su entorno y cómo habrá superado sus retos actuales.'
                    },
                    individual: {
                        title: 'Carta a 10 Años',
                        icon: 'fa-solid fa-envelope-open-text',
                        text: 'El alumno escribe una carta a su "yo" de dentro de una década. Debe contarse sus retos de hoy, sus sueños para el futuro y qué tres consejos le daría a su versión adulta para no olvidar su esencia personal.',
                        rubric: [
                            { criterion: 'Introspección', excellent: 'Reflexión profunda, emotiva y sincera.', improvable: 'Texto superficial o de broma.' },
                            { criterion: 'Coherencia vital', excellent: 'Une sus valores con sus metas futuras.', improvable: 'Metas sin conexión con su realidad.' }
                        ]
                    },
                    group: {
                        title: 'Cápsula del Tiempo',
                        icon: 'fa-solid fa-box-archive',
                        text: 'La clase crea una cápsula del tiempo colectiva con un objeto o dibujo simbólico de cada uno. Debaten qué mensaje común les gustaría enviarse al futuro, trabajando la identidad de grupo y la esperanza compartida.',
                        rubric: [
                            { criterion: 'Sentido de pertenencia', excellent: 'Aporta ideas que unen al grupo.', improvable: 'Actitud excluyente o negativa.' },
                            { criterion: 'Simbolismo', excellent: 'Aporta elementos con gran valor ético.', improvable: 'Elementos aleatorios sin significado.' }
                        ]
                    }
                },
                {
                    title: 'Brújula Ética',
                    duration: '50 min',
                    resource: {
                        title: 'Dilemas del día a día',
                        icon: 'fa-solid fa-scale-balanced',
                        text: 'Recurso sobre la toma de decisiones basada en principios. Se presentan situaciones donde "lo fácil" se enfrenta a "lo correcto", analizando cómo la integridad personal construye una autoestima sólida y duradera.'
                    },
                    individual: {
                        title: 'Mis No Negociables',
                        icon: 'fa-solid fa-hand',
                        text: 'El estudiante redacta una lista de 3 situaciones o conductas que nunca aceptaría hacer o que le hicieran, justificándolas desde su código ético personal. Es un ejercicio de empoderamiento y límites personales.',
                        rubric: [
                            { criterion: 'Firmeza ética', excellent: 'Límites claros, sanos y bien razonados.', improvable: 'Límites difusos o inexistentes.' },
                            { criterion: 'Autoconocimiento', excellent: 'Asocia ética con bienestar personal.', improvable: 'No entiende el valor de la integridad.' }
                        ]
                    },
                    group: {
                        title: 'Tribunal de Valores',
                        icon: 'fa-solid fa-building-columns',
                        text: 'Se plantea un dilema ético complejo al grupo. Por equipos, deben defender qué decisión sería la más "íntegra" más allá de la ley o la norma, fomentando la conciencia moral y el razonamiento colectivo.',
                        rubric: [
                            { criterion: 'Razonamiento moral', excellent: 'Base ética profunda y muy humana.', improvable: 'Argumentos basados en el egoísmo.' },
                            { criterion: 'Escucha', excellent: 'Valora matices éticos de otros grupos.', improvable: 'Muestra rigidez o intolerancia.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block9',
            title: 'Orientación Educativa',
            desc: 'Itinerarios, toma de decisiones y planificación del futuro académico.',
            color: '#0ea5e9',
            icon: 'fa-solid fa-map-location-dot',
            sessions: [
                {
                    title: 'Itinerarios LOMLOE',
                    duration: '50 min',
                    resource: {
                        title: 'Mapa de FP y Bachillerato',
                        icon: 'fa-solid fa-road',
                        text: 'Guía visual actualizada sobre las diferentes vías educativas tras la ESO. Se explican los requisitos de acceso para los Ciclos Formativos de Grado Medio y las diferentes modalidades de Bachillerato, así como la conexión entre ellas y las futuras salidas universitarias.'
                    },
                    individual: {
                        title: 'Plan de Ruta',
                        icon: 'fa-solid fa-user',
                        text: 'El alumno traza su propio mapa de futuro ideal para los próximos 2-4 años. Debe identificar qué modalidad de estudio se adapta mejor a sus intereses y, lo más importante, investigar una alternativa (Plan B) por si su primera opción no fuera posible por nota o plazas.',
                        rubric: [
                            { criterion: 'Previsión académico', excellent: 'Estructura un Plan A y B coherentes.', improvable: 'No tiene plan o es poco realista.' },
                            { criterion: 'Realismo', excellent: 'Conoce bien los requisitos de acceso.', improvable: 'Ignora notas de corte o plazas.' }
                        ]
                    },
                    group: {
                        title: 'Gymkhana de Orientación',
                        icon: 'fa-solid fa-magnifying-glass',
                        text: 'Por equipos, los alumnos deben resolver un conjunto de "misiones de búsqueda". Deben encontrar información oficial sobre notas de corte, materias optativas de bachillerato y familias profesionales de FP, aprendiendo a manejar fuentes fiables de orientación académica.',
                        rubric: [
                            { criterion: 'Manejo de información', excellent: 'Localiza datos oficiales con rapidez.', improvable: 'Usa fuentes poco fiables o erróneas.' },
                            { criterion: 'Eficacia', excellent: 'Resuelve todas las misiones del tutor.', improvable: 'No encuentra los datos básicos.' }
                        ]
                    }
                },
                {
                    title: 'Habilidades del Futuro',
                    duration: '50 min',
                    resource: {
                        title: 'Soft Skills vs Hard Skills',
                        icon: 'fa-solid fa-brain',
                        text: 'Recurso sobre la transformación del mercado laboral. Se explica que mientras las habilidades técnicas (hard skills) caducan rápido, las habilidades blandas (soft skills) como el pensamiento crítico, la flexibilidad y la creatividad son las que garantizarán la empleabilidad a largo plazo.'
                    },
                    individual: {
                        title: 'Mi Portfolio de Skills',
                        icon: 'fa-solid fa-briefcase',
                        text: 'El estudiante analiza qué habilidades blandas ya posee (ej: sabe trabajar bajo presión, es mediador en conflictos) y cuáles necesita entrenar para su futuro profesional. Debe redactar una acción concreta para empezar a desarrollar una de esas habilidades este mismo curso.',
                        rubric: [
                            { criterion: 'Consciencia de habilidades', excellent: 'Identifica sus Soft Skills con madurez.', improvable: 'No reconoce ninguna habilidad propia.' },
                            { criterion: 'Acción', excellent: 'Propuesta de entrenamiento muy clara.', improvable: 'No sabe cómo mejorar sus habilidades.' }
                        ]
                    },
                    group: {
                        title: 'Supervivientes 2050',
                        icon: 'fa-solid fa-rocket',
                        text: 'En una dinámica de prospectiva, los grupos imaginan profesiones que existirán dentro de 30 años (ej: arquitecto de entornos virtuales, gestor de residuos espaciales). Deben debatir qué habilidades humanas serán imprescindibles en esos trabajos que aún no han sido inventados.',
                        rubric: [
                            { criterion: 'Visión de futuro', excellent: 'Propuestas creativas y muy bien razonadas.', improvable: 'Falta de imaginación o rigor.' },
                            { criterion: 'Razonamiento', excellent: 'Asocia habilidad humana con entorno IA.', improvable: 'No justifica la necesidad de la skill.' }
                        ]
                    }
                },
                {
                    title: 'Toma de Decisiones',
                    duration: '50 min',
                    resource: {
                        title: 'El Método Pro/Contra',
                        icon: 'fa-solid fa-scale-balanced',
                        text: 'Presentación de una matriz racional para la toma de decisiones complejas. Se introduce el concepto de "ponderación": no todos los factores valen lo mismo (ej: la cercanía del centro puede ser menos importante que la calidad de los estudios para una persona concreta).'
                    },
                    individual: {
                        title: 'Mi Gran Balanza',
                        icon: 'fa-solid fa-weight-scale',
                        text: 'El alumno aplica la matriz de decisión a un dilema académico real que tenga actualmente (elegir una optativa, un centro para el año que viene o una rama de estudios). Debe justificar su elección final basándose en el análisis de pros y contras ponderados.',
                        rubric: [
                            { criterion: 'Ponderación razonada', excellent: 'Asigna pesos lógicos a cada factor.', improvable: 'Elección aleatoria o sin justificar.' },
                            { criterion: 'Justificación', excellent: 'Argumento final maduro y coherente.', improvable: 'Decisión por impulso o sin base.' }
                        ]
                    },
                    group: {
                        title: 'Asesores de Futuro',
                        icon: 'fa-solid fa-user-group',
                        text: 'Por parejas, los alumnos se ayudan mutuamente a "auditar" sus balanzas de decisión. El compañero debe intentar encontrar un factor positivo o negativo que el otro haya pasado por alto, fomentando la visión periférica y el apoyo mutuo en momentos clave.',
                        rubric: [
                            { criterion: 'Asesoramiento objetivo', excellent: 'Aporta una visión externa valiosa.', improvable: 'No aporta nada nuevo al compañero.' },
                            { criterion: 'Aportación', excellent: 'Ayuda to mejorar la balanza del otro.', improvable: 'Muestra indiferencia al problema ajeno.' }
                        ]
                    }
                },
                {
                    title: 'Emprendimiento Joven',
                    duration: '50 min',
                    resource: {
                        title: 'Autoempleo y Creatividad',
                        icon: 'fa-solid fa-lightbulb',
                        text: 'Recurso sobre las alternativas al trabajo por cuenta ajena. Se presentan ejemplos de jóvenes emprendedores que han detectado necesidades en su comunidad y han creado servicios o productos innovadores desde cero.'
                    },
                    individual: {
                        title: 'Mi Micro-Empresa',
                        icon: 'fa-solid fa-store',
                        text: 'El alumno idea una pequeña actividad económica basada en un talento propio (ej: dar clases, diseñar webs, reparar objetos). Debe calcular qué recursos necesita y cómo "vendería" su valor diferencial a sus primeros clientes.',
                        rubric: [
                            { criterion: 'Iniciativa', excellent: 'Idea original, factible y atractiva.', improvable: 'Propuesta poco trabajada o nula.' },
                            { criterion: 'Análisis recursos', excellent: 'Conoce bien qué necesita para empezar.', improvable: 'Ignora costes o medios básicos.' }
                        ]
                    },
                    group: {
                        title: 'Shark Tank Escolar',
                        icon: 'fa-solid fa-fish-fins',
                        text: 'Dinámica de presentación de ideas de negocio. Un grupo actúa como "inversores" y otro como "emprendedores". Deben negociar y convencer con argumentos técnicos por qué su idea merece ser apoyada y es sostenible.',
                        rubric: [
                            { criterion: 'Persuasión', excellent: 'Argumentos sólidos, calmos y claros.', improvable: 'Incapaz de defender su propuesta.' },
                            { criterion: 'Visión económica', excellent: 'Plan de sostenibilidad coherente.', improvable: 'No entiende cómo generar valor.' }
                        ]
                    }
                },
                {
                    title: 'Visita Virtual',
                    duration: '50 min',
                    resource: {
                        title: 'Exploración de Centros',
                        icon: 'fa-solid fa-vr-cardboard',
                        text: 'Uso de recursos digitales para visitar virtualmente facultades, centros de FP y escuelas de arte. Se enseña a leer los planes de estudios (guías docentes) para entender qué se estudia exactamente en cada carrera o grado.'
                    },
                    individual: {
                        title: 'Ficha de Grado',
                        icon: 'fa-solid fa-file-signature',
                        text: 'El estudiante elige un grado o ciclo específico e investiga: asignaturas clave, proyectos que realizan y convenios de prácticas. Debe redactar por qué ese plan de estudios encaja (o no) con sus habilidades aprendidas.',
                        rubric: [
                            { criterion: 'Investigación detallada', excellent: 'Conoce a fondo el plan de estudios.', improvable: 'Datos muy genéricos o erróneos.' },
                            { criterion: 'Autocrítica', excellent: 'Evalúa honestamente su afinidad al grado.', improvable: 'No relaciona materias con gustos.' }
                        ]
                    },
                    group: {
                        title: 'Dossier de Clase',
                        icon: 'fa-solid fa-folder-open',
                        text: 'La clase colabora en un mapa digital de recursos post-ESO. Se reparten los centros de la zona para investigar servicios extra (idiomas, deportes, becas), creando una guía compartida para facilitar la transición de todos.',
                        rubric: [
                            { criterion: 'Calidad informativa', excellent: 'Aporta datos útiles y verificados.', improvable: 'Información incompleta o falsa.' },
                            { criterion: 'Cooperación', excellent: 'Ayuda a completar el mapa grupal.', improvable: 'No comparte sus hallazgos.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block10',
            title: 'Proyecto Ikigai',
            desc: 'Propósito vital: uniendo pasión, talento, misión y realidad económica.',
            color: '#f97316',
            icon: 'fa-regular fa-compass',
            sessions: [
                {
                    title: 'Busca tu Propósito',
                    duration: '50 min',
                    resource: {
                        title: 'Círculos Ikigai',
                        icon: 'fa-solid fa-sun',
                        text: 'Concepto japonés para hallar el equilibrio vital. Se presentan los cuatro círculos fundamentales: lo que amas, en lo que eres bueno, lo que el mundo necesita y por lo que te pueden pagar. El punto donde todos se cruzan es tu Ikigai (tu razón de ser).'
                    },
                    individual: {
                        title: 'Mi Mapa Ikigai',
                        icon: 'fa-solid fa-user',
                        text: 'El alumno completa su propio diagrama de círculos. Debe esforzarse por ser específico: no basta con poner "deporte", debe concretar si es practicarlo, enseñarlo o gestionarlo. Este ejercicio ayuda a visualizar cómo una pasión puede convertirse en una misión real.',
                        rubric: [
                            { criterion: 'Conexión', excellent: 'Une intereses con salidas reales.', improvable: 'Sin conexión lógica.' },
                            { criterion: 'Especificidad', excellent: 'Define acciones muy concretas.', improvable: 'Ideas demasiado generales.' }
                        ]
                    },
                    group: {
                        title: 'Feedback Vocacional',
                        icon: 'fa-solid fa-comments',
                        text: 'Dinámica de intercambio. Los alumnos comparten sus borradores de Ikigai por parejas. El compañero debe intentar ver conexiones que el autor no haya percibido, aportando una visión externa fresca sobre los talentos y posibilidades de su compañero.',
                        rubric: [
                            { criterion: 'Escucha', excellent: 'Aporta sugerencias de valor.', improvable: 'No muestra interés.' },
                            { criterion: 'Aportación', excellent: 'Visión externa motivadora y útil.', improvable: 'Comentarios irrelevantes.' }
                        ]
                    }
                },
                {
                    title: 'Pasión y Talento',
                    duration: '50 min',
                    resource: {
                        title: 'El Estado de Flow',
                        icon: 'fa-solid fa-water',
                        text: 'Explicación del concepto de flujo de Mihály Csíkszentmihályi. Se analiza por qué ciertas actividades nos absorben tanto que perdemos la noción del tiempo y cómo esos momentos de máxima concentración son indicadores claros de nuestro talento natural.'
                    },
                    individual: {
                        title: 'Mi Momento "Flow"',
                        icon: 'fa-solid fa-hourglass-half',
                        text: 'El estudiante describe detalladamente una actividad (un hobby, una materia, un deporte) donde haya experimentado el estado de flujo. Debe analizar qué habilidades estaba poniendo en práctica en ese momento y por qué le resultaba tan gratificante.',
                        rubric: [
                            { criterion: 'Detalle', excellent: 'Describe sensaciones con precisión.', improvable: 'No identifica ningún momento.' },
                            { criterion: 'Análisis', excellent: 'Asocia talento con gratificación.', improvable: 'No explica por qué fluye.' }
                        ]
                    },
                    group: {
                        title: 'Cazatalentos',
                        icon: 'fa-solid fa-magnifying-glass-plus',
                        text: 'Un "testigo" observa a su compañero realizar una tarea breve (ej: explicar algo, dibujar, organizar una lista). El testigo debe actuar como un cazatalentos, resaltando qué destrezas naturales ha observado y en qué tipo de trabajos cree que esa persona destacaría.',
                        rubric: [
                            { criterion: 'Observación', excellent: 'Detecta talentos sutiles en otros.', improvable: 'Solo ve lo obvio.' },
                            { criterion: 'Feedback', excellent: 'Comunica sus hallazgos con tacto.', improvable: 'No sabe explicar qué ha visto.' }
                        ]
                    }
                },
                {
                    title: 'Misión y Profesión',
                    duration: '50 min',
                    resource: {
                        title: 'Impacto Social',
                        icon: 'fa-solid fa-earth-americas',
                        text: 'Recurso sobre cómo las profesiones del futuro deben alinearse con la sostenibilidad y la ayuda social. Se analizan ejemplos de personas que han convertido su talento en una herramienta para mejorar la vida de los demás o cuidar el planeta.'
                    },
                    individual: {
                        title: 'Mi Idea Solidaria',
                        icon: 'fa-solid fa-hand-holding-dollar',
                        text: 'Cada alumno idea un proyecto o servicio ficticio que combine su pasión personal con un beneficio para su comunidad. Debe redactar un breve resumen del proyecto, a quién ayudaría y por qué cree que sería una idea valiosa y sostenible.',
                        rubric: [
                            { criterion: 'Impacto', excellent: 'Idea original con beneficio social.', improvable: 'Idea puramente egoísta.' },
                            { criterion: 'Viabilidad', excellent: 'Proyecto factible y bien pensado.', improvable: 'Idea imposible de realizar.' }
                        ]
                    },
                    group: {
                        title: 'Feria de Propósitos',
                        icon: 'fa-solid fa-tent',
                        text: 'Presentación rápida (estilo feria) de las ideas solidarias. Los alumnos circulan por la clase conociendo los proyectos de los demás. Al final, se hace una votación no para ver cuál es mejor, sino para identificar cuáles tienen más potencial transformador.',
                        rubric: [
                            { criterion: 'Comunicación', excellent: 'Transmite pasión y claridad.', improvable: 'Falta de entusiasmo.' },
                            { criterion: 'Participación', excellent: 'Muestra interés por todos los proyectos.', improvable: 'Se distrae durante la feria.' }
                        ]
                    }
                },
                {
                    title: 'Economía Vital',
                    duration: '50 min',
                    resource: {
                        title: 'Propósito vs Dinero',
                        icon: 'fa-solid fa-coins',
                        text: 'Recurso que analiza la sostenibilidad económica de un sueño. Se enseña que en el Ikigai es crucial el círculo de "por lo que te pueden pagar", explorando cómo monetizar un talento sin perder la esencia o el propósito social.'
                    },
                    individual: {
                        title: 'Mi Presupuesto Ikigai',
                        icon: 'fa-solid fa-calculator',
                        text: 'El alumno debe calcular qué ingresos necesitaría para mantener la vida que desea con su proyecto Ikigai. Debe investigar precios reales de materiales, locales o licencias, aterrizando su sueño a la realidad financiera actual.',
                        rubric: [
                            { criterion: 'Realismo financiero', excellent: 'Cálculos basados en precios reales.', improvable: 'Cifras inventadas o poco creíbles.' },
                            { criterion: 'Análisis de valor', excellent: 'Sabe por qué cobraría por su servicio.', improvable: 'No entiende el concepto de valor.' }
                        ]
                    },
                    group: {
                        title: 'Crowdfunding de Ideas',
                        icon: 'fa-solid fa-users-viewfinder',
                        text: 'Dinámica donde los alumnos "apuestan" por las ideas de sus compañeros que les parecen más sostenibles y valiosas. El debate se centra en qué hace que un proyecto reciba apoyo y cómo mejorar la "venta" del propósito social.',
                        rubric: [
                            { criterion: 'Persuasión ética', excellent: 'Vende valor social y sostenibilidad.', improvable: 'Solo se centra en el beneficio propio.' },
                            { criterion: 'Feedback crítico', excellent: 'Sugerencias brillantes para mejorar flujo.', improvable: 'Apoyo sin juicio o desinterés.' }
                        ]
                    }
                },
                {
                    title: 'El Pitch Final',
                    duration: '50 min',
                    resource: {
                        title: 'Oratoria con Propósito',
                        icon: 'fa-solid fa-microphone-lines',
                        text: 'Manual de comunicación para presentar un proyecto vital. Se trabajan las "3C": Claridad, Confianza y Conexión emocional. La clave es que el oyente no solo entienda qué haces, sino por qué lo haces (tu misión).'
                    },
                    individual: {
                        title: 'Mi Guion de Vida',
                        icon: 'fa-solid fa-paragraph',
                        text: 'El estudiante redacta el guion de su presentación final de Ikigai. Debe estructurarlo como un viaje: el problema que vio, el talento que aplicó y el cambio que quiere generar en el mundo con su futura profesión.',
                        rubric: [
                            { criterion: 'Estructura narrativa', excellent: 'Relato emocionante y muy coherente.', improvable: 'Texto inconexo o sin mensaje claro.' },
                            { criterion: 'Fuerza del porqué', excellent: 'Transmite una misión vital potente.', improvable: 'No explica su motivación real.' }
                        ]
                    },
                    group: {
                        title: 'Gala de Ikigais',
                        icon: 'fa-solid fa-masks-theater',
                        text: 'Presentación final ante la clase. Los alumnos presentan su propósito vital como si ya estuvieran en el futuro. Es un ejercicio de visualización y oratoria compartida que cierra el bloque celebrando el talento individual.',
                        rubric: [
                            { criterion: 'Dominio del escenario', excellent: 'Seguridad, calma y contacto visual.', improvable: 'Lee el papel o muestra inseguridad.' },
                            { criterion: 'Impacto emocional', excellent: 'Logra inspirar a sus compañeros.', improvable: 'Presentación apática o rutinaria.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block11',
            title: 'Salidas Laborales',
            desc: 'Habilidades profesionales, currículum y preparación para el primer empleo.',
            color: '#475569',
            icon: 'fa-solid fa-briefcase',
            sessions: [
                {
                    title: 'Currículum Creative',
                    duration: '50 min',
                    resource: {
                        title: 'Soft Skills en el CV',
                        icon: 'fa-solid fa-file-invoice',
                        text: 'Guía sobre cómo redactar un currículum impactante cuando aún no se tiene experiencia laboral. Se enseña a poner el foco en las habilidades transversales (idiomas, digitalización, trabajo en equipo) y en actividades extracurriculares que demuestren responsabilidad.'
                    },
                    individual: {
                        title: 'Borrador de CV',
                        icon: 'fa-solid fa-user',
                        text: 'El alumno diseña un primer borrador de su currículum. Debe elegir un formato limpio y profesional, redactando un extracto personal que defina quién es y qué puede aportar. El ejercicio sirve para tomar conciencia de que sus logros escolares y hobbies también tienen valor profesional.',
                        rubric: [
                            { criterion: 'Estructura', excellent: 'Claro, directo y sin errores.', improvable: 'Desordenado o incompleto.' },
                            { criterion: 'Presentación', excellent: 'Diseño visual impecable.', improvable: 'Formato descuidado.' }
                        ]
                    },
                    group: {
                        title: 'Simulación Entrevista',
                        icon: 'fa-solid fa-users-viewfinder',
                        text: 'Dinámica de role-playing por parejas. Uno actúa como entrevistador y el otro como candidato. Deben practicar respuestas a preguntas trampa comunes (ej: "¿cuál es tu mayor debilidad?") buscando siempre la honestidad y la proactividad.',
                        rubric: [
                            { criterion: 'Expresión', excellent: 'Se comunica con seguridad y claridad.', improvable: 'Falta de preparación.' },
                            { criterion: 'Seguridad', excellent: 'Lenguaje corporal muy profesional.', improvable: 'Muestra excesivo nerviosismo.' }
                        ]
                    }
                },
                {
                    title: 'Marca Personal',
                    duration: '50 min',
                    resource: {
                        title: 'Tu Huella Digital',
                        icon: 'fa-solid fa-fingerprint',
                        text: 'Recurso sobre la importancia de la reputación online. Se explica que todo lo que publicamos deja un rastro que las empresas consultan hoy en día. Se dan consejos para auditar la propia presencia en redes y convertirla en una herramienta de marca personal positiva.'
                    },
                    individual: {
                        title: 'Googleándome',
                        icon: 'fa-solid fa-search',
                        text: 'Actividad de auditoría digital. El alumno debe rastrear (o imaginar, si no tiene presencia) qué resultados aparecen al buscar su nombre. Debe proponer tres acciones para mejorar su privacidad u optimizar su perfil para que dé una imagen profesional y coherente.',
                        rubric: [
                            { criterion: 'Precaución', excellent: 'Propone medidas de privacidad serias.', improvable: 'No ve riesgo en las redes.' },
                            { criterion: 'Análisis', excellent: 'Reflexión profunda sobre su huella.', improvable: 'Análisis muy superficial.' }
                        ]
                    },
                    group: {
                        title: 'Elevator Pitch',
                        icon: 'fa-solid fa-up-long',
                        text: 'Desafío de comunicación: los alumnos tienen exactamente 60 segundos para presentarse ante el grupo y convencerles de que son el candidato ideal para un puesto. Se trabaja la síntesis, la seguridad gestual y la capacidad de impacto verbal.',
                        rubric: [
                            { criterion: 'Impacto', excellent: 'Logra captar la atención rápido.', improvable: 'Se alarga sin decir nada claro.' },
                            { criterion: 'Síntesis', excellent: 'Resume su valor en el tiempo justo.', improvable: 'No logra explicar quién es.' }
                        ]
                    }
                },
                {
                    title: 'Búsqueda de Empleo',
                    duration: '50 min',
                    resource: {
                        title: 'Portales y Redes',
                        icon: 'fa-solid fa-laptop-code',
                        text: 'Análisis de las herramientas modernas de búsqueda activa. Se comparan portales generales (Infojobs) con redes profesionales (LinkedIn), subrayando la importancia del "mercado oculto" de vacantes que solo se cubren mediante contactos y recomendaciones personales.'
                    },
                    individual: {
                        title: 'Carta de Motivación',
                        icon: 'fa-solid fa-envelope-open-text',
                        text: 'Redacción de una carta de presentación para una empresa donde el alumno soñaría trabajar. Debe ser personalizada, mostrando que conoce la empresa y explicando de forma honesta por qué está motivado para aprender con ellos.',
                        rubric: [
                            { criterion: 'Redacción', excellent: 'Persuasiva, educada y profesional.', improvable: 'Lenguaje demasiado informal.' },
                            { criterion: 'Motivación', excellent: 'Transmite interés real por el puesto.', improvable: 'Parece una carta genérica.' }
                        ]
                    },
                    group: {
                        title: 'Mapa de Contactos',
                        icon: 'fa-solid fa-network-wired',
                        text: 'Visualización sociográfica. Cada alumno dibuja su red de contactos actual (familia, vecinos, conocidos en empresas). La clase debate sobre cómo activar esta red de forma educada para conseguir información sobre el mercado laboral real.',
                        rubric: [
                            { criterion: 'Red', excellent: 'Visualiza oportunidades reales.', improvable: 'Cree que no conoce a nadie.' },
                            { criterion: 'Análisis', excellent: 'Identifica sectores de interés mutuo.', improvable: 'No asocia red con futuro.' }
                        ]
                    }
                },
                {
                    title: 'Identidad Digital Pro',
                    duration: '50 min',
                    resource: {
                        title: 'Redes Profesionales',
                        icon: 'fa-solid fa-link',
                        text: 'Introducción a plataformas como LinkedIn para jóvenes. Se enseña que las redes también sirven para aprender de referentes, seguir a empresas del sector y participar en comunidades de conocimiento técnico.'
                    },
                    individual: {
                        title: 'Mi Perfil Futuro',
                        icon: 'fa-solid fa-address-card',
                        text: 'El alumno diseña cómo sería su perfil profesional en redes sociales dentro de 5 años. Debe elegir una foto adecuada, redactar un titular profesional atractivo y listar las habilidades que espera haber certificado para entonces.',
                        rubric: [
                            { criterion: 'Proyección Pro', excellent: 'Imagen impecable y muy profesional.', improvable: 'Perfil informal o poco serio.' },
                            { criterion: 'Ambición realista', excellent: 'Metas de formación muy coherentes.', improvable: 'Metas inalcanzables o absurdas.' }
                        ]
                    },
                    group: {
                        title: 'Taller de Networking',
                        icon: 'fa-solid fa-comments-dollar',
                        text: 'Dinámica de simulación de un evento profesional. Los alumnos deben circular presentándose y buscando "colaboradores" para proyectos ficticios, practicando la escucha activa y el intercambio de valor profesional.',
                        rubric: [
                            { criterion: 'Iniciativa social', excellent: 'Rompe el hielo con soltura y respeto.', improvable: 'Se queda solo o no interactúa.' },
                            { criterion: 'Claridad mensaje', excellent: 'Explica qué ofrece y qué busca rápido.', improvable: 'Mensaje confuso o poco profesional.' }
                        ]
                    }
                },
                {
                    title: 'Derechos del Trabajador',
                    duration: '50 min',
                    resource: {
                        title: 'Guía del Primer Empleo',
                        icon: 'fa-solid fa-scale-unbalanced',
                        text: 'Recurso esencial sobre legislación laboral básica: salario mínimo, tipos de contrato, periodos de prueba y seguridad social. Se enseña a leer una nómina básica y a reconocer situaciones de abuso laboral.'
                    },
                    individual: {
                        title: 'Analista de Nómina',
                        icon: 'fa-solid fa-receipt',
                        text: 'A partir de un ejemplo real (o simulado), el alumno debe identificar los conceptos clave: salario base, retenciones y cotizaciones. Debe explicar por qué es importante cotizar y qué derechos le otorga estar dado de alta.',
                        rubric: [
                            { criterion: 'Atención al detalle', excellent: 'Identifica todos los conceptos técnicos.', improvable: 'No entiende los números de la nómina.' },
                            { criterion: 'Conciencia legal', excellent: 'Valora la importancia de la legalidad.', improvable: 'Muestra indiferencia a sus derechos.' }
                        ]
                    },
                    group: {
                        title: 'Dilema Contractual',
                        icon: 'fa-solid fa-handshake-slash',
                        text: 'Por grupos, analizan casos de ofertas de empleo "sospechosas" o abusivas. Deben argumentar qué partes de la oferta incumplen la ley y cómo deberían responder para defender sus derechos de forma profesional.',
                        rubric: [
                            { criterion: 'Defensa de derechos', excellent: 'Argumentos basados en la guía legal.', improvable: 'Acepta el abuso o responde mal.' },
                            { criterion: 'Análisis ético', excellent: 'Prioriza la dignidad sobre el dinero.', improvable: 'No detecta la falta de ética.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block12',
            title: 'Ciudadanía Digital',
            desc: 'Privacidad, respeto y seguridad en el entorno digital para una convivencia sana online.',
            color: '#3b82f6',
            icon: 'fa-solid fa-shield-halved',
            sessions: [
                {
                    title: 'Huella y Privacidad',
                    duration: '50 min',
                    resource: {
                        title: 'La Permanente Digital',
                        icon: 'fa-solid fa-fingerprint',
                        text: 'Recurso sobre la irreversibilidad de las acciones online. Se explica cómo la información que compartimos (fotos, comentarios) crea un rastro permanente que nos define ante futuros empleadores o instituciones educativas.'
                    },
                    individual: {
                        title: 'Auditoría de Perfil',
                        icon: 'fa-solid fa-user-lock',
                        text: 'El alumno revisa los ajustes de privacidad de sus redes sociales principales. Debe identificar tres riesgos potenciales (ej: geolocalización activa) y redactar las medidas tomadas para mitigar su exposición pública innecesaria.',
                        rubric: [
                            { criterion: 'Seguridad', excellent: 'Identifica y corrige riesgos graves.', improvable: 'Ignora ajustes básicos de privacidad.' },
                            { criterion: 'Análisis', excellent: 'Reflexión profunda sobre su exposición.', improvable: 'Análisis superficial de su perfil.' }
                        ]
                    },
                    group: {
                        title: 'El Juego del Rastreador',
                        icon: 'fa-solid fa-magnifying-glass',
                        text: 'Dinámica por equipos donde se analiza el perfil (ficticio o público) de una persona. Deben deducir hábitos, gustos y ubicación basándose solo en "rastros" digitales, aprendiendo lo fácil que es reconstruir la vida de alguien sin su permiso.',
                        rubric: [
                            { criterion: 'Deducción', excellent: 'Extrae conclusiones lógicas y éticas.', improvable: 'Cae en la especulación sin base.' },
                            { criterion: 'Colaboración', excellent: 'Trabaja en equipo para analizar datos.', improvable: 'Se distrae o no aporta al rastreo.' }
                        ]
                    }
                },
                {
                    title: 'Netiqueta y Respeto',
                    duration: '50 min',
                    resource: {
                        title: 'Las 10 Reglas de Oro',
                        icon: 'fa-solid fa-handshake-angle',
                        text: 'Guía sobre el comportamiento ético en entornos virtuales. Se subraya que "detrás de cada pantalla hay una persona" y se analizan las consecuencias del anonimato en la deshumanización de la comunicación digital.'
                    },
                    individual: {
                        title: 'Mensajes Asertivos',
                        icon: 'fa-solid fa-comment-dots',
                        text: 'El estudiante debe redactar una respuesta respetuosa pero firme ante una situación de conflicto en un grupo de WhatsApp. El objetivo es practicar la comunicación no violenta y la resolución de malentendidos sin escalar la agresividad.',
                        rubric: [
                            { criterion: 'Asertividad', excellent: 'Responde con firmeza y máximo respeto.', improvable: 'Usa un tono pasivo o agresivo.' },
                            { criterion: 'Eficacia', excellent: 'Logra calmar el conflicto potencial.', improvable: 'El mensaje no resuelve la tensión.' }
                        ]
                    },
                    group: {
                        title: 'Mediadores Digitales',
                        icon: 'fa-solid fa-users-viewfinder',
                        text: 'Simulacro grupal: un grupo simula un debate que se vuelve tóxico. Un "mediador" debe intervenir usando las reglas de netiqueta para reconducir la conversación hacia el respeto y el intercambio constructivo de ideas.',
                        rubric: [
                            { criterion: 'Mediación', excellent: 'Reconduce el tono del grupo con éxito.', improvable: 'No sabe cómo frenar la toxicidad.' },
                            { criterion: 'Técnica', excellent: 'Aplica reglas de netiqueta con rigor.', improvable: 'Olvida los principios básicos de respeto.' }
                        ]
                    }
                },
                {
                    title: 'Ciberseguridad Básica',
                    duration: '50 min',
                    resource: {
                        title: 'Phishing y Contraseñas',
                        icon: 'fa-solid fa-key',
                        text: 'Manual práctico para detectar estafas comunes (phishing) y crear contraseñas robustas. Se enseña el uso de la verificación en dos pasos (2FA) como la herramienta más eficaz para proteger las cuentas personales.'
                    },
                    individual: {
                        title: 'Gestor de Identidad',
                        icon: 'fa-solid fa-vault',
                        text: 'El alumno diseña un plan de seguridad para sus cuentas: debe crear una "frase de contraseña" larga y fácil de recordar, identificar correos sospechosos y verificar qué apps tienen acceso excesivo a sus datos privados.',
                        rubric: [
                            { criterion: 'Técnica', excellent: 'Crea un sistema de seguridad avanzado.', improvable: 'Usa contraseñas débiles o repetidas.' },
                            { criterion: 'Atención', excellent: 'Detecta engaños visuales en estafas.', improvable: 'No distingue entre mail real y fake.' }
                        ]
                    },
                    group: {
                        title: 'Escape Room Digital',
                        icon: 'fa-solid fa-door-open',
                        text: 'Prueba por equipos donde deben resolver retos de ciberseguridad (descifrar un aviso, detectar un virus, configurar un router) para "escapar". Fomenta el aprendizaje lúdico de conceptos técnicos de seguridad informática.',
                        rubric: [
                            { criterion: 'Resolución', excellent: 'Resuelve los retos técnicos con lógica.', improvable: 'Se bloquea ante problemas sencillos.' },
                            { criterion: 'Trabajo en equipo', excellent: 'Coordina habilidades para avanzar.', improvable: 'No comparte la información con el grupo.' }
                        ]
                    }
                },
                {
                    title: 'Algoritmos y Burbujas',
                    duration: '50 min',
                    resource: {
                        title: 'Cámaras de Eco',
                        icon: 'fa-solid fa-diagram-project',
                        text: 'Explicación de cómo funcionan los algoritmos de recomendación: nos muestran lo que nos gusta para que no salgamos de la app. Esto crea "burbujas de filtro" que nos impiden ver otras realidades e incrementan la polarización social.'
                    },
                    individual: {
                        title: 'Mi Burbuja Personal',
                        icon: 'fa-solid fa-filter',
                        text: 'El alumno analiza sus recomendaciones de TikTok o YouTube. Debe identificar qué temas son recurrentes y buscar activamente tres canales o perfiles con opiniones o gustos totalmente opuestos a los suyos por un día.',
                        rubric: [
                            { criterion: 'Crítica algorítmica', excellent: 'Entiende cómo le manipula la red.', improvable: 'Cree que las sugerencias son azarosas.' },
                            { criterion: 'Flexibilidad mental', excellent: 'Muestra interés por visiones ajenas.', improvable: 'Muestra rechazo o intolerancia.' }
                        ]
                    },
                    group: {
                        title: 'Desafío del Algoritmo',
                        icon: 'fa-solid fa-robot',
                        text: 'En grupos, deben diseñar un "algoritmo ético" que en lugar de solo retener al usuario, fomente la diversidad y el aprendizaje. Deben presentar 3 funciones de su algoritmo que ayuden a romper burbujas informativas.',
                        rubric: [
                            { criterion: 'Creatividad social', excellent: 'Funciones muy originales e inclusivas.', improvable: 'Propuesta aburrida o convencional.' },
                            { criterion: 'Razonamiento', excellent: 'Justifica el beneficio para la paz social.', improvable: 'No ve el impacto ético del código.' }
                        ]
                    }
                },
                {
                    title: 'Creación Ética',
                    duration: '50 min',
                    resource: {
                        title: 'Influencers de Valor',
                        icon: 'fa-solid fa-video',
                        text: 'Recurso que analiza qué hace que un creador de contenido sea una influencia positiva. Se exploran valores como la honestidad (publicidad marcada), la salud mental y la responsabilidad sobre lo que se dice a miles de personas.'
                    },
                    individual: {
                        title: 'Mi Canal Positivo',
                        icon: 'fa-solid fa-microphone-lines',
                        text: 'El estudiante idea una campaña o perfil de contenido que aporte algo bueno a la sociedad (ej: tutorías rápidas, consejos de ecología, humor sano). Debe definir su "línea editorial" basada en el respeto y la veracidad.',
                        rubric: [
                            { criterion: 'Propósito', excellent: 'Misión social clara y muy valiosa.', improvable: 'Contenido vacío o sin valores.' },
                            { criterion: 'Ética creativa', excellent: 'Cero uso de clickbait o engaño.', improvable: 'Usa trucos para ganar visitas.' }
                        ]
                    },
                    group: {
                        title: 'Manifiesto de Creador',
                        icon: 'fa-solid fa-file-contract',
                        text: 'La clase redacta un "Código Deontológico del Estudiante Creador". Un conjunto de compromisos que cualquier alumno de la clase que publique contenido online debería seguir para asegurar que su huella sea siempre un aporte positivo.',
                        rubric: [
                            { criterion: 'Consenso ético', excellent: 'Llega a acuerdos de respeto maduros.', improvable: 'Muestra indiferencia por el respeto online.' },
                            { criterion: 'Impacto', excellent: 'Normas que realmente evitan el daño.', improvable: 'Normas irrelevantes o flojas.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block13',
            title: 'Pensamiento Crítico',
            desc: 'Herramientas para analizar la información, detectar sesgos y tomar decisiones fundamentadas.',
            color: '#f43f5e',
            icon: 'fa-solid fa-brain',
            sessions: [
                {
                    title: 'Detectando Fake News',
                    duration: '50 min',
                    resource: {
                        title: 'Infodemia y Verdad',
                        icon: 'fa-solid fa-newspaper',
                        text: 'Recurso que analiza cómo se propagan las noticias falsas y por qué el cerebro humano tiende a creer lo que confirma sus prejuicios. Se presentan herramientas de "fact-checking" como Maldita o Newtral.'
                    },
                    individual: {
                        title: 'Buscador de Mentiras',
                        icon: 'fa-solid fa-magnifying-glass-plus',
                        text: 'El alumno debe buscar una noticia viral reciente y aplicar el test de veracidad: ¿Quién lo publica? ¿Hay fuentes citadas? ¿Es un titular clickbait? Debe redactar un breve informe justificando si es una noticia real o falsa.',
                        rubric: [
                            { criterion: 'Análisis', excellent: 'Aplica el test con rigor y acierto.', improvable: 'Se deja llevar por el titular.' },
                            { criterion: 'Investigación', excellent: 'Localiza la fuente original del bulo.', improvable: 'No cita fuentes alternativas.' }
                        ]
                    },
                    group: {
                        title: 'Taller de Bulos',
                        icon: 'fa-solid fa-users-rays',
                        text: 'En grupos, los alumnos crean un "bulo convincente" y analizan qué elementos lo hacen creíble (emoción, miedo, urgencia). Después, deben explicar al resto cómo detectar esos elementos para no caer en la trampa en el futuro.',
                        rubric: [
                            { criterion: 'Reflexión', excellent: 'Entiende los resortes de la manipulación.', improvable: 'Solo ve el bulo como una broma.' },
                            { criterion: 'Comunicación', excellent: 'Explica con claridad cómo vacunarse.', improvable: 'Mensaje confuso o poco útil.' }
                        ]
                    }
                },
                {
                    title: 'Sesgos Cognitivos',
                    duration: '50 min',
                    resource: {
                        title: 'Atajos del Cerebro',
                        icon: 'fa-solid fa-diagram-predecessor',
                        text: 'Introducción a los sesgos más comunes: sesgo de confirmación, efecto anclaje y sesgo de disponibilidad. Se explica cómo estos "atajos mentales" nos ayudan a decidir rápido pero a menudo nos llevan a errores de juicio.'
                    },
                    individual: {
                        title: 'Mi Sesgo Favorito',
                        icon: 'fa-solid fa-user-gear',
                        text: 'El estudiante identifica una situación personal donde haya actuado bajo un sesgo (ej: juzgar a alguien por su primera impresión). Debe explicar cómo ese sesgo influyó en su conducta y qué hubiera pasado si hubiera actuado de forma más racional.',
                        rubric: [
                            { criterion: 'Autocrítica', excellent: 'Reconoce sus propios errores de juicio.', improvable: 'Niega tener sesgos personales.' },
                            { criterion: 'Comprensión', excellent: 'Define el sesgo con total exactitud.', improvable: 'Confunde los tipos de sesgos.' }
                        ]
                    },
                    group: {
                        title: 'El Jurado Popular',
                        icon: 'fa-solid fa-scale-balanced',
                        text: 'Dinámica grupal donde se presenta un caso ambiguo. Los grupos deben decidir un "veredicto" y luego analizar si en su debate aparecieron sesgos grupales, evaluando cómo la opinión de la mayoría puede anular el pensamiento individual.',
                        rubric: [
                            { criterion: 'Objetividad', excellent: 'Basa su veredicto en pruebas reales.', improvable: 'Se deja llevar por prejuicios.' },
                            { criterion: 'Análisis grupal', excellent: 'Detecta la presión de grupo con madurez.', improvable: 'No analiza la dinámica del debate.' }
                        ]
                    }
                },
                {
                    title: 'El Poder de la Pregunta',
                    duration: '50 min',
                    resource: {
                        title: 'Método Socrático',
                        icon: 'fa-solid fa-question',
                        text: 'Guía sobre la técnica de preguntar para profundizar. Se enseña a no aceptar la primera respuesta y a cuestionar las premisas ocultas tras cualquier afirmación, fomentando una curiosidad intelectual activa y respetuosa.'
                    },
                    individual: {
                        title: 'Entrevista al Saber',
                        icon: 'fa-solid fa-file-invoice-dollar',
                        text: 'El alumno debe elegir una afirmación común (ej: "los videojuegos son malos") y redactar 5 preguntas que obliguen a profundizar en esa idea, buscando matices y evidencias que la confirmen o la desmientan.',
                        rubric: [
                            { criterion: 'Calidad preguntas', excellent: 'Preguntas que rompen la superficie.', improvable: 'Preguntas cerradas (sí/no).' },
                            { criterion: 'Estructura', excellent: 'Sigue un hilo lógico de indagación.', improvable: 'Preguntas inconexas o simples.' }
                        ]
                    },
                    group: {
                        title: 'Torneo de Preguntas',
                        icon: 'fa-solid fa-comments-dollar',
                        text: 'Debate grupal donde el objetivo no es responder, sino plantear la "mejor pregunta posible" sobre un tema. Gana el equipo que logre formular la pregunta que más haga reflexionar a los demás, primando el ingenio sobre la retórica.',
                        rubric: [
                            { criterion: 'Ingenio', excellent: 'Plantea dudas que nadie había visto.', improvable: 'Preguntas obvias o repetitivas.' },
                            { criterion: 'Escucha activa', excellent: 'Lanza preguntas basadas en lo oído.', improvable: 'Lanza preguntas preparadas de casa.' }
                        ]
                    }
                },
                {
                    title: 'Neuromarketing',
                    duration: '50 min',
                    resource: {
                        title: 'Trampas del Consumo',
                        icon: 'fa-solid fa-tags',
                        text: 'Análisis de cómo la publicidad utiliza la neurociencia para inducirnos a comprar: música, olores, precios psicológicos (.99) y la escasez ficticia ("solo queda 1"). Se enseña a separar el deseo impulsivo de la necesidad real.'
                    },
                    individual: {
                        title: 'Caza de Trucos',
                        icon: 'fa-solid fa-magnifying-glass-dollar',
                        text: 'El alumno analiza su última compra o un anuncio que le haya tentado. Debe identificar al menos dos técnicas de neuromarketing usadas y reflexionar sobre si su decisión fue libre o "empujada" por el diseño del anuncio.',
                        rubric: [
                            { criterion: 'Identificación', excellent: 'Detecta trucos sutiles de marketing.', improvable: 'No ve más allá de la oferta.' },
                            { criterion: 'Consciencia', excellent: 'Entiende su propio proceso de impulso.', improvable: 'Niega que la publicidad le afecte.' }
                        ]
                    },
                    group: {
                        title: 'Anuncio Honesto',
                        icon: 'fa-solid fa-rectangle-ad',
                        text: 'En grupos, rediseñan un anuncio famoso quitando todos los "trucos" sensoriales y dejando solo la información real del producto. El objetivo es ver qué queda cuando quitamos la manipulación emocional.',
                        rubric: [
                            { criterion: 'Sinceridad creativa', excellent: 'Logra ser informativo sin manipular.', improvable: 'Mantiene trucos ocultos en el diseño.' },
                            { criterion: 'Reflexión', excellent: 'Gran debate sobre la ética comercial.', improvable: 'No analiza el impacto de la publicidad.' }
                        ]
                    }
                },
                {
                    title: 'Ciencia vs Mito',
                    duration: '50 min',
                    resource: {
                        title: 'Método Científico',
                        icon: 'fa-solid fa-microscope',
                        text: 'Guía sobre cómo distinguir la ciencia real de las pseudociencias. Se explica la importancia del grupo de control, la revisión por pares y que "correlación no implica causalidad" (que dos cosas pasen a la vez no significa que una cause la otra).'
                    },
                    individual: {
                        title: 'Desmontando el Mito',
                        icon: 'fa-solid fa-user-doctor',
                        text: 'El estudiante elige una creencia común sin base científica (horóscopos, remedios mágicos, teorías de la conspiración) y redacta un breve texto explicando qué pruebas faltan para que sea considerada verdadera.',
                        rubric: [
                            { criterion: 'Rigor lógico', excellent: 'Aplica el método científico con solidez.', improvable: 'Usa argumentos emocionales o vagos.' },
                            { criterion: 'Claridad', excellent: 'Explica conceptos complejos de forma simple.', improvable: 'Mensaje confuso o poco firme.' }
                        ]
                    },
                    group: {
                        title: 'Laboratorio de Pruebas',
                        icon: 'fa-solid fa-vials',
                        text: 'Dinámica por equipos donde deben diseñar un experimento "imaginario" para demostrar si una afirmación es cierta o falsa. Deben definir qué medirían, cómo evitarían sesgos y qué resultado esperaría la ciencia.',
                        rubric: [
                            { criterion: 'Diseño experimental', excellent: 'Propuesta de experimento muy rigurosa.', improvable: 'Experimento mal planteado o sesgado.' },
                            { criterion: 'Razonamiento', excellent: 'Defiende la evidencia sobre la opinión.', improvable: 'Cede ante ideas populares no probadas.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block14',
            title: 'Emprendimiento Social',
            desc: 'Identificación de problemas sociales y diseño de soluciones creativas y sostenibles.',
            color: '#10b981',
            icon: 'fa-solid fa-rocket',
            sessions: [
                {
                    title: 'Identificando Problemas',
                    duration: '50 min',
                    resource: {
                        title: 'Empatía y Necesidad',
                        icon: 'fa-solid fa-eye',
                        text: 'Recurso que enseña a mirar el entorno con "ojos de emprendedor". Se aprende a distinguir entre una queja y un problema real que requiere una solución, poniendo siempre el foco en las personas afectadas.'
                    },
                    individual: {
                        title: 'Mi Mapa de Entorno',
                        icon: 'fa-solid fa-map-location',
                        text: 'El alumno analiza su barrio o instituto buscando 3 necesidades no cubiertas (ej: falta de reciclaje, soledad de mayores). Debe describir quién tiene el problema y cómo le afecta en su día a día, sin proponer aún ninguna solución.',
                        rubric: [
                            { criterion: 'Observación', excellent: 'Detecta necesidades sutiles e importantes.', improvable: 'No ve problemas más allá de los suyos.' },
                            { criterion: 'Empatía', excellent: 'Describe el dolor del usuario con claridad.', improvable: 'Descripción fría y sin profundidad.' }
                        ]
                    },
                    group: {
                        title: 'El Árbol del Problema',
                        icon: 'fa-solid fa-tree',
                        text: 'En grupos, eligen un problema y dibujan su "árbol": las raíces son las causas ocultas, el tronco es el problema principal y las ramas son las consecuencias. Visualizarlo ayuda a entender que para solucionar algo hay que atacar la raíz.',
                        rubric: [
                            { criterion: 'Análisis causal', excellent: 'Llega a las raíces profundas del fallo.', improvable: 'Confunde causas con síntomas.' },
                            { criterion: 'Visión sistémica', excellent: 'Entiende cómo todo está conectado.', improvable: 'Análisis lineal y simplista.' }
                        ]
                    }
                },
                {
                    title: 'Ideación y Creatividad',
                    duration: '50 min',
                    resource: {
                        title: 'Design Thinking',
                        icon: 'fa-solid fa-gears',
                        text: 'Introducción a la fase de ideación masiva (Brainstorming). Se enseña que "la mejor forma de tener una buena idea es tener muchas ideas" y que en esta fase no se debe juzgar ninguna propuesta, por loca que parezca.'
                    },
                    individual: {
                        title: 'Lluvia de Ideas en 10',
                        icon: 'fa-solid fa-bolt-lightning',
                        text: 'El estudiante debe generar 10 soluciones posibles para uno de los problemas detectados anteriormente. La regla es que las 5 primeras sean lógicas y las 5 últimas sean totalmente disruptivas o "imposibles".',
                        rubric: [
                            { criterion: 'Disrupción', excellent: 'Propone soluciones muy originales.', improvable: 'Todas sus ideas son convencionales.' },
                            { criterion: 'Fluidez', excellent: 'Logra el reto de las 10 ideas rápido.', improvable: 'Se queda bloqueado en la tercera.' }
                        ]
                    },
                    group: {
                        title: 'El Pitch de la Idea',
                        icon: 'fa-solid fa-microphone-lines',
                        text: 'Los grupos fusionan sus mejores ideas en una sola propuesta ganadora. Deben preparar un "pitch" de 2 minutos explicando su idea, por qué es creativa y qué impacto real positivo tendría si se llevara a cabo.',
                        rubric: [
                            { criterion: 'Eficacia comunicativa', excellent: 'Logra emocionar y convencer al foro.', improvable: 'Presentación apática o confusa.' },
                            { criterion: 'Valor social', excellent: 'La idea tiene un impacto real medible.', improvable: 'Idea sin beneficio social claro.' }
                        ]
                    }
                },
                {
                    title: 'Prototipado de Impacto',
                    duration: '50 min',
                    resource: {
                        title: 'MVP: Mínimo Viable',
                        icon: 'fa-solid fa-vial-circle-check',
                        text: 'Recurso sobre cómo validar una idea con pocos recursos. Se explica que no hace falta una app compleja para empezar; a veces un dibujo, un papel o una encuesta bastan para saber si tu solución interesa a la gente.'
                    },
                    individual: {
                        title: 'Mi Primer Boceto',
                        icon: 'fa-solid fa-pen-ruler',
                        text: 'El alumno dibuja o diseña el "esqueleto" de su solución (un cartel, un flujo de app, un folleto). Debe definir cuáles son las dos funciones clave que su invento debe cumplir sí o sí para ser útil desde el primer día.',
                        rubric: [
                            { criterion: 'Síntesis', excellent: 'Identifica las funciones vitales.', improvable: 'Se pierde en detalles irrelevantes.' },
                            { criterion: 'Claridad visual', excellent: 'El boceto se entiende sin explicarlo.', improvable: 'Dibujo confuso o ilegible.' }
                        ]
                    },
                    group: {
                        title: 'Validación en Crudo',
                        icon: 'fa-solid fa-users-gear',
                        text: 'Dinámica de "crítica constructiva". Cada grupo presenta su prototipo a otro grupo. Los "evaluadores" deben intentar encontrar fallos o puntos débiles, no para criticar, sino para proponer mejoras que hagan la idea más sólida.',
                        rubric: [
                            { criterion: 'Mentalidad de mejora', excellent: 'Acepta y aplica el feedback recibido.', improvable: 'Se pone a la defensiva con las críticas.' },
                            { criterion: 'Asesoramiento', excellent: 'Aporta ideas de mejora brillantes.', improvable: 'Comentarios vagos o destructivos.' }
                        ]
                    }
                },
                {
                    title: 'Presupuesto y Recursos',
                    duration: '50 min',
                    resource: {
                        title: 'Gestión Económica',
                        icon: 'fa-solid fa-calculator',
                        text: 'Recurso sobre cómo financiar un proyecto social. Se exploran vías como el patrocinio, las subvenciones, el crowdfunding y la autofinanciación mediante servicios. Se enseña a priorizar gastos para maximizar el impacto social.'
                    },
                    individual: {
                        title: 'Mi Micro-Presupuesto',
                        icon: 'fa-solid fa-file-invoice-dollar',
                        text: 'El alumno debe listar los 3 recursos materiales más caros que necesita su proyecto y buscar alternativas (reciclaje, trueque, préstamo). Debe justificar por qué su idea es viable incluso con pocos recursos iniciales.',
                        rubric: [
                            { criterion: 'Eficiencia', excellent: 'Optimiza recursos de forma brillante.', improvable: 'Pide recursos excesivos o innecesarios.' },
                            { criterion: 'Realismo', excellent: 'Cálculos y costes muy bien ajustados.', improvable: 'Cifras totalmente irreales.' }
                        ]
                    },
                    group: {
                        title: 'Búsqueda de Sponsors',
                        icon: 'fa-solid fa-hand-holding-dollar',
                        text: 'Simulacro de reunión con una empresa local. Los grupos deben convencer a un "empitico sponsor" de que su proyecto merece ser apoyado, vinculándolo con los valores de Responsabilidad Social Corporativa (RSC) de la empresa.',
                        rubric: [
                            { criterion: 'Persuasión ética', excellent: 'Une intereses sociales y empresariales.', improvable: 'Solo pide dinero sin ofrecer valor.' },
                            { criterion: 'Seguridad', excellent: 'Presentación profesional y muy segura.', improvable: 'Falta de preparación en los datos.' }
                        ]
                    }
                },
                {
                    title: 'Demo Day Social',
                    duration: '50 min',
                    resource: {
                        title: 'Presentación de Impacto',
                        icon: 'fa-solid fa-clapperboard',
                        text: 'Guía final para la presentación de proyectos. Se subraya la importancia de la historia (Storytelling): a quién ayudamos, cómo lo hicimos y qué hemos aprendido en el camino de convertirnos en emprendedores sociales.'
                    },
                    individual: {
                        title: 'Mi Reflexión Final',
                        icon: 'fa-solid fa-user-graduate',
                        text: 'El estudiante redacta una breve conclusión personal sobre el bloque. ¿Qué habilidad descubrió en sí mismo? ¿Qué problema social ahora entiende mejor? Es un ejercicio de cierre y autoconciencia sobre su capacidad de cambio.',
                        rubric: [
                            { criterion: 'Madurez', excellent: 'Conclusiones profundas y transformadoras.', improvable: 'Texto vacío o de compromiso.' },
                            { criterion: 'Autenticidad', excellent: 'Reconoce sus miedos y logros reales.', improvable: 'No admite aprendizaje personal.' }
                        ]
                    },
                    group: {
                        title: 'Entrega de Galardones',
                        icon: 'fa-solid fa-award',
                        text: 'Presentación final de los proyectos ante la clase. Se otorgan reconocimientos simbólicos (ej: "Más innovador", "Mayor impacto social", "Mejor prototipo") para celebrar el esfuerzo y la creatividad colectiva del curso.',
                        rubric: [
                            { criterion: 'Impacto social', excellent: 'El proyecto soluciona un dolor real.', improvable: 'Idea sin impacto o mal definida.' },
                            { criterion: 'Compañerismo', excellent: 'Celebra los éxitos ajenos con alegría.', improvable: 'Muestra envidia o indiferencia.' }
                        ]
                    }
                }
            ]
        }
    ];

    const currentBlock = blocks.find(b => b.id === activeBlock) || blocks[0];
    const currentSession = currentBlock.sessions[activeSessionIdx] || currentBlock.sessions[0];

    return (
        <div className="tutoria-app">
            <header className="tutoria-app-header">
                <div className="tutoria-app-title-group">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        🎓 Banco de Recursos Tutoriales ✨
                    </motion.h1>

                </div>
            </header>

            {/* Always visible category navigation / bubbles */}
            <nav className="tutoria-block-nav">
                {blocks.map((block, idx) => (
                    <motion.div
                        key={block.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03, type: "spring", stiffness: 200 }}
                        className={`block-nav-item ${activeBlock === block.id ? 'active' : ''}`}
                        onClick={() => handleBlockChange(block.id)}
                    >
                        <i className={block.icon}></i>
                        <span>{block.title}</span>
                    </motion.div>
                ))}
            </nav>

            <AnimatePresence mode="wait">
                <motion.main
                    key={activeBlock}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="tutoria-main-content"
                >
                    <section className="block-intro-card">
                        <div className="block-intro-content">
                            <h2 style={{ color: currentBlock.color }}>{currentBlock.title}</h2>
                            <p>{currentBlock.desc}</p>

                            {/* Minimalist session selection buttons */}
                            <div className="session-nav-container">
                                {currentBlock.sessions.map((_, sIdx) => (
                                    <button
                                        key={sIdx}
                                        className={`session-nav-btn ${activeSessionIdx === sIdx ? 'active' : ''}`}
                                        onClick={() => setActiveSessionIdx(sIdx)}
                                        style={activeSessionIdx === sIdx ? { borderColor: currentBlock.color, color: currentBlock.color } : {}}
                                    >
                                        Sesión {sIdx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <i className={`${currentBlock.icon} block-decor-icon`} style={{ color: currentBlock.color }}></i>
                    </section>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${activeBlock}-${activeSessionIdx}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="session-card"
                        >
                            <div className="session-card-header">
                                <h3>{currentSession.title}</h3>
                                <div className="session-meta">
                                    <div className="meta-pill">
                                        <i className="fa-regular fa-clock"></i> {currentSession.duration}
                                    </div>
                                </div>
                            </div>

                            <div className="session-body">
                                <div className="resource-section">
                                    <span className="section-title-label">Recurso Didáctico</span>
                                    <div className="resource-card">
                                        <h4><i className={currentSession.resource.icon}></i> {currentSession.resource.title}</h4>
                                        <p>{currentSession.resource.text}</p>
                                    </div>
                                </div>

                                <div className="activity-individual">
                                    <span className="section-title-label">Actividad Individual</span>
                                    <div className="activity-item">
                                        <h4><i className={currentSession.individual.icon} style={{ color: currentBlock.color, marginRight: '10px' }}></i> {currentSession.individual.title}</h4>
                                        <p>{currentSession.individual.text}</p>

                                        <button
                                            className="eval-trigger"
                                            onClick={() => toggleRubric(`${activeBlock}-${activeSessionIdx}-ind`)}
                                        >
                                            <i className="fa-solid fa-clipboard-check"></i>
                                            {expandedRubrics[`${activeBlock}-${activeSessionIdx}-ind`] ? 'Ocultar rúbrica' : 'Ver rúbrica'}
                                        </button>

                                        <AnimatePresence>
                                            {expandedRubrics[`${activeBlock}-${activeSessionIdx}-ind`] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="rubric-wrapper"
                                                >
                                                    <div className="rubric-header">
                                                        <span>Criterio</span>
                                                        <span>Excelente</span>
                                                        <span>Mejorable</span>
                                                    </div>
                                                    {currentSession.individual.rubric?.map((r, rIdx) => (
                                                        <div key={rIdx} className="rubric-row">
                                                            <span className="rubric-cell"><b>{r.criterion}</b></span>
                                                            <span className="rubric-cell cel-excellent">{r.excellent}</span>
                                                            <span className="rubric-cell cel-improvable">{r.improvable}</span>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="activity-group">
                                    <span className="section-title-label">Actividad Grupal</span>
                                    <div className="activity-item">
                                        <h4><i className={currentSession.group.icon} style={{ color: currentBlock.color, marginRight: '10px' }}></i> {currentSession.group.title}</h4>
                                        <p>{currentSession.group.text}</p>

                                        <button
                                            className="eval-trigger"
                                            onClick={() => toggleRubric(`${activeBlock}-${activeSessionIdx}-grp`)}
                                        >
                                            <i className="fa-solid fa-users-gear"></i>
                                            {expandedRubrics[`${activeBlock}-${activeSessionIdx}-grp`] ? 'Ocultar rúbrica' : 'Ver rúbrica'}
                                        </button>

                                        <AnimatePresence>
                                            {expandedRubrics[`${activeBlock}-${activeSessionIdx}-grp`] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="rubric-wrapper"
                                                >
                                                    <div className="rubric-header">
                                                        <span>Criterio</span>
                                                        <span>Excelente</span>
                                                        <span>Mejorable</span>
                                                    </div>
                                                    {currentSession.group.rubric?.map((r, rIdx) => (
                                                        <div key={rIdx} className="rubric-row">
                                                            <span className="rubric-cell"><b>{r.criterion}</b></span>
                                                            <span className="rubric-cell cel-excellent">{r.excellent}</span>
                                                            <span className="rubric-cell cel-improvable">{r.improvable}</span>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.main>
            </AnimatePresence>
        </div>
    );
};

export default BancoRecursosTutoria;
