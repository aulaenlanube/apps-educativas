# QA Run · App Rosco · 2026-04-08 16:20

## Configuración
- App: rosco · Filtro: ESO humanidades (historia, lengua, latín, valencià, tutoría) · Muestra: 15

## Resultados

| id | sub/curso | letra | sol | def | veredicto | nota |
|---|---|---|---|---|---|---|
| 20865 | his/3 | Q | riqueza | Abundancia de bienes (Ri...eza, contiene Q). | ✅ OK | riqueza contiene Q (Ri-Q-ueza) |
| 20870 | his/3 | R | rey | Monarca. | ✅ OK | Conciso pero correcto |
| 20902 | his/3 | U | unificación | Unión de reinos (ej. Reyes Católicos). | ✅ OK | |
| 20920 | his/3 | W | watt | Inventor de la máquina de vapor (James... contiene W). | ⚠️ WARNING | "watt" es la unidad; el inventor es James Watt. La def confunde persona e unidad. Mejor: "Apellido del inventor de la máquina de vapor (James...)" |
| 20957 | his/4 | A | absolutismo | Sistema político del Antiguo Régimen donde el rey tiene todo el poder. | ✅ OK | Definición histórica correcta |
| 20963 | his/4 | A | auschwitz | Campo de concentración y exterminio nazi más conocido. | ✅ OK | Apropiado 4º ESO |
| 21009 | his/4 | F | frente popular | Coalición de partidos de izquierda que ganó las elecciones de 1936 en España. | ✅ OK | Concepto histórico, dif 3 apropiada |
| 21218 | his/4 | Z | zona | Área geográfica (ej. ... desmilitarizada). | ⚠️ WARNING | Definición demasiado genérica para 4º ESO; "zona desmilitarizada" debería ser más específico |
| 22478 | leng/1 | F | frase | Conjunto de palabras con sentido (sinónimo de oración). | ⚠️ WARNING | Da el sinónimo entre paréntesis (pista innecesaria) |
| 22529 | leng/1 | K | kilogramo | Unidad de mil gramos (completo). | ⚠️ WARNING | El "(completo)" es una nota interna del autor; no aporta valor al alumno |
| 22584 | leng/1 | P | poema | Composición literaria en verso. | ✅ OK | |
| 22807 | leng/2 | L | léxico | Vocabulario de un idioma. | ✅ OK | |
| 22895 | leng/2 | S | semántica | Estudio del significado. | ✅ OK | |
| 23039 | leng/3 | G | galatea | Novela pastoril de Cervantes (La...). | ✅ OK | |
| 29866 | val/1 | H | hipònim | Paraula inclosa en una altra més general. | ✅ OK | |

## Resumen
- ✅ OK: 11 · ⚠️ WARNING: 4 · ❌ ERROR: 0

## Hallazgos

⚠️ **Patrón**: anotaciones residuales del autor que pasaron desapercibidas en revisiones previas:
- id 22529: "(completo)" — anotación innecesaria
- id 21218: definición trunca con "(ej. ... desmilitarizada)"
- id 20920: confunde concepto (unidad watt vs persona Watt)
- id 22478: pista en paréntesis

## Acciones
- IDs flagged: 20920, 21218, 22478, 22529
