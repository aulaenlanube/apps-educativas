// src/pages/AppRunnerPage.jsx
import React, { Suspense, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Heart, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedBorderButton } from '@/components/NavBackButton';
import { findAppById } from '@/apps/appList';
import { useGameTracker } from '@/hooks/useGameTracker';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import UserMenu from '@/components/auth/UserMenu';
import NotificationBell from '@/components/ui/NotificationBell';
import DonationModal from '@/components/ui/DonationModal';
import AppRatingPanel from '@/components/ui/AppRatingPanel';
import RatingPromptModal from '@/components/ui/RatingPromptModal';
import RankingModal from '@/components/ui/RankingModal';
import MatrixBackground from '@/components/ui/MatrixBackground';
import GeometryDashBackground from '@/components/ui/GeometryDashBackground';

const AppRunnerPage = () => {
    // 1. Obtenemos parámetros de la URL.
    // 'subjectId' vendrá aquí si configuraste la ruta nueva en main.jsx
    const { level, grade, subjectId: paramSubjectId, appId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
    const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);
    const { startSession, trackGameSession, abandonSession } = useGameTracker();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const result = findAppById(appId, level, grade);

    if (!result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50 text-red-700">
                <h1 className="text-2xl font-bold mb-4">App no encontrada</h1>
                <p>No hemos podido encontrar la aplicación que buscas. Revisa la configuración en appList.js</p>
                <Button onClick={() => navigate('/')} className="mt-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
                </Button>
            </div>
        );
    }

    const { app, subjectId: defaultSubjectId } = result;
    const AppToRender = app.component;

    // --- LÓGICA DE RETORNO INTELIGENTE ---
    // Prioridad: 
    // 1. URL (si existe el parámetro en la ruta).
    // 2. State (si venimos de hacer clic en la tarjeta).
    // 3. Default (lo que diga la app por defecto, ej. Lengua).
    const activeSubjectId = paramSubjectId || location.state?.fromSubjectId || defaultSubjectId;

    // Iniciar sesion de tracking al montar, abandonar al desmontar
    useEffect(() => {
      startSession({
        appId: app.id,
        appName: app.name,
        level,
        grade,
        subjectId: activeSubjectId,
      });
      return () => { abandonSession(); };
    }, [app?.id, app?.name, level, grade, activeSubjectId, startSession, abandonSession]);

    const onGameComplete = useCallback(async (data) => {
      setCompletedCount(c => c + 1);
      const gamifResult = await trackGameSession({
        appId: app.id,
        appName: app.name,
        level,
        grade,
        subjectId: activeSubjectId,
        ...data,
      });

      if (gamifResult) {
        // Mostrar XP ganada
        if (gamifResult.total_xp_gained > 0) {
          toast({
            title: `+${gamifResult.total_xp_gained} XP`,
            description: gamifResult.level_up
              ? `Has subido al nivel ${gamifResult.new_level}!`
              : `XP total: ${gamifResult.new_xp}`,
            duration: 4000,
          });
        }
        // Mostrar nuevo record
        if (gamifResult.high_score?.is_new_record) {
          const hs = gamifResult.high_score;
          const rankMsg = hs.global_rank
            ? hs.global_rank <= 3
              ? `Estas en el podio global (#${hs.global_rank})`
              : hs.global_rank <= 10
                ? `Top ${hs.global_rank} global`
                : `Posicion #${hs.global_rank}`
            : '';
          toast({
            title: `🏆 Nuevo record: ${Number(hs.new_score).toLocaleString('es-ES')} pts`,
            description: rankMsg || `Anterior: ${Number(hs.old_score).toLocaleString('es-ES')} pts`,
            duration: 5000,
          });
        }
        // Mostrar insignias nuevas
        if (gamifResult.new_badges?.length > 0) {
          gamifResult.new_badges.forEach(badge => {
            setTimeout(() => {
              toast({
                title: `🏅 ${badge.name_es}`,
                description: `${badge.description_es} (+${badge.xp_reward} XP)`,
                duration: 6000,
              });
            }, 500);
          });
        }
      }
    }, [trackGameSession, toast, app?.id, app?.name, level, grade, activeSubjectId]);

    const hasSubject = activeSubjectId && activeSubjectId !== 'general';
    const backPath = hasSubject
        ? `/curso/${level}/${grade}/${activeSubjectId}`
        : `/curso/${level}/${grade}`;

    const backButtonText = hasSubject ? 'Volver a la Asignatura' : 'Volver al Curso';

    const isTerminal = app.id.includes('terminal-retro');
    const isRunner = app.id === 'runner';
    const isRetroApp = isTerminal || isRunner;

    const isCalma = app.id.startsWith('isla-de-la-calma');
    const backgroundClass = isCalma
        ? 'bg-[#1a2e3b] dark:bg-[#080e14]'
        : isRetroApp || app.id.includes('celula-animal') || app.id.includes('celula-vegetal') || app.id.includes('sistema-solar')
            ? 'bg-black'
            : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';

    const isWideApp = app.id.includes('visualizador-3d') || app.id.includes('romanos') || app.id.includes('laboratorio-funciones-2d') || app.id.includes('fracciones-eso') || app.id.includes('excavacion-selectiva');
    const isFullScreenApp = app.id.includes('sistema-solar') || app.id.includes('celula-animal') || app.id.includes('celula-vegetal') || app.id.includes('mesa-crafteo') || app.id.includes('juego-memoria');
    const hideTopBarUserControls = app.id.includes('sistema-solar');

    const containerClass = isFullScreenApp
        ? "w-full h-screen"
        : isWideApp
            ? "max-w-[1600px] w-[85%] px-0"
            : "max-w-4xl w-full";

    // Conditional Styles
    const btnBackClass = isRetroApp
        ? "bg-black border border-green-500 text-green-500 hover:bg-green-900/50 hover:text-green-400 hover:shadow-[0_0_10px_rgba(0,255,0,0.5)] transition-all font-mono tracking-widest uppercase"
        : isFullScreenApp || isCalma
            ? "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all uppercase tracking-widest text-[10px] font-bold px-6 py-2 rounded-xl ring-1 ring-white/10"
            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 hover:shadow-lg transition-all duration-300 shadow-md border-0";

    const btnHeartClass = isRetroApp
        ? "bg-black border border-green-500 text-green-500 hover:bg-green-900/50 hover:text-green-400 hover:shadow-[0_0_10px_rgba(0,255,0,0.5)] transition-all group"
        : isFullScreenApp || isCalma
            ? "bg-white/10 backdrop-blur-md border border-white/20 text-red-500 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all group rounded-xl ring-1 ring-white/10"
            : "bg-white/80 backdrop-blur-sm hover:bg-pink-50 text-pink-600 border border-pink-200 shadow-sm hover:shadow-md transition-all group";

    const iconHeartClass = isRetroApp
        ? "h-5 w-5 fill-transparent group-hover:fill-green-500 transition-all duration-300"
        : isFullScreenApp
            ? "h-4 w-4 fill-transparent group-hover:fill-red-500 transition-all duration-300"
            : "h-5 w-5 fill-transparent group-hover:fill-pink-600 transition-all duration-300";

    // Mismas variantes para el botón de Ranking (igual estilo que el corazón pero en dorado)
    const btnRankingClass = isRetroApp
        ? "bg-black border border-green-500 text-green-500 hover:bg-green-900/50 hover:text-green-400 hover:shadow-[0_0_10px_rgba(0,255,0,0.5)] transition-all group"
        : isFullScreenApp || isCalma
            ? "bg-white/10 backdrop-blur-md border border-white/20 text-amber-400 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all group rounded-xl ring-1 ring-white/10"
            : "bg-white/80 backdrop-blur-sm hover:bg-amber-50 text-amber-600 border border-amber-200 shadow-sm hover:shadow-md transition-all group";

    const iconRankingClass = isRetroApp
        ? "h-5 w-5 transition-all duration-300"
        : isFullScreenApp
            ? "h-4 w-4 transition-all duration-300"
            : "h-5 w-5 transition-all duration-300";

    return (
        <>
            <Helmet>
                <title>{`${app.name} - EduApps`}</title>
            </Helmet>

            <DonationModal
                open={isDonationModalOpen}
                onOpenChange={setIsDonationModalOpen}
            />

            <RankingModal
                isOpen={isRankingModalOpen}
                onClose={() => setIsRankingModalOpen(false)}
                appId={app.id}
                appName={app.name}
                level={level}
                grade={grade}
                subjectId={activeSubjectId}
            />

            <div className={`min-h-screen flex flex-col items-center justify-start ${isFullScreenApp ? 'p-0' : 'pt-2 px-4 pb-4'} ${backgroundClass} relative overflow-hidden`}>

                {isTerminal && <MatrixBackground />}
                {isRunner && <GeometryDashBackground />}

                <div className={`${isFullScreenApp ? 'absolute top-6 left-6 right-6 z-[100] w-auto' : `w-full ${containerClass} relative z-[100] mb-4`} flex items-center gap-3`}>

                    {isRetroApp || isFullScreenApp || isCalma ? (
                        <Button
                            onClick={() => navigate(backPath)}
                            className={btnBackClass}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> {backButtonText}
                        </Button>
                    ) : (
                        <AnimatedBorderButton
                            onClick={() => navigate(backPath)}
                            colors={['#A855F7', '#EC4899']}
                            glowColor="rgba(168,85,247,0.3)"
                            shape="arrow"
                        >
                            {backButtonText}
                        </AnimatedBorderButton>
                    )}

                    <Button
                        onClick={() => setIsDonationModalOpen(true)}
                        className={btnHeartClass}
                        size="icon"
                        title="Apoya el proyecto"
                    >
                        <Heart className={iconHeartClass} />
                    </Button>

                    <Button
                        onClick={() => setIsRankingModalOpen(true)}
                        className={btnRankingClass}
                        size="icon"
                        title="Ver ranking"
                    >
                        <Trophy className={iconRankingClass} />
                    </Button>

                    <div className="flex-1" />

                    {!authLoading && isAuthenticated && !hideTopBarUserControls && (
                        <div className="flex items-center gap-2">
                            <NotificationBell />
                            <UserMenu />
                        </div>
                    )}
                </div>

                <div className={`${containerClass} relative z-10`}>
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                        </div>
                    }>
                        <AppToRender
                            isPaused={isDonationModalOpen}
                            level={level}
                            grade={grade}
                            subjectId={activeSubjectId}
                            onGameComplete={onGameComplete}
                        />
                    </Suspense>
                </div>
            </div>

            <AppRatingPanel
                appId={app.id}
                appName={app.name}
                level={level}
                grade={grade}
                subjectId={activeSubjectId}
                variant={isRetroApp ? 'retro' : isFullScreenApp ? 'fullscreen' : 'default'}
            />

            <RatingPromptModal
                appId={app.id}
                appName={app.name}
                level={level}
                grade={grade}
                subjectId={activeSubjectId}
                completedCount={completedCount}
            />
        </>
    );
};

export default AppRunnerPage;