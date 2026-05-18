---
title: "Nota del alumno paso a paso: tareas, duelos, batallas, nivel y avatares"
slug: nota-del-alumno-tareas-duelos-batallas-nivel-avatares
date: 2026-05-10
category: guias-plataforma
excerpt: "Cómo se calcula la nota del alumno en apps-educativas.com: base de tareas al 90 % más cuatro bonus capados (duelos, batallas, nivel y avatares). Fórmula, casos reales y cómo lo ve el alumno."
hero: /images/blog/nota-del-alumno-tareas-duelos-batallas-nivel-avatares.webp
keywords:
  - nota alumno
  - sistema doble base
  - bonus duelos
  - bonus avatares
  - nivel 101
  - 106 avatares
  - apps-educativas.com
tldr:
  - "La nota del alumno es base_tareas · 0,9 + bonus_duelos (±0,5) + bonus_batallas (+0,5) + bonus_nivel (+0,5) + bonus_avatares (+0,5), clip [0, 10]."
  - "La base de tareas pesa el 90 % en la fórmula final para dejar margen real a los bonus — la nota mostrada al alumno sigue siendo sobre 10."
  - "Cada bonus tiene curva concava (raíz cuadrada) para nivel y batallas; duelos y avatares son lineales — premia variedad por encima del grinding."
  - "La plataforma tiene 101 niveles, pero solo los primeros 50 aportan al bonus de nivel. Del 50 al 101 es prestigio: avatares de rareza alta y la insignia mythic_max_level."
  - "Hay 106 avatares en total (22 comunes, 27 raros, 24 épicos, 23 legendarios, 10 míticos). Cada uno desbloqueado suma según rareza; cap del bonus en +0,5."
faq:
  - q: "¿Por qué se multiplica la base de tareas por 0,9 en la fórmula?"
    a: "Para garantizar margen real a los bonus. Si la base pesara 1,0 y los bonus sumaran +2, el cap a 10 los anularía cuando la base es alta. Multiplicando por 0,9 dejas espacio para que un alumno con base 10 sume +1 de bonus y obtenga la nota máxima. Es una decisión de diseño para que los bonus motiven, no decoren."
  - q: "¿Cuántos avatares hay en la plataforma y cuántos puntos suma cada uno?"
    a: "Hay 106 avatares en total, agrupados por rareza: 22 comunes (suman 0,1 cada uno), 27 raros (0,2), 24 épicos (0,3), 23 legendarios (0,4) y 10 míticos (0,5). El bonus de avatares se cappea en +0,5 — con un mítico ya estás al máximo, o con 5 comunes."
  - q: "¿Cómo se calcula el bonus de nivel y hasta dónde sube?"
    a: "Fórmula: 0,5 · √((nivel-1)/49). Llega al máximo +0,5 en nivel 50. Del 50 al 101 no aporta más al bonus — es prestigio: avatares legendarios/míticos y la insignia mythic_max_level. La XP exacta para nivel 100 son 831.448 puntos; el 101 cuesta otros 831.448 adicionales (doble salto)."
  - q: "¿Si reseteo el progreso del curso de un alumno, pierde sus avatares?"
    a: "No. El reset solo borra del cálculo de nota lo del curso actual (partidas, batallas, ledger de duelos). Los avatares, XP, nivel e insignias son globales y se mantienen. El alumno reseteado vuelve a empezar la nota desde 0 pero conserva todo su prestigio acumulado."
  - q: "¿Puedo cambiar manualmente la nota o el modelo de cálculo?"
    a: "El modelo de cálculo está fijado por la plataforma — es la garantía de que la nota es transparente y reproducible. Lo que sí controlas como docente: pesos y min_score de cada tarea, crear o eliminar tareas, resetear progreso del curso de un alumno, cambiar la evaluación actual del grupo, decidir si una batalla cuenta o no para nota. Con estas palancas tienes flexibilidad sin romper la fórmula."
tags: [nota, evaluacion, bonus, gamificacion, plataforma]
---

Hola qué tal docente. Si has llegado al último post de la serie [Guías de la plataforma](/blog/categoria/guias-plataforma), es momento de abrir la caja negra: **cómo se calcula exactamente la nota del alumno** en apps-educativas.com.

No hay magia. Hay una fórmula transparente con 5 componentes y un cap. Vamos paso a paso, con casos reales, para que puedas explicársela a alumnado, familias y dirección sin dudar.

Al lío.

## La fórmula, en una línea

```
nota_final = base_tareas · 0,9
           + bonus_duelos    (±0,5)
           + bonus_batallas  (+0,5)
           + bonus_nivel     (+0,5)
           + bonus_avatares  (+0,5)
           → clip [0, 10]
```

Cinco componentes. Cuatro bonus capados. Clip final a [0, 10] para que no salgan "11,3" o "−0,4".

Vamos uno por uno.

## Componente 1: base de tareas

Es la **media ponderada de las tareas asignadas** al alumno durante la evaluación actual:

```
base_tareas = Σ (nota_tarea · weight_tarea) / Σ pesos
```

Con dos detalles importantes:

- **El mejor intento** de cada tarea es el que cuenta.
- **Lo no intentado cuenta como 0** — esto premia constancia. Lo expongo en el [post sobre tareas](/blog/tareas-con-modo-examen-como-crear-y-asignar).

### El factor 0,9

Cuando se combina con los bonuses, la base se multiplica por **0,9**. Razón:

- Si la base pesara 1,0 → base 10 + bonus +1 = 11 → cap a 10. El bonus no aporta nada.
- Si la base pesa 0,9 → base 10 + bonus +1 = 10. El bonus aporta su +1 real.

**El alumno necesita base alta Y bonus para llegar a 10**. Es intencional: te obliga a recorrer la plataforma, no solo machacar tareas.

En la UI, la `base_tareas` que ve el alumno **sigue siendo sobre 10**. El 0,9 solo se aplica al combinar internamente.

## Componente 2: bonus de duelos

Suma de dos fuentes (ver [post sobre duelos y Quiz Battle](/blog/duelos-1vs1-y-quiz-battle-competicion-sana)):

| Fuente | Cómo aporta |
|---|---|
| Duelos-tarea ganados | +0,10 fijo por victoria al ledger |
| Duelos personales con apuesta | ±stake (0,1/0,2/0,3) según resultado |
| Duelos personales amistosos | Nada (0 puntos) |

Combinación:

```
task_bonus     = CLAMP(0, 0.5, Σ deltas de entradas is_task)
personal_delta = Σ deltas de entradas no-task (con signo)
bonus_duelos   = CLAMP(−0,5, +0,5, task_bonus + personal_delta)
```

Es el único bonus que puede ser **negativo** — si pierdes muchos duelos personales con apuesta alta, te resta. Por eso el modo amistoso existe: para jugar sin riesgo.

## Componente 3: bonus de batallas (Quiz Battle)

Cada vez que el alumno queda en el podio de un Quiz Battle **que cuenta para una evaluación**:

| Posición | Aporta al score acumulado |
|---|---|
| 1.º | 1,000 |
| 2.º | 0,667 |
| 3.º | 0,333 |

El bonus se calcula como:

```
bonus_batallas = 0,5 · √(min(score_total, 10) / 10)
```

Curva concava. Los primeros podios suman mucho; los siguientes, cada vez menos.

| Score acumulado | Bonus |
|---|---|
| 1 (1 podio de 1.º) | 0,158 |
| 3 (varios podios) | 0,274 |
| 5 | 0,354 |
| 10 (10+ podios) | 0,500 (cap) |

Recuerda: si en la sala el docente eligió "Evaluación: Ninguna", esa batalla no aporta puntos — solo XP y diversión.

## Componente 4: bonus de nivel

La XP se acumula partida a partida. Cada nivel cuesta más XP. La plataforma tiene **101 niveles** (curva por tramos):

| Tramo | Cómo escala |
|---|---|
| 1-49 | Curva estándar (cada nivel ~+34 XP que el anterior) |
| 50-79 | Lineal a +200 XP por nivel |
| 80-89 | +5 % por nivel |
| 90-99 | +25 % por nivel |
| 100 → 101 | El último salto duplica todo lo acumulado |

Hitos XP exactos (de la curva del juego):

- Nivel 50 → **49.784 XP**
- Nivel 80 → **197.744 XP**
- Nivel 90 → **301.174 XP**
- Nivel 100 → **831.448 XP**
- Nivel 101 → **1.662.896 XP** (exactamente el doble del nivel 100)

El **bonus** solo va con los primeros 50 niveles:

```
bonus_nivel = 0,5 · √((nivel − 1) / 49)
```

Cap +0,5 en nivel 50. Del 50 al 101 **no se gana más bonus**.

¿Por qué entonces hay niveles más allá del 50?

- **Avatares legendarios y míticos** que solo se desbloquean con nivel alto.
- **Insignia `mythic_max_level`** al llegar a 101.
- **Prestigio puro** — el alumno top sigue teniendo metas.

No queremos que un alumno de nivel 90 tenga ventaja matemática contra uno de nivel 50. Ambos tienen el mismo cap de bonus.

## Componente 5: bonus de avatares

Hay **106 avatares** en total, agrupados por **5 rarezas**:

| Rareza | Cantidad | Aporta cada uno desbloqueado |
|---|---|---|
| Común | 22 | 0,1 |
| Raro | 27 | 0,2 |
| Épico | 24 | 0,3 |
| Legendario | 23 | 0,4 |
| Mítico | 10 | 0,5 |

Cap total: **+0,5**. Con 5 comunes desbloqueados o con 1 mítico llegas igual al máximo. Premia recorrer la plataforma con variedad.

**Bonus global** (no por evaluación): los avatares desbloqueados se conservan curso a curso. El alumno que llega a 4.º ESO con 30 avatares mantiene su +0,5 desde el primer día del curso.

Equipar un avatar es solo cosmético. **Lo que cuenta para el bonus es haberlos desbloqueado**, no llevarlo puesto.

### Cómo se desbloquean

Cada avatar tiene su propio requisito. Tipos existentes:

- Valorar X apps distintas (`apps_rated`).
- Aprobar X exámenes con nota alta (`high_score_exams`).
- Aprobar X exámenes de una asignatura concreta (`subject_exams`).
- Ganar X duelos (`duels_won`).
- Ganar X batallas (`battles_won`).
- Aprobar X sesiones de una app específica (`app_sessions`).
- Alcanzar un nivel concreto (`level`).
- Requisitos **combinados** (ej. "Gana 15 duelos Y 8 batallas").

Cada partida la plataforma comprueba si se desbloquea algún avatar y notifica al alumno con un modal celebrativo.

## Caso real 1: alumno medio que solo hace tareas

| Componente | Valor |
|---|---|
| base_tareas | 7,0 |
| bonus_duelos | 0,0 (no juega duelos) |
| bonus_batallas | 0,0 (no participa) |
| bonus_nivel | 0,2 (nivel 8) |
| bonus_avatares | 0,3 (3 avatares comunes desbloqueados) |
| **Nota final** | **7,0·0,9 + 0,5 = 6,8** |

Saca casi su nota cruda de tareas. Los bonus apenas le suman. Es el patrón típico del alumno que solo va a tareas.

## Caso real 2: alumno todoterreno

| Componente | Valor |
|---|---|
| base_tareas | 7,0 |
| bonus_duelos | +0,4 (gana 4 duelos-tarea, juega amistosos sin perder) |
| bonus_batallas | +0,4 (8 podios variados) |
| bonus_nivel | +0,5 (nivel 50, cap) |
| bonus_avatares | +0,5 (5+ avatares, cap) |
| **Nota final** | **7,0·0,9 + 1,8 = 8,1** |

Con la misma base de tareas, **gana +1,3 puntos por gamificación**. El sistema premia al que recorre la plataforma entera.

## Caso real 3: alumno top de tareas, perezoso de bonus

| Componente | Valor |
|---|---|
| base_tareas | 10,0 |
| bonus_duelos | 0 |
| bonus_batallas | 0 |
| bonus_nivel | 0,1 (nivel 3) |
| bonus_avatares | 0,1 (1 avatar común) |
| **Nota final** | **10·0,9 + 0,2 = 9,2** |

Aunque las tareas son perfectas, **no llega al 10**. Para llegar tiene que tocar bonus. Es por diseño — si la nota máxima fuera regalable solo con tareas, los bonus serían decoración.

## Caso real 4: alumno gamer, débil en tareas

| Componente | Valor |
|---|---|
| base_tareas | 4,0 |
| bonus_duelos | +0,5 (cap, top de duelos del grupo) |
| bonus_batallas | +0,5 (cap, top de batallas) |
| bonus_nivel | +0,5 (cap, nivel 50) |
| bonus_avatares | +0,5 (cap, varios avatares de alta rareza) |
| **Nota final** | **4,0·0,9 + 2,0 = 5,6** |

Aunque los 4 bonus están al cap, **no aprueba con holgura**. El sistema garantiza que la base manda — los bonus no salvan una nota mala. Solo añaden colchón.

Mensaje al alumno: "para subir más, no es jugar más duelos. Es trabajar las tareas".

## Cómo lo ve el alumno

En su panel **Resumen** ve algo como:

| Componente | Valor |
|---|---|
| Nota actual (evaluación 2.ª) | 7,8 / 10 |
| Base tareas | 7,5 / 10 |
| Bonus duelos | +0,3 |
| Bonus batallas | +0,4 |
| Bonus nivel | +0,4 |
| Bonus avatares | +0,3 |

Ve la fórmula viva. **No es una caja negra**. Si suspende, sabe exactamente qué subir.

Y ve **la nota de la evaluación actual**, no global. Esto es deliberado: no quiero que arrastren toda la trayectoria del curso a final de la 3.ª evaluación con presión inmanejable.

## La evaluación actual (la que se está calculando)

El docente decide desde **Editar grupo → Evaluación actual**:

- Automática (por fecha: sep-dic = 1.ª, ene-mar = 2.ª, abr-ago = 3.ª).
- 1.ª, 2.ª o 3.ª manualmente.

La nota que ve el alumno y las tareas mostradas se filtran por esa evaluación. Las anteriores quedan archivadas — no se borran, pero no afectan al cálculo actual.

## Reset del progreso del curso (sin perder lo global)

A veces hace falta dar borrón y cuenta nueva — alumno que llega tarde, cambio de centro, lo que sea. Desde la ficha del alumno hay un botón con icono de historial.

Lo que se borra del cálculo de nota:

- Partidas (`game_sessions`) anteriores al reset.
- Batallas (`quiz_battle_sessions`) anteriores.
- Ledger de duelos (`duel_grade_ledger`) anterior.

Lo que se mantiene:

- **XP, nivel, avatares desbloqueados, insignias**.
- Historial de partidas (lo siguen viendo).
- Tiempo total de juego.

Es decir: **el alumno empieza de nuevo la nota, pero conserva todo su prestigio acumulado**. No es destructivo. Lo registra `student_group_reset_log` por si hay que auditar.

## Por qué este modelo y no otro

He probado modelos más simples y más complejos en estos años. Lo que valida este específicamente:

1. **Es transparente**: cualquier alumno entiende los 5 componentes en 3 minutos.
2. **No es manipulable**: el algoritmo es fijo; ni el docente ni el alumnado pueden alterar la fórmula.
3. **Recompensa variedad** sin obsesionar (curvas concavas para nivel y batallas).
4. **Garantiza que la base manda**: los bonus son extras, no atajos.
5. **Sostiene motivación a largo plazo**: hay siempre algo nuevo (avatares de mayor rareza, nuevas insignias entre las 64+, niveles 50→101).
6. **Cumple normativa LOMLOE**: la base son las tareas evaluables con peso justificado; los bonus son gamificación añadida.

Lo que NO he conseguido evitar:

- Algún alumno que se obsesiona con los avatares y descuida tareas — pero el sistema le frena (caso 4).
- Algún docente al que le parece "muchos números" — pero una vez ve los casos reales, le encaja.

## Una recomendación final

Si tu primer trimestre con la plataforma estás dudando del modelo, **deja que pase el trimestre entero**. No cambies la metodología a mitad. Mira las notas de fin de trimestre, compara con tu sistema anterior, escucha al alumnado.

Mi experiencia tras años acumulados con sistemas de este estilo: **la nota es más justa y refleja mejor el aprendizaje real** que un cuaderno tradicional con exámenes puntuales. Porque incluye constancia, variedad y esfuerzo distribuido.

Y si quieres releer cómo se monta todo desde cero, los tres posts anteriores de esta serie son la ruta completa:

1. [Registro y primer grupo en 10 minutos](/blog/registro-y-primer-grupo-en-10-minutos).
2. [Tareas con modo examen](/blog/tareas-con-modo-examen-como-crear-y-asignar).
3. [Duelos 1 vs 1 y Quiz Battle](/blog/duelos-1vs1-y-quiz-battle-competicion-sana).

Con los cuatro juntos tienes manual completo del funcionamiento de la plataforma.

Nos vemos en el siguiente.
