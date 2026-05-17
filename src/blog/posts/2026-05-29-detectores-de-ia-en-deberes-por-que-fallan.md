---
title: "Detectores de IA en deberes: por qué fallan y qué hacer en su lugar"
slug: detectores-de-ia-en-deberes-por-que-fallan
date: 2026-05-29
category: ia-en-educacion
excerpt: "OpenAI cerró su propio detector. Stanford demostró que marcan como IA al 61 % del alumnado no nativo. Por qué los detectores fallan y qué hacer en clase cuando sospechas que un trabajo es de ChatGPT."
hero: /images/blog/detectores-de-ia-en-deberes-por-que-fallan.webp
keywords:
  - detector IA
  - Turnitin
  - GPTZero
  - falsos positivos
  - integridad académica
  - Stanford ESL
  - OpenAI classifier
tldr:
  - "OpenAI cerró su propio detector de IA en julio de 2023 tras reconocer solo un 26 % de acierto identificando texto de ChatGPT y un 9 % de falsos positivos sobre texto humano."
  - "Un estudio de Stanford (2023) encontró que los detectores marcan como IA al 61 % del alumnado no nativo de inglés — sesgo grave contra ESL y neurodivergentes."
  - "Universidades como Vanderbilt (agosto 2023), UCLA y UPenn desactivaron el detector de Turnitin por inexactitud y falta de garantías."
  - "Una reformulación mínima del texto generado por ChatGPT baja la detección de Turnitin del 100 % al 0 % — los detectores no son prueba válida."
  - "La mejor defensa pedagógica no es el detector: es rediseñar la tarea (proceso en clase, defensa oral, borradores intermedios) para que copiar deje de ser la opción más rápida."
faq:
  - q: "¿Funcionan los detectores de IA como Turnitin o GPTZero?"
    a: "Mal. La precisión real ronda el 30-70 % en condiciones óptimas y cae a 0 % con reformulaciones simples. OpenAI cerró su propio clasificador en 2023 por baja precisión. Universidades como Vanderbilt, UCLA y UPenn los han descartado oficialmente como evidencia para decisiones académicas."
  - q: "¿Qué hago si sospecho que un trabajo es de ChatGPT y no tengo detector fiable?"
    a: "Tres pasos: (1) entrevista breve con el alumno sobre el contenido del trabajo; quien ha copiado no lo sostiene; (2) pide una versión manuscrita de un fragmento clave; (3) si persiste la sospecha y no hay prueba, baja la puntuación de la parte no defendible, no la nota global. Nunca acuses sin evidencia conversacional."
  - q: "¿Es ilegal usar un detector de IA en mi centro?"
    a: "Bajo el Reglamento Europeo de IA (AI Act), si la decisión del detector influye en una calificación, es alto riesgo (Anexo III). El centro debe documentar quién supervisa el resultado, qué umbral activa la revisión humana y cómo el alumno puede impugnar. Usarlo sin esos procedimientos por escrito deja al centro fuera de cobertura legal desde agosto de 2026."
  - q: "¿Cómo rediseño una tarea para que sea resistente a la IA?"
    a: "Pide producto + proceso visible: borradores intermedios en clase, anotaciones a mano sobre el texto, defensa oral de 3 minutos, conexión con un evento personal o local que ChatGPT no conoce, comentarios sobre fuentes específicas que les has dado tú. Si el alumno tiene que mostrar el camino y no solo el destino, la IA ayuda pero no sustituye."
  - q: "¿Acusar a un alumno por falso positivo puede tener consecuencias legales?"
    a: "Sí. Hay casos documentados de demandas a centros y universidades por suspender alumnos con base en un detector luego desautorizado. El sesgo contra alumnado no nativo de la lengua es además una causa potencial de discriminación bajo RGPD y normativa española antidiscriminación. Acusar sin proceso sólido es exposición legal real."
tags: [detectores-ia, integridad-academica, falsos-positivos, ai-act, evaluacion]
---

Hola qué tal docente. Si has llegado aquí, supongo que tienes la sospecha de que algún alumno te está colando deberes hechos con ChatGPT y has visto en internet que Turnitin, GPTZero o ZeroGPT te van a salvar.

Spoiler: **no van a salvarte**. Te explico por qué con los datos en la mano y, sobre todo, qué sí puedes hacer en clase para que la IA no te haga el ridículo.

Al lío.

## Por qué los detectores no detectan

Tres datos para empezar:

| Dato | Fuente |
|---|---|
| OpenAI cerró su propio clasificador de IA | Julio 2023, web oficial de OpenAI |
| 26 % de aciertos sobre texto IA real | OpenAI, evaluación interna |
| 9 % de falsos positivos sobre texto humano | OpenAI, evaluación interna |

El detalle es importantísimo. **OpenAI** — la empresa que fabrica ChatGPT, la que mejor conoce cómo escribe su propio modelo — fue incapaz de construir un detector que identificara correctamente su propio output más de uno de cada cuatro intentos. Y lo cerró públicamente reconociéndolo.

Si la empresa que conoce el modelo no puede detectar al modelo, **¿por qué iba a poder Turnitin o GPTZero?** No pueden. Y los datos lo confirman.

## El sesgo brutal contra alumnado no nativo

Esto es lo más serio. Un estudio de **Stanford** publicado en 2023 ([Liang, Yuksekgonul, Mao, Wu, Zou — *GPT detectors are biased against non-native English writers*](https://arxiv.org/abs/2304.02819)) demostró que los detectores de IA marcaron como "generado por IA" al **61 % de los ensayos escritos por estudiantes no nativos de inglés**.

La razón es técnica y dura: los detectores miden la **"perplejidad"** del texto (variabilidad en la elección de palabras). El texto IA tiene baja perplejidad (palabras predecibles). El texto de un escritor no nativo también tiene baja perplejidad — porque al no dominar la lengua, usa vocabulario más estándar.

Resultado: **el detector confunde "no dominar inglés" con "ser una IA"**.

Esto no es opinión, es matemática. Y en aulas españolas tenemos exactamente el mismo problema con:

- Alumnado de origen extranjero escribiendo en castellano.
- Alumnado con TEA o disgrafía que escribe estructuras más uniformes.
- Alumnado neurodivergente que reformula menos.
- Alumnado más joven que tiene menos variabilidad léxica.

Si usas el detector para acusar, estás sesgado contra justo el alumnado que ya tiene más dificultades. Es un problema ético serio, no solo metodológico.

## Lo fácil que es burlar al detector

Otro dato del estudio de Stanford y de pruebas independientes ([Sadasivan et al. 2023](https://arxiv.org/abs/2303.11156), entre otros):

- Texto generado por ChatGPT puro: detección **74 %**.
- Mismo texto con reformulaciones menores hechas por el alumno: detección **42 %**.
- Mismo texto pidiendo a ChatGPT "escribe como un adolescente de 14 años": detección **0 %**.

El esfuerzo de "burlar al detector" es de **dos minutos**. El esfuerzo de hacer la tarea bien por uno mismo, mucho más. Los incentivos están al revés.

## Las universidades que ya tiraron la toalla

No hablamos de centros marginales. Lista de instituciones que **han desactivado o nunca han adoptado** el detector de Turnitin oficialmente:

- **Vanderbilt University** — desactivó la herramienta el 16 de agosto de 2023.
- **UCLA** — declinó adoptarla por "preocupaciones y dudas sin responder" sobre la precisión.
- **University of Pennsylvania** — recomienda al profesorado: "Evita los detectores de IA. Ninguna de estas herramientas tiene precisión suficiente para servir como evidencia".
- **MIT, Yale, Princeton, Stanford** — no recomiendan su uso para decisiones académicas.

Si estas universidades no se fían, tu centro debería mirar muy bien antes de fiarse.

## ¿Y entonces qué hago cuando sospecho que un trabajo es IA?

Aquí la parte útil. Lo que hago yo cuando tengo la sospecha:

### 1. Entrevista breve, antes que acusar

Llamo al alumno y le pido que me explique **una parte concreta** del trabajo, con preguntas que le obliguen a entender lo que entregó.

- "Explícame con tus palabras el segundo párrafo."
- "¿Por qué elegiste este ejemplo y no otro?"
- "¿De dónde sacaste esta fuente? Cuéntame el camino."

Quien ha escrito el trabajo lo sostiene en 30 segundos. Quien ha copiado y pegado se desinfla en 15. No hace falta detector, hace falta **conversación**.

### 2. Fragmento manuscrito en clase

Le pido al día siguiente que me reescriba a mano (sin ordenador, sin móvil) **un fragmento concreto** del trabajo, en clase, durante 10 minutos. Sin amenazas, sin drama: "necesito ver tu proceso, porque hay frases que me llaman la atención".

Si el resultado manuscrito tiene el mismo nivel y vocabulario que el entregado, sin trampa. Si es notablemente más pobre, ya tienes evidencia conversacional sólida.

### 3. Si persiste la duda, baja la puntuación de lo no defendible — no acuses

Si el alumno no puede defender ciertas partes pero otras sí, la nota refleja eso: **lo que ha sostenido cuenta, lo que no, no cuenta**. Esto no requiere acusación formal, es evaluación por proceso. Y te cubre legalmente.

### 4. Nunca acuses sin proceso

Si pones un cero o un parte por usar IA basándote **solo en el detector**, te puedes ver en una situación muy fea: el alumno o la familia presenta una reclamación, el detector resulta ser dudoso, y tú quedas como quien acusó sin pruebas. Hay [casos documentados de demandas](https://www.theverge.com/2023/8/15/23829612/texas-am-chatgpt-ai-professor-mark-class-graduation) y el AI Act endurece estas obligaciones desde agosto de 2026 (lo conté en el [post sobre AI Act](/blog/ai-act-en-clase-obligaciones-y-prohibiciones)).

## Lo que sí funciona: rediseñar la tarea

Esta es la parte importante. Si tu tarea se puede resolver enteramente con ChatGPT y no se nota, **la culpa no es del alumno, es del diseño**. Cambia el diseño.

### Producto + proceso visible

No pidas solo el producto. Pide el camino:

- Borradores intermedios en clase con tu visado.
- Anotaciones a mano sobre el texto en papel.
- Captura de la búsqueda inicial (cuándo, dónde, qué encontró).
- Reflexión personal del proceso (qué dificultad tuvo, qué cambió en el camino).

Estos pasos los puede hacer una IA, pero el alumno tiene que **enseñarlos en clase secuencialmente**. El coste de fakear todo el proceso supera al de hacer la tarea de verdad.

### Conexión personal o local que ChatGPT no conoce

ChatGPT no sabe:

- Lo que pasó el martes en el patio del recreo de tu centro.
- El nombre del río que pasa por el pueblo del alumno.
- El proyecto que estáis haciendo en clase desde octubre.
- La opinión del alcalde de tu localidad sobre tal tema.

Si en la tarea pides explícitamente conectar con un dato local o un hecho de aula, la IA solo puede ayudar a hilarlo, no a inventarlo. Y el resultado es más rico.

### Defensa oral de 3 minutos

Esto cambia todo. Cada trabajo entregado se defiende en 3 minutos al docente, en alto. El que ha escrito el trabajo lo defiende fluido. El que ha copiado, no puede.

Y como bonus pedagógico: la defensa oral mejora la oratoria del alumno, que es competencia LOMLOE.

### Comentarios sobre fuentes específicas que tú das

Tú entregas al alumnado 3 fuentes concretas (un artículo, un vídeo, una página). La tarea es **comentar esas fuentes específicas**. ChatGPT no las ha leído. Si el alumno usa IA, las cita mal o inventa cosas que no aparecen.

### Tareas de proceso largo

Un trabajo entregado un viernes y se acabó es fácil de IA-zar. Un trabajo de **4 semanas con 3 hitos intermedios** (idea → esbozo → borrador → final) es muy difícil de fingir.

## La conversación honesta con el alumnado

El siguiente paso, que no debería faltar nunca, es **una conversación de aula** sobre IA. No "está prohibido". No "siempre os pillaré". Es:

- "Usar ChatGPT no es trampa por sí mismo. Lo que es trampa es entregar algo como tuyo cuando no lo es."
- "Os enseño cuándo usarlo: para brainstorming, para resumir un texto largo, para ver ejemplos. No para escribir por vosotros lo que se evalúa."
- "Si me declaráis su uso, contamos la tarea de otra manera, sin sanción. Si me mentís y lo descubro, es lo mismo que cualquier otro plagio."

Esto baja la trampa a la mitad solo por bajar la tentación. Y educa en uso responsable, que es lo que la sociedad les va a pedir cuando salgan del centro.

## El detector no es la solución; el diseño sí

Resumen para llevar:

- **No compres** un detector de IA esperando que arregle el problema. No funciona y te puede meter en líos legales.
- **Si lo tienes**, úsalo solo como uno de varios indicios, nunca como prueba única, y nunca como base para sanción.
- **Rediseña tareas** para que mostrar el proceso sea parte del entregable.
- **Habla con el alumnado** sobre uso responsable de IA. Tienen 14 años y van a usarla toda su vida adulta — más vale que lo aprendan contigo bien que en TikTok mal.

En mis clases de informática, desde 2023 no uso ningún detector. Y desde 2024 declaré explícitamente que usar IA está permitido si se declara y se defiende en la defensa oral. **El número de trabajos plagiados bajó**, no subió. Porque la trampa solo es atractiva cuando la alternativa transparente está prohibida.

Para el día a día del aula, los [20 prompts de IA para docentes](/blog/20-prompts-de-ia-para-docentes) te dan ideas concretas que puedes proponer al alumnado como uso legítimo. Y si quieres una mirada más amplia a la integración de IA en clase, está la [guía para empezar sin meter la pata](/blog/como-empezar-con-ia-en-clase-sin-meter-la-pata).

La IA no se va a ir. Lo que sí se puede ir es la idea de que un detector resuelve el problema. Cuanto antes lo aceptemos, antes diseñaremos tareas que de verdad evalúen lo que el alumno sabe.

Nos vemos en el siguiente.
