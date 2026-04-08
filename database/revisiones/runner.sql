-- =====================================================================
-- Revisión Runner Categories · 10 updates
-- Deduplica words dentro de las categorías afectadas.
-- =====================================================================

BEGIN;

UPDATE runner_categories SET words='["hormiga","mosca","abeja","mariposa","grillo","mosquito","escarabajo","libélula","avispa","saltamontes","oruga","mariquita","termita","mantis","chinche","luciérnaga","cucaracha","polilla","pulgón","tábano","abejorro","cigarra","efímera"]'::jsonb WHERE id=8;
UPDATE runner_categories SET words='["Tajo","Duero","Guadiana","Guadalquivir","Miño","Tambre","Ulla","Guadalete","Tinto","Odiel","Umia","Lérez","Sil","Águeda","Tormes","Alagón","Zújar","Jabalón","Guadiato","Genil","Guadiana Menor","Chanza","Adaja"]'::jsonb WHERE id=50;
UPDATE runner_categories SET words='["Danubio","Rin","Volga","Sena","Támesis","Loira","Elba","Po","Vístula","Tíber","Dniéper","Don","Ural","Ródano","Garona","Óder","Mosa","Maritza","Dniéster","Duero","Tajo","Ebro","Gualdalquivir","Petchora"]'::jsonb WHERE id=57;
UPDATE runner_categories SET words='["manteau","écharpe","gants","bonnet","bottes","pull","veste","pantalon d''hiver","chaussettes laine","blouson","anorak","doudoune","imperméable","gilet","bottines","moufles","cache-nez","parka","survêtement","collants","cache-oreilles","polaire","hautes bottes","cape"]'::jsonb WHERE id=86;
UPDATE runner_categories SET words='["recta","curva","ondulada","quebrada","espiral","paralela","secante","perpendicular","vertical","horizontal","segmento","semirrecta","diagonal","arco","radio","diámetro","tangente","punto","extremo"]'::jsonb WHERE id=155;
UPDATE runner_categories SET words='["suma","resta","multiplicación","división","doble","triple","mitad","tercio","total","producto","cociente","resto","factor","sumando","minuendo","sustraendo","resultado","cálculo","estimación","operación","cifra","llevada","par","impar"]'::jsonb WHERE id=157;
UPDATE runner_categories SET words='["agudo","recto","obtuso","llano","completo","nulo","cóncavo","convexo","adyacente","opuesto","consecutivo","suplementario","complementario","exterior","interior","central","inscrito"]'::jsonb WHERE id=158;
UPDATE runner_categories SET words='["centro","radio","diámetro","cuerda","arco","semicírculo","sector","tangente","secante","circunferencia","corona circular","segmento circular","punto central","perímetro del círculo","superficie","pi","compás","elipse","curva plana"]'::jsonb WHERE id=162;
UPDATE runner_categories SET words='["alegría","felicidad","calma","amor","ilusión","sorpresa","diversión","orgullo","cariño","ternura","alivio","satisfacción","entusiasmo","asombro","gozo","esperanza","tranquilidad","seguridad","bienestar","placer","paz interior","euforia","curiosidad","ánimo"]'::jsonb WHERE id=200;
UPDATE runner_categories SET words='["primer","després","finalment","també","però","perquè","encara que","aleshores","a més","per tant","d''altra banda","en resum","per contra","malgrat tot","atés que","puix que","així mateix","en conclusió","per contrapartida"]'::jsonb WHERE id=252;

-- COMMIT;  -- descomenta tras revisar
ROLLBACK;
