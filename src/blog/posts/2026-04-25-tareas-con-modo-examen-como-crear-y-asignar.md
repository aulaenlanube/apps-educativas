---
title: "Tareas con modo examen: cómo se crean, cómo cuentan y qué ve el alumno"
slug: tareas-con-modo-examen-como-crear-y-asignar
date: 2026-04-25
category: guias-plataforma
excerpt: "Guía completa del módulo de tareas en apps-educativas.com: diferencia entre práctica y modo examen, asignación a un grupo, pesos en la nota y qué pasa cuando un alumno no la entrega."
hero: /images/blog/tareas-con-modo-examen-como-crear-y-asignar.webp
keywords:
  - tareas docente
  - modo examen
  - apps-educativas.com
  - evaluación gamificada
  - peso nota
  - reset progreso curso
  - ventana entrega
tldr:
  - "En apps-educativas.com hay tres modos de juego por app: Fácil y Medio NO cuentan para la nota; el modo Examen sí cuando lo asigna el docente como tarea."
  - "Una tarea es un examen sobre una app concreta + un peso (porcentaje sobre la base de tareas) + una ventana de entrega opcional."
  - "Lo no intentado cuenta como 0 al promediar — esto premia constancia y no solo rendimiento puntual."
  - "El alumno ve el mejor intento de cada tarea; puede repetir el examen tantas veces como quiera durante la ventana abierta y solo cuenta su mejor nota."
  - "Si necesitas reiniciar el progreso del alumno (cambio de evaluación, llegada tardía), hay un reset que solo borra notas y tareas del curso actual; los avatares, XP e insignias globales se mantienen."
faq:
  - q: "¿Cuál es la diferencia entre modo Fácil, Medio y Examen?"
    a: "Fácil tiene muchas ayudas (pistas, vidas extra, tiempo amplio). Medio tiene algunas. Examen tiene mínimas o ninguna y es el único que cuenta para la nota de una tarea asignada. Para apps de single_mode (Célula Animal, Sistema Solar, Excavación Selectiva, Célula Vegetal) todas las partidas son válidas; no hay distinción."
  - q: "¿Puedo dejar que el alumno repita el examen cuantas veces quiera?"
    a: "Sí. Por defecto la plataforma guarda el mejor intento del alumno dentro de la ventana de entrega de la tarea. Puede jugar 1 vez o 20 — solo cuenta su mejor resultado. Esto premia el esfuerzo de mejora y evita la angustia de 'una sola oportunidad'."
  - q: "¿Qué pasa si el alumno no hace una tarea?"
    a: "Se contabiliza como 0 en la media ponderada de la base de tareas. Esto es intencional: lo no intentado cuenta. Garantiza que la nota refleja constancia, no solo el rendimiento de las tareas que sí ha hecho. Si quieres ser flexible con alguien concreto, hay un reset del progreso del curso por alumno."
  - q: "¿Puedo poner una fecha límite a la tarea?"
    a: "Sí. Cada tarea admite ventana de entrega con fecha de inicio y fecha de cierre. Fuera de esa ventana, el alumno puede seguir jugando la app pero su nota ya no se actualiza. Si no pones fechas, la tarea queda abierta durante toda la evaluación actual."
  - q: "¿Una tarea cuenta diferente si la juega como duelo?"
    a: "Sí. Si la app de la tarea forma parte de un duelo (1 vs 1), esas partidas van con mode='duel' y NO cuentan como intento de examen para la tarea. Solo cuenta el resultado del duelo según el ledger. Esto evita que jugar duelos pise la nota del examen del alumno."
tags: [tareas, modo-examen, evaluacion, grupos, plataforma]
---

Hola qué tal docente. Si ya tienes tu grupo creado (lo cuento en el [post de registro y primer grupo](/blog/registro-y-primer-grupo-en-10-minutos)), el siguiente paso natural es **asignar tu primera tarea evaluable**.

Hoy te explico el modelo entero: práctica vs examen, cómo se crea una tarea, cómo se calcula la nota, qué ve el alumno y qué pasa con la gente que no las hace.

Vamos.

## Los tres modos de juego (y solo uno cuenta para nota)

Cada app de [apps-educativas.com](https://www.apps-educativas.com) tiene una pantalla previa donde el alumno elige modo:

| Modo | Ayudas | Cuenta para nota |
|---|---|---|
| **Fácil** | Muchas (pistas, vidas extra, tiempo amplio) | No |
| **Medio** | Algunas | No |
| **Examen** | Mínimas o ninguna | **Sí**, cuando es una tarea asignada |

Esto es importante porque cambia el incentivo: el alumno puede practicar las veces que quiera en Fácil/Medio sin presión, y cuando se siente listo, va a Examen sabiendo que esa partida sí contará.

Hay tres excepciones:

- **Apps de comprensión** (lectora/oral) — solo tienen modo examen.
- **Sopa/Crucigrama** — práctica + examen.
- **Apps de modo único** (Célula Animal, Célula Vegetal, Sistema Solar, Excavación Selectiva) — toda partida es válida.

## Qué es exactamente una tarea

Una tarea es un objeto formado por **tres cosas**:

1. **App** sobre la que evalúas (Rosco, Ahorcado, Sistema Solar, etc.).
2. **Peso** en la base de tareas (porcentaje, ej. 10 % = vale el 10 % de la base de tareas del trimestre).
3. **Ventana de entrega** (fecha inicio + fecha cierre, opcional).

Cuando creas la tarea y la asignas al grupo, **a partir de ese momento la partida del alumno en modo examen de esa app cuenta** para esa tarea. El sistema guarda automáticamente el **mejor intento** del alumno dentro de la ventana.

## Crear una tarea paso a paso

Desde el panel del docente:

1. **Grupos → tu grupo → Tareas → Nueva tarea**.
2. Eliges la **app** de un listado filtrado por curso y asignatura.
3. Asignas el **peso** (suma de pesos no tiene que dar 100; el sistema normaliza al promediar).
4. Defines la **ventana de entrega** o la dejas vacía (queda abierta hasta el final de la evaluación actual).
5. Opcional: **descripción** que verá el alumno (instrucciones especiales).
6. **Guardar**.

A los alumnos del grupo les aparece la tarea en su pestaña Tareas con un indicador "Sin intentar / Aprobada / Suspensa", la nota actual y el botón directo para ir al examen.

## Lo que ve el alumno

Cuando un alumno entra a Tareas, ve algo así:

| Tarea | Mejor nota | Estado | Cierra |
|---|---|---|---|
| Rosco - Animales | 7,5 / 10 | Aprobada | 30 abr |
| Sistema Solar | 4,2 / 10 | Necesita repasar | 30 abr |
| Anagramas - Examen 2 | — | Sin intentar | 28 abr |

Pulsa la tarea y va directo a la app en modo examen. Juega, saca su nota, vuelve. El sistema actualiza si es mejor que la anterior.

**Importante**: ve solo la última nota (su mejor intento). No ve un historial de fallos. Esto baja la ansiedad y favorece que repita sin miedo.

## Cómo se calcula la base de tareas

Si el alumno tiene 4 tareas con pesos 10 %, 20 %, 30 %, 40 % y notas 7, 6, 8, 0:

```
base_tareas = (7·0,10 + 6·0,20 + 8·0,30 + 0·0,40) / (0,10+0,20+0,30+0,40)
            = (0,7 + 1,2 + 2,4 + 0) / 1,00
            = 4,3 / 10
```

El 0 de la tarea no intentada **arrastra mucho** la nota. Es intencional. La constancia se premia. Si el alumno se atrasa, lo nota.

Esa `base_tareas` se combina luego con los 4 bonus (duelos, batallas, nivel, avatares) para producir la nota final de la evaluación — lo explico al detalle en el [post sobre el sistema de nota completo](/blog/nota-del-alumno-tareas-duelos-batallas-nivel-avatares).

## El factor 0,9 de la base de tareas

Hay un detalle que pillará desprevenido al docente que mire los números fríos: la base de tareas **pesa el 90 %** en la fórmula final, no el 100 %.

Razón: con bases altas (8-9) los bonuses positivos se quedarían sin margen, porque el sistema cappea la nota a 10. Multiplicando por 0,9 garantizamos que **un alumno con 10 perfecto en tareas + 0 en bonuses saca 9**. Para llegar a 10 necesita base alta **y** algún bonus — fomenta usar duelos/batallas/avatares como parte del aprendizaje, no solo machacar tareas.

La `base_tareas` que ve el alumno en su panel sigue siendo sobre 10 (no se reescala visualmente); el 0,9 solo se aplica al combinar.

## Ventanas de entrega: cuándo usarlas

Tres patrones que funcionan bien:

### Patrón A: tarea semanal con ventana corta

Una tarea por semana, ventana de 7 días. El alumno tiene 1 semana para hacerla; si no, 0. **Mantiene ritmo** y bloquea la procrastinación masiva.

### Patrón B: tareas por unidad sin ventana

Asignas todas las tareas de una unidad y las dejas abiertas hasta final de la evaluación. El alumno se organiza. **Funciona en Bachillerato y ESO mayor**, no tanto en Primaria.

### Patrón C: examen final cerrado

Una tarea con ventana de 1 día (el día del examen presencial). Solo se puede entregar en esa fecha. Útil para apps que sustituyen exámenes tradicionales.

## Cómo afectan los duelos a las tareas

Si una app de una tarea es jugable como duelo 1 vs 1 (Ahorcado, Snake, Ordena Bolas, Nave Palabras), cuando el alumno la juega como duelo la partida queda registrada con `mode='duel'` y **no cuenta como intento de examen** para esa tarea.

Esto evita que un duelo perdido pise la nota del examen. La nota del duelo va por otro canal (bonus de duelos, ±0,5 sobre la nota final). El sistema mantiene **dos contadores paralelos** para que cada actividad cuente donde toca.

## Reset del progreso del curso (sin perder lo global)

A veces necesitas dar borrón y cuenta nueva a un alumno concreto:

- Llega tarde al curso y no es justo que las tareas del trimestre anterior cuenten como 0.
- Hay un cambio de evaluación y empezáis de cero pedagógicamente.
- El alumno ha cambiado de centro a mitad de curso.

Desde el panel del docente, en la ficha del alumno, hay un icono de **History** que abre un modal de confirmación: *"Reiniciar progreso del curso"*. Pulsando aceptar:

- **Se borran** del cálculo de nota: game_sessions, quiz_battle_sessions, duel_grade_ledger anteriores a la fecha de reset.
- **Se mantienen**: XP global, nivel, avatares desbloqueados, insignias, historial de partidas, tiempo total de juego.

Es decir: **el progreso de la nota se reinicia, pero el alumno conserva todo su prestigio global**. No pierde sus avatares legendarios ni baja de nivel.

Tras el reset, la nota empieza desde cero y las tareas se vuelven a contar. El alumno tiene que hacer cada tarea otra vez para que cuente.

## Errores típicos al crear tareas

Por equilibrio, lo que veo más:

- **Crear 30 tareas el primer día**: abruma al alumnado y la nota se vuelve loca. Empieza con 3-5 por evaluación.
- **Pesos absurdos**: si todas las tareas pesan lo mismo, la nota no diferencia importancia. Pondera: las clave 20-30 %, las secundarias 5-10 %.
- **Ventanas demasiado cortas**: 1 día solo vale para examen presencial. 7 días es el mínimo razonable para tarea online.
- **Crear tarea de app que el alumnado no ha tocado nunca**: deja una semana de juego libre antes de la primera tarea. Si no, el examen mide cómo aprenden a usar la app, no el contenido.

## El flujo ideal de inicio de evaluación

Lo que recomiendo a docentes que empiezan:

1. **Semana 1**: alumnado juega libre. Tú observas qué apps les enganchan y cuáles ignoran.
2. **Semana 2**: creas 2-3 tareas iniciales con peso bajo (10-15 % cada una). Ventana de 7 días.
3. **Semana 3-4**: revisas resultados. Si el alumnado va con todo, sumas 2-3 tareas más.
4. **Mes siguiente**: introduces duelos y batallas como cosa de aula (lo cuento en el [post sobre duelos y Quiz Battle](/blog/duelos-1vs1-y-quiz-battle-competicion-sana)).
5. **Final de trimestre**: la nota se calcula sola.

Sin obsesión con la matemática del modelo, la plataforma trabaja sola.

## Lo más importante

Resumiendo todo:

- **Modo examen** es el único que cuenta — el resto es práctica libre.
- **Lo no intentado cuenta como 0** — premia constancia.
- **El mejor intento manda** — el alumno puede repetir sin miedo.
- **Pesos diferenciados** entre tareas — refleja prioridad pedagógica.
- **Ventanas opcionales** — flexibilidad según tu metodología.
- **Reset disponible** — flexibilidad cuando hace falta.

Con esto, una evaluación entera se gestiona desde el panel sin tocar Excel ni cuadernos paralelos. Lo cobré caro hasta llegar a esta arquitectura — espero que tú lo aproveches sin pagar la curva.

Nos vemos en el siguiente.
