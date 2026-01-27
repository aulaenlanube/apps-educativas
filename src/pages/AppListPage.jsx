import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowLeft, Sparkles, Folder, Dices, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
// CORRECCIÓN 1: Importamos también 'primariaSubjects'
import { esoApps, esoSubjects, primariaApps, primariaSubjects } from '@/apps/appList';
import Mascot from '@/components/Mascot';

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
            <div className="bg-white/90 backdrop-blur-sm border-2 border-indigo-100 rounded-3xl p-1 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500" />
                <div className="p-6 md:p-8 text-center flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-gray-600 mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-500 fill-current" />
                        ¡Deja que el azar elija por ti!
                    </h3>

                    <div className="w-full h-24 mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 flex items-center justify-center relative overflow-hidden shadow-inner">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentAppIndex}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: isSpinning ? 0.03 : 0.5 }}
                                className="absolute inset-0 flex items-center justify-center px-4"
                            >
                                <div className="text-2xl md:text-3xl font-bold text-center flex justify-center items-center flex-wrap">
                                    {emoji && (
                                        <span className="text-gray-800 mr-1 filter drop-shadow-sm">{emoji}</span>
                                    )}
                                    <span className={`bg-clip-text text-transparent bg-gradient-to-r ${isSpinning ? 'from-gray-400 to-gray-600' : 'from-indigo-600 to-purple-600'}`}>
                                        {text}
                                    </span>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <Button
                        onClick={handleSpin}
                        disabled={isSpinning}
                        size="lg"
                        className={`w-full md:w-auto min-w-[200px] text-lg rounded-xl transition-all duration-300 ${isSpinning
                            ? 'bg-gray-100 text-gray-400 border border-gray-200 shadow-none'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1'
                            }`}
                    >
                        {isSpinning ? (
                            <span className="flex items-center gap-2">
                                <Dices className="animate-spin w-5 h-5" /> Elegiendo...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Dices className="w-5 h-5 " /> ¡Elegir App Aleatoria!
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};
// --- FIN RANDOMAPPSELECTOR ---

const AppList = ({ apps, level, grade, subjectId }) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app, index) => (
                <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-purple-100 group"
                    onClick={() => navigate(`/curso/${level}/${grade}/${subjectId}/app/${app.id}`)}
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">{app.name}</h3>
                    <p className="text-gray-600">{app.description}</p>
                </motion.div>
            ))}
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

    // CORRECCIÓN 2: Lógica unificada para obtener el nombre correcto con acentos
    if (level === 'eso') {
        const subjectInfo = esoSubjects[grade]?.find(s => s.id === subjectId);
        // Si encontramos la asignatura en la lista, usamos su nombre "bonito"
        if (subjectInfo) subjectName = subjectInfo.nombre;

        appsForSubject = esoApps[grade]?.[subjectId] || [];

    } else { // Primaria
        // Buscamos el nombre en primariaSubjects
        const subjectInfo = primariaSubjects[grade]?.find(s => s.id === subjectId);
        if (subjectInfo) subjectName = subjectInfo.nombre;

        // Obtenemos las apps
        const primaryCourseData = primariaApps[grade];
        if (primaryCourseData && !Array.isArray(primaryCourseData)) {
            appsForSubject = primaryCourseData[subjectId] || [];
        } else {
            // Fallback si la estructura de primaria fuera un array plano (sin asignaturas)
            appsForSubject = Array.isArray(primaryCourseData) ? primaryCourseData : [];
        }
    }

    // Capitalizar la primera letra si no se encontró nombre (fallback) y no es un nombre compuesto
    if (subjectName === subjectId) {
        subjectName = subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
    }

    const fullTitle = `${subjectName} - ${grade}º ${level === 'eso' ? 'ESO' : 'Primaria'}`;
    const levelDisplay = level === 'eso' ? 'ESO' : 'Primaria';
    const headerSubtitle = `${grade}º ${levelDisplay}`;

    const handleRandomSelection = (app) => {
        navigate(`/curso/${level}/${grade}/${subjectId}/app/${app.id}`);
    };

    return (
        <>
            <Helmet>
                <title>{`Apps de ${fullTitle} - EduApps`}</title>
            </Helmet>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100 sticky top-0 z-50">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <GraduationCap className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold gradient-text">EduApps</h1>
                                    <p className="text-sm text-gray-600">{headerSubtitle}</p>
                                </div>
                            </div>
                            <Button onClick={() => navigate(`/curso/${level}/${grade}`)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Asignaturas
                            </Button>
                        </div>
                    </div>
                </header>
                <main className="container mx-auto px-6 py-16">
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12">
                        <div className="flex items-center justify-center space-x-4 mb-4">
                            <Folder className="w-10 h-10 text-blue-500" />
                            <h1 className="text-5xl md:text-6xl font-bold gradient-text">{subjectName}</h1>
                            <Sparkles className="w-10 h-10 text-purple-500" />
                        </div>
                        <p className="text-xl text-gray-600 mt-4">¡Selecciona una aplicación para empezar a jugar y aprender!</p>
                    </motion.div>

                    {appsForSubject.length > 0 ? (
                        <>
                            <Mascot />
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
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-16 flex flex-col items-center justify-center text-center bg-white/60 backdrop-blur-sm p-12 rounded-3xl shadow-xl">
                            <img className="w-56 h-56 mb-8" alt="Un cohete despegando hacia las estrellas" src="/images/portada.webp" />
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Próximamente!</h2>
                            <p className="text-lg text-gray-600 max-w-md">Estamos trabajando para añadir las mejores apps para esta asignatura. ¡Vuelve pronto!</p>
                        </motion.div>
                    )}
                </main>
            </div>
        </>
    );
};

export default AppListPage;