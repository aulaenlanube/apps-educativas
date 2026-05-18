---
title: "Tareas con modo examen: cómo se crean, cómo cuentan y qué ve el alumno"
slug: tareas-con-modo-examen-como-crear-y-asignar
date: 2026-04-25
category: guias-plataforma
excerpt: "Guía completa del módulo de tareas en apps-educativas.com: tipos disponibles (estándar y duelo), nota mínima, peso, evaluación a la que cuentan y qué pasa cuando un alumno no la entrega."
hero: /images/blog/tareas-con-modo-examen-como-crear-y-asignar.webp
keywords:
  - tareas docente
  - modo examen
  - apps-educativas.com
  - min_score nota mínima
  - peso tarea weight
  - tarea duelo
  - evaluación term
tldr:
  - "En apps-educativas.com hay tres modos de juego por app: Fácil y Medio NO cuentan para la nota; el modo Examen sí cuando hay una tarea asignada que lo evalúa."
  - "Las tareas tienen dos tipos en el panel del docente: estándar (sobre una app concreta) y duelo (emparejamiento automático en una de las 4 apps duelables)."
  - "Cada tarea estándar lleva nota mínima (min_score, por defecto 5), peso (weight, por defecto 1) y evaluación (term 1/2/3) — define a qué evaluación cuenta y cuánto pesa en su promedio."
  - "El alumno puede repetir el examen las veces que quiera dentro de la ventana — solo cuenta su mejor intento por encima del min_score."
  - "Las tareas de tipo duelo siempre dan +0,10 al ganador en el ledger y nada al perdedor — el stake del docente se ignora (esa decisión está fijada en el modelo)."
faq:
  - q: "¿Cuál es la diferencia entre modo Fácil, Medio y Examen?"
    a: "Fácil tiene muchas ayudas (pistas, vidas extra, tiempo amplio). Medio tiene algunas. Examen tiene las mínimas posibles y es el único que cuenta para tareas asignadas. Para las apps de modo único (Célula Animal, Célula Vegetal, Sistema Solar, Excavación Selectiva) no hay distinción — todas las partidas son válidas."
  - q: "¿Puedo poner una nota mínima distinta para cada tarea?"
    a: "Sí. Cada tarea tiene un campo min_score (por defecto 5/10). Sirve para definir qué cuenta como 'tarea aprobada'. Para tareas exigentes puedes subirlo a 7 u 8; para introducciones, dejarlo en 4. Es independiente del peso."
  - q: "¿Qué pasa si un alumno no hace una tarea?"
    a: "Cuenta como 0 en el promedio ponderado de la base de tareas. Esto es intencional: lo no intentado cuenta. Garantiza que la nota refleja constancia. Si necesitas ser flexible con alguien concreto (llegada tardía, cambio de centro), hay un reset del progreso del curso en la ficha del alumno."
  - q: "¿Hay diferencia entre crear una tarea estándar y una tarea de duelo?"
    a: "Sí. La estándar se asigna sobre una app concreta y la nota viene del mejor intento del alumno. La de duelo empareja automáticamente al alumnado por nota similar, juegan un duelo oculto en una de las 4 apps duelables y solo el ganador suma +0,10 al ledger — sin penalización para el perdedor. Si el grupo tiene número impar, queda un alumno con 'bye' (victoria automática)."
  - q: "¿Y si una tarea coincide con un duelo personal de la misma app?"
    a: "No se pisa: las partidas de duelo personal se guardan con modo 'duel', que NO cuenta como intento de examen para la tarea. La tarea sigue su flujo independiente. Las dos contabilidades viven en paralelo para que cada actividad sume donde toca."
tags: [tareas, modo-examen, evaluacion, duelo-tarea, plataforma]
---

Hola qué tal docente. Si ya tienes tu grupo creado (lo cuento en el [post de registro y primer grupo](/blog/registro-y-primer-grupo-en-10-minutos)), el siguiente paso natural es **asignar tu primera tarea evaluable**.

Hoy te explico el modelo entero: práctica vs examen, los dos tipos de tarea, cómo afectan a la nota y qué ve el alumno en su panel.

Vamos.

## Los tres modos de juego (y solo uno cuenta para nota)

Cada app de [apps-educativas.com](https://www.apps-educativas.com) tiene una pantalla previa donde el alumno elige modo:

| Modo | Ayudas | Cuenta para nota |
|---|---|---|
| **Fácil** | Muchas (pistas, vidas extra, tiempo amplio) | No |
| **Medio** | Algunas | No |
| **Examen** | Mínimas o ninguna | **Sí**, cuando hay una tarea asignada que la evalúa |

Esto cambia el incentivo: el alumno practica las veces que quiera en Fácil/Medio sin presión, y cuando se siente listo, va a Examen sabiendo que esa partida sí puede contar para una tarea asignada.

Excepciones:

- **Apps de comprensión** (lectora/oral) — solo tienen modo examen.
- **Sopa de letras / Crucigrama** — práctica + examen.
- **Apps de modo único** (Célula Animal, Célula Vegetal, Sistema Solar, Excavación Selectiva) — toda partida es válida sin selector.

## Los dos tipos de tarea

Al pulsar **Tareas → Nueva tarea** en el panel del grupo, el modal te ofrece dos tipos:

### Tipo 1: Estándar

Es la tarea clásica. La asignas sobre una **app concreta** y se cuenta con los exámenes que el alumno juega en esa app.

Campos del formulario:

| Campo | Por defecto | Para qué sirve |
|---|---|---|
| Título | — | Lo que verá el alumno en su lista de tareas |
| Descripción | (opcional) | Instrucciones extra que ve el alumno |
| Nivel / Curso / Asignatura | Heredados del grupo | Filtran qué apps están disponibles |
| App | — | La app sobre la que se evalúa |
| **min_score** | **5** | Nota mínima para considerar la tarea "completada" |
| **weight** | **1** | Peso de la tarea en el promedio ponderado |
| **term** | **1** | A qué evaluación cuenta (1, 2 o 3) |
| Destinatario | Grupo | A todo el grupo o a un alumno concreto |
| Fecha límite | (opcional) | Cierre orientativo |

### Tipo 2: Duelo

La plataforma empareja automáticamente al alumnado del grupo por **nota media similar** (algoritmo de balanceo) y crea **duelos ocultos** entre cada pareja. Solo se juega en una de las 4 apps duelables (Rosco del Saber, Ahorcado, Snake palabras, Ordena Bolas).

Diferencias clave:

- **Solo el ganador** recibe entrada en el ledger: **+0,10 fijo**.
- **El perdedor no es penalizado** — no tiene entrada.
- Si el grupo es **impar**, queda un alumno con **bye** (victoria automática).
- El **stake del docente se ignora** (la cifra fija +0,10 ya está decidida en el modelo).

La UI del alumno avisa explícitamente: **"+0,10 si ganas · sin penalización si pierdes"**. El incentivo es 100 % positivo — útil para grupos donde no quieres asustar al alumnado más inseguro.

## Cómo se calcula la base de tareas

Si el alumno tiene 4 tareas con pesos 1, 2, 3, 2 (es decir, la tarea 3 vale el triple que la 1) y notas 7, 6, 8, 0 (la 4.ª no la intentó):

```
base_tareas = (7·1 + 6·2 + 8·3 + 0·2) / (1+2+3+2)
            = (7 + 12 + 24 + 0) / 8
            = 43 / 8
            = 5,375 / 10
```

El 0 de la tarea no intentada **arrastra**. Es intencional: la constancia se premia. Si el alumno se atrasa, se nota.

La `base_tareas` se combina luego con los 4 bonuses (duelos, batallas, nivel, avatares) para producir la nota final de la evaluación — lo expongo al detalle en el [post sobre el sistema de nota](/blog/nota-del-alumno-tareas-duelos-batallas-nivel-avatares).

## El factor 0,9 de la base de tareas

Detalle importante para entender los números: cuando se combina con los bonuses, la base de tareas **pesa el 90 %** (no el 100 %).

Razón:

- Con base · 1,0: una base 10 + bonus +1 = 11 → cap a 10. El bonus no aporta nada.
- Con base · 0,9: una base 10 + bonus +1 = 10. El bonus aporta su +1 real.

**Para llegar a 10 hace falta base alta Y bonus**. Te obliga a recorrer la plataforma (duelos, batallas, avatares), no solo machacar tareas.

En la UI, la `base_tareas` que ve el alumno sigue siendo sobre 10 (no se reescala visualmente); el 0,9 solo se aplica al combinar.

## Lo que ve el alumno

Cuando un alumno entra a Tareas, ve algo así:

| Tarea | Mejor nota | Estado | Evaluación |
|---|---|---|---|
| Rosco - Animales | 7,5 / 10 | Aprobada (min_score 5) | 2.ª |
| Sistema Solar | 4,2 / 10 | Necesita repasar | 2.ª |
| Anagramas - Examen | — | Sin intentar | 2.ª |
| Duelo de Snake | — | Pendiente de jugar | 2.ª |

Pulsa la tarea y va directo a la app en modo examen (o a la sala del duelo, según tipo). Juega, vuelve y el sistema actualiza si su nuevo intento mejora el anterior.

Ve solo el **mejor intento** (no un historial de fallos). Esto baja la ansiedad y favorece la repetición sin miedo.

## Ventanas y fechas límite

El campo `dueDate` del formulario de tarea es **opcional y orientativo**: marca al alumno cuándo "debería" tenerla, pero la plataforma no bloquea físicamente la entrega después de esa fecha. La función de la ventana es comunicativa, no restrictiva.

Si necesitas dureza real con plazos, lo más razonable es:

- Asignar la tarea al inicio de un periodo.
- Anunciar al alumnado la fecha de "corte" como una norma de aula.
- Cambiar de evaluación cuando llegue el momento, lo que naturalmente reinicia el cálculo a las tareas de la nueva.

## Cómo afectan los duelos a las tareas

Si el alumnado juega una app **como duelo personal** (no como tarea), esas partidas quedan registradas con `mode='duel'` y **NO cuentan como intento de examen** para una tarea estándar de esa misma app.

Es decir: jugar un duelo no pisa la nota del examen. Las dos contabilidades viven en paralelo:

- **Tareas estándar** → mejor intento en modo examen (`mode='test'`).
- **Duelos personales** → entrada en `duel_grade_ledger` (bonus de duelos).
- **Duelos-tarea** → +0,10 al ganador si lo es (bonus de duelos).

Tu nota base de tareas no se ve afectada por cuántos duelos juegue. Y al revés: una tarea estándar que el alumno fastidie no le penaliza en duelos. Cada cosa cuenta donde debe.

## Reset del progreso del curso

A veces hace falta dar borrón y cuenta nueva — alumno que llega tarde, problema técnico, etc. En la **ficha del alumno** dentro del grupo hay un botón con icono de historial que abre un modal de confirmación: *"Reiniciar progreso del curso"*.

Aceptando:

- **Se borran del cálculo** de nota: partidas, batallas y ledger de duelos anteriores a la fecha de reset.
- **Se mantienen**: XP global, nivel, avatares desbloqueados, insignias, historial visible y tiempo total de juego.

Es decir: **la nota se reinicia, el prestigio se conserva**. El alumno no pierde sus avatares legendarios ni baja de nivel. Tras el reset, vuelve a tener que hacer cada tarea para que cuente.

## Errores típicos al crear tareas

Por experiencia con docentes a los que he acompañado:

- **Crear 30 tareas el primer día**: abruma al alumnado y la nota se vuelve loca. Empieza con 3-5 por evaluación.
- **Pesos absurdos**: si todas las tareas pesan lo mismo, la nota no diferencia importancia. Pondera: las clave con weight 3, las secundarias con weight 1.
- **min_score demasiado alto al principio**: subir min_score a 8 en una app que el alumnado acaba de conocer es frustrante. Empieza en 5; cuando dominen la app, sube el listón.
- **Crear tarea de una app que el alumnado no ha tocado nunca**: deja una semana de juego libre antes de la primera tarea. Si no, el examen mide cómo aprenden a usar la app, no el contenido.

## El flujo ideal de inicio

Lo que recomiendo a docentes que empiezan:

1. **Semana 1**: alumnado juega libre. Observas qué apps les enganchan.
2. **Semana 2**: creas 2-3 tareas estándar con peso bajo (weight 1, min_score 5).
3. **Semana 3-4**: revisas resultados y sumas 2-3 tareas más.
4. **Mes siguiente**: introduces tu primera **tarea de duelo** (lo cuento en el [post sobre duelos y Quiz Battle](/blog/duelos-1vs1-y-quiz-battle-competicion-sana)).
5. **Final de trimestre**: la nota se calcula sola y la consultas en el panel del grupo.

Sin obsesionarse con la matemática del modelo, la plataforma trabaja sola.

## Lo más importante

Resumiendo:

- **Modo examen** es el único que cuenta — el resto es práctica libre.
- **Lo no intentado cuenta como 0** — premia constancia.
- **El mejor intento manda** — el alumno puede repetir sin miedo.
- **min_score** define qué nota considera la tarea aprobada (por defecto 5).
- **weight** define cuánto pesa esa tarea en el promedio (por defecto 1).
- **term** define a qué evaluación va (1, 2 o 3).
- **Reset disponible** — flexibilidad cuando hace falta.

Con esto, una evaluación entera se gestiona desde el panel sin tocar Excel ni cuadernos paralelos.

Nos vemos en el siguiente.
