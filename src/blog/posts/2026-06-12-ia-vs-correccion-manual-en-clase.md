---
title: "Corrección con IA vs manual: lo que vimos al compararlas"
slug: ia-vs-correccion-manual-en-clase
date: 2026-06-12
category: ia-en-educacion
excerpt: "Llevamos meses comparando corrección manual con corrección por IA en mi centro. Los resultados sorprenden, y en varios casos la nota más justa la había puesto la máquina."
hero: /images/blog/ia-vs-correccion-manual-en-clase.webp
keywords:
  - corrección con IA
  - feedback automatizado
  - centro de excelencia en IA
  - AI Act educación
  - e-rater ETS
  - rúbrica
  - sesgo algorítmico
tldr:
  - "En mi centro, declarado de excelencia en IA, llevamos meses comparando corrección manual y corrección por IA con la misma rúbrica y los mismos exámenes."
  - "La sorpresa no ha sido la velocidad, sino la calidad del feedback: la IA devuelve un comentario detallado y específico donde la nota manual apenas tenía una línea."
  - "En varios casos, al revisar una nota manual a la luz del informe de la IA, la conclusión fue que la nota más justa era la de la máquina y la corregimos."
  - "El estudio de Floden (BERJ, 463 exámenes de máster) y la literatura reciente confirman paridad razonable entre IA y humanos en tareas con rúbrica fina."
  - "El docente sigue al final del proceso: define la rúbrica, atiende reclamaciones, decide. La última palabra, de momento, es siempre suya."
faq:
  - q: "¿Puede una IA corregir exámenes mejor que un docente?"
    a: "En tareas con rúbrica fina y respuesta acotada, la fiabilidad de los modelos actuales es comparable a la de dos correctores humanos. Lo que claramente supera al docente medio es el detalle del feedback. Al final, el docente sigue siendo quien decide, atiende reclamaciones y protege casos especiales."
  - q: "¿Qué riesgos tiene corregir con IA?"
    a: "Sesgo algorítmico documentado (Stanford 2023 detectó sesgo contra no nativos en detectores; e-rater de ETS mostró sesgos por origen en estudios independientes), opacidad para el alumno que quiere reclamar, y efecto Goodhart si el alumnado escribe pensando en agradar al modelo. Son riesgos manejables con auditoría y supervisión humana, no excusas para no usarla."
  - q: "¿Qué dice la ley europea sobre corregir exámenes con IA?"
    a: "El Reglamento (UE) 2024/1689 (AI Act) clasifica como alto riesgo cualquier sistema que evalúe resultados de aprendizaje (Anexo III). No lo prohíbe: exige supervisión humana efectiva, registros, evaluación de impacto, transparencia con familias y derecho a impugnar. El artículo 22 del RGPD blinda el derecho del estudiante a no ser objeto de una decisión exclusivamente automatizada."
  - q: "Si la IA corrige, ¿deja de hacer falta el docente?"
    a: "No. El docente pasa de único filtro a garante del filtro algorítmico: define la rúbrica, audita los desacuerdos, atiende reclamaciones y protege al alumnado neurodivergente o no nativo. Cualitativamente es más trabajo, no menos."
  - q: "¿En qué tipo de exámenes funciona mejor la corrección con IA?"
    a: "En los que tienen rúbrica explícita y criterios objetivables: programación con casos de prueba, problemas con solución acotada, comentarios de texto con criterios claros. Donde aún hay que tener mucho cuidado: redacciones libres muy creativas, materias muy ligadas a contexto cultural local, y siempre con alumnado neurodivergente o no nativo."
tags: [ia-correccion, feedback, ai-act, rubricas, evaluacion]
---

Hola qué tal docente. Te cuento de dónde vengo este curso. En mi centro somos centro de excelencia en IA, y llevamos meses haciendo algo que sospechaba interesante y que ha resultado más interesante de lo que esperaba: **comparar la corrección manual con la corrección por IA** en exámenes reales, con la misma rúbrica, las mismas pruebas y los mismos alumnos.

No demos sueltas, no "a ver qué dice ChatGPT". Pruebas en serio: criterios claros, rúbrica granular, varios modelos comparados, registro de cada corrección. Y al cabo de varios meses, los resultados nos han sorprendido. Mucho. **Por la calidad**, no solo por la velocidad.

Te lo cuento sin floritura. Llevo años defendiendo que la IA en educación tiene mucho que aportar, y este curso he visto cosas que me han dado la razón en sitios donde no la esperaba. Vamos al detalle.

## Lo que de verdad sorprende: el feedback

Si me preguntas qué es lo más llamativo de esta comparativa, no es lo obvio. Lo obvio es que la IA tarda treinta segundos donde tú tardas veinte minutos. Eso ya lo sabíamos. Lo verdaderamente impactante es **el nivel de detalle del feedback** que recibe el alumno.

Te explico a qué me refiero, sin tecnicismos. Cuando un docente corrige a las once de la noche con veinte exámenes detrás, lo que el alumno recibe al día siguiente suele ser una nota y, con suerte, un par de líneas señalando lo principal. Es lo que se puede hacer, no lo que nos gustaría hacer. La IA, en cambio, devuelve un comentario largo y específico para cada apartado: dónde está exactamente el fallo, por qué lo es, cómo afectaría si no se corrige y dos o tres formas distintas de arreglarlo, conectándolo con lo que el propio alumno ha hecho bien en otras partes del examen.

El chaval entiende en cinco minutos lo que con una nota seca le habría costado tres semanas, si es que le llegaba. Y eso no es velocidad. Es **calidad pedagógica del feedback**, que es lo que de verdad mueve el aprendizaje. Lo dice también Sal Khan en *Brave New Words*: [un profesor corrigiendo cien redacciones un fin de semana no lo va a hacer de forma consistente](https://www.techlearning.com/news/khanmigos-academic-essay-feedback-tool-can-help-make-writing-instruction-more-accessible-sal-khan-says), y mucho menos con feedback detallado para cada uno.

## El caso que más me hizo pensar

En varias de las comparativas hechas en el centro, nos encontramos con una situación que al principio nos descolocó. Tras corregir un docente un examen y poner su nota, pasábamos el mismo examen por la IA con la misma rúbrica. En la inmensa mayoría de casos las dos notas coincidían (o estaban dentro del margen de los dos correctores humanos cualquiera). Pero en algunos, **la nota era distinta**. Y entonces ocurría lo interesante.

Cuando sentábamos a leer el informe detallado de la IA junto al examen, varias veces la conclusión fue que **la corrección más acertada era la de la máquina**. No siempre, ojo. A veces la IA se había confundido y el docente tenía razón. Pero más veces de las que esperaríamos, el análisis paso a paso del modelo —apoyado en una rúbrica que nosotros mismos habíamos escrito— era más fino, más justo y más coherente con lo que el alumno realmente había hecho que la corrección hecha a final de tarde con prisas.

No te vendo esto como ciencia: es la observación de un equipo docente que ha hecho muchas pruebas, no un estudio replicable. Pero la coincidencia con lo que aparece en la literatura académica reciente es notable. El estudio de [Floden en el British Educational Research Journal](https://bera-journals.onlinelibrary.wiley.com/doi/10.1002/berj.4069) comparó 463 exámenes de máster corregidos con ChatGPT frente a la nota humana: la gran mayoría de las notas IA cayeron a una calificación de distancia o menos de la del profesor, con un porcentaje sustancial de coincidencia exacta. Traducido: en muchas tareas, la IA ya acierta dentro del margen en el que dos profesores tampoco se ponen del todo de acuerdo.

## La distinción que falta en el debate público

Aquí toca medir las palabras, porque hay una distinción clave que casi nadie hace.

No es lo mismo evaluar **tarea baja carga** (respuesta corta, opción múltiple, problema cerrado, ejercicio con solución acotada) que **tarea alta carga** (ensayo argumentativo, comentario de texto literario muy libre, problema muy abierto). En la primera, la fiabilidad de los modelos actuales es muy alta y la calidad del feedback es claramente superior a la corrección manual cansada. En la segunda hay paridad razonable, pero el extremo bajo del rango asusta cuando hablamos de algo que cuente para la nota final.

Los datos públicos lo confirman. En el clásico dataset ASAP, [GPT-3.5 fine-tuned alcanza un acuerdo (QWK) entre 0,613 y 0,859 según la tarea](https://arxiv.org/pdf/2409.13120). El acuerdo entre dos correctores humanos en exámenes de alto impacto suele moverse en un rango parecido según la [literatura divulgada de psicometría](https://assess.com/inter-rater-reliability-vs-agreement/). Pero solapar no es equivaler: en alto impacto eliges el modelo más fiable, no uno cualquiera del rango.

Y en producción real hay rodaje serio. ETS lleva [casi dos décadas usando e-rater como segundo corrector](https://www.ets.org/erater.html) en TOEFL iBT y GRE Analytical Writing, donde la nota final es la media humano más algoritmo. [Duolingo English Test corrige con IA](https://blog.englishtest.duolingo.com/the-duolingo-english-test-ai-driven-language-assessment/) y deja al humano para anomalías, y lo aceptan universidades de todo el mundo. En Reino Unido, [JISC tiene un piloto con decenas de universidades y colleges](https://nationalcentreforai.jiscinvolve.org/wp/2025/05/14/ai-in-assessment-pilot/). [Singapur tiene su Short Answer Feedback Assistant integrado en el Singapore Student Learning Space](https://www.moe.gov.sg/news/press-releases/20230920-more-support-for-schools-and-students-to-shape-the-future-of-learning) a escala nacional. [Corea del Sur arrancó pilotos en Gyeonggi en 2026](https://www.koreaherald.com/article/10514805) para sostener un giro hacia respuestas abiertas en el Suneung.

Esto no es futuro. Es presente extranjero que en España todavía no es presente. Y ojo: que estos países avancen no nos obliga; nos da datos. La elección sigue siendo nuestra.

## El flujo que tenemos montado (y por qué importa tanto como la herramienta)

La IA corrige, sí. Pero **el docente sigue al final del proceso, siempre**. Te explico cómo lo tenemos montado en mi centro:

1. **El examen se corrige primero por la IA** contra una rúbrica fina que el departamento ha redactado.
2. **El docente revisa el informe** y la nota propuesta. Si la firma, se publica. Si no, ajusta.
3. **El alumno recibe la nota más el feedback detallado** (no solo el número).
4. **Si el alumno detecta algo que no le cuadra** —porque la máquina ha entendido mal su intención, porque le parece injusta una valoración, porque sospecha un error—, viene a hablar con el profesor.
5. **Revisamos entre los dos** el informe de la IA y el examen. Discutimos. A veces tiene razón el alumno y se corrige. A veces tenía razón la IA y se le explica al alumno el porqué.
6. **La última palabra, de momento, es siempre del docente.**

Ese "de momento" no es retórico. Es a propósito. Veremos qué pasa dentro de unos años. Yo no apostaría a que esa última palabra siga siendo siempre del docente en todos los contextos. Pero hoy lo es, y debe serlo.

## Mi postura, sin floritura

Estoy a favor de que la IA corrija parte de los exámenes. Con condiciones, con auditoría y con humano supervisor, pero a favor. Te resumo por qué en cuatro pilares:

**Uno: consistencia auditable.** Un docente a las once y media de la noche no es el mismo corrector que a las cinco de la tarde. La máquina sí. Y más importante: el sesgo de un modelo se puede medir contra un test set, publicar y corregir; el sesgo de un corrector humano lo enmascaramos con la liturgia del "criterio del profesor" y nadie audita su distribución.

**Dos: escalabilidad del feedback.** En Birmingham, la plataforma [Graide reporta caídas grandes del tiempo de corrección y mucho más feedback escrito por alumno](https://www.graide.co.uk/blog/university-of-birmingham-research). Son datos del proveedor, así que ponles el filtro, pero el orden de magnitud aparece también en pilotos académicos independientes. Eso significa que un alumno que hoy recibe tres líneas garabateadas podría recibir media página de comentarios específicos. Es lo que estoy viendo en mi propio centro.

**Tres: trato más uniforme dentro del mismo grupo.** Dentro de la misma prueba, con la misma rúbrica, una IA aplica el mismo criterio al examen 3 y al examen 23. Un humano cansado, no. No es opinión: es lo que vemos en cuanto comparamos las dos correcciones en frío.

**Cuatro: tiempo docente para lo que solo el docente puede hacer.** Si la IA me ahorra horas mecánicas, gano horas para tutoría sobre el alumno que se hunde, para diseñar mejor las clases, para acompañar reclamaciones bien. Eso, si la administración no aprovecha el ahorro para meterte un grupo más. Yo elijo creer que en algún sitio se usará bien. Veremos.

## Los contras que no escondo

Si te vendo el paraíso te miento. Hay riesgos reales que conviene tener encima de la mesa.

**Sesgo algorítmico documentado.** El [e-rater de ETS sesgó notas en direcciones distintas para estudiantes chinos y para afroamericanos según estudios independientes](https://www.vice.com/en/article/pa7dj9/flawed-algorithms-are-grading-millions-of-students-essays). [Los detectores de IA marcaron como "IA generada" un porcentaje altísimo de ensayos TOEFL de no nativos](https://hai.stanford.edu/news/ai-detectors-biased-against-non-native-english-writers) frente a un porcentaje mínimo en nativos. El [BABEL Generator de Les Perelman demuestra que un ensayo absurdo bien hilado podía sacar un 5,4 sobre 6 en e-rater](https://lesperelman.com/wp-content/uploads/2021/01/Perelman-BABEL-Generator-e-rater.pdf). Importante: e-rater es un sistema clásico, no un LLM de 2026; y detectar IA y corregir IA son problemas distintos aunque comparten arquitectura de sesgo. Los modelos actuales no son inmunes, pero la base estadística es otra y los test sets de equidad son mucho más exigentes. Esto no resuelve el problema, lo encuadra.

**Alumnado neurodivergente.** Existe literatura que documenta que [los embeddings asocian términos como autismo o TDAH con cargas semánticas negativas](https://pmc.ncbi.nlm.nih.gov/articles/PMC12233132/). Un alumno con TEA escribe distinto: frases más repetidas, estructura más rígida, voz idiosincrásica. Un sistema mal entrenado lo penaliza por defecto. Hay reportajes sobre casos de alumnos autistas marcados falsamente como "100 % IA" por [detectores tipo Turnitin](https://blog.unemployedprofessors.com/a-student-just-won-a-lawsuit-over-a-turnitin-false-positive/), con litigios derivados. Insisto: detectar IA y corregir IA son cosas distintas, pero el aviso vale para los dos. Sobre esto en concreto escribí en [por qué fallan los detectores de IA en deberes](/blog/detectores-de-ia-en-deberes-por-que-fallan).

**Opacidad y derecho real a recurrir.** Si la nota la pone una máquina y nadie sabe por qué, ¿cómo reclamas? El [AI Act, Anexo III](https://artificialintelligenceact.eu/annex/3/) clasifica como alto riesgo cualquier sistema que evalúe resultados de aprendizaje, y el [artículo 22 del RGPD](https://gdpr-law.eu/art-22-gdpr-automated-individual-decision-making-including-profiling/) blinda el derecho del estudiante a no ser objeto de una decisión basada exclusivamente en tratamiento automatizado. El derecho existe sobre el papel; ejercerlo es otra cosa. Un alumno de 16 años no va a litigar contra una nota algorítmica. Esa es la grieta ética grande que el marco no resuelve por sí solo. Sobre las obligaciones legales concretas, escribí en [AI Act en clase: obligaciones y prohibiciones](/blog/ai-act-en-clase-obligaciones-y-prohibiciones).

**Voces críticas serias.** Ana Delgado de CCOO Castilla-La Mancha avisa de [trabajos impecables pero vacíos de aprendizaje](https://www.elespanol.com/eldigitalcastillalamancha/cultura/educacion-y-universidad/20260330/ana-delgado-ccoo-avisa-peligro-ia-aulas-trabajos-impecables-vacios-aprendizaje/1003744188852_0.html). FETE-UGT pide que la IA sea [copiloto educativo, nunca piloto automático](https://ugt-sp.es/ugt-reclama-fortalecer-la-relacion-profesor-alumno-y-las-condiciones-laborales-del-profesorado-ante-los-desafios-de-la-inteligencia-artificial/). Lorena Jaume-Palasí denuncia que [la IA arrastra sesgos estructurales que no se neutralizan con buenas intenciones](https://www.infolibre.es/medios/lorena-jaume-palasi-investigadora-ia-entrevista_1_1876577.html). Estas voces tienen razón en mucho y no se pueden despachar como tecnófobas.

**Mi umbral, por si te lo preguntabas.** Si los estudios de equidad muestran sesgos sistemáticos por origen o por neurodivergencia superiores a los del corrector humano medio, retiro el apoyo a despliegue extensivo y lo limito a feedback formativo de aula. No me vale "se irá corrigiendo". Hago lo que le pido al sistema: poner umbrales, no cheques en blanco. Sobre esto escribí más largo en [por qué corregir exámenes con IA sigue siendo responsabilidad del docente](/blog/corregir-examenes-con-ia-sigue-siendo-el-docente).

**El efecto Goodhart.** Si los alumnos saben que corrige una IA, pueden empezar a escribir para la IA: estructuras predecibles, palabras clave, longitud óptima. Lo que mides deforma lo que mides. El riesgo es real y hay que vigilarlo desde el diseño de la rúbrica.

## Por qué creo que esto se va a generalizar

Porque cuando una tecnología baja el coste por unidad varios órdenes de magnitud y al mismo tiempo mejora la calidad del feedback, se acaba imponiendo. No por convicción ideológica: por presupuesto y por presión legítima de las familias, que cada vez piden más detalle en las correcciones.

Porque la paridad técnica en muchas tareas ya está. ETS la lleva usando dos décadas. Singapur la tiene nacional. Reino Unido la pilota. Las administraciones no van a pagar cinco veces más por una corrección manual cuando una IA bien auditada da un acuerdo equivalente y un feedback mucho mejor.

Porque el AI Act no veta: regula. Anexo III no significa "prohibido", significa "alto riesgo con salvaguardas". Esas salvaguardas (evaluación de conformidad, registros, auditorías) implican coste y tiempo y pueden retrasar el despliegue varios años, pero no lo impiden.

Llegará una evaluación oficial corregida con humano más IA. Quizá en 2030, quizá después. Mi apuesta es que va a llegar.

## Cómo me preparo (y te recomiendo prepararte)

Mira, lo que estoy haciendo yo este curso con mis alumnos:

Diseño rúbricas explícitas, granulares y compartidas con el alumnado. Si la IA va a corregir algún día, lo hará contra una rúbrica. Cuanto antes nos acostumbremos a evaluar contra criterios externalizados, mejor para todos. Mis alumnos saben exactamente qué se evalúa antes de entregar. Para asignar y trackear esos exámenes uso [el modo examen de las tareas de la plataforma](/blog/tareas-con-modo-examen-como-crear-y-asignar).

Uso IA en correcciones de borrador, con visibilidad total. Les digo: este feedback lo ha generado el modelo X con este prompt, yo lo he revisado, este punto lo he cambiado porque la máquina no tenía razón en esto. Aprenden a leer feedback crítico de máquina.

Doy clases explícitas sobre cómo se reclama una nota algorítmica. Es alfabetización ciudadana del siglo XXI. Y les recuerdo lo obvio: leer y entender una decisión algorítmica es mucho más difícil que discutirla con un profesor en el recreo. El derecho del artículo 22 sin la capacidad real de entender es un derecho formal sin contenido. Por eso nos toca a los docentes acompañar esas reclamaciones, no esperar a que el alumno las haga solo.

Cuido especialmente al alumnado neurodivergente: rúbricas adaptadas, espacio para defensa oral, no me fío de ningún sistema automático sin auditoría. Si la administración no protege a estos chavales, lo hacemos nosotros en el aula.

Y, sobre todo, hablo con ellos del tema. Sin dramatismos. Que sepan que la corrección humana también tiene sesgos, que la corrección por IA tiene los suyos, que el flujo de "IA primero y docente al final" es honesto, y que el futuro va por aquí.

## El flujo que tengo montado se va a quedar

La IA corrige con detalle, el alumno reclama si algo no le cuadra, lo hablamos entre los dos, decido yo. Es más trabajo cualitativo del que tenía antes, no menos. Y mis chavales reciben en cada entrega un feedback que con bolígrafo rojo y nocturnidad no les podría dar ni queriendo.

Cuando nos pusimos a comparar correcciones en serio, esperaba confirmar que la IA es útil pero claramente inferior al docente atento. Lo que hemos visto es otra cosa: la IA es útil, y en muchos casos su corrección detallada es **al menos tan buena** como la del docente cansado de fin de jornada. Y a veces, mejor. Aceptarlo no es rebajar el papel del docente; es elevarlo: pasamos de ser el único filtro a ser el garante del filtro.

Esa, te digo, es la mejor noticia que he tenido como profesor este curso.

Nos vemos en el siguiente.
