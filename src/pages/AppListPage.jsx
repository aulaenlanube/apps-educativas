import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { AnimatedBorderButton } from '@/components/NavBackButton';
import Header from '@/components/layout/Header';
import { AnimatedGradientTitle } from '@/components/ui/GradientTitle';
import { esoApps, esoSubjects, primariaApps, primariaSubjects, bachilleratoApps, bachilleratoSubjects, adApps, adSubjects } from '@/apps/appList';
import StarRating from '@/components/ui/StarRating';
import AppIcon from '@/components/AppIcon';
import { supabase } from '@/lib/supabase';
import { tiltProps, accentFor, keyActivate } from './navTilt';
import './NavPages.css';

// --- INICIO RANDOMAPPSELECTOR (Se mantiene igual, lo incluyo para que el fichero esté completo) ---
const RandomAppSelector = ({ apps, onAppSelected }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [currentAppIndex, setCurrentAppIndex] = useState(0);
    const spinIntervalRef = useRef(null);

    const splitEmojiAndTitle = (title) => {
        if (!title) return { emoji: '', text: '' };
        const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
        const match = title.match(emojiRegex);

        if (match) {
            const firstSpaceIndex = title.indexOf(' ');
            if (firstSpaceIndex !== -1) {
                return {
                    emoji: title.substring(0, firstSpaceIndex),
                    text: title.substring(firstSpaceIndex)
                };
            }
        }
        return { emoji: '', text: title };
    };

    useEffect(() => {
        if (isSpinning) return;
        const idleInterval = setInterval(() => {
            setCurrentAppIndex((prev) => (prev + 1) % apps.length);
        }, 1500);
        return () => clearInterval(idleInterval);
    }, [isSpinning, apps.length]);

    useEffect(() => {
        return () => {
            if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
        };
    }, []);

    const handleSpin = () => {
        if (isSpinning || apps.length === 0) return;
        setIsSpinning(true);
        let spins = 0;
        const maxSpins = 30;
        const speed = 30;

        spinIntervalRef.current = setInterval(() => {
            setCurrentAppIndex((prev) => (prev + 1) % apps.length);
            spins++;

            if (spins >= maxSpins) {
                clearInterval(spinIntervalRef.current);
                const winnerIndex = Math.floor(Math.random() * apps.length);
                setCurrentAppIndex(winnerIndex);

                setTimeout(() => {
                    setIsSpinning(false);
                    onAppSelected(apps[winnerIndex]);
                }, 1000);
            }
        }, speed);
    };

    if (apps.length < 2) return null;
    const { emoji, text } = splitEmojiAndTitle(apps[currentAppIndex]?.name);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto mb-12"
        >
            <div className="np-panel fx-aurora-border overflow-hidden">
                <div className="p-6 md:p-8 text-center flex flex-col items-center">
                    <h3 className="text-base md:text-lg font-bold text-white/90 mb-5 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-300 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                        ¡Deja que el azar elija por ti!
                    </h3>

                    <div className={`np-slot w-full h-24 mb-6 flex items-center justify-center ${isSpinning ? 'np-slot--spinning' : ''}`}>
                        <span className="np-slot__marker np-slot__marker--l" aria-hidden="true" />
                        <span className="np-slot__marker np-slot__marker--r" aria-hidden="true" />
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentAppIndex}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: isSpinning ? 0.03 : 0.5 }}
                                className="absolute inset-0 flex items-center justify-center px-8"
                            >
                                <div className="text-2xl md:text-3xl font-bold text-center flex justify-center items-center flex-wrap">
                                    {emoji && (
                                        <span className="mr-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]">{emoji}</span>
                                    )}
                                    <span className={isSpinning ? 'text-white/55' : 'np-slot-text'}>
                                        {text}
                                    </span>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <button
                        type="button"
                        onClick={handleSpin}
                        disabled={isSpinning}
                        className="fx-btn np-btn-dice w-full md:w-auto min-w-[220px] text-lg"
                    >
                        {isSpinning ? (
                            <span className="flex items-center gap-2">
                                <Dices className="animate-spin w-5 h-5" /> Eligiendo...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Dices className="w-5 h-5" /> ¡Elegir App Aleatoria!
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
// --- FIN RANDOMAPPSELECTOR ---

const AppList = ({ apps, level, grade, subjectId }) => {
    const navigate = useNavigate();
    const [ratings, setRatings] = useState({});

    useEffect(() => {
        const loadRatings = async () => {
            const { data } = await supabase.rpc('get_bulk_avg_ratings', {
                p_level: level, p_grade: grade, p_subject_id: subjectId,
            });
            if (data && Array.isArray(data)) {
                const map = {};
                data.forEach(r => { map[r.app_id] = r; });
                setRatings(map);
            }
        };
        if (level && grade && subjectId) loadRatings();
    }, [level, grade, subjectId]);

    // Mismo lenguaje que las tarjetas de asignatura (SubjectPage): entrada
    // escalonada en CSS sobre un wrapper (.np-enter) y tilt 3D + foco de luz en
    // la tarjeta interior (variables CSS, sin re-render por frame).
    const open = (app) => navigate(`/curso/${level}/${grade}/${subjectId}/app/${app.id}`);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {apps.map((app, i) => {
                const r = ratings[app.id];
                const name = app.name.replace(/^\p{Emoji_Presentation}\s?|\p{Extended_Pictographic}\s?/u, '');
                return (
                    <div key={app.id} className="np-enter" style={{ '--i': i }}>
                        <div
                            role="link"
                            tabIndex={0}
                            aria-label={name}
                            className="np-card fx-spotlight fx-shine group"
                            style={{ '--np-accent': accentFor(i) }}
                            onClick={() => open(app)}
                            onKeyDown={keyActivate(() => open(app))}
                            {...tiltProps}
                        >
                            <span className="np-card__glare" aria-hidden="true" />
                            <span className="np-card__ring" aria-hidden="true" />
                            <div className="np-card__body">
                                <div className="flex items-start gap-4">
                                    <span className="np-icon">
                                        <span className="np-icon__frame">
                                            <AppIcon appId={app.id} size={64} />
                                        </span>
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="np-title text-xl">{name}</h3>
                                        <p className="np-desc text-sm mt-1 line-clamp-2">{app.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 mt-auto pt-1">
                                    {r && r.total_ratings > 0 ? (
                                        <StarRating value={Math.round(r.avg_rating)} readOnly size="sm" count={r.total_ratings} />
                                    ) : <span />}
                                    <span className="np-cta" aria-hidden="true">
                                        Jugar <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const AppListPage = () => {
    const params = useParams();
    const { grade, subjectId } = params;
    // Si la URL no tiene level (rutas antiguas), asumimos 'eso', pero tu router debería pasarlo.
    const level = params.level || 'eso';
    const navigate = useNavigate();

    let appsForSubject = [];
    let subjectName = subjectId;

    // Lógica unificada para obtener el nombre correcto con acentos
    const subjectsMap = { eso: esoSubjects, primaria: primariaSubjects, bachillerato: bachilleratoSubjects, ad: adSubjects };
    const appsMap = { eso: esoApps, primaria: primariaApps, bachillerato: bachilleratoApps, ad: adApps };

    const subjectInfo = subjectsMap[level]?.[grade]?.find(s => s.id === subjectId);
    if (subjectInfo) subjectName = subjectInfo.nombre;

    const courseData = appsMap[level]?.[grade];
    if (courseData && !Array.isArray(courseData)) {
        appsForSubject = courseData[subjectId] || [];
    } else {
        appsForSubject = Array.isArray(courseData) ? courseData : [];
    }

    // Capitalizar la primera letra si no se encontró nombre (fallback) y no es un nombre compuesto
    if (subjectName === subjectId) {
        subjectName = subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
    }

    const levelDisplayMap = { primaria: 'Primaria', eso: 'ESO', bachillerato: 'Bachillerato', ad: 'Atención a la Diversidad' };
    const levelDisplay = levelDisplayMap[level] || 'Primaria';
    const isSpecialLevel = level === 'ad';
    const headerSubtitle = isSpecialLevel ? levelDisplay : `${grade}º ${levelDisplay}`;

    const handleRandomSelection = (app) => {
        navigate(`/curso/${level}/${grade}/${subjectId}/app/${app.id}`);
    };

    return (
        <>
            <Helmet>
                <title>{`${subjectName} · ${isSpecialLevel ? levelDisplay : grade + 'º ' + levelDisplay} — Apps Educativas`}</title>
                <meta name="description" content={`Apps y juegos educativos de ${subjectName} para ${isSpecialLevel ? levelDisplay : grade + 'º de ' + levelDisplay}. Gratis, sin descargas.`} />
                <link rel="canonical" href={`https://apps-educativas.com/curso/${level}/${grade}/${subjectId}`} />
                <meta property="og:title" content={`${subjectName} ${isSpecialLevel ? '' : '· ' + grade + 'º ' + levelDisplay} — Apps Educativas`} />
                <meta property="og:description" content={`Apps y juegos educativos de ${subjectName}.`} />
                <meta property="og:url" content={`https://apps-educativas.com/curso/${level}/${grade}/${subjectId}`} />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://apps-educativas.com/" },
                        { "@type": "ListItem", "position": 2, "name": `${grade}º ${levelDisplay}`, "item": `https://apps-educativas.com/curso/${level}/${grade}` },
                        { "@type": "ListItem", "position": 3, "name": subjectName, "item": `https://apps-educativas.com/curso/${level}/${grade}/${subjectId}` },
                    ],
                })}</script>
            </Helmet>
            <div className="relative min-h-screen overflow-x-hidden">
                <div className="relative z-10">
                <Header subtitle={headerSubtitle}>
                    <AnimatedBorderButton
                        onClick={() => navigate(`/curso/${level}/${grade}`)}
                        colors={['#ffffff', '#ffffff']}
                        glowColor="rgba(255,255,255,0.45)"
                        borderColor="#ffffff"
                        shape="arrow"
                    >
                        Asignaturas
                    </AnimatedBorderButton>
                </Header>
                <main className="container mx-auto px-6 py-16">
                  {/* Wrapper con `filter` (igual que SubjectPage): deja un filter:blur(0px)
                      permanente que aisla el backdrop-filter de las tarjetas. Sin esto, el
                      backdrop-blur de las tarjetas esmerila el fondo 3D y se ven mas opacas
                      que las de asignaturas; con el ancestro filtrado se ven identicas. */}
                  <motion.div
                    key={`${level}-${grade}-${subjectId}`}
                    initial={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full"
                  >
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12">
                        <div className="mb-4">
                            <span className="np-kicker">
                                <span className="np-kicker__dot" aria-hidden="true" />
                                {headerSubtitle}
                                {appsForSubject.length > 0 && <span className="np-count">{appsForSubject.length} apps</span>}
                            </span>
                        </div>
                        <div className="mb-4">
                            <AnimatedGradientTitle className="text-5xl md:text-6xl">{subjectName}</AnimatedGradientTitle>
                        </div>
                        <div className="np-sub mt-2">
                            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" aria-hidden="true" />
                            <p className="text-lg md:text-xl">¡Selecciona una aplicación para empezar a jugar y aprender!</p>
                        </div>
                    </motion.div>

                    {appsForSubject.length > 0 ? (
                        <>
                            <RandomAppSelector
                                apps={appsForSubject}
                                onAppSelected={handleRandomSelection}
                            />

                            <AppList
                                apps={appsForSubject}
                                level={level}
                                grade={grade}
                                subjectId={subjectId}
                            />
                        </>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="np-panel mt-16 flex flex-col items-center justify-center text-center p-12">
                            <img className="w-56 h-56 mb-8" alt="Un cohete despegando hacia las estrellas" src="/images/portada.webp" loading="lazy" decoding="async" />
                            <h2 className="text-3xl font-bold text-white mb-4">¡Próximamente!</h2>
                            <p className="text-lg text-white/80 max-w-md">Estamos trabajando para añadir las mejores apps para esta asignatura. ¡Vuelve pronto!</p>
                        </motion.div>
                    )}
                  </motion.div>
                </main>
                </div>
            </div>
        </>
    );
};

export default AppListPage;