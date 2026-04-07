-- =====================================================================
-- Revisión rosco · ESO · Francés · 1º a 4º ESO
-- Generado por revisión manual. NO ejecutar sin revisar el .md adjunto.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1º ESO
-- =====================================================================

-- 1) Errores ortográficos
UPDATE rosco_questions
SET solution = 'vêtements',
    definition = 'Ropa (plural) en francés.'
WHERE id = 19314;

UPDATE rosco_questions
SET solution = 'igloo',
    definition = 'Casa de hielo de los inuit.'
WHERE id = 19186;

-- 2) Bajar de 3 → 2 (los "difíciles" no son B1)
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  19179, -- informatique
  19226  -- mathématiques
);

-- 3) Bajar de 2 → 1 (A1 puro)
UPDATE rosco_questions SET difficulty = 1 WHERE id IN (
  19103, -- adresse
  19102, -- anglais
  19100, -- au revoir
  19107, -- bonjour
  19115, -- bonsoir
  19121, -- cartable
  19126, -- couleurs
  19125, -- cuisine
  19133, -- décembre
  19127, -- dimanche
  19140, -- écouter
  19142, -- éléphant
  19143, -- espagnol
  19147, -- famille
  19154, -- fenêtre
  19152, -- février
  19156, -- football
  19153, -- français
  19149, -- fromage
  19166, -- grand-mère
  19165, -- grand-père
  19170, -- habiter
  19174, -- histoire
  19181, -- insecte
  19192, -- janvier
  19194, -- juillet
  19223, -- mercredi
  19225, -- musique
  19235, -- novembre
  19242, -- octobre
  19243, -- ordinateur
  19241, -- oreille
  19250, -- pantalon
  19256, -- piscine
  19251, -- poisson
  19252, -- professeur
  19265, -- question
  19269, -- regarder
  19276, -- restaurant
  19281, -- serpent
  19296, -- télévision
  19315, -- vacances
  19310, -- vendredi
  19309  -- voiture
);

-- 4) Subir de 1 → 2 (palabras menos comunes)
UPDATE rosco_questions SET difficulty = 2 WHERE id IN (
  19186, -- igloo (palabra rara)
  19202, -- képi (léxico militar)
  19236, -- nord (puntos cardinales A2)
  19345  -- royal (adjetivo A2)
);

-- =====================================================================
-- 2º ESO
-- =====================================================================

-- Bajar de 3 → 2 (anniversaire es A1, no B1)
UPDATE rosco_questions SET difficulty = 2 WHERE id = 19357; -- anniversaire

-- Bajar de 2 → 1 (A1 puro)
UPDATE rosco_questions SET difficulty = 1 WHERE id IN (
  19358, -- après-midi
  19362, -- aujourd'hui
  19365, -- automne
  19369, -- beaucoup
  19383, -- chambre
  19384, -- chanson
  19385, -- chanter
  19386, -- chemise
  19388, -- déjeuner
  19395, -- dimanche
  19399, -- écouter
  19409, -- famille
  19412, -- fenêtre
  19427, -- habiter
  19430, -- hôpital
  19441, -- important
  19501, -- ordinateur
  19502, -- oreille
  19508, -- pantalon
  19515, -- piscine
  19533, -- restaurant
  19543, -- semaine
  19544, -- serpent
  19548, -- tableau
  19551, -- téléphone
  19567  -- vacances
);

-- Subir de 2 → 3 (bloque difícil A2/B1)
UPDATE rosco_questions SET difficulty = 3 WHERE id IN (
  19392, -- derrière
  19403, -- ensemble
  19473, -- lentement
  19488, -- naissance
  19495, -- nouveau
  19503, -- oublier
  19523  -- quitter
);

-- =====================================================================
-- 3º ESO
-- =====================================================================

-- Bajar de 3 → 2
UPDATE rosco_questions SET difficulty = 2 WHERE id = 19703; -- informatique

-- Bajar de 2 → 1 (A1 puro)
UPDATE rosco_questions SET difficulty = 1 WHERE id IN (
  19623, -- après-midi
  19628, -- bonjour
  19642, -- chanson
  19643, -- chapeau
  19644, -- chaussure
  19649, -- dimanche
  19655, -- difficile
  19658, -- écouter
  19664, -- éléphant
  19662, -- étudiant
  19668, -- famille
  19672, -- fenêtre
  19675, -- football
  19674, -- fromage
  19683, -- grand-mère
  19696, -- hamster
  19695, -- histoire
  19693, -- hôpital
  19706, -- important
  19704, -- infirmier
  19700, -- intelligent
  19719, -- kangourou
  19721, -- kiosque
  19734, -- lunettes
  19746, -- médecin
  19745, -- musique
  19754, -- nouveau
  19756, -- novembre
  19762, -- octobre
  19763, -- ordinateur
  19761, -- oreille
  19775, -- pantalon
  19773, -- piscine
  19785, -- question
  19788, -- regarder
  19794, -- restaurant
  19801, -- semaine
  19811, -- téléphone
  19814  -- travail
);

-- Subir de 2 → 3 (B1 razonable)
UPDATE rosco_questions SET difficulty = 3 WHERE id IN (
  19699, -- invitation
  19701, -- intéressant
  19823, -- uniforme
  19825, -- ustensile
  19852, -- exemple
  19866  -- symbole
);

-- Definición confusa
UPDATE rosco_questions
SET definition = 'Extremidad inferior usada para andar.'
WHERE id = 19714; -- jambe

-- =====================================================================
-- 4º ESO
-- =====================================================================

-- Bajar de 3 → 2
UPDATE rosco_questions SET difficulty = 2 WHERE id = 19962; -- informatique

-- Bajar de 2 → 1 (A1 puro en un curso B1/B2)
UPDATE rosco_questions SET difficulty = 1 WHERE id IN (
  19881, -- acheter
  19883, -- adresse
  19877, -- aéroport
  19886, -- appeler
  19895, -- boisson
  19910, -- déjeuner
  19912, -- devoirs
  19911, -- drapeau
  19926, -- écouter
  19920, -- envoyer
  19925, -- étudiant
  19927, -- famille
  19929, -- fenêtre
  19947, -- histoire
  19950, -- hôpital
  19954, -- horloge
  19963, -- important
  19959, -- infirmier
  19967, -- journal
  19987, -- liberté
  19991, -- lumière
  19992, -- lunettes
  19998, -- magasin
  20017, -- ordinateur
  20023, -- oreille
  20024, -- oublier
  20063, -- semaine
  20075, -- téléphone
  20076, -- télévision
  20067, -- travail
  20084, -- uniforme
  20088, -- vacances
  20092, -- vêtement
  20090  -- voiture
);

-- Subir de 2 → 3 (B1/B2 reales)
UPDATE rosco_questions SET difficulty = 3 WHERE id IN (
  19897, -- carrefour
  19905, -- carrière
  19916, -- découvrir
  19919, -- étranger
  19958, -- immeuble
  19960, -- incendie
  20069, -- théâtre
  19891, -- boulangerie
  19892, -- blessure
  19893, -- banlieue
  19979, -- kiosque
  19999, -- montagne
  19978, -- kangourou
  19965  -- imperméable
);

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
