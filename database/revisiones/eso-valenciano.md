# Revisión: ESO · Valencià

Estado actual del slice (`level=eso`, `subject_id=valenciano`, 1.112 entradas):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 287 | 150 | 131 | 6 |
| 2º ESO | 278 | 141 | 130 | 7 |
| 3º ESO | 260 | 102 | 45 | **113** |
| 4º ESO | 287 | 143 | 130 | 14 |

**Ñ**: 0 entradas en toda la asignatura. **Correcto**: en valenciano no se usa la letra Ñ (se usa el dígrafo NY). El rosco se renderizará automáticamente con 26 letras gracias al hook dinámico (verificado en revisión de Inglés ESO).

**Diagnóstico**: 1º, 2º, 4º casi limpios (algunos `kilo` placeholder en K). **3º ESO Valencià es otro caso catastrófico**: solo 18 entradas legítimas de 260 (~7%), con 242 placeholders en las 27 letras.

---

## 🔴🔴🔴 3º ESO · Regeneración casi completa

Mismo patrón sistémico que Tutoría: las 27 letras tienen placeholders masivos. **Solo 18 legítimas** en 9 letras (A:4, B:4, C:3, D:2, E:1, F:1, M:1, T:1, U:1).

**Plan**: borrar ~242 placeholders e insertar **~120 entradas nuevas** en valenciano con vocabulario LOMLOE de 3º ESO Valencià: literatura medieval (Tirant lo Blanc, Ausiàs March, Roís de Corella), gramática y morfología, géneros literarios, comunicación lingüística, ortografia, lèxic.

### Distribución de inserciones por letra (~5 cada una)

- **A** +2: adjectiu, alfabet
- **B** +2: bé, biografia
- **C** +3: conjunció, cognom, comprensió
- **D** +3: diftong, diccionari, descripció
- **E** +4: emissor, epígraf, escriptor, etimologia
- **F** +4: fonema, frase, faula, ficció
- **G** +5: gènere, gramàtica, gerundi, glossari, grafia
- **H** +5: hiat, hiperònim, homònim, història, heroi
- **I** +5: infinitiu, imperatiu, indicatiu, idioma, introducció
- **J** +5: joglar, jeroglífic, joc, justícia, joventut
- **K** +5: kilòmetre, koala, karate, ketchup, kiwi (cubre la K en 3º que está vacía)
- **L** +5: llengua, llibre, llegenda, lèxic, literatura
- **M** +4: missatge, masculí, monosíl·laba, morfema
- **N** +5: nom, novel·la, narrador, narració, neutre
- **O** +5: oració, ortografia, obra, oda, octosíl·lab
- **P** +5: pronom, predicat, paraula, poesia, prosa
- **Q** +5 (contiene Q): quart, quan, qui, quaranta, perquè
- **R** +5: rima, relat, romanç, recurs, ritme
- **S** +5: subjecte, sintagma, substantiu, sinònim, sufix
- **T** +4: teatre, tema, tragèdia, text
- **U** +4: unitat, ull, una, ús
- **V** +5: vocal, verb, vers, valencià, vocabulari
- **W** +5 (contiene W): web, watt, kiwi, sandvitx, twitter
- **X** +5 (contiene X): text, sufix, exemple, prefix, exposició
- **Y** +3: yoga, yogur, youtube (la letra Y es prácticamente inexistente en valenciano normalizado)
- **Z** +5: zero, zona, zoo, zebra, zinc

**Total: ~120 inserts**

---

## 1º ESO

| id | problema | corrección |
|---|---|---|
| 29891, 29894, 29895, 29899, 29900 | 5x `kilo` K — varias con defs erróneas (quiosc, lletra, embarcació) | borrar 29894, 29895, 29899, 29900; mantener 29891 (def "unitat de distància" → corregir a "Mil grams") |

(Las 5 entradas mantienen `solution=kilo` con defs como "Lloc de premsa" (kiosc), "Lletra K", "Embarcació lleugera" (kayak). Ningún `kilo` con def correcta — todos placeholders.)

## 2º ESO

| id | problema | corrección |
|---|---|---|
| 30174, 30177, 30178, 30182, 30183 | 5x `kilo` K placeholders | borrar 30177, 30178, 30182, 30183; mantener 30174 (def "1000 metres" → kilòmetre) |

## 4º ESO

| id | problema | corrección |
|---|---|---|
| 30612 | `Ausiàs` mayúscula | minúscula `ausiàs` |

---

## Resumen de cambios

| Curso | Deletes | Updates | Inserts |
|---|---|---|---|
| 1º | 4 | 1 | 0 |
| 2º | 4 | 1 | 0 |
| 3º | ~242 | 1 (`bo,`) | **~120** |
| 4º | 0 | 1 | 0 |

---

SQL en [eso-valenciano.sql](eso-valenciano.sql).
