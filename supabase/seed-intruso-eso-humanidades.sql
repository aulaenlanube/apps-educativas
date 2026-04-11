-- ============================================================
-- SEED: INTRUSO SETS — ESO (Humanidades e Idiomas)
-- ============================================================
-- Asignaturas: lengua, historia, economia, latin, frances, ingles, valenciano
-- Formato: cada set = 13-15 correctos + 7 intrusos (no pertenecen)
-- Items en minusculas sin acentos; apostrofos escapados con ''
-- ============================================================

-- ============================================================
-- LENGUA (ESO 1-4)
-- ============================================================

-- Lengua 1 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('lengua', 'eso', '{1}', 'Tipos de sustantivos',
 '["comun","propio","concreto","abstracto","individual","colectivo","contable","incontable","animado","inanimado","masculino","femenino","simple","compuesto"]'::jsonb,
 '["transitivo","intransitivo","copulativo","auxiliar","irregular","defectivo","reflexivo"]'::jsonb),

('lengua', 'eso', '{1}', 'Tipos de acentuacion',
 '["aguda","llana","esdrujula","sobreesdrujula","tilde diacritica","hiato","diptongo","triptongo","silaba tonica","silaba atona","acento prosodico","acento ortografico","monosilabo","palabra compuesta"]'::jsonb,
 '["sujeto","predicado","verbo","adjetivo","oracion","parrafo","texto"]'::jsonb),

('lengua', 'eso', '{1}', 'Elementos de la comunicacion',
 '["emisor","receptor","mensaje","canal","codigo","contexto","referente","ruido","retroalimentacion","situacion","signo","significante","significado","interlocutor"]'::jsonb,
 '["metafora","simil","rima","verso","estrofa","hiperbole","personificacion"]'::jsonb);

-- Lengua 2 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('lengua', 'eso', '{2}', 'Tipos de narrador',
 '["narrador omnisciente","narrador protagonista","narrador testigo","narrador en primera persona","narrador en tercera persona","narrador equisciente","narrador observador","narrador autodiegetico","narrador heterodiegetico","narrador homodiegetico","voz narrativa","punto de vista","perspectiva","focalizacion"]'::jsonb,
 '["metafora","hiperbole","rima asonante","verso alejandrino","soneto","oda","elegia"]'::jsonb),

('lengua', 'eso', '{2}', 'Tipos de sintagmas',
 '["sintagma nominal","sintagma verbal","sintagma adjetival","sintagma adverbial","sintagma preposicional","nucleo","determinante","modificador","complemento","aposicion","especificador","expansion","adyacente","termino"]'::jsonb,
 '["acento agudo","diptongo","hiato","silaba tonica","tilde","punto","coma"]'::jsonb),

('lengua', 'eso', '{2}', 'Subgeneros narrativos',
 '["cuento","novela","leyenda","mito","fabula","epopeya","cantar de gesta","romance","microrrelato","novela policiaca","novela historica","novela de aventuras","novela realista","novela fantastica"]'::jsonb,
 '["soneto","oda","elegia","egloga","haiku","madrigal","letrilla"]'::jsonb);

-- Lengua 3 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('lengua', 'eso', '{3}', 'Autores del Romanticismo espanol',
 '["jose de espronceda","gustavo adolfo becquer","rosalia de castro","mariano jose de larra","jose zorrilla","duque de rivas","enrique gil y carrasco","carolina coronado","jose cadalso","antonio garcia gutierrez","juan arolas","nicomedes pastor diaz","gertrudis gomez de avellaneda","ramon de mesonero romanos"]'::jsonb,
 '["federico garcia lorca","antonio machado","miguel de unamuno","pio baroja","rafael alberti","luis cernuda","camilo jose cela"]'::jsonb),

('lengua', 'eso', '{3}', 'Caracteristicas de la novela realista',
 '["observacion de la realidad","narrador omnisciente","descripciones detalladas","personajes verosimiles","ambientes cotidianos","critica social","lenguaje objetivo","tematica contemporanea","psicologia del personaje","retrato de costumbres","conflicto social","burguesia como tema","entorno urbano","determinismo social"]'::jsonb,
 '["metrica alejandrina","rima consonante","verso libre","hiperbole","metafora cosmica","simbolismo hermetico","irracionalismo"]'::jsonb);

-- Lengua 4 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('lengua', 'eso', '{4}', 'Autores de la Generacion del 98',
 '["miguel de unamuno","pio baroja","ramon maria del valle-inclan","azorin","antonio machado","ramiro de maeztu","angel ganivet","jacinto benavente","manuel machado","ruben dario (vinculo)","joaquin costa","francisco navarro ledesma","jose martinez ruiz","enrique de mesa"]'::jsonb,
 '["luis de gongora","calderon de la barca","garcilaso de la vega","lope de vega","san juan de la cruz","fernando de rojas","francisco de quevedo"]'::jsonb),

('lengua', 'eso', '{4}', 'Tipos de subordinadas adverbiales',
 '["causal","consecutiva","condicional","concesiva","final","temporal","modal","comparativa","locativa","adversativa subordinada","de lugar","de tiempo","de modo","de finalidad"]'::jsonb,
 '["copulativa","disyuntiva","distributiva","explicativa","yuxtapuesta","sustantiva de sujeto","adjetiva especificativa"]'::jsonb);

-- ============================================================
-- HISTORIA (ESO 1-4)
-- ============================================================

-- Historia 1 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('historia', 'eso', '{1}', 'Dioses del Olimpo griego',
 '["zeus","hera","poseidon","hades","atenea","apolo","artemisa","ares","afrodita","hefesto","hermes","dionisos","demeter","hestia"]'::jsonb,
 '["ra","osiris","anubis","thor","odin","quetzalcoatl","vishnu"]'::jsonb),

('historia', 'eso', '{1}', 'Faraones del Antiguo Egipto',
 '["tutankamon","ramses ii","keops","kefren","micerinos","cleopatra vii","hatshepsut","akenaton","tutmosis iii","nefertiti","menes","seti i","amenhotep iii","djoser"]'::jsonb,
 '["julio cesar","augusto","pericles","solon","hammurabi","ciro el grande","nabucodonosor"]'::jsonb);

-- Historia 2 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('historia', 'eso', '{2}', 'Reinos cristianos medievales de la Peninsula',
 '["asturias","leon","castilla","navarra","aragon","cataluna","galicia","portugal","mallorca","valencia","union castilla-leon","corona de aragon","reino de toledo","condado de barcelona"]'::jsonb,
 '["al-andalus","califato de cordoba","emirato de cordoba","taifa de sevilla","taifa de zaragoza","almohades","almoravides"]'::jsonb),

('historia', 'eso', '{2}', 'Ordenes religiosas medievales',
 '["benedictinos","cistercienses","franciscanos","dominicos","cluny","cartujos","agustinos","templarios","hospitalarios","calatrava","santiago","alcantara","montesa","jesuitas (tardia)"]'::jsonb,
 '["samurais","vikingos","mongoles","mamelucos","druidas","chamanes","cosacos"]'::jsonb);

-- Historia 3 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('historia', 'eso', '{3}', 'Exploradores de la Era de los Descubrimientos',
 '["cristobal colon","vasco de gama","fernando de magallanes","juan sebastian elcano","hernan cortes","francisco pizarro","bartolome diaz","americo vespucio","juan ponce de leon","nunez de balboa","francisco de orellana","diego de almagro","pedro alvares cabral","juan de la cosa"]'::jsonb,
 '["marco polo","ibn battuta","leif erikson","zheng he","alejandro magno","julio cesar","anibal"]'::jsonb),

('historia', 'eso', '{3}', 'Artistas del Renacimiento italiano',
 '["leonardo da vinci","miguel angel","rafael sanzio","donatello","botticelli","brunelleschi","masaccio","ghiberti","tiziano","tintoretto","veronese","fra angelico","piero della francesca","giorgione"]'::jsonb,
 '["pablo picasso","salvador dali","vincent van gogh","claude monet","gustav klimt","eugene delacroix","caspar david friedrich"]'::jsonb);

-- Historia 4 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('historia', 'eso', '{4}', 'Dictadores del siglo XX',
 '["adolf hitler","benito mussolini","francisco franco","ioseb stalin","mao zedong","fidel castro","augusto pinochet","antonio salazar","kim il-sung","pol pot","nicolae ceausescu","saddam hussein","idi amin","muammar gadafi"]'::jsonb,
 '["winston churchill","charles de gaulle","franklin d roosevelt","john f kennedy","margaret thatcher","konrad adenauer","willy brandt"]'::jsonb),

('historia', 'eso', '{4}', 'Etapas de la Guerra Civil Espanola',
 '["sublevacion militar","batalla de madrid","batalla del jarama","batalla de guadalajara","batalla de brunete","batalla de teruel","batalla del ebro","campana del norte","caida de cataluna","ofensiva final","bombardeo de guernica","frente de aragon","no intervencion","brigadas internacionales"]'::jsonb,
 '["batalla de stalingrado","desembarco de normandia","batalla de inglaterra","pearl harbor","batalla de verdun","somme","trafalgar"]'::jsonb);

-- ============================================================
-- ECONOMIA (ESO 4)
-- ============================================================

INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('economia', 'eso', '{4}', 'Tipos de mercado segun competencia',
 '["competencia perfecta","monopolio","oligopolio","competencia monopolistica","duopolio","monopsonio","oligopsonio","mercado cautivo","mercado libre","mercado regulado","cartel","trust","holding","mercado contestable"]'::jsonb,
 '["supermercado","hipermercado","tienda de barrio","bazar","mercadillo","centro comercial","outlet"]'::jsonb),

('economia', 'eso', '{4}', 'Impuestos del sistema fiscal espanol',
 '["irpf","iva","impuesto de sociedades","impuesto sobre el patrimonio","impuesto sobre sucesiones","impuesto sobre donaciones","itp","ibi","ivtm (circulacion)","impuestos especiales","impuesto matriculacion","iae","iiee hidrocarburos","impuesto sobre alcohol"]'::jsonb,
 '["cuota sindical","recibo de la luz","factura del agua","peaje de autopista","matricula universitaria","multa de trafico","ticket del bus"]'::jsonb),

('economia', 'eso', '{4}', 'Derechos del consumidor',
 '["derecho a la informacion","derecho a la seguridad","derecho a la salud","derecho a la proteccion","derecho a la reparacion","derecho de desistimiento","derecho a la garantia","derecho a reclamacion","derecho a la educacion del consumidor","derecho a representacion","derecho a eleccion","derecho a la calidad","derecho a la indemnizacion","derecho a hoja de reclamaciones"]'::jsonb,
 '["derecho al voto","derecho a la huelga","derecho a la manifestacion","derecho de asilo","libertad de prensa","libertad de catedra","derecho a la intimidad"]'::jsonb);

-- ============================================================
-- LATIN (ESO 4)
-- ============================================================

INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('latin', 'eso', '{4}', 'Conjugaciones verbales latinas',
 '["primera conjugacion (-are)","segunda conjugacion (-ere larga)","tercera conjugacion (-ere breve)","cuarta conjugacion (-ire)","amo amas amare","habeo habes habere","lego legis legere","audio audis audire","sum es esse","possum potes posse","fero fers ferre","eo is ire","volo vis velle","nolo non vis nolle"]'::jsonb,
 '["rosa rosae","dominus domini","mors mortis","dies diei","manus manus","templum templi","civis civis"]'::jsonb),

('latin', 'eso', '{4}', 'Autores de la literatura latina',
 '["ciceron","virgilio","horacio","ovidio","tito livio","seneca","tacito","julio cesar","catulo","plauto","terencio","salustio","quintiliano","plinio el joven"]'::jsonb,
 '["homero","hesiodo","esquilo","sofocles","euripides","aristofanes","herodoto"]'::jsonb);

-- ============================================================
-- FRANCES (ESO 1-4) — items en frances
-- ============================================================

-- Frances 1 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('frances', 'eso', '{1}', 'Animaux (animales)',
 '["chien","chat","cheval","vache","mouton","cochon","poule","canard","lapin","souris","oiseau","poisson","lion","tigre"]'::jsonb,
 '["pomme","banane","voiture","maison","livre","table","chaise"]'::jsonb),

('frances', 'eso', '{1}', 'Fruits et legumes',
 '["pomme","poire","banane","orange","fraise","raisin","peche","tomate","carotte","salade","pomme de terre","oignon","courgette","concombre"]'::jsonb,
 '["chien","voiture","stylo","chaise","lundi","bleu","ecole"]'::jsonb),

('frances', 'eso', '{1}', 'Parties du corps',
 '["tete","bras","jambe","main","pied","oeil","oreille","nez","bouche","doigt","dos","ventre","cou","genou"]'::jsonb,
 '["chapeau","pantalon","chemise","chaussure","manteau","veste","robe"]'::jsonb);

-- Frances 2 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('frances', 'eso', '{2}', 'Moyens de transport',
 '["voiture","velo","bus","train","avion","bateau","metro","tramway","moto","taxi","camion","scooter","trottinette","helicoptere"]'::jsonb,
 '["maison","ecole","hopital","parc","musee","jardin","cinema"]'::jsonb),

('frances', 'eso', '{2}', 'Sports et loisirs',
 '["football","basket","tennis","natation","cyclisme","danse","equitation","ski","rugby","volleyball","athletisme","gymnastique","judo","escrime"]'::jsonb,
 '["mathematiques","histoire","geographie","biologie","physique","anglais","musique"]'::jsonb),

('frances', 'eso', '{2}', 'Instruments de musique',
 '["piano","guitare","violon","batterie","flute","trompette","saxophone","clarinette","harpe","accordeon","violoncelle","contrebasse","tambour","xylophone"]'::jsonb,
 '["pinceau","crayon","ordinateur","telephone","livre","cahier","regle"]'::jsonb);

-- Frances 3 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('frances', 'eso', '{3}', 'Verbes au passe compose',
 '["j''ai parle","tu as fini","il a pris","nous avons vu","vous avez mange","ils ont fait","je suis alle","elle est venue","nous sommes partis","tu as ecrit","il a lu","j''ai dit","vous avez bu","elles sont restees"]'::jsonb,
 '["je parle","tu finis","il prend","nous voyons","vous mangez","ils font","je vais"]'::jsonb),

('frances', 'eso', '{3}', 'Adjectifs possessifs',
 '["mon","ma","mes","ton","ta","tes","son","sa","ses","notre","nos","votre","vos","leur"]'::jsonb,
 '["le","la","les","un","une","des","ce"]'::jsonb),

('frances', 'eso', '{3}', 'Expressions de temps',
 '["hier","aujourd''hui","demain","maintenant","toujours","jamais","souvent","parfois","tot","tard","bientot","deja","encore","longtemps"]'::jsonb,
 '["rouge","bleu","grand","petit","beau","joli","content"]'::jsonb);

-- Frances 4 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('frances', 'eso', '{4}', 'Connecteurs logiques',
 '["mais","cependant","pourtant","neanmoins","toutefois","en revanche","par contre","donc","ainsi","par consequent","c''est pourquoi","de plus","en outre","par ailleurs"]'::jsonb,
 '["voiture","table","rouge","chien","manger","dormir","ecole"]'::jsonb),

('frances', 'eso', '{4}', 'Verbes pronominaux',
 '["se lever","se laver","s''habiller","se coucher","se reveiller","se promener","se reposer","se depecher","s''amuser","se preparer","se brosser","se maquiller","se raser","se souvenir"]'::jsonb,
 '["manger","boire","lire","ecrire","parler","courir","sauter"]'::jsonb);

-- ============================================================
-- INGLES (ESO 1-4) — items en ingles
-- ============================================================

-- Ingles 1 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('ingles', 'eso', '{1}', 'Animals',
 '["dog","cat","horse","cow","sheep","pig","chicken","duck","rabbit","mouse","bird","fish","lion","tiger"]'::jsonb,
 '["apple","car","house","book","table","chair","pencil"]'::jsonb),

('ingles', 'eso', '{1}', 'Colors',
 '["red","blue","green","yellow","black","white","orange","purple","pink","brown","grey","turquoise","gold","silver"]'::jsonb,
 '["monday","january","summer","winter","big","small","fast"]'::jsonb),

('ingles', 'eso', '{1}', 'Parts of the body',
 '["head","arm","leg","hand","foot","eye","ear","nose","mouth","finger","back","stomach","neck","knee"]'::jsonb,
 '["shirt","trousers","shoes","hat","jacket","socks","coat"]'::jsonb);

-- Ingles 2 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('ingles', 'eso', '{2}', 'Means of transport',
 '["car","bike","bus","train","plane","boat","underground","tram","motorbike","taxi","lorry","scooter","helicopter","ship"]'::jsonb,
 '["house","school","hospital","park","museum","garden","cinema"]'::jsonb),

('ingles', 'eso', '{2}', 'Sports',
 '["football","basketball","tennis","swimming","cycling","skiing","rugby","volleyball","athletics","gymnastics","judo","handball","hockey","golf"]'::jsonb,
 '["maths","history","geography","biology","physics","french","music"]'::jsonb),

('ingles', 'eso', '{2}', 'Weather vocabulary',
 '["sunny","rainy","cloudy","windy","snowy","foggy","stormy","hot","cold","warm","freezing","humid","icy","mild"]'::jsonb,
 '["angry","happy","sad","tired","bored","scared","excited"]'::jsonb);

-- Ingles 3 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('ingles', 'eso', '{3}', 'Regular past simple verbs',
 '["played","watched","listened","walked","talked","studied","worked","lived","opened","closed","started","finished","helped","cooked"]'::jsonb,
 '["went","saw","did","had","came","took","made"]'::jsonb),

('ingles', 'eso', '{3}', 'Reporting verbs',
 '["said","told","asked","explained","suggested","answered","replied","mentioned","claimed","admitted","denied","insisted","promised","warned"]'::jsonb,
 '["run","jump","swim","eat","drink","sleep","cook"]'::jsonb);

-- Ingles 4 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('ingles', 'eso', '{4}', 'Linking words of contrast',
 '["however","nevertheless","although","even though","though","despite","in spite of","whereas","while","on the other hand","on the contrary","yet","still","but"]'::jsonb,
 '["because","since","as","therefore","so","thus","hence"]'::jsonb),

('ingles', 'eso', '{4}', 'Collocations with ''make'' and ''do''',
 '["make a decision","make a mistake","make progress","make an effort","make noise","do homework","do the shopping","do the washing","do exercise","do your best","do a favour","make friends","make a phone call","do research"]'::jsonb,
 '["have breakfast","take a shower","get up","go to bed","come home","play football","watch tv"]'::jsonb),

('ingles', 'eso', '{4}', 'Prefixes of negation',
 '["un-","in-","im-","ir-","il-","dis-","mis-","non-","a-","anti-","counter-","de-","ex-","under-"]'::jsonb,
 '["-ness","-tion","-ment","-ity","-ing","-ed","-ly"]'::jsonb);

-- ============================================================
-- VALENCIANO (ESO 1-4) — items en valenciano
-- ============================================================

-- Valenciano 1 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('valenciano', 'eso', '{1}', 'Fruites i verdures',
 '["poma","pera","platan","taronja","maduixa","raim","prunya","tomaca","pastanaga","encisam","creilla","ceba","carabasso","cogombre"]'::jsonb,
 '["gos","cotxe","llibre","taula","dilluns","blau","escola"]'::jsonb),

('valenciano', 'eso', '{1}', 'Parts del cos huma',
 '["cap","brac","cama","ma","peu","ull","orella","nas","boca","dit","esquena","panxa","coll","genoll"]'::jsonb,
 '["camisa","pantalons","sabates","barret","jaqueta","mitjons","vestit"]'::jsonb),

('valenciano', 'eso', '{1}', 'Mitjans de transport',
 '["cotxe","bicicleta","autobus","tren","avio","vaixell","metro","tramvia","moto","taxi","camio","patinet","helicopter","barca"]'::jsonb,
 '["casa","escola","hospital","parc","museu","jardi","cinema"]'::jsonb);

-- Valenciano 2 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('valenciano', 'eso', '{2}', 'Esports',
 '["futbol","basquet","tenis","natacio","ciclisme","dansa","equitacio","rugbi","voleibol","atletisme","gimnastica","judo","pilota valenciana","esgrima"]'::jsonb,
 '["matematiques","historia","geografia","biologia","fisica","angles","musica"]'::jsonb),

('valenciano', 'eso', '{2}', 'Instruments musicals',
 '["piano","guitarra","violi","bateria","flauta","trompeta","saxofon","clarinet","arpa","acordio","violoncel","contrabaix","tabal","dolcaina"]'::jsonb,
 '["pinzell","llapis","ordinador","telefon","llibre","quadern","regla"]'::jsonb),

('valenciano', 'eso', '{2}', 'Oficis i professions',
 '["mestre","metge","bomber","policia","cambrer","cuiner","forner","advocat","enginyer","fuster","llaurador","pescador","electricista","lampista"]'::jsonb,
 '["escola","hospital","forn","restaurant","casa","parc","biblioteca"]'::jsonb);

-- Valenciano 3 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('valenciano', 'eso', '{3}', 'Connectors textuals',
 '["pero","tanmateix","no obstant aixo","en canvi","per contra","per tant","aixi doncs","en consequencia","a mes","d''altra banda","per exemple","es a dir","en primer lloc","finalment"]'::jsonb,
 '["taula","cadira","roig","gos","menjar","dormir","escola"]'::jsonb),

('valenciano', 'eso', '{3}', 'Verbs reflexius i pronominals',
 '["llevar-se","rentar-se","vestir-se","gitar-se","despertar-se","passejar-se","afaitar-se","pentinar-se","banyar-se","dutxar-se","arreglar-se","apressar-se","divertir-se","recordar-se"]'::jsonb,
 '["menjar","beure","llegir","escriure","parlar","correr","saltar"]'::jsonb),

('valenciano', 'eso', '{3}', 'Accidents geografics',
 '["muntanya","serra","vall","plana","altipla","riu","llac","mar","golf","cap","peninsula","illa","delta","estret"]'::jsonb,
 '["ciutat","poble","carrer","placa","avinguda","barri","rotonda"]'::jsonb);

-- Valenciano 4 ESO
INSERT INTO intruso_sets (subject_id, level, grades, category, correct_items, intruder_items) VALUES
('valenciano', 'eso', '{4}', 'Figures retoriques',
 '["metafora","comparacio","personificacio","hiperbole","antitesi","anafora","metonimia","sinestesia","alliteracio","paral·lelisme","polisindeton","asindeton","hiperbaton","onomatopeia"]'::jsonb,
 '["subjecte","predicat","nucli","complement directe","atribut","aposicio","vocatiu"]'::jsonb),

('valenciano', 'eso', '{4}', 'Tipus de text',
 '["text narratiu","text descriptiu","text argumentatiu","text expositiu","text instructiu","text dialogat","text prescriptiu","text periodistic","text cientific","text juridic","text literari","text publicitari","text administratiu","text conversacional"]'::jsonb,
 '["substantiu","adjectiu","verb","adverbi","preposicio","conjuncio","pronom"]'::jsonb),

('valenciano', 'eso', '{4}', 'Autors valencians contemporanis',
 '["vicent andres estelles","joan fuster","enric valor","maria beneyto","carmelina sanchez-cutillas","manuel baixauli","isabel-clara simo","ferran torrent","silvestre vilaplana","josep piera","toni cucarella","joan francesc mira","jaume perez montaner","marc granell"]'::jsonb,
 '["ausias march","joanot martorell","jaume roig","isabel de villena","jordi de sant jordi","bernat metge","ramon llull"]'::jsonb);

-- ============================================================
-- FIN DEL SEED — ESO Humanidades e Idiomas
-- ============================================================
