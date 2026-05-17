---
title: "20 prompts de IA que todo docente debería tener guardados"
slug: 20-prompts-de-ia-para-docentes
date: 2026-03-15
category: ia-en-educacion
excerpt: "Veinte prompts listos para copiar-pegar y usar con ChatGPT o Claude que te ahorran horas semanales: ejercicios, rúbricas, adaptaciones, informes y mucho más."
hero: /images/blog/20-prompts-de-ia-para-docentes.webp
keywords:
  - prompts ChatGPT
  - prompts educativos
  - Claude para docentes
  - generar ejercicios IA
  - rúbricas con IA
  - adaptación curricular
  - prompt engineering
tldr:
  - "Un buen prompt es 5-7 líneas: rol + contexto + tarea + formato + restricciones + ejemplo + tono."
  - "Los 5 prompts más rentables para docentes: generar ejercicios variados, adaptar texto a 3 niveles, redactar rúbricas, corregir con feedback formativo, y resumir reuniones."
  - "Ahorro real: un docente que usa estos prompts una hora semanal recupera 4-6 horas de tareas que antes hacía a mano."
  - "El truco está en GUARDAR los prompts buenos como plantillas reusables, no escribirlos desde cero cada vez."
  - "Para prompts en español, especifica el nivel educativo (LOMLOE 2.º Primaria, 4.º ESO…) y el dialecto si importa (España, Latam)."
faq:
  - q: "¿Qué es un prompt y por qué importa el diseño?"
    a: "Un prompt es la instrucción que le das a una IA generativa. La diferencia entre 'hazme ejercicios de matemáticas' y un prompt bien diseñado es enorme: el primero te genera material genérico inservible; el segundo te da material listo para imprimir y entregar."
  - q: "¿Debo escribir los prompts en inglés o en español?"
    a: "En español si el resultado es para alumnado español. La calidad de los modelos en español es ya excelente desde 2025 (GPT-5, Claude Sonnet 4.6, Gemini 2.5) y evitas traducciones raras. En inglés solo si trabajas materiales en inglés."
  - q: "¿Cuánto debe ocupar un buen prompt?"
    a: "Entre 5 y 15 líneas para tareas docentes habituales. Menos de 5 y la IA inventa contexto; más de 20 y empieza a perder el foco. La excepción son los prompts con ejemplos (few-shot) que pueden llegar a 30-40 líneas."
  - q: "¿Las versiones gratuitas de ChatGPT o Claude valen para esto?"
    a: "Sí, sobradamente. Para el 90 % de las tareas docentes, los modelos gratuitos (GPT-5 mini, Claude Sonnet) cubren perfectamente. Las versiones de pago aportan en tareas largas o muy específicas, pero no las necesitas para empezar."
  - q: "¿Puedo subir trabajos del alumnado al chat para corregirlos?"
    a: "Mejor anonimizalos primero (quita nombres y datos identificativos). Los términos de uso de OpenAI/Anthropic permiten el uso educativo, pero la LOPDGDD aplica a los datos de menores. Si tienes ChatGPT Enterprise / Claude for Work, los datos no se usan para entrenar — más seguro."
tags: [ia, prompts, chatgpt, claude, productividad-docente]
---

Muy buenas docente. Si ya te has metido en la IA y la estás usando para preparar clases, este post te ahorra meses de tanteo: aquí tienes **veinte prompts probados** que llevo más de un año puliendo y que uso cada semana.

Cópialos, adáptalos, guárdalos en un Drive. Son tu arsenal docente con IA.

(Si todavía no has empezado, el post de [cómo usar IA en clase sin meter la pata](/blog/como-empezar-con-ia-en-clase-sin-meter-la-pata) es la guía previa. Empieza por ahí.)

## La estructura de un buen prompt

Antes de los 20, la teoría rápida. Un prompt potente tiene 7 ingredientes:

1. **Rol**: "Eres un maestro de Primaria con 20 años de experiencia…"
2. **Contexto**: "…para una clase de 4.º de Primaria con alumnado mixto, 3 con TDAH y 1 con dislexia leve."
3. **Tarea**: "Genera…"
4. **Formato**: "…en formato tabla con tres columnas: enunciado, operación, solución."
5. **Restricciones**: "Máximo 10 ítems. Vocabulario adaptado al nivel."
6. **Ejemplo** (opcional pero potente): "Sigue este formato exacto: …"
7. **Tono**: "Lenguaje claro y motivador, sin tecnicismos innecesarios."

No tienen que estar los 7 siempre. Pero **3-4 mínimo** marcan la diferencia.

## Los 20 prompts

### Sección A — Preparar contenidos

#### 1. Generar ejercicios variados con la misma estructura

```
Eres un maestro de [NIVEL] con experiencia. Genera [N] ejercicios de
[TEMA] siguiendo esta estructura:

- Enunciado (1-2 frases, contexto realista)
- Datos
- Solución desarrollada paso a paso

Cubre estos subtemas: [LISTA]. Dificultad creciente del 1 al [N].
Contexto: [hogar / deporte / viajes / etc.].
```

Tarda 30 segundos. A mano serían 25 minutos.

#### 2. Adaptar un texto a tres niveles (diferenciación)

```
Toma este texto:

"[TEXTO ORIGINAL]"

Reescríbelo en TRES versiones:

A) NIVEL FÁCIL: 3.º Primaria. Frases cortas, vocabulario básico, sustituye
   tecnicismos por palabras conocidas.
B) NIVEL ESTÁNDAR: igual al original (cópialo).
C) NIVEL AMPLIACIÓN: añade dos párrafos con contexto histórico/científico
   adicional, manteniendo el rigor.

Devuelve las tres versiones etiquetadas.
```

Diferenciación curricular en un minuto.

#### 3. Generar un dictado adaptado

```
Genera un dictado para [CURSO] de unas [N] palabras. Tema: [TEMA].
Debe trabajar las reglas ortográficas de [REGLA: tildes en hiatos, b/v,
g/j, etc.] al menos 8 veces. Tono: narrativo, atractivo para la edad.
Devuelve también una lista de las palabras clave a evaluar.
```

#### 4. Generar 10 preguntas tipo Kahoot

```
Eres un docente que prepara un Kahoot sobre [TEMA] para [CURSO].
Genera 10 preguntas de opción múltiple (4 opciones, una correcta).
Mezcla niveles de dificultad. Devuelve en formato:

P1: [pregunta]
A) opción / B) opción / C) opción / D) opción
Correcta: [letra]
Explicación: [1 frase]
```

### Sección B — Evaluación

#### 5. Diseñar una rúbrica de exposición oral

```
Diseña una rúbrica para evaluar una exposición oral de 5 minutos
en [CURSO] sobre [TEMA].
- Cuatro niveles: insuficiente (0-4), suficiente (5-6), notable (7-8),
  excelente (9-10).
- Cuatro criterios: contenido (40 %), expresión oral (25 %), apoyo
  visual (15 %), gestión del tiempo (20 %).
Formato tabla. Para cada celda, una descripción concreta y observable.
```

#### 6. Generar feedback formativo individualizado

```
Eres un tutor que escribe comentarios de evaluación. Genera un
comentario individualizado de 80-100 palabras para un alumno de [CURSO]
con estos datos:

- Asignatura: [ASIGNATURA]
- Nota: [NOTA]
- Aspectos positivos: [LISTA]
- Aspectos a mejorar: [LISTA]
- Actitud: [DESCRIPCIÓN]

Tono: constructivo, motivador, evita repetir literalmente la nota.
Termina con UN objetivo concreto para el siguiente trimestre.
```

Repite cambiando los datos. Comentarios de toda la clase en 40 minutos en lugar de 4 horas.

#### 7. Corregir una redacción con feedback útil

```
Actúa como profesor de Lengua. Analiza esta redacción de un alumno
de [CURSO]:

"[REDACCIÓN]"

Devuelve:
1. Errores ortográficos (lista enumerada, con corrección).
2. Errores gramaticales o de sintaxis (lista enumerada, con explicación).
3. Aspectos a mejorar en estructura/coherencia (3 puntos máximo).
4. Tres fortalezas concretas.
5. Una nota orientativa sobre 10 con justificación.

Tono: directo y constructivo, sin condescendencia.
```

### Sección C — Adaptación a diversidad

#### 8. Adaptar material para alumnado con TDAH

```
Toma esta ficha de ejercicios:

"[FICHA]"

Adáptala para un alumno de [CURSO] con TDAH:
- Fragmenta en bloques visualmente separados (máx 3 ejercicios por bloque).
- Reduce instrucciones verbosas a viñetas claras.
- Añade un checkbox al inicio de cada ejercicio para marcar progreso.
- Mantén el contenido curricular intacto, solo cambia la presentación.
```

Más adaptaciones reales en el [post de TDAH en Primaria](/blog/tdah-en-primaria-12-adaptaciones-que-funcionan).

#### 9. Adaptar texto para alumnado con dislexia

```
Toma este texto:

"[TEXTO]"

Reescríbelo para alumnado con dislexia siguiendo estas reglas:
- Frases cortas (máx 12 palabras).
- Vocabulario común; sustituye palabras de baja frecuencia.
- Sin párrafos de más de 4 líneas.
- Negrita en palabras clave (no más de 3 por párrafo).
- Estructura lineal sin saltos temporales.
Mantén la fidelidad al contenido. Devuelve solo el texto adaptado.
```

#### 10. Generar instrucciones en pictogramas

```
Convierte estas instrucciones de clase en una secuencia de pictogramas
descritos para un alumno con TEA en Primaria:

"[INSTRUCCIONES]"

Para cada paso, devuelve:
- Descripción del pictograma (qué dibujar)
- Texto breve asociado (máx 6 palabras)
- Color sugerido

Máximo 8 pasos.
```

### Sección D — Innovación metodológica

#### 11. Diseñar un ABP completo

```
Diseña un Aprendizaje Basado en Proyectos para [CURSO], asignatura
[ASIGNATURA], duración [N] semanas.

Devuelve:
1. Pregunta motriz (abierta, auténtica, motivadora).
2. Producto final público.
3. Audiencia real.
4. Calendario semanal con hitos.
5. Saberes básicos LOMLOE que cubre.
6. Rúbrica de producto (4 criterios, 4 niveles).
7. Rúbrica de proceso semanal.
8. Recursos necesarios.
```

Marco metodológico en el [post de ABP](/blog/aprendizaje-basado-en-proyectos-como-disenar-uno-que-enganche).

#### 12. Diseñar 3 insignias gamificadas

```
Diseña 3 insignias para gamificar la asignatura de [ASIGNATURA] en
[CURSO]. Para cada una:

- Nombre con personalidad (no genérico).
- Icono sugerido (descripción visual).
- Criterio de obtención claro y observable.
- Puntuación (5-20).
- ¿Es global, trimestral, acumulable o súper?

Que las tres cubran tipos distintos.
```

Sistema completo en el [post de insignias en clase](/blog/sistema-de-insignias-en-clase-metodologia-completa).

#### 13. Generar guión para vídeo de flipped classroom

```
Eres docente de [ASIGNATURA]. Tengo que grabar un vídeo de aula
invertida para [CURSO] sobre [TEMA]. Duración objetivo: 6 minutos.

Devuelve el guión completo:
- Gancho inicial (15 seg).
- Explicación dividida en 2-3 bloques con ejemplos visuales.
- Síntesis final.
- Pregunta para entregar antes de la próxima clase.

Para cada parte, indica qué mostrar en pantalla (tipo de pizarra,
imagen o esquema).
```

Marco metodológico en el [post de flipped classroom](/blog/flipped-classroom-como-lo-monte-en-mi-clase).

### Sección E — Gestión de aula y burocracia

#### 14. Generar acta de reunión a partir de notas

```
Estas son mis notas sueltas de la reunión de [FECHA] sobre [TEMA]:

[NOTAS]

Genera el acta formal con:
- Asistentes
- Orden del día
- Acuerdos tomados (numerados, claros)
- Tareas asignadas con responsable y plazo
- Próxima reunión

Tono institucional, neutral.
```

#### 15. Redactar un informe de tutoría

```
Genera un informe trimestral de tutoría para [ALUMNO/A] (anónimo).
Datos:
- Curso: [CURSO]
- Notas: [LISTA]
- Faltas: [N]
- Aspectos positivos: [LISTA]
- Aspectos a trabajar: [LISTA]
- Familia: [SITUACIÓN BREVE]

Formato institucional, 200-300 palabras, tono profesional pero cálido.
Incluye recomendaciones concretas para casa.
```

#### 16. Redactar comunicado a familias

```
Redacta un comunicado a familias para informar sobre [TEMA].

Detalles:
- Fecha del evento: [FECHA]
- Hora y lugar: [DATOS]
- Qué tienen que hacer: [ACCIÓN]
- Plazo de confirmación: [PLAZO]

Tono: claro, cordial, directo. Máximo 150 palabras. Despedida con
firma del centro.
```

### Sección F — Creatividad y ampliación

#### 17. Generar problemas matemáticos con contexto local

```
Genera 10 problemas matemáticos para [CURSO] sobre [TEMA] con contexto
de [CIUDAD/REGIÓN]. Usa referentes reales:
- Establecimientos típicos
- Distancias entre lugares conocidos
- Productos locales
- Costumbres y eventos locales

Devuelve enunciado + solución. Evita estereotipos.
```

#### 18. Crear una narrativa para gamificar una unidad

```
Diseña una narrativa para gamificar la unidad de [TEMA] en [CURSO].
Duración: [N] sesiones.

Devuelve:
- Trama general (1 párrafo).
- Personajes (3-5, con nombre y rol).
- Misión principal y submisiones por sesión.
- Recompensas narrativas (no solo puntos).
- Climax final.
Tono apropiado a la edad. Sin referencias a marcas registradas.
```

#### 19. Generar ideas de ampliación para alumnado avanzado

```
Tengo un alumno de [CURSO] que ha terminado la unidad de [TEMA] antes
y necesita ampliación significativa, no más ejercicios del mismo nivel.

Genera 5 propuestas de ampliación:
- Cada una con una pregunta-reto interesante.
- Recursos necesarios.
- Producto esperado.
- Cómo evaluarlo.
- Conexión con cursos superiores (para que vea el sentido).

Tono motivador, presupuesto cero (no requiere material caro).
```

#### 20. Generar preguntas de pensamiento crítico tipo Bloom

```
Genera 12 preguntas sobre [TEMA] para [CURSO] organizadas por los
niveles de la taxonomía de Bloom:

- 2 de RECORDAR (qué, quién, cuándo).
- 2 de COMPRENDER (explica, resume, compara).
- 2 de APLICAR (calcula, demuestra, usa).
- 2 de ANALIZAR (por qué, qué evidencia, qué patrón).
- 2 de EVALUAR (justifica, critica, decide).
- 2 de CREAR (diseña, propón, inventa).

Numéralas y etiqueta el nivel de Bloom de cada una.
```

## Cómo guardar los prompts para tenerlos siempre a mano

No los memorices. Guárdalos:

- **Google Drive**: una hoja con los 20, copia-pega a demanda.
- **Notion / Obsidian**: una base de datos con tags por uso.
- **Custom GPT / Claude Project**: crea un asistente que ya tenga los prompts cargados como instrucciones del sistema.
- **Snippet manager** (TextExpander, Espanso): cada prompt con un atajo de texto (`/ejerc`, `/rubric`, `/feedb`…).

A medida que los uses, **anota tus modificaciones**. Tu versión personal después de 6 meses será mucho mejor que cualquier lista pública.

## El meta-prompt: dile a la IA que mejore tu prompt

El truco final. Cuando un prompt no termina de salirte bien, copia esto:

```
Aquí tienes un prompt que estoy usando. Quiero que lo analices y me
devuelvas una versión MEJORADA. Identifica qué le falta (rol, contexto,
restricciones, formato, ejemplos) y reescríbelo para que produzca un
resultado más útil para un docente de [TU NIVEL].

Mi prompt actual:

"[PEGA TU PROMPT]"
```

La IA te devuelve una versión más estructurada. La usas, la afinas, la guardas. Bucle infinito de mejora.

## Y la siguiente capa

Una vez tengas los 20 dominados, el paso siguiente es **encadenar prompts**: en lugar de una respuesta, generas una cadena de tareas (planificar → generar → revisar → adaptar → evaluar). Tienes una guía completa en aulaenlanube.com sobre cadenas de prompts.

Y si lo que te interesa es crear apps interactivas con IA (no solo materiales escritos), el post de [crea apps educativas nivel pro con IA](/blog/crea-apps-educativas-nivel-pro-con-ia-sin-codigo) cubre la metodología.

Cualquier prompt que descubras y te funcione, comparte en comentarios. Esto crece compartiendo.

Nos vemos en el siguiente.
