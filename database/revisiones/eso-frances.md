# Revisión: ESO · Francés

Estado actual del slice (`level=eso`, `subject_id=frances`):

| Curso | Total | Fácil (1) | Medio (2) | Difícil (3) |
|---|---|---|---|---|
| 1º ESO | 260 | 184 | 74 | 2 |
| 2º ESO | 260 | 184 | 74 | 2 |
| 3º ESO | 260 | 186 | 72 | 2 |
| 4º ESO | 260 | 182 | 75 | 3 |

**Buena noticia**: no hay letra Ñ en francés (los 4 cursos vienen con 26 letras), `type=contiene` está bien aplicado en U/W/X/Y/Z y no se detectan duplicados ni soluciones rotas.

**Diagnóstico general crítico (afecta a los 4 cursos):**

1. **No hay progresión entre cursos.** El léxico de 4º ESO es prácticamente el mismo que el de 1º ESO (`ami`, `école`, `hiver`, `homme`, `gâteau`, `gare`, `bateau`…). De B1/B2 (4º ESO) hay un puñado de palabras y la mayoría son A1 estirado. Esto **invalida la diferenciación de cursos** del rosco de francés.
2. **Los `difficulty=3` existentes no son difíciles**, solo largos: `informatique`, `mathématiques`, `bibliothèque`, `anniversaire`, `environnement`, `gouvernement`. Reclasifico los que claramente no son B1.
3. **Distribución colapsada en `1`**, idéntica al patrón de inglés. Se necesita una redistribución masiva.
4. **2 errores ortográficos** detectados (1º ESO).
5. **Estilo de definiciones inconsistente** entre cursos: 1º/2º/4º usan "X en francés." mientras 3º usa definiciones contextuales más educativas. No es bug, pero se nota.

Aplico el mismo criterio MCER que en inglés:
- 1º ESO → A1 mayoritario
- 2º ESO → A1/A2
- 3º ESO → A2/B1
- 4º ESO → B1/B2

A medio plazo recomiendo **insertar léxico B1/B2 nuevo** en 3º y 4º (no incluido en este SQL — sería una segunda fase de creación, no de revisión).

---

## 1º ESO (`grades=[1]`, 260 entradas)

### 🔴 Errores ortográficos

| id | actual | corregido |
|---|---|---|
| 19314 | `vetements` | `vêtements` (lleva circunflejo) |
| 19186 | `iglou` | `igloo` (forma estándar; `iglou` es minoritaria) |

### 🟠 Reclasificación de `difficulty`

**Bajar `3 → 2`** (los dos "difíciles" no son B1+):

| id | palabra | motivo |
|---|---|---|
| 19179 | informatique | A2 técnico, no B1 |
| 19226 | mathématiques | A1 escolar, sólo es largo |

**Bajar `2 → 1`** (A1 puro: meses, días, familia, asignaturas, casa, comida, animales):

19103 (adresse), 19102 (anglais), 19100 (au revoir), 19107 (bonjour), 19115 (bonsoir), 19121 (cartable), 19126 (couleurs), 19125 (cuisine), 19133 (décembre), 19127 (dimanche), 19140 (écouter), 19142 (éléphant), 19143 (espagnol), 19147 (famille), 19154 (fenêtre), 19152 (février), 19156 (football), 19153 (français), 19149 (fromage), 19166 (grand-mère), 19165 (grand-père), 19170 (habiter), 19174 (histoire), 19181 (insecte), 19192 (janvier), 19194 (juillet), 19223 (mercredi), 19225 (musique), 19235 (novembre), 19242 (octobre), 19243 (ordinateur), 19241 (oreille), 19250 (pantalon), 19256 (piscine), 19251 (poisson), 19252 (professeur), 19265 (question), 19269 (regarder), 19276 (restaurant), 19281 (serpent), 19296 (télévision), 19315 (vacances), 19310 (vendredi), 19309 (voiture)

**Subir `1 → 2`**:

19186 (iglou/igloo — palabra rara), 19202 (képi — léxico militar específico), 19236 (nord — puntos cardinales A2), 19345 (royal — adjetivo A2)

---

## 2º ESO (`grades=[2]`, 260 entradas)

### 🟠 Reclasificación de `difficulty`

**Bajar `3 → 2`** (anniversaire es A1, no B1):

| id | palabra |
|---|---|
| 19357 | anniversaire |

(Mantengo `bibliothèque` 19373 en `3` provisionalmente para no dejar el curso a cero — es A2/B1.)

**Bajar `2 → 1`** (A1 puro):

19358 (après-midi), 19362 (aujourd'hui), 19365 (automne), 19369 (beaucoup), 19383 (chambre), 19384 (chanson), 19385 (chanter), 19386 (chemise), 19388 (déjeuner), 19395 (dimanche), 19399 (écouter), 19409 (famille), 19412 (fenêtre), 19427 (habiter), 19430 (hôpital), 19441 (important), 19501 (ordinateur), 19502 (oreille), 19508 (pantalon), 19515 (piscine), 19533 (restaurant), 19543 (semaine), 19544 (serpent), 19548 (tableau), 19551 (téléphone), 19567 (vacances)

**Subir `2 → 3`** (los más complejos del slice — para construir bloque difícil A2/B1):

19392 (derrière — preposición compleja), 19403 (ensemble — adverbio abstracto), 19473 (lentement — adverbio en `-ment`), 19488 (naissance — abstracto), 19495 (nouveau — concordancia compleja), 19503 (oublier — verbo abstracto), 19523 (quitter — verbo abstracto)

---

## 3º ESO (`grades=[3]`, 260 entradas)

Definiciones notablemente mejor escritas (más contextuales y educativas — no dan la respuesta directa). Mantener este estilo como referencia para futuras revisiones.

### 🟠 Reclasificación de `difficulty`

**Bajar `3 → 2`** (mismo motivo: no es B1):

| id | palabra |
|---|---|
| 19703 | informatique |
| 19635 | bibliothèque (mantener en 3 → ver más abajo) |

(Decisión final: mantengo `bibliothèque` en 3 para no eliminar el único difícil; bajo `informatique`.)

**Bajar `2 → 1`** (A1 escolar puro en un curso A2/B1):

19623 (après-midi), 19628 (bonjour), 19642 (chanson), 19643 (chapeau), 19644 (chaussure), 19649 (dimanche), 19655 (difficile), 19658 (écouter), 19664 (éléphant), 19662 (étudiant), 19668 (famille), 19672 (fenêtre), 19675 (football), 19674 (fromage), 19683 (grand-mère), 19696 (hamster), 19695 (histoire), 19693 (hôpital), 19706 (important), 19704 (infirmier), 19700 (intelligent), 19719 (kangourou), 19721 (kiosque), 19734 (lunettes), 19746 (médecin), 19745 (musique), 19754 (nouveau), 19756 (novembre), 19762 (octobre), 19763 (ordinateur), 19761 (oreille), 19775 (pantalon), 19773 (piscine), 19785 (question), 19788 (regarder), 19794 (restaurant), 19801 (semaine), 19811 (téléphone), 19814 (travail)

**Subir `2 → 3`** (B1 razonable):

19699 (invitation — sustantivo abstracto B1), 19701 (intéressant — adjetivo abstracto B1), 19823 (uniforme — A2/B1), 19825 (ustensile — B1 técnico), 19852 (exemple — abstracto B1), 19866 (symbole — B1)

### 🟡 Definición confusa

| id | actual | propuesta |
|---|---|---|
| 19714 | `Parte de la pierna (en francés incluye toda la extremidad inferior).` | `Extremidad inferior usada para andar.` (la actual da una pista en francés que despista) |

---

## 4º ESO (`grades=[4]`, 260 entradas)

**Es el curso con el desfase más grave**: léxico A1 puro presentado como B1/B2.

### 🟠 Reclasificación de `difficulty`

**Bajar `3 → 2`**:

| id | palabra |
|---|---|
| 19962 | informatique (no es B2) |

(Mantengo `environnement` 19917 y `gouvernement` 19938 en 3 — sí son B1/B2 sólido.)

**Bajar `2 → 1`** (A1 puro):

19881 (acheter), 19883 (adresse), 19877 (aéroport), 19886 (appeler), 19895 (boisson), 19910 (déjeuner), 19912 (devoirs), 19911 (drapeau), 19926 (écouter), 19920 (envoyer), 19925 (étudiant), 19927 (famille), 19929 (fenêtre), 19947 (histoire), 19950 (hôpital), 19954 (horloge), 19963 (important), 19959 (infirmier), 19967 (journal), 19987 (liberté), 19991 (lumière), 19992 (lunettes), 19998 (magasin), 20017 (ordinateur), 20023 (oreille), 20024 (oublier), 20063 (semaine), 20075 (téléphone), 20076 (télévision), 20067 (travail), 20084 (uniforme), 20088 (vacances), 20092 (vêtement), 20090 (voiture)

**Subir `2 → 3`** (B1/B2 reales — para crear bloque difícil sustancial):

19897 (carrefour), 19905 (carrière), 19916 (découvrir), 19919 (étranger), 19958 (immeuble), 19960 (incendie), 20069 (théâtre), 19891 (boulangerie), 19892 (blessure), 19893 (banlieue), 19979 (kiosque — B1 en este curso), 19999 (montagne — A2 alto), 19978 (kangourou — léxico marginal), 19965 (imperméable)

---

## Resumen de cambios

| Curso | Δ ortografía | Δ 2→1 | Δ 1→2 | Δ 2→3 | Δ 3→2 | Δ definiciones |
|---|---|---|---|---|---|---|
| 1º | 2 | 44 | 4 | 0 | 2 | 0 |
| 2º | 0 | 26 | 0 | 7 | 1 | 0 |
| 3º | 0 | 39 | 0 | 6 | 1 | 1 |
| 4º | 0 | 34 | 0 | 14 | 1 | 0 |

**Total**: ~180 cambios sobre 1.040 preguntas.

## TODO de creación (no incluido en este SQL)

La asignatura de francés necesita una **fase de creación de vocabulario nuevo** en 3º y 4º ESO. La revisión actual solo redistribuye lo existente. Sería conveniente añadir:

- **3º ESO** (~30 palabras A2/B1 nuevas): `accueillir, ailleurs, atteindre, autrefois, avenir, bouger, changement, choix, croire, défendre, échanger, espoir, événement, expérience, façon, frontière, métier, peut-être, permettre, pourtant, projet, raison, réussir, sentir, sortir, suivre, tâche, tellement, vérité, volonté…`
- **4º ESO** (~30 palabras B1/B2 nuevas): `accroître, aboutir, s'agir, ambiguïté, attentivement, citoyen, compétence, concurrent, davantage, déchet, désormais, durable, échec, enjeu, environ, étape, exiger, faille, gaspillage, gouvernance, hasard, malgré, néanmoins, parcours, paysage, pénurie, plutôt, ressource, témoigner, urbain…`

Si quieres, en otra iteración generamos los `INSERT` con definiciones MCER + `type` + `letter` adecuados.

---

SQL listo en [eso-frances.sql](eso-frances.sql). **No se aplica nada hasta tu visto bueno.**
