import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BancoRecursosTutoria.css';

const BancoRecursosTutoria = () => {
    const [activeBlock, setActiveBlock] = useState('block1');
    const [expandedRubrics, setExpandedRubrics] = useState({});

    const toggleRubric = (id) => {
        setExpandedRubrics(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const blocks = [
        {
            id: 'block1',
            title: 'Bloque 1: Organización y Hábitos de Estudio',
            desc: 'Estrategias para la gestión eficaz del tiempo y optimización del aprendizaje.',
            color: '#4F46E5',
            icon: 'fa-regular fa-clock',
            sessions: [
                {
                    title: 'Sesión 1: Dominando el Tiempo',
                    duration: '50 min',
                    resource: {
                        title: 'La Matriz de Eisenhower',
                        icon: 'fa-solid fa-layer-group',
                        text: 'Herramienta visual que ayuda a distinguir entre lo "Urgente" y lo "Importante". Se presenta un gráfico de 4 cuadrantes (Hacer, Planificar, Delegar, Eliminar) para priorizar tareas académicas y personales.'
                    },
                    individual: {
                        title: 'Auditoría de mi Tiempo',
                        icon: 'fa-solid fa-user',
                        text: 'El alumnado rellenará una plantilla vacía de la Matriz de Eisenhower con las tareas que tienen para la próxima semana. Deberán clasificar conscientemente cada tarea en uno de los 4 cuadrantes.',
                        rubric: [
                            { criterion: 'Identificación', excellent: 'Distingue claramente entre urgente e importante.', improvable: 'Confunde urgencia con importancia.' },
                            { criterion: 'Completitud', excellent: 'Rellena los 4 cuadrantes con ejemplos reales.', improvable: 'Deja cuadrantes vacíos o usa ejemplos vagos.' }
                        ]
                    },
                    group: {
                        title: 'Cazadores de "Ladrones de Tiempo"',
                        icon: 'fa-solid fa-users',
                        text: 'En grupos de 4, deben identificar los 5 mayores "ladrones" de tiempo (ej. redes sociales, interrupciones, desorganización) y proponer una "Solución Antídoto" realista para cada uno. Presentan sus conclusiones al resto.',
                        rubric: [
                            { criterion: 'Análisis', excellent: 'Identifica distractores reales y específicos.', improvable: 'Identifica distractores genéricos.' },
                            { criterion: 'Soluciones', excellent: 'Propone estrategias prácticas y aplicables.', improvable: 'Propone soluciones poco realistas ("no usar el móvil nunca").' }
                        ]
                    }
                },
                {
                    title: 'Sesión 2: Aprender a Aprender',
                    duration: '50 min',
                    resource: {
                        title: 'Método Pomodoro + Active Recall',
                        icon: 'fa-solid fa-brain',
                        text: 'Presentación breve sobre dos pilares de la neuroeducación: estudiar en bloques de tiempo (25/5 min) y la recuperación activa (cuestionarse a uno mismo) frente a la relectura pasiva.'
                    },
                    individual: {
                        title: 'Diseño de Sesión de Estudio',
                        icon: 'fa-solid fa-user',
                        text: 'Diseñar una tarde de estudio real (ej. de 16:00 a 20:00) aplicando bloques Pomodoro. Deben especificar qué harán en cada descanso y qué técnica activa usarán para cada asignatura.',
                        rubric: [
                            { criterion: 'Planificación', excellent: 'Estructura realista con descansos adecuados.', improvable: 'Sesiones demasiado largas sin descansos.' },
                            { criterion: 'Técnica', excellent: 'Aplica técnicas activas específicas.', improvable: 'Solo pone "estudiar" sin especificar cómo.' }
                        ]
                    },
                    group: {
                        title: 'Role-Play: El Coach de Estudio',
                        icon: 'fa-solid fa-users',
                        text: 'En parejas, uno actúa como alumno agobiado ante un examen y el otro como "Coach" que debe aconsejarle cómo organizarse la tarde anterior usando lo aprendido. Luego intercambian roles.',
                        rubric: [
                            { criterion: 'Asesoramiento', excellent: 'Aplica los conceptos teóricos para ayudar.', improvable: 'Da consejos genéricos sin base técnica.' },
                            { criterion: 'Empatía', excellent: 'Escucha activa y comunicación asertiva.', improvable: 'Interrupciones o imposición de ideas.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 3: Gestión del Estrés',
                    duration: '50 min',
                    resource: {
                        title: 'Técnicas de Relajación Rápida',
                        icon: 'fa-solid fa-wind',
                        text: 'Explicación práctica de la respiración 4-7-8 y la visualización guiada para reducir la ansiedad antes de exámenes.'
                    },
                    individual: {
                        title: 'Plan de Crisis',
                        icon: 'fa-solid fa-user',
                        text: 'Escribir un plan paso a paso de qué hacer cuando se sienten bloqueados estudiando (ej. "Parar 5 min", "Beber agua", "Respirar").',
                        rubric: [
                            { criterion: 'Autonomía', excellent: 'Estrategias personalizadas y útiles.', improvable: 'Copia ejemplos sin adaptarlos.' }
                        ]
                    },
                    group: {
                        title: 'Simulacro de Examen',
                        icon: 'fa-solid fa-users',
                        text: 'Se simula un examen sorpresa de 5 min (preguntas absurdas/difíciles). Al acabar, en grupo comparten qué sintieron y cómo lo gestionaron.',
                        rubric: [
                            { criterion: 'Reflexión', excellent: 'Comparte emociones honestamente.', improvable: 'Se toma la actividad a broma.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block2',
            title: 'Bloque 2: Cohesión Grupal',
            desc: 'Dinámicas para fomentar el conocimiento mutuo y el sentido de pertenencia.',
            color: '#7C3AED',
            icon: 'fa-solid fa-users',
            sessions: [
                {
                    title: 'Sesión 1: Rompiendo el Hielo',
                    duration: '50 min',
                    resource: {
                        title: 'Dinámica: La Telaraña',
                        icon: 'fa-solid fa-diagram-project',
                        text: 'Ovillo de lana que se lanza de uno a otro. Quien lo recibe debe presentarse y lanzar el ovillo a otro compañero, reteniendo el hilo, formando así una red visual que une a todo el grupo.'
                    },
                    individual: {
                        title: 'Mi Tarjeta de Presentación "Oculta"',
                        icon: 'fa-solid fa-user',
                        text: 'En una tarjeta, escribir 3 datos que nadie en la clase sepa (un hobby raro, un viaje, una habilidad). No poner nombre, solo un dibujo/símbolo identificativo.',
                        rubric: [
                            { criterion: 'Profundidad', excellent: 'Comparte información significativa/original.', improvable: 'Datos superficiales o comunes.' }
                        ]
                    },
                    group: {
                        title: '¿Quién es quién?',
                        icon: 'fa-solid fa-users',
                        text: 'Se recogen todas las tarjetas y se reparten aleatoriamente. El grupo debe moverse por el aula entrevistándose para encontrar al dueño de la tarjeta que les ha tocado.',
                        rubric: [
                            { criterion: 'Interacción', excellent: 'Habla con múltiples compañeros activamente.', improvable: 'Se queda quieto o solo habla con amigos.' },
                            { criterion: 'Escucha', excellent: 'Muestra interés real por descubrir al compañero.', improvable: 'Actitud pasiva.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 2: Construyendo Equipo',
                    duration: '50 min',
                    resource: {
                        title: 'Roles de Equipo (Belbin simplificado)',
                        icon: 'fa-solid fa-puzzle-piece',
                        text: 'Explicación breve de que en un equipo todos son necesarios: el cerebro (ideas), el coordinador (organiza), el impulsor (acción) y el cohesionador (emociones).'
                    },
                    individual: {
                        title: 'Autodiagnóstico de Rol',
                        icon: 'fa-solid fa-user',
                        text: 'Cuestionario breve donde el alumno identifica con qué rol se siente más cómodo trabajando en grupo y por qué.',
                        rubric: [
                            { criterion: 'Autoconocimiento', excellent: 'Argumenta su rol basándose en experiencias pasadas.', improvable: 'Elección aleatoria sin justificación personal.' }
                        ]
                    },
                    group: {
                        title: 'El Desafío Marshmallow',
                        icon: 'fa-solid fa-users',
                        text: 'Grupos de 4. Deben construir la torre más alta posible usando espaguetis, cinta adhesiva, cuerda y una nube (marshmallow) en la cima. Deben aplicar los roles asignados previamente.',
                        rubric: [
                            { criterion: 'Colaboración', excellent: 'Todos participan y respetan los roles.', improvable: 'Un líder domina o hay pasividad.' },
                            { criterion: 'Resolución', excellent: 'Estrategia creativa y adaptación a fallos.', improvable: 'Frustración ante el colapso de la torre.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 3: Resolución de Conflictos',
                    duration: '50 min',
                    resource: {
                        title: 'Los 3 Filtros de Sócrates',
                        icon: 'fa-solid fa-filter',
                        text: 'Historia breve sobre los filtros de Verdad, Bondad y Utilidad antes de comunicar un chisme o conflicto sobre alguien.'
                    },
                    individual: {
                        title: 'Análisis de Conflicto',
                        icon: 'fa-solid fa-user',
                        text: 'Recordar un conflicto reciente con un amigo/compañero. Analizar si lo que se dijo pasó los 3 filtros.',
                        rubric: [
                            { criterion: 'Autocrítica', excellent: 'Admite errores propios en la comunicación.', improvable: 'Culpa totalmente al otro.' }
                        ]
                    },
                    group: {
                        title: 'Teatro Imagen',
                        icon: 'fa-solid fa-users',
                        text: 'Grupos representan una situación conflictiva en "foto fija" (estatuas). El resto de la clase modifica la postura de los actores para resolver el conflicto.',
                        rubric: [
                            { criterion: 'Creatividad', excellent: 'Propone soluciones no verbales claras.', improvable: 'No participa o confunde.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block3',
            title: 'Bloque 3: Convivencia y Debate',
            desc: 'Mejora del clima del aula mediante el diálogo y el consenso.',
            color: '#F59E0B',
            icon: 'fa-regular fa-comments',
            sessions: [
                {
                    title: 'Sesión 1: Asamblea de Clase',
                    duration: '50 min',
                    resource: {
                        title: 'Estructura de Asamblea Democrática',
                        icon: 'fa-solid fa-gavel',
                        text: 'Guía de pasos para una asamblea: 1. Orden del día, 2. Turnos de palabra (objeto de la palabra), 3. Propuestas y 4. Votación.'
                    },
                    individual: {
                        title: 'Propuestas de Mejora',
                        icon: 'fa-solid fa-user',
                        text: 'Cada alumno escribe 2 propuestas concretas para mejorar la convivencia en el aula (limpieza, ruido, respeto, compañerismo) y las argumenta.',
                        rubric: [
                            { criterion: 'Constructividad', excellent: 'Propuestas positivas y factibles.', improvable: 'Solo quejas sin propuesta de solución.' }
                        ]
                    },
                    group: {
                        title: 'Plenario y Votación',
                        icon: 'fa-solid fa-users',
                        text: 'Se exponen las propuestas en pizarra. Se agrupan por temáticas y se debaten los pros/contras. Finalmente se votan las 3 normas "Doradas" de la clase.',
                        rubric: [
                            { criterion: 'Respeto', excellent: 'Respeta turno de palabra y opiniones ajenas.', improvable: 'Interrupciones o ridiculiza propuestas.' },
                            { criterion: 'Participación', excellent: 'Aporta argumentos al debate.', improvable: 'Se mantiene al margen.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 2: El Arte del Debate',
                    duration: '50 min',
                    resource: {
                        title: 'Falacias Lógicas y Argumentación',
                        icon: 'fa-solid fa-scale-balanced',
                        text: 'Ficha resumen con las falacias más comunes (Ad Hominem, Hombre de Paja, Falsa Causalidad). Explicación de la estructura: Afirmación + Razonamiento + Evidencia.'
                    },
                    individual: {
                        title: 'Detective de Falacias',
                        icon: 'fa-solid fa-user',
                        text: 'Se presentan 5 frases o tweets polémicos simulados. El alumno debe identificar qué tipo de falacia se está cometiendo en cada uno.',
                        rubric: [
                            { criterion: 'Identificación', excellent: 'Identifica correctamente la falacia.', improvable: 'No reconoce el error lógico.' }
                        ]
                    },
                    group: {
                        title: 'Mini-Debate 3x3',
                        icon: 'fa-solid fa-users',
                        text: 'Grupos de 3 a favor vs 3 en contra sobre un tema aleatorio (ej. "Uso de móviles en el aula"). 5 min preparación, 3 min exposición, 3 min refutación.',
                        rubric: [
                            { criterion: 'Argumentación', excellent: 'Usa estructura ARE (Afirmación, Razonamiento, Evidencia).', improvable: 'Argumentos basados solo en opinión personal.' },
                            { criterion: 'Réplica', excellent: 'Contesta a los argumentos del contrario.', improvable: 'Ignora lo dicho por el otro equipo.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 3: Mediación Escolar',
                    duration: '50 min',
                    resource: {
                        title: 'Fases de la Mediación',
                        icon: 'fa-solid fa-handshake',
                        text: 'Explicación de las fases: 1. Cuéntame, 2. Aclaremos (buscar el problema real), 3. Solucionemos (acuerdo ganar-ganar).'
                    },
                    individual: {
                        title: 'Estilo de Afrontamiento',
                        icon: 'fa-solid fa-user',
                        text: 'Test breve: ¿Eres Tortuga (te escondes), Tiburón (atacas), Osito (cedes) o Búho (colaboras) ante un conflicto?',
                        rubric: [
                            { criterion: 'Identificación', excellent: 'Identifica su estilo predominante real.', improvable: 'Responde lo socialmente deseable.' }
                        ]
                    },
                    group: {
                        title: 'Role-Play de Mediadores',
                        icon: 'fa-solid fa-users',
                        text: 'Trios: Parte A, Parte B y Mediador. Simulan un conflicto por un rumor. El mediador debe guiar las fases sin juzgar.',
                        rubric: [
                            { criterion: 'Imparcialidad', excellent: 'El mediador no toma partido.', improvable: 'El mediador da la razón a uno.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block4',
            title: 'Bloque 4: Igualdad y Coeducación',
            desc: 'Análisis crítico de estereotipos, publicidad y fomento de la igualdad real.',
            color: '#DB2777',
            icon: 'fa-solid fa-scale-unbalanced-flip',
            sessions: [
                {
                    title: 'Sesión 1: Análisis Crítico de la Publicidad',
                    duration: '50 min',
                    resource: {
                        title: 'El Test de Bechdel y Publicidad',
                        icon: 'fa-solid fa-tv',
                        text: 'Explicación del Test de Bechdel para cine aplicado a la publicidad. Conceptos de cosificación vs empoderamiento.'
                    },
                    individual: {
                        title: 'Cazadores de Estereotipos',
                        icon: 'fa-solid fa-user',
                        text: 'Analizar un anuncio reciente identificando: roles de género, quién tiene la voz de autoridad y qué valores transmite.',
                        rubric: [
                            { criterion: 'Análisis', excellent: 'Identifica estereotipos sutiles.', improvable: 'Análisis superficial ("es rosa porque es de chicas").' }
                        ]
                    },
                    group: {
                        title: 'Dale la Vuelta: "Ad-Busting"',
                        icon: 'fa-solid fa-users',
                        text: 'En grupos, reescribir un anuncio sexista conocido para hacerlo inclusivo y respetuoso, manteniendo el producto pero cambiando el mensaje.',
                        rubric: [
                            { criterion: 'Creatividad', excellent: 'Propuesta original e impactante.', improvable: 'Cambios mínimos o poco claros.' },
                            { criterion: 'Mensaje', excellent: 'Transmite valores de igualdad claros.', improvable: 'Mantiene sesgos inconscientes.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 2: Profesiones y Género',
                    duration: '50 min',
                    resource: {
                        title: 'Techos de Cristal y Suelos Pegajosos',
                        icon: 'fa-solid fa-briefcase',
                        text: 'Gráficas sobre la brecha salarial y la segregación horizontal. Concepto de "Nuevas Masculinidades".'
                    },
                    individual: {
                        title: 'Reflexión: ¿Quién te imaginas?',
                        icon: 'fa-solid fa-user',
                        text: 'Se leen profesiones y el alumno anota qué género imaginó primero. Reflexión sobre sesgos inconscientes.',
                        rubric: [
                            { criterion: 'Autocrítica', excellent: 'Reconoce sus propios sesgos honestamente.', improvable: 'Niega tener sesgos.' }
                        ]
                    },
                    group: {
                        title: 'Debate: ¿Tienen género las profesiones?',
                        icon: 'fa-solid fa-users',
                        text: 'Debate sobre medidas de discriminación positiva y cuotas. ¿Son necesarias para romper el techo de cristal o son injustas?',
                        rubric: [
                            { criterion: 'Argumentación', excellent: 'Usa datos y ejemplos concretos.', improvable: 'Se basa en opiniones viscerales.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 3: Violencia Digital',
                    duration: '50 min',
                    resource: {
                        title: 'Sexting y Ciberacoso',
                        icon: 'fa-solid fa-user-shield',
                        text: 'Definiciones claras de delitos digitales. Protocolo de actuación: No responder, Guardar pruebas, Bloquear, Denunciar.'
                    },
                    individual: {
                        title: 'Chequeo de Privacidad',
                        icon: 'fa-solid fa-user',
                        text: 'Revisión guiada de la configuración de privacidad de sus redes sociales principales.',
                        rubric: [
                            { criterion: 'Seguridad', excellent: 'Realiza cambios efectivos para protegerse.', improvable: 'No le da importancia a la privacidad.' }
                        ]
                    },
                    group: {
                        title: 'Campaña "No seas Cómplice"',
                        icon: 'fa-solid fa-users',
                        text: 'Debate sobre el papel del espectador. Diseñar un meme o sticker que corte la cadena cuando alguien pasa contenido íntimo de otro.',
                        rubric: [
                            { criterion: 'Mensaje', excellent: 'Mensaje claro de rechazo al acoso.', improvable: 'Mensaje confuso o gracioso.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block5',
            title: 'Bloque 5: Hábitos Saludables',
            desc: 'Desarrollo físico y gestión del bienestar digital y nutricional.',
            color: '#059669',
            icon: 'fa-solid fa-heart-pulse',
            sessions: [
                {
                    title: 'Sesión 1: Desconexión Digital',
                    duration: '50 min',
                    resource: {
                        title: 'Dopamina y Luz Azul',
                        icon: 'fa-solid fa-mobile-screen',
                        text: 'Infografía sobre cómo las redes sociales explotan el sistema de recompensas y cómo la luz azul afecta al sueño.'
                    },
                    individual: {
                        title: 'Calculadora de Pantallas',
                        icon: 'fa-solid fa-user',
                        text: 'Consulta de estadísticas de "Tiempo de Uso". Reflexión: ¿A qué renuncias por estar conectado?',
                        rubric: [
                            { criterion: 'Consciencia', excellent: 'Reflexión profunda sobre el impacto en su vida.', improvable: 'Indiferencia ante los datos.' }
                        ]
                    },
                    group: {
                        title: 'Plan de Reto "Detox"',
                        icon: 'fa-solid fa-users',
                        text: 'Diseñar un "Contrato de Uso Saludable" con normas realistas (ej. no móvil en la mesa). Se comprometen a cumplir una regla durante 24h.',
                        rubric: [
                            { criterion: 'Realismo', excellent: 'Propuestas asumibles y sostenibles.', improvable: 'Propuestas extremas o ridículas.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 2: Consumo Responsable',
                    duration: '50 min',
                    resource: {
                        title: 'Mitos Alimentarios y Sustancias',
                        icon: 'fa-solid fa-apple-whole',
                        text: 'Vídeo desmintiendo mitos sobre dietas milagro y explicando efectos del alcohol/vapeo en el cerebro adolescente.'
                    },
                    individual: {
                        title: 'Mi Semáforo de Hábitos',
                        icon: 'fa-solid fa-user',
                        text: 'Dibujar un semáforo con hábitos en Rojo (eliminar), Amarillo (reducir) y Verde (mantener).',
                        rubric: [
                            { criterion: 'Sinceridad', excellent: 'Identifica hábitos negativos reales.', improvable: 'Dice hacerlo todo perfecto.' }
                        ]
                    },
                    group: {
                        title: 'Campaña de Guerrilla',
                        icon: 'fa-solid fa-users',
                        text: 'Crear un eslogan y un boceto de cartel impactante para los pasillos promoviendo un hábito saludable.',
                        rubric: [
                            { criterion: 'Impacto', excellent: 'Mensaje claro y atractivo para jóvenes.', improvable: 'Mensaje aburrido.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 3: Salud Mental y Estigma',
                    duration: '50 min',
                    resource: {
                        title: 'Rompiendo Mitos',
                        icon: 'fa-solid fa-brain',
                        text: 'Video de testimonios de personas jóvenes que van a terapia. Desmontar la idea de que "ir al psicólogo es de locos".'
                    },
                    individual: {
                        title: 'Carta de Autocompasión',
                        icon: 'fa-solid fa-user',
                        text: 'Escribirse una carta a uno mismo como si le escribiera a su mejor amigo que está pasando por un mal momento.',
                        rubric: [
                            { criterion: 'Tono', excellent: 'Usa un lenguaje amable y comprensivo.', improvable: 'Se critica duramente.' }
                        ]
                    },
                    group: {
                        title: 'Mural "Está Bien No Estar Bien"',
                        icon: 'fa-solid fa-users',
                        text: 'Crear un mural colaborativo con frases que normalicen la tristeza o el pedir ayuda.',
                        rubric: [
                            { criterion: 'Colaboración', excellent: 'Aporta ideas positivas al mural.', improvable: 'No participa.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block6',
            title: 'Bloque 6: Bienestar Emocional',
            desc: 'Inteligencia emocional y gestión del estrés y la ansiedad.',
            color: '#0891B2',
            icon: 'fa-solid fa-face-smile-beam',
            sessions: [
                {
                    title: 'Sesión 1: Poniendo Nombre a lo que Siento',
                    duration: '50 min',
                    resource: {
                        title: 'La Rueda de las Emociones',
                        icon: 'fa-solid fa-heart-circle-check',
                        text: 'Presentación de la Rueda de Plutchik. Diferencia entre emociones básicas y complejas. Importancia de etiquetar.'
                    },
                    individual: {
                        title: 'Bitácora Emocional',
                        icon: 'fa-solid fa-user',
                        text: 'Escribir sobre una situación intensa identificando la emoción exacta y dónde se sintió en el cuerpo.',
                        rubric: [
                            { criterion: 'Precisión', excellent: 'Usa vocabulario emocional variado.', improvable: 'Vocabulario limitado ("bien/mal").' }
                        ]
                    },
                    group: {
                        title: 'Charadas Emocionales',
                        icon: 'fa-solid fa-users',
                        text: 'Mímica de emociones complejas. Reflexión sobre la importancia del lenguaje no verbal.',
                        rubric: [
                            { criterion: 'Expresividad', excellent: 'Comunica con el cuerpo eficazmente.', improvable: 'Timidez excesiva.' },
                            { criterion: 'Empatía', excellent: 'El grupo decodifica señales sutiles.', improvable: 'No prestan atención.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 2: Caja de Herramientas Anti-Estrés',
                    duration: '50 min',
                    resource: {
                        title: 'Respiración y Grounding',
                        icon: 'fa-solid fa-wind',
                        text: 'Técnicas rápidas: Respiración cuadrada (4-4-4-4) y Técnica 5-4-3-2-1 para anclarse al presente.'
                    },
                    individual: {
                        title: 'Mi Kit de Emergencia',
                        icon: 'fa-solid fa-user',
                        text: 'Crear una lista personalizada de 5 cosas que funcionan para calmarse.',
                        rubric: [
                            { criterion: 'Autonomía', excellent: 'Estrategias propias y saludables.', improvable: 'Estrategias dependientes o nocivas.' }
                        ]
                    },
                    group: {
                        title: 'Role-Play: Escucha Activa',
                        icon: 'fa-solid fa-users',
                        text: 'Parejas. A cuenta un problema. B debe escuchar SIN dar consejos, solo validando emociones.',
                        rubric: [
                            { criterion: 'Escucha', excellent: 'No interrumpe, valida emociones.', improvable: 'Interruponde o juzga.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 3: Resiliencia y Superación',
                    duration: '50 min',
                    resource: {
                        title: 'El Arte del Kintsugi',
                        icon: 'fa-solid fa-hammer',
                        text: 'Metáfora japonesa de reparar la cerámica con oro. Resiliencia es ser más fuerte tras la rotura.'
                    },
                    individual: {
                        title: 'Línea de la Vida',
                        icon: 'fa-solid fa-user',
                        text: 'Dibujar gráfica con picos y valles. Identificar qué aprendieron de un valle pasado.',
                        rubric: [
                            { criterion: 'Reflexión', excellent: 'Extrae aprendizajes de las dificultades.', improvable: 'Solo relata hechos.' }
                        ]
                    },
                    group: {
                        title: 'Historias de Superación',
                        icon: 'fa-solid fa-users',
                        text: 'Investigar y compartir la historia de alguien famoso que fracasó antes de triunfar.',
                        rubric: [
                            { criterion: 'Investigación', excellent: 'Aporta datos sobre el fracaso previo.', improvable: 'Solo cuenta el éxito.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block7',
            title: 'Bloque 7: Educ. Afectivo-Sexual',
            desc: 'Relaciones sanas, consentimiento y salud sexual.',
            color: '#E11D48',
            icon: 'fa-solid fa-venus-mars',
            sessions: [
                {
                    title: 'Sesión 1: Mitos del Amor Romántico',
                    duration: '50 min',
                    resource: {
                        title: 'La "Media Naranja" y los Celos',
                        icon: 'fa-solid fa-heart-crack',
                        text: 'Análisis de mitos tóxicos: "los celos son amor". Diferencia entre control y cuidado.'
                    },
                    individual: {
                        title: 'Green Flags vs Red Flags',
                        icon: 'fa-solid fa-user',
                        text: 'Lista personal de 3 comportamientos inaceptables y 3 deseables en pareja.',
                        rubric: [
                            { criterion: 'Límites', excellent: 'Establece límites claros y saludables.', improvable: 'Límites difusos.' }
                        ]
                    },
                    group: {
                        title: 'DJ Letrista',
                        icon: 'fa-solid fa-users',
                        text: 'Analizar letras de canciones populares detectando frases tóxicas y reescribiéndolas.',
                        rubric: [
                            { criterion: 'Análisis Crítico', excellent: 'Identifica machismo/control en cultura pop.', improvable: 'Normaliza conductas tóxicas.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 2: Consentimiento y Salud',
                    duration: '50 min',
                    resource: {
                        title: 'La Metáfora del Té',
                        icon: 'fa-solid fa-hand-holding-heart',
                        text: 'Uso de la analogía "Consent is like tea" para explicar que debe ser libre, reversible, informado y entusiasta.'
                    },
                    individual: {
                        title: 'Buzón de Dudas Anónimas',
                        icon: 'fa-solid fa-user',
                        text: 'Escribir una duda sobre sexualidad o ITS que nunca se atrevieron a preguntar.',
                        rubric: [
                            { criterion: 'Participación', excellent: 'Formula preguntas serias.', improvable: 'No participa o hace bromas.' }
                        ]
                    },
                    group: {
                        title: 'Trivial de Salud Sexual',
                        icon: 'fa-solid fa-users',
                        text: 'Concurso sobre métodos anticonceptivos e ITS. Desmontar mitos peligrosos.',
                        rubric: [
                            { criterion: 'Conocimiento', excellent: 'Demuestra nociones básicas correctas.', improvable: 'Cree en mitos.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 3: Diversidad LGTBIQ+',
                    duration: '50 min',
                    resource: {
                        title: 'La Galleta de Jengibre',
                        icon: 'fa-solid fa-rainbow',
                        text: 'Explicación visual de Identidad, Expresión, Sexo biológico y Orientación sexual.'
                    },
                    individual: {
                        title: 'Glosario Diverso',
                        icon: 'fa-solid fa-user',
                        text: 'Definir Cisgénero, Transgénero, No Binario, Asexual, Intersexual.',
                        rubric: [
                            { criterion: 'Comprensión', excellent: 'Distingue conceptos correctamente.', improvable: 'Confunde identidad con orientación.' }
                        ]
                    },
                    group: {
                        title: 'Debate: Espacios Seguros',
                        icon: 'fa-solid fa-users',
                        text: 'Analizar si el centro es un espacio seguro para la diversidad y proponer mejoras.',
                        rubric: [
                            { criterion: 'Empatía', excellent: 'Propone mejoras para la inclusión.', improvable: 'Niega la discriminación.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block8',
            title: 'Bloque 8: Autoconocimiento',
            desc: 'Descubrir quién soy, mis fortalezas y cómo me ven los demás.',
            color: '#7C3AED',
            icon: 'fa-solid fa-id-card',
            sessions: [
                {
                    title: 'Sesión 1: La Ventana de Johari',
                    duration: '50 min',
                    resource: {
                        title: 'Los 4 Cuadrantes',
                        icon: 'fa-solid fa-table-cells-large',
                        text: 'Explicación del modelo de Johari: Área Libre, Área Ciega, Área Oculta y Área Desconocida.'
                    },
                    individual: {
                        title: 'Mi Área Oculta',
                        icon: 'fa-solid fa-user',
                        text: 'Reflexionar sobre 3 cualidades que suelen mantener ocultas y por qué.',
                        rubric: [
                            { criterion: 'Profundidad', excellent: 'Introspección genuina.', improvable: 'Superficialidad.' }
                        ]
                    },
                    group: {
                        title: 'Iluminando el Área Ciega',
                        icon: 'fa-solid fa-users',
                        text: 'Escribir cualidades positivas en un papel en la espalda de los compañeros.',
                        rubric: [
                            { criterion: 'Compañerismo', excellent: 'Escribe cualidades amables.', improvable: 'Escribe bromas.' },
                            { criterion: 'Recepción', excellent: 'Acepta los cumplidos positivamente.', improvable: 'Rechaza lo bueno.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 2: Análisis DAFO Personal',
                    duration: '50 min',
                    resource: {
                        title: 'Estrategia Personal',
                        icon: 'fa-solid fa-chess-board',
                        text: 'Interno: Debilidades y Fortalezas. Externo: Amenazas y Oportunidades.'
                    },
                    individual: {
                        title: 'Mi Matriz DAFO',
                        icon: 'fa-solid fa-user',
                        text: 'Elaborar un DAFO académico/personal identificando factores clave.',
                        rubric: [
                            { criterion: 'Análisis', excellent: 'Identifica factores internos y externos.', improvable: 'Confunde factores.' }
                        ]
                    },
                    group: {
                        title: 'Estrategias Cruzadas',
                        icon: 'fa-solid fa-users',
                        text: 'En parejas, ayudarse a convertir una Debilidad en Fortaleza o aprovechar una Oportunidad.',
                        rubric: [
                            { criterion: 'Resolución', excellent: 'Aporta ideas útiles al compañero.', improvable: 'No sabe aconsejar.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block9',
            title: 'Bloque 9: Orientación Vocacional',
            desc: 'Estructura del sistema educativo, itinerarios y opciones académicas.',
            color: '#2563EB',
            icon: 'fa-solid fa-map-location-dot',
            sessions: [
                {
                    title: 'Sesión 1: El Mapa del Sistema Educativo',
                    duration: '50 min',
                    resource: {
                        title: 'Caminos Cruzados',
                        icon: 'fa-solid fa-road',
                        text: 'Esquema visual de la LOMLOE: Bachillerato, FP, Universidad, Enseñanzas Artísticas.'
                    },
                    individual: {
                        title: 'Trazando mi Ruta',
                        icon: 'fa-solid fa-user',
                        text: 'Dibujar esquema de los próximos 4 años con Opción A (ideal) y B (alternativa).',
                        rubric: [
                            { criterion: 'Previsión', excellent: 'Contempla plazos y requisitos reales.', improvable: 'Planificación irreal.' }
                        ]
                    },
                    group: {
                        title: 'Gymkhana de la Información',
                        icon: 'fa-solid fa-users',
                        text: 'Competición por equipos buscando datos en webs oficiales (notas de corte, asignaturas FP).',
                        rubric: [
                            { criterion: 'Búsqueda', excellent: 'Localiza fuentes fiables rápidamente.', improvable: 'Usa fuentes no oficiales.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 2: Ponderaciones y Estrategia',
                    duration: '50 min',
                    resource: {
                        title: 'La Selectividad (PAU)',
                        icon: 'fa-solid fa-calculator',
                        text: 'Explicación del cálculo de nota y tablas de ponderación (0.1 vs 0.2).'
                    },
                    individual: {
                        title: 'Simulador de Notas',
                        icon: 'fa-solid fa-user',
                        text: 'Calcular nota posible y decidir asignaturas específicas según ponderación.',
                        rubric: [
                            { criterion: 'Estrategia', excellent: 'Elige materias que maximizan nota.', improvable: 'Elige materias que ponderan poco.' }
                        ]
                    },
                    group: {
                        title: 'Consultorio de Dudas',
                        icon: 'fa-solid fa-users',
                        text: 'Resolución colectiva de dudas administrativas y casos particulares.',
                        rubric: [
                            { criterion: 'Colaboración', excellent: 'Resuelve dudas de compañeros.', improvable: 'Confunde más al grupo.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 3: Becas y Movilidad',
                    duration: '50 min',
                    resource: {
                        title: 'El Mundo es Tuyo',
                        icon: 'fa-solid fa-plane-departure',
                        text: 'Opciones de movilidad: Erasmus+, Cuerpo Europeo de Solidaridad, Interrail y becas MEC.'
                    },
                    individual: {
                        title: 'Caza de Becas',
                        icon: 'fa-solid fa-user',
                        text: 'Buscar una beca real viable y anotar plazos y documentación.',
                        rubric: [
                            { criterion: 'Investigación', excellent: 'Datos precisos y beca viable.', improvable: 'Datos incorrectos.' }
                        ]
                    },
                    group: {
                        title: 'Mesa Redonda: Miedos al Salir',
                        icon: 'fa-solid fa-users',
                        text: 'Debate sobre miedos a salir de casa para estudiar. ¿Qué es lo peor que puede pasar?',
                        rubric: [
                            { criterion: 'Participación', excellent: 'Expresa miedos y valida los ajenos.', improvable: 'No participa.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block10',
            title: 'Bloque 10: Proyecto Personal (Ikigai)',
            desc: 'Entrenamiento en la toma de decisiones vocacionales y vitales.',
            color: '#D97706',
            icon: 'fa-regular fa-compass',
            sessions: [
                {
                    title: 'Sesión 1: En busca del Ikigai',
                    duration: '50 min',
                    resource: {
                        title: 'El Concepto Ikigai',
                        icon: 'fa-solid fa-sun',
                        text: 'Filosofía japonesa: Lo que amas, en lo que eres bueno, lo que el mundo necesita y por lo que te pagan.'
                    },
                    individual: {
                        title: 'Rellenando mis Círculos',
                        icon: 'fa-solid fa-user',
                        text: 'Completar el diagrama de Ikigai buscando dónde convergen pasiones con oportunidades reales.',
                        rubric: [
                            { criterion: 'Introspección', excellent: 'Conecta intereses con realidad laboral.', improvable: 'Solo pone sueños imposibles.' }
                        ]
                    },
                    group: {
                        title: 'Speed Dating Vocacional',
                        icon: 'fa-solid fa-users',
                        text: 'Rotaciones de 2 min. Cuentan su Ikigai y reciben feedback o sugerencias de profesiones.',
                        rubric: [
                            { criterion: 'Comunicación', excellent: 'Expresa vocación con claridad.', improvable: 'No sabe qué decir.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 2: Decidir con Cabeza',
                    duration: '50 min',
                    resource: {
                        title: 'Matriz de Decisión Ponderada',
                        icon: 'fa-solid fa-scale-balanced',
                        text: 'Método racional: Listar opciones y criterios (precio, distancia, gusto), dar peso y puntuar.'
                    },
                    individual: {
                        title: 'Tomando la Decisión',
                        icon: 'fa-solid fa-user',
                        text: 'Aplicar la matriz a una decisión real actual (ej. qué grado elegir). Calcular puntuación.',
                        rubric: [
                            { criterion: 'Racionalidad', excellent: 'Usa criterios lógicos y ponderación real.', improvable: 'Puntuaciones aleatorias.' }
                        ]
                    },
                    group: {
                        title: 'Debate: Instinto vs Razón',
                        icon: 'fa-solid fa-users',
                        text: 'Compartir resultados. ¿Coincide el resultado matemático con lo que les pide el corazón?',
                        rubric: [
                            { criterion: 'Sinceridad', excellent: 'Analiza el conflicto entre razón y emoción.', improvable: 'No profundiza.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 3: Plan de Acción',
                    duration: '50 min',
                    resource: {
                        title: 'Metodología SMART',
                        icon: 'fa-solid fa-bullseye',
                        text: 'Objetivos específicos, medibles, alcanzables, relevantes y con tiempo definido.'
                    },
                    individual: {
                        title: 'Mi Hoja de Ruta SMART',
                        icon: 'fa-solid fa-user',
                        text: 'Escribir 3 objetivos SMART para el próximo curso académico.',
                        rubric: [
                            { criterion: 'Concreción', excellent: 'Objetivos muy específicos y medibles.', improvable: 'Objetivos vagos ("estudiar más").' }
                        ]
                    },
                    group: {
                        title: 'Parejas de Compromiso',
                        icon: 'fa-solid fa-users',
                        text: 'Compartir un objetivo con un "compañero de éxito" que le hará seguimiento el mes próximo.',
                        rubric: [
                            { criterion: 'Compromiso', excellent: 'Establece un plan de revisión mutua.', improvable: 'No se lo toma en serio.' }
                        ]
                    }
                }
            ]
        },
        {
            id: 'block11',
            title: 'Bloque 11: Salidas Profesionales',
            desc: 'Preparación para el mercado laboral y búsqueda activa.',
            color: '#1E293B',
            icon: 'fa-solid fa-briefcase',
            sessions: [
                {
                    title: 'Sesión 1: El CV de Alto Impacto',
                    duration: '50 min',
                    resource: {
                        title: 'Diseño y Soft Skills',
                        icon: 'fa-solid fa-file-invoice',
                        text: 'Cómo destacar habilidades blandas y voluntariado cuando no se tiene experiencia laboral previa.'
                    },
                    individual: {
                        title: 'Borrador de mi CV',
                        icon: 'fa-solid fa-user',
                        text: 'Crear un primer borrador de CV usando plantillas modernas (Canva/Europass).',
                        rubric: [
                            { criterion: 'Presentación', excellent: 'Diseño limpio y sin faltas.', improvable: 'Desordenado o incompleto.' }
                        ]
                    },
                    group: {
                        title: 'Peer Review: Reclutadores',
                        icon: 'fa-solid fa-users',
                        text: 'Intercambiar CVs y dar feedback como si fueran jefes de personal. ¿Te contratarían?',
                        rubric: [
                            { criterion: 'Crítica Constructiva', excellent: 'Feedback útil y específico.', improvable: 'Crítica destructiva o vaga.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 2: La Entrevista de Trabajo',
                    duration: '50 min',
                    resource: {
                        title: 'Comunicación No Verbal y Elevator Pitch',
                        icon: 'fa-solid fa-comments',
                        text: 'La importancia del primer minuto y cómo responder a preguntas trampa ("¿Cuál es tu mayor defecto?").'
                    },
                    individual: {
                        title: 'Mi Elevator Pitch',
                        icon: 'fa-solid fa-user',
                        text: 'Escribir y practicar una presentación de 60 segundos sobre quién eres y qué aportas.',
                        rubric: [
                            { criterion: 'Poder de Síntesis', excellent: 'Mensaje claro, conciso y memorable.', improvable: 'Demasiado largo o aburrido.' }
                        ]
                    },
                    group: {
                        title: 'Simulacro de Entrevista',
                        icon: 'fa-solid fa-users',
                        text: 'Role-play: uno entrevista y otro es candidato para un puesto de verano. El resto observa.',
                        rubric: [
                            { criterion: 'Seguridad', excellent: 'Mantiene contacto visual y responde con aplomo.', improvable: 'Lenguaje corporal defensivo.' }
                        ]
                    }
                },
                {
                    title: 'Sesión 3: Emprendimiento y Futuro',
                    duration: '50 min',
                    resource: {
                        title: 'Modelo Canvas Simplificado',
                        icon: 'fa-solid fa-lightbulb',
                        text: 'Cómo transformar una idea en un proyecto real analizando valor, clientes y recursos.'
                    },
                    individual: {
                        title: 'Mi Idea de Negocio',
                        icon: 'fa-solid fa-user',
                        text: 'Pensar en un problema cotidiano y proponer una solución creativa que pueda ser un servicio/producto.',
                        rubric: [
                            { criterion: 'Creatividad', excellent: 'Solución original a un problema real.', improvable: 'Copia de algo ya existente.' }
                        ]
                    },
                    group: {
                        title: 'Shark Tank Educativo',
                        icon: 'fa-solid fa-users',
                        text: 'Presentación rápida de ideas ante un "jurado" que decide en qué proyectos "invertir" (puntos).',
                        rubric: [
                            { criterion: 'Persuasión', excellent: 'Argumenta el valor de la idea con entusiasmo.', improvable: 'No convence o lee mucho.' }
                        ]
                    }
                }
            ]
        }
    ];

    const currentBlock = blocks.find(b => b.id === activeBlock) || blocks[0];

    return (
        <div className="tutoria-app">
            <header className="tutoria-header">
                <h1><i className="fa-solid fa-graduation-cap text-gradient"></i> Banco de Recursos Tutoriales</h1>
                <p>Recursos educativos para la acción tutorial en Secundaria y Bachillerato</p>
            </header>

            <div className="tutoria-container">
                <aside className="tutoria-sidebar">
                    <ul className="nav-menu">
                        {blocks.map(block => (
                            <li key={block.id} className="nav-item">
                                <button
                                    className={`nav-btn ${activeBlock === block.id ? 'active' : ''}`}
                                    onClick={() => setActiveBlock(block.id)}
                                >
                                    <i className={`${block.icon} nav-icon`}></i>
                                    {block.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="main-content">
                    <motion.div
                        key={currentBlock.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="block-container"
                    >
                        <div className="block-header" style={{ background: `linear-gradient(135deg, ${currentBlock.color}, #7C3AED)` }}>
                            <h2 className="block-title">{currentBlock.title}</h2>
                            <p className="block-desc">{currentBlock.desc}</p>
                        </div>

                        {currentBlock.sessions.map((session, idx) => (
                            <div key={idx} className="session-card">
                                <div className="session-header">
                                    <h3 className="session-title">{session.title}</h3>
                                    <span className="session-badge"><i className="fa-regular fa-clock"></i> {session.duration}</span>
                                </div>

                                <div className="activity-section">
                                    <span className="section-label">Recurso Didáctico</span>
                                    <div className="resource-box" style={{ borderLeftColor: currentBlock.color }}>
                                        <h4 style={{ color: currentBlock.color }}>
                                            <i className={session.resource.icon}></i> {session.resource.title}
                                        </h4>
                                        <p>{session.resource.text}</p>
                                    </div>
                                </div>

                                <div className="activity-section">
                                    <span className="section-label">Actividad Individual (15-25 min)</span>
                                    <div className="activity-box">
                                        <div className="activity-header">
                                            <span className="activity-icon"><i className={session.individual.icon}></i></span>
                                            <h4>{session.individual.title}</h4>
                                        </div>
                                        <p>{session.individual.text}</p>
                                        <button
                                            className="rubric-btn"
                                            onClick={() => toggleRubric(`${currentBlock.id}-s${idx}-ind`)}
                                        >
                                            {expandedRubrics[`${currentBlock.id}-s${idx}-ind`] ? 'Ocultar Rúbrica' : 'Ver Rúbrica de Evaluación'}
                                        </button>
                                        <AnimatePresence>
                                            {expandedRubrics[`${currentBlock.id}-s${idx}-ind`] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="rubric-content"
                                                >
                                                    <table className="rubric-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Criterio</th>
                                                                <th>Excelente</th>
                                                                <th>Mejorable</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {session.individual.rubric.map((item, i) => (
                                                                <tr key={i}>
                                                                    <td>{item.criterion}</td>
                                                                    <td>{item.excellent}</td>
                                                                    <td>{item.improvable}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="activity-section">
                                    <span className="section-label">Actividad Grupal (20-30 min)</span>
                                    <div className="activity-box">
                                        <div className="activity-header">
                                            <span className="activity-icon"><i className={session.group.icon}></i></span>
                                            <h4>{session.group.title}</h4>
                                        </div>
                                        <p>{session.group.text}</p>
                                        <button
                                            className="rubric-btn"
                                            onClick={() => toggleRubric(`${currentBlock.id}-s${idx}-grp`)}
                                        >
                                            {expandedRubrics[`${currentBlock.id}-s${idx}-grp`] ? 'Ocultar Rúbrica' : 'Ver Rúbrica de Evaluación'}
                                        </button>
                                        <AnimatePresence>
                                            {expandedRubrics[`${currentBlock.id}-s${idx}-grp`] && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="rubric-content"
                                                >
                                                    <table className="rubric-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Criterio</th>
                                                                <th>Excelente</th>
                                                                <th>Mejorable</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {session.group.rubric.map((item, i) => (
                                                                <tr key={i}>
                                                                    <td>{item.criterion}</td>
                                                                    <td>{item.excellent}</td>
                                                                    <td>{item.improvable}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default BancoRecursosTutoria;
