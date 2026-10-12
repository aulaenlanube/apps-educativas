import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Archive, ArrowBigUp, Award, BatteryFull, Bed, BookMarked, BookOpen, BookOpenCheck, Bot, Boxes,
    Brain, BrainCircuit, Briefcase, Building2, Calculator, CalendarCheck, CalendarDays, Camera,
    ChevronDown, ChevronRight, ChevronUp, Clapperboard, ClipboardCheck, ClipboardList, Clock, Coffee,
    Cog, Coins, Compass, Contact, Contact2, Cookie, Cross, Dna, DoorOpen, Drama, Ear, Eye, Feather,
    FileEdit, FileLock, FileSignature, FileText, Filter, Fingerprint, Fish, Flag, FolderOpen, FolderTree,
    Footprints, Gauge, Gavel, Ghost, Glasses, Globe, Globe2, GraduationCap, Grid2x2, Hand, HeartCrack,
    HeartHandshake, Heart, HeartPulse, HelpCircle, HelpingHand, Home, Hourglass, Image, Key, Landmark,
    Languages, LampDesk, Laptop, Layers, LayoutList, Library, Lightbulb, LineChart, Link, ListChecks,
    Lock, LockKeyhole, MailOpen, Map, MapPin, MapPinned, Megaphone, MessageCircle, MessagesSquare,
    Mic2, Microscope, MonitorPlay, Moon, Mountain, Music, Network, Newspaper, PackageOpen, Palette, Pen,
    PenLine, PencilRuler, PenTool, PersonStanding, PiggyBank, Pilcrow, Presentation, Puzzle, Quote,
    Radio, Receipt, Rocket, Route, Scale, ScanFace, ScanSearch, School, Scroll, Search, SearchCheck,
    Share2, ShieldCheck, ShieldHalf, ShoppingBasket, Skull, Smartphone, Smile, Sparkles, SpellCheck,
    Sprout, Star, Stethoscope, Store, Sun, Tags, Target, Tent, TestTube, TestTubes, ThumbsUp,
    TowerControl, TrafficCone, Trees, TrendingUp, Trophy, Tv, Unlink, User, UserCheck, UserCircle2,
    UserCog, UserCog2, Users, Users2, UserSquare2, Utensils, Video, VenetianMask, Wand2, Waves,
    Waypoints, Weight, Wind, Workflow, Zap, ZoomIn,
} from 'lucide-react';
import { getAppContent } from '../../services/gameDataService';
import {
    GameShell, GameHeader, Hud, HudStat, Chip, GameButton, GameLoading, GameEmpty,
} from '../_shared/kit';
import './BancoRecursosTutoria.css';

/* ───────── Iconos: los datos traen clases de Font Awesome ───────── */

// La hoja de estilos de Font Awesome la bloquea la CSP de la web, así que los
// <i class="fa-…"> salían invisibles. Traducimos cada clase a un icono de
// lucide-react (los que usa toda la plataforma). Clave = nombre sin "fa-".

// «venus-mars» no existe en lucide-react 0.285: lo dibujamos con el mismo trazo.
const VenusMars = React.forwardRef(({ size = 24, strokeWidth = 2, color = 'currentColor', ...rest }, ref) => (
    <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
    >
        <circle cx="7.5" cy="11" r="4.5" />
        <path d="M7.5 15.5v6M4.5 18.5h6" />
        <circle cx="14.5" cy="11" r="4.5" />
        <path d="M17.7 7.8 21 4.5M16.5 4.5H21V9" />
    </svg>
));
VenusMars.displayName = 'VenusMars';

const FA_ICONS = {
    'address-card': Contact, 'arrow-up-right-dots': TrendingUp, award: Award,
    'basket-shopping': ShoppingBasket, 'battery-full': BatteryFull, bed: Bed, bolt: Zap,
    'bolt-lightning': Zap, 'book-bookmark': BookMarked, 'book-open': BookOpen,
    'book-open-reader': BookOpenCheck, 'box-archive': Archive, 'box-open': PackageOpen, brain: Brain,
    'brain-circuit': BrainCircuit, bridge: Waypoints, briefcase: Briefcase, 'building-columns': Landmark,
    'building-user': Building2, bullhorn: Megaphone, calculator: Calculator,
    'calendar-check': CalendarCheck, 'calendar-days': CalendarDays, 'camera-retro': Camera,
    'chalkboard-user': Presentation, 'chart-line': LineChart, child: PersonStanding,
    'circle-nodes': Share2, clapperboard: Clapperboard, 'clipboard-list': ClipboardList, clock: Clock,
    coins: Coins, 'comment-dots': MessageCircle, comments: MessagesSquare,
    'comments-dollar': MessagesSquare, compass: Compass, 'cookie-bite': Cookie, 'cubes-stacked': Boxes,
    desk: LampDesk, 'diagram-predecessor': Workflow, 'diagram-project': Workflow, dna: Dna,
    'door-open': DoorOpen, 'ear-listen': Ear, 'earth-americas': Globe, 'earth-europe': Globe2,
    'envelope-open-text': MailOpen, eye: Eye, 'face-smile-beam': Smile, 'feather-pointed': Feather,
    'file-contract': FileSignature, 'file-invoice': FileText, 'file-invoice-dollar': Receipt,
    'file-pen': FileEdit, 'file-shield': FileLock, 'file-signature': FileSignature, filter: Filter,
    fingerprint: Fingerprint, 'fish-fins': Fish, flag: Flag, 'folder-open': FolderOpen,
    'folder-tree': FolderTree, 'gauge-high': Gauge, gavel: Gavel, gears: Cog, hand: Hand,
    'hand-holding-dollar': PiggyBank, 'hand-holding-heart': HeartHandshake,
    'hands-asl-interpreting': Hand, 'hands-holding': HelpingHand, handshake: HeartHandshake,
    'handshake-angle': HelpingHand, 'handshake-simple': HeartHandshake, 'handshake-slash': Unlink,
    heart: Heart, 'heart-circle-bolt': HeartPulse, 'heart-circle-check': Heart, 'heart-crack': HeartCrack,
    'heart-pulse': HeartPulse, 'hourglass-half': Hourglass, 'house-chimney-window': Home,
    'house-user': Home, 'id-badge': Contact2, 'id-card': Contact, images: Image, key: Key,
    'kit-medical': Cross, language: Languages, 'laptop-code': Laptop, 'layer-group': Layers,
    lightbulb: Lightbulb, link: Link, 'list-check': ListChecks, 'magnifying-glass': Search,
    'magnifying-glass-chart': ScanSearch, 'magnifying-glass-dollar': SearchCheck,
    'magnifying-glass-plus': ZoomIn, map: Map, 'map-location': MapPinned, 'map-location-dot': MapPinned,
    'map-pin': MapPin, mask: VenetianMask, 'mask-face': VenetianMask, 'masks-theater': Drama,
    'microphone-lines': Mic2, microscope: Microscope, 'mobile-screen': Smartphone,
    'mobile-screen-button': Smartphone, moon: Moon, 'mountain-sun': Mountain, 'mug-hot': Coffee,
    music: Music, 'network-wired': Network, newspaper: Newspaper, palette: Palette, paragraph: Pilcrow,
    'pen-fancy': Pen, 'pen-nib': PenTool, 'pen-ruler': PencilRuler, 'people-arrows': Users2,
    'people-group': Users, 'person-circle-check': UserCheck, 'person-walking': PersonStanding,
    'puzzle-piece': Puzzle, question: HelpCircle, 'quote-left': Quote, radio: Radio,
    'ranking-star': Trophy, receipt: Receipt, 'rectangle-ad': MonitorPlay, 'rectangle-list': LayoutList,
    road: Route, robot: Bot, rocket: Rocket, 'scale-balanced': Scale, 'scale-unbalanced': Scale,
    'school-flag': School, scroll: Scroll, search: Search, seedling: Sprout, 'shield-halved': ShieldHalf,
    'shoe-prints': Footprints, 'skull-crossbones': Skull, 'spell-check': SpellCheck, sprout: Sprout,
    stairs: TrendingUp, star: Star, store: Store, sun: Sun, 'table-cells-large': Grid2x2, tags: Tags,
    tent: Tent, 'thumbs-up': ThumbsUp, 'tower-observation': TowerControl, 'traffic-light': TrafficCone,
    tree: Trees, tv: Tv, 'up-long': ArrowBigUp, user: User, 'user-astronaut': UserCircle2,
    'user-check': UserCheck, 'user-doctor': Stethoscope, 'user-gear': UserCog,
    'user-graduate': GraduationCap, 'user-group': Users2, 'user-lock': Lock, 'user-ninja': Ghost,
    'user-pen': PenLine, 'user-shield': ShieldCheck, 'user-tie': UserSquare2, users: Users,
    'users-gear': UserCog2, 'users-rays': Users2, 'users-viewfinder': ScanFace, utensils: Utensils,
    vault: LockKeyhole, 'venus-mars': VenusMars, 'vial-circle-check': TestTube, vials: TestTubes,
    video: Video, 'vr-cardboard': Glasses, 'wand-sparkles': Wand2, water: Waves, 'weight-scale': Weight,
    wind: Wind,
};

// Si llega una clase nueva que no está en la tabla, aproximamos por palabra clave.
const FA_KEYWORDS = [
    ['heart', Heart], ['users', Users], ['people', Users], ['user', User], ['book', BookOpen],
    ['file', FileText], ['hand', Hand], ['chart', LineChart], ['calendar', CalendarDays], ['map', Map],
    ['comment', MessageCircle], ['brain', Brain], ['shield', ShieldHalf], ['magnifying', Search],
    ['pen', Pen], ['star', Star],
];
const FA_MODIFIERS = new Set(['fa', 'solid', 'regular', 'light', 'thin', 'duotone', 'brands', 'sharp', 'fw', 'lg', 'xl', '2x', '3x']);

const faIcon = (cls = '') => {
    const name = String(cls).split(/\s+/)
        .map((t) => t.replace(/^fa-/, ''))
        .filter((t) => t && !FA_MODIFIERS.has(t))
        .pop();
    if (!name) return Sparkles;
    if (FA_ICONS[name]) return FA_ICONS[name];
    const hit = FA_KEYWORDS.find(([kw]) => name.includes(kw));
    return hit ? hit[1] : Sparkles;
};

function FaIcon({ name, ...rest }) {
    return React.createElement(faIcon(name), { 'aria-hidden': true, focusable: 'false', ...rest });
}

/* ───────── Piezas de presentación ───────── */

// Rúbrica: tabla de 3 columnas (Criterio / Excelente / Mejorable); en móvil, tarjetas.
function Rubric({ rows, title }) {
    return (
        <div className="brt-rubric" role="table" aria-label={`Rúbrica: ${title}`}>
            <div className="brt-rubric__row brt-rubric__row--head" role="row">
                <span className="brt-rubric__h" role="columnheader"><Target size={14} /> Criterio</span>
                <span className="brt-rubric__h is-ok" role="columnheader"><Star size={14} /> Excelente</span>
                <span className="brt-rubric__h is-ko" role="columnheader"><TrendingUp size={14} /> Mejorable</span>
            </div>
            {rows?.map((r, rIdx) => (
                <div key={rIdx} className="brt-rubric__row" role="row">
                    <span className="brt-rubric__crit" role="cell"><b>{r.criterion}</b></span>
                    <span className="brt-rubric__cell is-ok" role="cell" data-label="Excelente">{r.excellent}</span>
                    <span className="brt-rubric__cell is-ko" role="cell" data-label="Mejorable">{r.improvable}</span>
                </div>
            ))}
        </div>
    );
}

// Tarjeta de actividad (individual o grupal) con su rúbrica desplegable.
function ActivityCard({ kind, label, kindIcon: KindIcon, activity, open, onToggle }) {
    return (
        <article className={`brt-activity brt-activity--${kind}`}>
            <div className="brt-activity__head">
                <span className="brt-medal brt-medal--md"><FaIcon name={activity.icon} size={24} /></span>
                <div className="brt-activity__heading">
                    <span className="brt-tag"><KindIcon size={13} /> {label}</span>
                    <h4 className="brt-activity__title">{activity.title}</h4>
                </div>
            </div>
            <p className="brt-activity__text">{activity.text}</p>
            <div className="brt-activity__foot">
                <GameButton
                    variant={open ? 'primary' : 'soft'}
                    size="sm"
                    icon={ClipboardCheck}
                    iconRight={open ? ChevronUp : ChevronDown}
                    onClick={onToggle}
                    aria-expanded={open}
                >
                    {open ? 'Ocultar rúbrica' : 'Ver rúbrica'}
                </GameButton>
                {activity.rubric?.length > 0 && (
                    <span className="brt-activity__count">{activity.rubric.length} criterios de evaluación</span>
                )}
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="brt-rubric-wrap"
                    >
                        <Rubric rows={activity.rubric} title={activity.title} />
                    </motion.div>
                )}
            </AnimatePresence>
        </article>
    );
}

const BancoRecursosTutoria = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeBlock, setActiveBlock] = useState('block1');
    const [activeSessionIdx, setActiveSessionIdx] = useState(0);
    const [expandedRubrics, setExpandedRubrics] = useState({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getAppContent('banco-tutoria');
                setBlocks(data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error loading tutoring data:", error);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const toggleRubric = (id) => {
        setExpandedRubrics(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleBlockChange = (blockId) => {
        setActiveBlock(blockId);
        setActiveSessionIdx(0);
        setExpandedRubrics({});
    };

    if (loading) {
        return (
            <GameShell wide className="brt-shell">
                <GameHeader />
                <GameLoading label="Cargando recursos..." />
            </GameShell>
        );
    }

    if (!blocks || blocks.length === 0) {
        return (
            <GameShell wide className="brt-shell">
                <GameHeader />
                <GameEmpty title="Sin recursos">No se pudieron cargar los datos de tutoría.</GameEmpty>
            </GameShell>
        );
    }

    const currentBlock = blocks.find(b => b.id === activeBlock) || blocks[0];
    const currentSession = currentBlock.sessions[activeSessionIdx] || currentBlock.sessions[0];

    // Solo presentación: el color del bloque tiñe todo el escenario.
    const color = currentBlock.color;
    const blockNumber = blocks.indexOf(currentBlock) + 1;
    const totalSessions = blocks.reduce((n, b) => n + (b.sessions?.length || 0), 0);
    const indKey = `${activeBlock}-${activeSessionIdx}-ind`;
    const grpKey = `${activeBlock}-${activeSessionIdx}-grp`;

    return (
        <GameShell
            wide
            className="brt-shell"
            accent={color}
            accent2={`color-mix(in srgb, ${color} 60%, white)`}
            style={{ '--brt-c': color }}
        >
            <GameHeader
                right={(
                    <Hud>
                        <HudStat icon={Layers} tone="accent" value={blocks.length} label="Bloques" />
                        <HudStat icon={CalendarDays} tone="accent" value={totalSessions} label="Sesiones" />
                    </Hud>
                )}
            />

            <div className="brt-layout">
                {/* Índice de bloques temáticos (siempre visible) */}
                <nav className="brt-index" aria-label="Bloques temáticos">
                    <span className="brt-index__label"><Library size={14} /> Bloques temáticos</span>
                    <div className="brt-index__list">
                        {blocks.map((block, idx) => {
                            const isActive = activeBlock === block.id;
                            return (
                                <motion.button
                                    key={block.id}
                                    type="button"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03, duration: 0.3, ease: 'easeOut' }}
                                    className={`brt-cat ${isActive ? 'is-active' : ''}`}
                                    style={{ '--c': block.color }}
                                    onClick={() => handleBlockChange(block.id)}
                                    aria-current={isActive ? 'true' : undefined}
                                >
                                    <span className="brt-medal brt-medal--sm"><FaIcon name={block.icon} size={17} /></span>
                                    <span className="brt-cat__text">
                                        <span className="brt-cat__title">{block.title}</span>
                                        <span className="brt-cat__meta">{block.sessions?.length || 0} sesiones</span>
                                    </span>
                                    <ChevronRight className="brt-cat__arrow" size={16} aria-hidden="true" />
                                </motion.button>
                            );
                        })}
                    </div>
                </nav>

                <AnimatePresence mode="wait">
                    <motion.main
                        key={activeBlock}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -24 }}
                        transition={{ duration: 0.35, ease: "circOut" }}
                        className="brt-main"
                    >
                        {/* Portada del bloque */}
                        <section className="brt-hero">
                            <span className="brt-hero__pattern" aria-hidden="true" />
                            <div className="brt-hero__art" aria-hidden="true">
                                <span className="brt-hero__ring brt-hero__ring--a" />
                                <span className="brt-hero__ring brt-hero__ring--b" />
                                <span className="brt-medal brt-medal--xl"><FaIcon name={currentBlock.icon} size={50} strokeWidth={1.9} /></span>
                                <span className="brt-hero__spark brt-hero__spark--a" />
                                <span className="brt-hero__spark brt-hero__spark--b" />
                            </div>
                            <div className="brt-hero__text">
                                <span className="brt-eyebrow">Bloque {blockNumber} de {blocks.length}</span>
                                <h2 className="brt-hero__title">{currentBlock.title}</h2>
                                <p className="brt-hero__desc">{currentBlock.desc}</p>
                            </div>

                            {/* Sesiones del bloque */}
                            <div className="brt-tabs" role="tablist" aria-label="Sesiones del bloque">
                                {currentBlock.sessions.map((s, sIdx) => (
                                    <button
                                        key={sIdx}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeSessionIdx === sIdx}
                                        className={`brt-tab ${activeSessionIdx === sIdx ? 'is-active' : ''}`}
                                        onClick={() => setActiveSessionIdx(sIdx)}
                                        title={s.title}
                                    >
                                        <span className="brt-tab__num">{sIdx + 1}</span>
                                        <span className="brt-tab__text">
                                            <span className="brt-tab__label">Sesión {sIdx + 1}</span>
                                            <span className="brt-tab__title">{s.title}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${activeBlock}-${activeSessionIdx}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="brt-session"
                            >
                                <header className="brt-session__head">
                                    <div className="brt-session__heading">
                                        <span className="brt-eyebrow">Sesión {activeSessionIdx + 1} de {currentBlock.sessions.length}</span>
                                        <h3 className="brt-session__title">{currentSession.title}</h3>
                                    </div>
                                    <Chip tone="soft" icon={Clock} className="brt-duration">{currentSession.duration}</Chip>
                                </header>

                                {/* Recurso didáctico (destacado) */}
                                <article className="brt-resource">
                                    <div className="brt-resource__side" aria-hidden="true">
                                        <span className="brt-resource__glyph"><FaIcon name={currentSession.resource.icon} size={36} /></span>
                                    </div>
                                    <div className="brt-resource__body">
                                        <span className="brt-tag brt-tag--solid"><Lightbulb size={13} /> Recurso didáctico</span>
                                        <h4 className="brt-resource__title">{currentSession.resource.title}</h4>
                                        <p className="brt-resource__text">{currentSession.resource.text}</p>
                                    </div>
                                </article>

                                <ActivityCard
                                    kind="ind"
                                    label="Actividad individual"
                                    kindIcon={User}
                                    activity={currentSession.individual}
                                    open={!!expandedRubrics[indKey]}
                                    onToggle={() => toggleRubric(indKey)}
                                />

                                <ActivityCard
                                    kind="grp"
                                    label="Actividad grupal"
                                    kindIcon={Users}
                                    activity={currentSession.group}
                                    open={!!expandedRubrics[grpKey]}
                                    onToggle={() => toggleRubric(grpKey)}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </motion.main>
                </AnimatePresence>
            </div>
        </GameShell>
    );
};

export default BancoRecursosTutoria;
