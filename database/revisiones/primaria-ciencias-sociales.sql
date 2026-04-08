-- =====================================================================
-- Revisión rosco · Primaria · Ciencias Sociales · 1º a 6º
-- 3 deletes + 38 updates.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 2º
-- =====================================================================
DELETE FROM rosco_questions WHERE id = 11123; -- web duplicado

UPDATE rosco_questions SET definition = 'Persona que orienta o conduce a otros.' WHERE id = 11038; -- guía
UPDATE rosco_questions SET definition = 'Hijo de los mismos padres.' WHERE id = 11043; -- hermano
UPDATE rosco_questions SET definition = 'El planeta Tierra y todo lo que hay en él.' WHERE id = 11067; -- mundo
UPDATE rosco_questions SET definition = 'Localidad pequeña con pocos habitantes.' WHERE id = 11084; -- pueblo
UPDATE rosco_questions SET definition = 'Vehículo de transporte que circula sobre raíles.' WHERE id = 11107; -- tren
UPDATE rosco_questions SET definition = 'Grupo organizado de personas o cosas.' WHERE id = 11113; -- unidad
UPDATE rosco_questions SET definition = 'Acción de elegir en unas elecciones.' WHERE id = 11118; -- voto

-- =====================================================================
-- 3º
-- =====================================================================
DELETE FROM rosco_questions WHERE id = 11192; -- pueblo letra K (no contiene K)

UPDATE rosco_questions SET definition = 'Localidad pequeña habitada por personas.' WHERE id = 11222; -- pueblo
UPDATE rosco_questions SET definition = 'Sector económico terciario, ofrece atención sin producir bienes.' WHERE id = 11236; -- servicios
UPDATE rosco_questions SET definition = 'Edificio donde se representan obras dramáticas.' WHERE id = 11243; -- teatro
UPDATE rosco_questions SET definition = 'Montaña por la que sale magma del interior de la Tierra.' WHERE id = 11253; -- volcán
UPDATE rosco_questions SET definition = 'Costa con arena junto al mar (contiene Y).' WHERE id = 11265; -- playa

-- =====================================================================
-- 4º
-- =====================================================================
UPDATE rosco_questions SET definition = 'Terreno rural con propietario, dedicado al cultivo o ganado.' WHERE id = 11302; -- finca
UPDATE rosco_questions SET definition = 'Adjetivo: de poco tamaño, opuesto a grande (contiene Q).' WHERE id = 11360; -- pequeño
UPDATE rosco_questions SET definition = 'Capital de Estados Unidos (contiene W).' WHERE id = 11392; -- washington
UPDATE rosco_questions SET definition = 'Grupo de personas unidas por parentesco (contiene Y).' WHERE id = 11401; -- familia
UPDATE rosco_questions SET definition = 'Zona de arena junto al mar (contiene Y).' WHERE id = 11402; -- playa

-- =====================================================================
-- 5º · Anotaciones internas + autorrefs
-- =====================================================================
UPDATE rosco_questions SET definition = 'Antigua moneda de Francia, anterior al euro.' WHERE id = 11443; -- franco
UPDATE rosco_questions SET definition = 'Porción de tierra rodeada de agua por todas partes.' WHERE id = 11460; -- isla
UPDATE rosco_questions SET definition = 'Planeta más grande del sistema solar.' WHERE id = 11468; -- júpiter
UPDATE rosco_questions SET definition = 'Recipiente para depositar votos en unas elecciones.' WHERE id = 11533; -- urna
UPDATE rosco_questions SET definition = 'Séptimo planeta del sistema solar.' WHERE id = 11534; -- urano
UPDATE rosco_questions SET definition = 'Terreno bajo entre dos montañas.' WHERE id = 11539; -- valle
UPDATE rosco_questions SET definition = 'Unidad de potencia eléctrica (contiene W).' WHERE id = 11544; -- vatio
UPDATE rosco_questions SET definition = 'Grupo organizado de personas con un objetivo común.' WHERE id = 11409; -- asociación
UPDATE rosco_questions SET definition = 'Capa de agua subterránea que se acumula entre las rocas.' WHERE id = 11413; -- acuífero
UPDATE rosco_questions SET definition = 'Pueblo o ciudad gobernada por un ayuntamiento.' WHERE id = 11484; -- municipio
UPDATE rosco_questions SET definition = 'Aparato mecánico que realiza un trabajo (contiene Q).' WHERE id = 11514; -- máquina
UPDATE rosco_questions SET definition = 'Cantidad básica que se toma como referencia.' WHERE id = 11535; -- unidad
UPDATE rosco_questions SET definition = 'Líneas de referencia del plano cartesiano (contiene X).' WHERE id = 11551; -- ejes

-- =====================================================================
-- 6º
-- =====================================================================
DELETE FROM rosco_questions WHERE id = 11617; -- 'unión' letra J (no contiene J)

UPDATE rosco_questions SET definition = 'Persona propietaria de algo (contiene Ñ).' WHERE id = 11642; -- dueño
UPDATE rosco_questions SET definition = 'Terreno llano dedicado al cultivo (contiene Ñ).' WHERE id = 11643; -- campiña
UPDATE rosco_questions SET definition = 'Casa rústica pequeña, hecha de troncos o piedra (contiene Ñ).' WHERE id = 11645; -- cabaña
UPDATE rosco_questions SET definition = 'Acción de tomar un territorio por parte de un ejército extranjero.' WHERE id = 11650; -- ocupación
UPDATE rosco_questions SET definition = 'Movimiento cultural y artístico de los siglos XV y XVI.' WHERE id = 11666; -- renacimiento
UPDATE rosco_questions SET definition = 'Tipo de energía obtenida del Sol.' WHERE id = 11673; -- solar
UPDATE rosco_questions SET definition = 'Actividad de capturar animales salvajes (contiene Z).' WHERE id = 11711; -- caza

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
