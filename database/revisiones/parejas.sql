-- =====================================================================
-- Revisión Parejas Items · 95 cambios
-- 5 deletes + 90 updates (89 reescrituras de term_a + 1 trim)
-- =====================================================================

BEGIN;

-- =====================================================================
-- DELETES
-- =====================================================================

DELETE FROM parejas_items WHERE id IN (
  166,  -- 👮 ↔ 👮‍ (caracter zero-width invisible, duplica con 165)
  384,  -- Fromage ↔ Queso duplica con 378
  1671, -- Salut duplica con 312
  1673, -- S'il vous plaît duplica con 314
  1668  -- Bonjour ↔ Buenos días duplica concepto con 311
);

-- =====================================================================
-- UPDATES · 89 parejas con term_a == term_b
-- Reescribir term_a con el texto descriptivo
-- =====================================================================

-- ESO Ed.Física (deportes)
UPDATE parejas_items SET term_a = 'Fútbol'           WHERE id = 1476;
UPDATE parejas_items SET term_a = 'Baloncesto'       WHERE id = 1477;
UPDATE parejas_items SET term_a = 'Tenis'            WHERE id = 1478;
UPDATE parejas_items SET term_a = 'Natación'         WHERE id = 1479;
UPDATE parejas_items SET term_a = 'Ciclismo'         WHERE id = 1480;
UPDATE parejas_items SET term_a = 'Voleibol'         WHERE id = 1481;
UPDATE parejas_items SET term_a = 'Tenis de mesa'    WHERE id = 1482;
UPDATE parejas_items SET term_a = 'Judo'             WHERE id = 1483;
UPDATE parejas_items SET term_a = 'Portería'         WHERE id = 1484;
UPDATE parejas_items SET term_a = 'Zapatilla'        WHERE id = 1485;
UPDATE parejas_items SET term_a = 'Cronómetro'       WHERE id = 1486;
UPDATE parejas_items SET term_a = 'Medalla de oro'   WHERE id = 1487;

-- ESO Música (instrumentos)
UPDATE parejas_items SET term_a = 'Piano'            WHERE id = 2358;
UPDATE parejas_items SET term_a = 'Guitarra'         WHERE id = 2359;
UPDATE parejas_items SET term_a = 'Violín'           WHERE id = 2360;
UPDATE parejas_items SET term_a = 'Batería'          WHERE id = 2361;
UPDATE parejas_items SET term_a = 'Saxofón'          WHERE id = 2362;
UPDATE parejas_items SET term_a = 'Trompeta'         WHERE id = 2363;
UPDATE parejas_items SET term_a = 'Partitura'        WHERE id = 2364;
UPDATE parejas_items SET term_a = 'Micrófono'        WHERE id = 2365;
UPDATE parejas_items SET term_a = 'Auriculares'      WHERE id = 2366;
UPDATE parejas_items SET term_a = 'Nota musical'     WHERE id = 2367;
UPDATE parejas_items SET term_a = 'Radio'            WHERE id = 2368;
UPDATE parejas_items SET term_a = 'Flauta'           WHERE id = 2369;

-- ESO Plástica (arte)
UPDATE parejas_items SET term_a = 'Paleta de colores' WHERE id = 2370;
UPDATE parejas_items SET term_a = 'Pincel'            WHERE id = 2371;
UPDATE parejas_items SET term_a = 'Cera'              WHERE id = 2372;
UPDATE parejas_items SET term_a = 'Cuadro'            WHERE id = 2373;
UPDATE parejas_items SET term_a = 'Máscara'           WHERE id = 2374;
UPDATE parejas_items SET term_a = 'Lápiz'             WHERE id = 2375;
UPDATE parejas_items SET term_a = 'Escuadra'          WHERE id = 2376;
UPDATE parejas_items SET term_a = 'Tijeras'           WHERE id = 2377;
UPDATE parejas_items SET term_a = 'Cámara'            WHERE id = 2378;
UPDATE parejas_items SET term_a = 'Ladrillo'          WHERE id = 2379;
UPDATE parejas_items SET term_a = 'Hilo'              WHERE id = 2380;
UPDATE parejas_items SET term_a = 'Cerámica'          WHERE id = 2381;

-- ESO Tecnología (tech)
UPDATE parejas_items SET term_a = 'Ordenador'         WHERE id = 2532;
UPDATE parejas_items SET term_a = 'Robot'             WHERE id = 2533;
UPDATE parejas_items SET term_a = 'Engranaje'         WHERE id = 2534;
UPDATE parejas_items SET term_a = 'Llave inglesa'     WHERE id = 2535;
UPDATE parejas_items SET term_a = 'Martillo'          WHERE id = 2536;
UPDATE parejas_items SET term_a = 'Enchufe'           WHERE id = 2537;
UPDATE parejas_items SET term_a = 'Antena'            WHERE id = 2538;
UPDATE parejas_items SET term_a = 'Cohete'            WHERE id = 2539;
UPDATE parejas_items SET term_a = 'Ratón'             WHERE id = 2540;
UPDATE parejas_items SET term_a = 'Teclado'           WHERE id = 2541;
UPDATE parejas_items SET term_a = 'Móvil'             WHERE id = 2542;
UPDATE parejas_items SET term_a = 'Construcción'      WHERE id = 2543;

-- ESO Tutoría (emociones)
UPDATE parejas_items SET term_a = 'Alegría'           WHERE id = 2574;
UPDATE parejas_items SET term_a = 'Tristeza'          WHERE id = 2575;
UPDATE parejas_items SET term_a = 'Enfado'            WHERE id = 2576;
UPDATE parejas_items SET term_a = 'Miedo'             WHERE id = 2577;
UPDATE parejas_items SET term_a = 'Amor'              WHERE id = 2578;
UPDATE parejas_items SET term_a = 'Sueño'             WHERE id = 2579;
UPDATE parejas_items SET term_a = 'Pensar'            WHERE id = 2580;
UPDATE parejas_items SET term_a = 'Confianza'         WHERE id = 2581;
UPDATE parejas_items SET term_a = 'Enfermo'           WHERE id = 2582;
UPDATE parejas_items SET term_a = 'Celebración'       WHERE id = 2583;
UPDATE parejas_items SET term_a = 'Silencio'          WHERE id = 2584;
UPDATE parejas_items SET term_a = 'Acuerdo'           WHERE id = 2585;

-- Primaria CCSS 1º (24)
UPDATE parejas_items SET term_a = 'Familia'           WHERE id = 161;
UPDATE parejas_items SET term_a = 'Casa'              WHERE id = 162;
UPDATE parejas_items SET term_a = 'Colegio'           WHERE id = 163;
UPDATE parejas_items SET term_a = 'Hospital'          WHERE id = 164;
UPDATE parejas_items SET term_a = 'Policía'           WHERE id = 165;
UPDATE parejas_items SET term_a = 'Maestra'           WHERE id = 167;
UPDATE parejas_items SET term_a = 'Médico'            WHERE id = 168;
UPDATE parejas_items SET term_a = 'Coche'             WHERE id = 169;
UPDATE parejas_items SET term_a = 'Autobús'           WHERE id = 170;
UPDATE parejas_items SET term_a = 'Tren'              WHERE id = 171;
UPDATE parejas_items SET term_a = 'Avión'             WHERE id = 172;
UPDATE parejas_items SET term_a = 'Barco'             WHERE id = 173;
UPDATE parejas_items SET term_a = 'Semáforo'          WHERE id = 174;
UPDATE parejas_items SET term_a = 'Tierra'            WHERE id = 175;
UPDATE parejas_items SET term_a = 'Mundo'             WHERE id = 176;
UPDATE parejas_items SET term_a = 'Sol'               WHERE id = 177;
UPDATE parejas_items SET term_a = 'Luna'              WHERE id = 178;
UPDATE parejas_items SET term_a = 'Arcoíris'          WHERE id = 179;
UPDATE parejas_items SET term_a = 'Bandera'           WHERE id = 180;
UPDATE parejas_items SET term_a = 'Iglesia'           WHERE id = 181;
UPDATE parejas_items SET term_a = 'Árbol'             WHERE id = 182;
UPDATE parejas_items SET term_a = 'Dinero'            WHERE id = 183;
UPDATE parejas_items SET term_a = 'Reloj'             WHERE id = 184;
UPDATE parejas_items SET term_a = 'Reciclar'          WHERE id = 185;

-- Casos sueltos (term_a == term_b sin emoji)
UPDATE parejas_items SET term_b = 'Instrument à clavier' WHERE id = 427;  -- frances Piano
UPDATE parejas_items SET term_b = 'Place where sick people are treated' WHERE id = 525; -- ingles Hospital
UPDATE parejas_items SET term_b = 'Lloc on viu una família' WHERE id = 1229; -- valencia Casa
UPDATE parejas_items SET term_b = 'Fruita dolça i sucosa' WHERE id = 1242; -- valencia Pera
UPDATE parejas_items SET term_b = 'Verb: descansar a la nit' WHERE id = 1263; -- valencia Dormir

-- Trim espacio al final (id 2020 inglés)
UPDATE parejas_items SET term_b = TRIM(term_b) WHERE id = 2020;

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
