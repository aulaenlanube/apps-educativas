import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Cpu, Trash2, Lightbulb, RotateCcw, Check, ArrowRight, Clock, Zap, ZoomIn, ZoomOut, Move, Maximize2,
  Volume2, VolumeX, Save, FolderOpen, X, Plus, Gauge, Wrench, CircuitBoard, LayoutGrid, Plug,
  AlertTriangle, Pencil,
} from 'lucide-react';
import InstructionsModal from '../_shared/InstructionsModal';
import {
  GameShell, GameHeader, Hud, HudStat, ProgressDots, GameButton, ModeSelect, RoundBanner,
  ResultsScreen, FeedbackItem,
} from '../_shared/kit';
import { COMPONENT_TEMPLATES, getExercises } from './roboticaData';
import { listDesigns, saveDesign, deleteDesign } from './robotLabDesignsService';
import { useAuth } from '@/contexts/AuthContext';
import ComponentArt from './LabArt';
import './LaboratorioRobotica.css';

const BOARD_W = 820;
const BOARD_H = 480;
const COLOR_PALETTE = ['#ef4444', '#22c55e', '#0ea5e9', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];

// Categorías de la paleta del Modo libre.
const PALETTE_CATEGORIES = [
  {
    id: 'power', label: '⚡ Alimentación',
    types: ['battery', 'arduino'],
  },
  {
    id: 'output', label: '💡 Salidas',
    types: ['led', 'led2', 'rgb', 'buzzer', 'motor', 'servo'],
  },
  {
    id: 'input', label: '🎛 Entradas',
    types: ['switch', 'button', 'pot', 'ldr', 'ntc', 'pir', 'ir', 'ultrasonic'],
  },
  {
    id: 'passive', label: '〰 Pasivos',
    types: ['resistor', 'resistorK', 'driverH'],
  },
];

const normPair = (a, b) => [a, b].sort().join('|');

const getPinAbsPos = (component, pin) => ({
  x: component.x + pin.x,
  y: component.y + pin.y,
});

const findPin = (components, pinKey) => {
  const [compId, pinId] = pinKey.split('.');
  const comp = components.find(c => c.id === compId);
  if (!comp) return null;
  const tpl = COMPONENT_TEMPLATES[comp.type];
  const pin = tpl.pins.find(p => p.id === pinId);
  if (!pin) return null;
  return { comp, tpl, pin, abs: getPinAbsPos(comp, pin) };
};

const wireColor = (index) => COLOR_PALETTE[index % COLOR_PALETTE.length];

// -----------------------------------------------------------------------------
// Análisis del circuito (BFS sobre los pines).
// Cada componente aporta:
//   · Aristas internas (siempre o según estado: switch on, button pressed…).
//   · Fuentes HIGH (5V, batería +, OUT activado de un sensor).
//   · Sumideros LOW (GND, batería −).
// Un componente "activo" (LED, buzzer, motor…) está encendido si una de sus
// terminales alcanza una fuente HIGH y la otra alcanza un sumidero LOW por la
// red de cables, sin pasar por el propio componente (no le ponemos arista
// interna).
// -----------------------------------------------------------------------------

const ARDUINO_OUTPUT_PINS = ['D2','D3','D4','D5','D6','D8','D9','D10','D11','D13'];

function buildCircuitGraph(components, wires, states) {
  const adj = new Map();
  const add = (u, v) => {
    if (!adj.has(u)) adj.set(u, new Set());
    if (!adj.has(v)) adj.set(v, new Set());
    adj.get(u).add(v);
    adj.get(v).add(u);
  };
  wires.forEach(w => add(w.a, w.b));
  components.forEach(c => {
    const s = states[c.id] || {};
    const k = (p) => `${c.id}.${p}`;
    switch (c.type) {
      case 'switch':
        if (s.on) add(k('a'), k('b'));
        break;
      case 'button':
        if (s.pressed) add(k('a'), k('b'));
        break;
      case 'resistor':
      case 'resistorK':
      case 'ldr':
      case 'ntc':
        add(k('a'), k('b'));
        break;
      case 'pot':
        add(k('1'), k('2'));
        add(k('2'), k('3'));
        add(k('1'), k('3'));
        break;
      // Componentes activos de 2 terminales SÍ conducen internamente, así
      // pueden conectarse en serie (varios LEDs encadenados, motor + buzzer,
      // etc.) y la corriente fluye por todos.
      case 'led':
      case 'led2':
      case 'buzzer':
        add(k('+'), k('-'));
        break;
      case 'motor':
        add(k('a'), k('b'));
        break;
      // RGB tiene canales independientes (R, G, B con cátodo común). NO
      // añadimos aristas internas para no marcar canales no conectados.
      // Sensores (pir, ir, ultrasonic, servo), fuentes (battery, arduino)
      // y driverH no aportan aristas internas — se gestionan aparte.
      default: break;
    }
  });
  return adj;
}

function analyzeCircuit(components, wires, states) {
  const adj = buildCircuitGraph(components, wires, states);
  const high = new Set();
  const low = new Set();
  components.forEach(c => {
    const s = states[c.id] || {};
    const k = (p) => `${c.id}.${p}`;
    switch (c.type) {
      case 'battery':
        high.add(k('+'));
        low.add(k('-'));
        break;
      case 'arduino':
        high.add(k('5V'));
        low.add(k('GND'));
        // Tratamos los pines digitales como salidas HIGH para visualización
        ARDUINO_OUTPUT_PINS.forEach(p => high.add(k(p)));
        break;
      case 'pir':
      case 'ir':
        if (s.triggered) high.add(k('OUT'));
        break;
      default: break;
    }
  });

  const reach = (sources) => {
    const set = new Set(sources);
    const queue = [...sources];
    while (queue.length > 0) {
      const node = queue.shift();
      const nbrs = adj.get(node);
      if (!nbrs) continue;
      for (const n of nbrs) if (!set.has(n)) { set.add(n); queue.push(n); }
    }
    return set;
  };

  const highReach = reach(high);
  const lowReach = reach(low);
  const isPoweredPair = (a, b) =>
    (highReach.has(a) && lowReach.has(b)) ||
    (highReach.has(b) && lowReach.has(a));

  const active = {};
  components.forEach(c => {
    const k = (p) => `${c.id}.${p}`;
    switch (c.type) {
      case 'led':
      case 'led2':
        active[c.id] = isPoweredPair(k('+'), k('-'));
        break;
      case 'buzzer':
        active[c.id] = isPoweredPair(k('+'), k('-'));
        break;
      case 'motor':
        active[c.id] = isPoweredPair(k('a'), k('b'));
        break;
      case 'rgb': {
        const gndOk = lowReach.has(k('GND'));
        active[c.id] = {
          R: gndOk && highReach.has(k('R')),
          G: gndOk && highReach.has(k('G')),
          B: gndOk && highReach.has(k('B')),
        };
        break;
      }
      case 'servo': {
        const powered = highReach.has(k('VCC')) && lowReach.has(k('GND'));
        active[c.id] = powered && highReach.has(k('SIG'));
        break;
      }
      case 'pir':
      case 'ir':
      case 'ultrasonic':
        active[c.id] = highReach.has(k('VCC')) && lowReach.has(k('GND'));
        break;
      case 'arduino':
        active[c.id] = true;
        break;
      default: break;
    }
  });
  return { active };
}

// --- Renderers -------------------------------------------------------------

// Parte interactiva de algunos componentes (interruptor, pulsador, sensores,
// potenciómetro). El dibujo del componente lo pone <ComponentArt>.
const ComponentWidget = ({ component, active, state, onToggleState, onButtonDown }) => {
  switch (component.type) {
    case 'switch':
      return (
        <button
          type="button"
          className={`rob-w-switch ${state?.on ? 'on' : ''}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onToggleState(component.id, 'on'); }}
          title={state?.on ? 'Apagar interruptor' : 'Encender interruptor'}
          aria-pressed={!!state?.on}
        >
          <span className="rob-w-switch__knob" />
          <span className="rob-w-switch__txt">{state?.on ? 'ON' : 'OFF'}</span>
        </button>
      );
    case 'button':
      return (
        <button
          type="button"
          className={`rob-w-push ${state?.pressed ? 'pressed' : ''}`}
          onPointerDown={(e) => { e.stopPropagation(); onButtonDown(component.id); }}
          title="Mantén pulsado para activar"
          aria-label="Pulsador"
        >
          <span className="rob-w-push__cap" />
        </button>
      );
    case 'pir':
    case 'ir':
      return (
        <button
          type="button"
          className={`rob-w-sensor ${state?.triggered ? 'triggered' : ''} ${active ? 'powered' : ''}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onToggleState(component.id, 'triggered'); }}
          title={active ? (state?.triggered ? 'Desactivar detección' : 'Simular detección') : 'Conecta VCC y GND para activar'}
        >
          <span className="rob-w-led" />
          <span className="rob-w-sensor__txt">{state?.triggered ? 'DETECTA' : 'STAND-BY'}</span>
        </button>
      );
    case 'ultrasonic':
      return (
        <div className={`rob-w-chip ${active ? 'powered' : ''}`}>
          <span className="rob-w-led" />
          <span>{active ? 'ON' : 'OFF'}</span>
        </div>
      );
    case 'pot': {
      const pos = state?.position ?? 1; // 0 = mín, 1 = medio, 2 = máx
      const angle = pos === 0 ? -90 : pos === 2 ? 90 : 0;
      const labels = ['MIN', '50%', 'MAX'];
      return (
        <button
          type="button"
          className="rob-w-pot"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onToggleState(component.id, 'position', (pos + 1) % 3); }}
          title="Click para girar"
        >
          <span className="rob-w-pot__dial" style={{ transform: `rotate(${angle}deg)` }}><span className="rob-w-pot__mark" /></span>
          <span className="rob-w-pot__txt">{labels[pos]}</span>
        </button>
      );
    }
    default:
      return null;
  }
};

const ComponentNode = ({ component, onPinClick, selectedPin, wiredPins, onComponentPointerDown, isDragging, isSelected, active, state, onToggleState, onButtonDown }) => {
  const tpl = COMPONENT_TEMPLATES[component.type];
  if (!tpl) return null;
  const isOn = component.type === 'rgb'
    ? !!(active && (active.R || active.G || active.B))
    : !!active;
  return (
    <div
      className={`rob-component type-${component.type} ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''} ${isOn ? 'is-on' : ''}`}
      style={{
        left: component.x,
        top: component.y,
        width: tpl.w,
        height: tpl.h,
        '--c': tpl.color,
      }}
      onPointerDown={(e) => onComponentPointerDown(e, component.id)}
    >
      <ComponentArt type={component.type} w={tpl.w} h={tpl.h} color={tpl.color} active={active} />
      <span className="rob-tag"><span className="rob-tag__dot" />{tpl.label}</span>
      <div className="rob-widget">
        <ComponentWidget
          component={component}
          active={active}
          state={state}
          onToggleState={onToggleState}
          onButtonDown={onButtonDown}
        />
      </div>
      {tpl.pins.map((pin) => {
        const pinKey = `${component.id}.${pin.id}`;
        const isSelected = selectedPin === pinKey;
        const isWired = wiredPins.has(pinKey);
        // Lado del pin según su posición en la caja: permite colocar la
        // etiqueta dentro del componente en vez de por fuera del borde.
        let side = 'center';
        if (pin.x <= 1) side = 'left';
        else if (pin.x >= tpl.w - 1) side = 'right';
        else if (pin.y <= 1) side = 'top';
        else if (pin.y >= tpl.h - 1) side = 'bottom';
        return (
          <button
            key={pin.id}
            type="button"
            className={`rob-pin side-${side} ${isSelected ? 'selected' : ''} ${isWired ? 'wired' : ''}`}
            style={{ left: pin.x, top: pin.y }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(pinKey);
            }}
            aria-label={`Pin ${pin.label} de ${component.id}`}
          >
            <span className="rob-pin-dot" />
            <span className="rob-pin-label">{pin.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Cálculo inteligente de la trayectoria de un cable.
// Para evitar que los cables se amontonen cuando comparten origen o destino,
// calculamos un desplazamiento perpendicular en función del índice dentro del
// "haz" (bundle) de cables que comparten pines cercanos.
const wirePath = (a, b, offsetIdx = 0) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;

  // Tirón horizontal que da la curva "electrónica" típica.
  const horizontal = Math.max(45, Math.abs(dx) * 0.4);

  // Vector perpendicular unitario para abrir los cables en abanico.
  const nx = -dy / dist;
  const ny = dx / dist;

  // Paso variable: más corto en distancias cortas, pero siempre limitado.
  const step = Math.min(22, 6 + dist / 40);
  const off = offsetIdx * step;

  const c1x = a.x + horizontal + nx * off;
  const c1y = a.y + ny * off;
  const c2x = b.x - horizontal + nx * off;
  const c2y = b.y + ny * off;

  return `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`;
};

// Asigna a cada cable un índice de desplazamiento para el fan-out. Los cables
// que comparten al menos un pin con otro obtienen índices centrados en 0 para
// abrirse en abanico sin cruzarse.
const computeWireOffsets = (wireKeys) => {
  // Agrupamos por pin extremo. Cada pin guarda la lista de cables que toca.
  const pinToWires = new Map();
  wireKeys.forEach((key, i) => {
    const [a, b] = key.split('|');
    [a, b].forEach((pin) => {
      if (!pinToWires.has(pin)) pinToWires.set(pin, []);
      pinToWires.get(pin).push(i);
    });
  });
  // Para cada cable, tomamos el grupo con MÁS hermanos entre sus extremos.
  const offsets = wireKeys.map(() => 0);
  wireKeys.forEach((key, i) => {
    const [a, b] = key.split('|');
    const groupA = pinToWires.get(a) || [i];
    const groupB = pinToWires.get(b) || [i];
    const group = groupA.length >= groupB.length ? groupA : groupB;
    const posInGroup = group.indexOf(i);
    const centered = posInGroup - (group.length - 1) / 2;
    offsets[i] = centered;
  });
  return offsets;
};

// Camino a través de waypoints (polilínea con esquinas redondeadas).
const polylinePath = (a, waypoints, b) => {
  const pts = [a, ...(waypoints || []), b];
  return `M ${pts.map(p => `${p.x} ${p.y}`).join(' L ')}`;
};

const WireLayer = ({ wires, components, pendingStart, pendingWaypoints, mousePos, onWireClick, width, height }) => {
  const getPos = (pinKey) => {
    const p = findPin(components, pinKey);
    return p ? p.abs : null;
  };

  const wirePairKeys = useMemo(() => wires.map(w => normPair(w.a, w.b)), [wires]);
  const offsets = useMemo(() => computeWireOffsets(wirePairKeys), [wirePairKeys]);

  const pendingPos = pendingStart ? getPos(pendingStart) : null;

  // Cada cable se dibuja como un cable real: funda oscura + color + brillo,
  // con un terminal metálico en cada extremo.
  return (
    <svg className="rob-wires" width={width} height={height} style={{ overflow: 'visible' }}>
      {wires.map((wire, i) => {
        const pa = getPos(wire.a);
        const pb = getPos(wire.b);
        if (!pa || !pb) return null;
        const hasWp = (wire.waypoints || []).length > 0;
        const d = hasWp ? polylinePath(pa, wire.waypoints, pb) : wirePath(pa, pb, offsets[i] || 0);
        return (
          <g
            key={wire.id}
            className="rob-wire"
            onClick={(e) => { e.stopPropagation(); onWireClick(wire.id); }}
          >
            <path className="rob-wire__shade" d={d} stroke="rgba(2, 6, 23, 0.55)" strokeWidth="9" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" />
            <path className="rob-wire__core" d={d} stroke={wireColor(i)} strokeWidth="6" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" />
            <path className="rob-wire__gloss" d={d} stroke="#fff" strokeOpacity="0.45" strokeWidth="1.6" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" transform="translate(-0.8 -1.4)" />
            <circle cx={pa.x} cy={pa.y} r="4.2" fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />
            <circle cx={pb.x} cy={pb.y} r="4.2" fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />
            <path d={d} stroke="transparent" strokeWidth="18" fill="none" strokeLinejoin="round" />
          </g>
        );
      })}

      {pendingPos && mousePos && (
        <>
          <path
            d={polylinePath(pendingPos, pendingWaypoints, mousePos)}
            stroke="rgba(2, 6, 23, 0.5)"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            className="rob-wire__pending"
            d={polylinePath(pendingPos, pendingWaypoints, mousePos)}
            stroke="#22d3ee"
            strokeWidth="4"
            strokeDasharray="6 6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {(pendingWaypoints || []).map((w, i) => (
            <circle key={`wp-${i}`} cx={w.x} cy={w.y} r="5.5"
                    fill="#22d3ee" stroke="#fff" strokeWidth="2" />
          ))}
          <circle cx={mousePos.x} cy={mousePos.y} r="6" fill="none" stroke="#22d3ee" strokeWidth="2" />
        </>
      )}
    </svg>
  );
};

const SHELL = { accent: '#06b6d4', accent2: '#2563eb' };

// --- Main App --------------------------------------------------------------

const LaboratorioRobotica = ({ onGameComplete, isPaused }) => {
  const { grade: gradeParam } = useParams();
  const grade = useMemo(() => String(gradeParam || '1'), [gradeParam]);
  const exercises = useMemo(() => getExercises(grade), [grade]);

  // Pantallas: 'intro' → 'practice-select'|'exam' → 'play' → 'summary'
  const [screen, setScreen] = useState('intro');
  const [mode, setMode] = useState('easy'); // easy | medium | exam
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [wires, setWires] = useState([]); // [{ id, a, b, waypoints: [{x,y}] }]
  const [pendingStart, setPendingStart] = useState(null);
  const [pendingWaypoints, setPendingWaypoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [, setHintsUsed] = useState(0);
  const [showHintText, setShowHintText] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Estado de examen
  const [examStep, setExamStep] = useState(0);
  const [examResults, setExamResults] = useState([]);
  const [examStartAt, setExamStartAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [summaryScore, setSummaryScore] = useState(0); // solo visual (puntos del resumen)
  const completedRef = useRef(false);
  const boardRef = useRef(null);

  // Estado de layout: posiciones arrastradas, zoom y pan.
  const [positions, setPositions] = useState({});
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(null);
  useEffect(() => { dragRef.current = drag; }, [drag]);

  // Estado interactivo de cada componente (switch on/off, button pressed,
  // sensor triggered…).
  const [componentStates, setComponentStates] = useState({});

  // ---- Modo libre ----------------------------------------------------------
  const { student, teacher, isStudent, isTeacher } = useAuth();
  const userId = isStudent ? student?.id : isTeacher ? teacher?.id : null;
  const userType = isStudent ? 'student' : isTeacher ? 'teacher' : null;

  const [freeComponents, setFreeComponents] = useState([]);
  const [freeName, setFreeName] = useState('Mi diseño');
  const [freeDesignId, setFreeDesignId] = useState(null);
  const [, setFreeCounter] = useState(0);
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDesignsList, setShowDesignsList] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [savingState, setSavingState] = useState(null); // 'saving' | 'saved' | 'error' | null

  const handleToggleState = useCallback((compId, key, value) => {
    setComponentStates(prev => ({
      ...prev,
      [compId]: {
        ...prev[compId],
        [key]: value !== undefined ? value : !prev[compId]?.[key],
      },
    }));
  }, []);

  const handleButtonDown = useCallback((compId) => {
    setComponentStates(prev => ({
      ...prev,
      [compId]: { ...prev[compId], pressed: true },
    }));
  }, []);

  // Liberar todos los pulsadores cuando se suelta el ratón.
  useEffect(() => {
    const onUp = () => {
      setComponentStates(prev => {
        let changed = false;
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (next[k]?.pressed) {
            next[k] = { ...next[k], pressed: false };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    };
    window.addEventListener('pointerup', onUp);
    return () => window.removeEventListener('pointerup', onUp);
  }, []);

  const exercise = exercises[exerciseIndex];
  const isLibre = mode === 'libre';

  // En modo libre, los componentes vienen del estado libre. En el resto, del
  // ejercicio. Las posiciones arrastradas se aplican igual sobre ambos.
  const baseComponents = useMemo(
    () => (isLibre ? freeComponents : (exercise?.components || [])),
    [isLibre, freeComponents, exercise],
  );
  const componentsPositioned = useMemo(() => {
    return baseComponents.map((c) => {
      const p = positions[c.id];
      return p ? { ...c, x: p.x, y: p.y } : c;
    });
  }, [baseComponents, positions]);

  const targetSet = useMemo(() => new Set(exercise?.target || []), [exercise]);
  const wirePairKeys = useMemo(() => wires.map(w => normPair(w.a, w.b)), [wires]);
  const userSet = useMemo(() => new Set(wirePairKeys), [wirePairKeys]);
  const wiredPins = useMemo(() => {
    const s = new Set();
    wires.forEach(w => { s.add(w.a); s.add(w.b); });
    return s;
  }, [wires]);

  // Timer para examen
  useEffect(() => {
    if (mode !== 'exam' || screen !== 'play' || isPaused) return;
    const id = setInterval(() => {
      if (examStartAt) setElapsed(Math.floor((Date.now() - examStartAt) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [mode, screen, examStartAt, isPaused]);

  // Limpiar estado al cambiar ejercicio
  useEffect(() => {
    setWires([]);
    setPendingStart(null);
    setPendingWaypoints([]);
    setFeedback(null);
    setShowHintText(false);
    setHintsUsed(0);
    setPositions({});
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setComponentStates({});
  }, [exerciseIndex, mode]);

  // Solo vista: en pantallas estrechas el tablero se ajusta al ancho disponible
  // (zoom inicial) para ver el circuito entero. El usuario puede seguir
  // acercando/alejando con los controles.
  useEffect(() => {
    if (screen !== 'play') return;
    const el = boardRef.current;
    const w = el ? el.clientWidth : 0;
    if (w && w < BOARD_W - 1) {
      setZoom(Math.max(0.4, w / BOARD_W));
      setPan({ x: 0, y: 0 });
    }
  }, [screen, exerciseIndex, mode]);

  // Análisis del circuito: qué componentes están activos según los cables y
  // los estados interactivos. Se recalcula cuando cambia algo relevante.
  const circuit = useMemo(
    () => analyzeCircuit(baseComponents, wires, componentStates),
    [baseComponents, wires, componentStates]
  );

  // ---- Audio de zumbadores -------------------------------------------------
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef(null);
  const buzzerNodesRef = useRef(new Map()); // compId -> { osc, gain }

  useEffect(() => {
    const stopAll = () => {
      buzzerNodesRef.current.forEach(({ osc, gain }) => {
        try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch {}
      });
      buzzerNodesRef.current.clear();
    };
    if (!soundEnabled) { stopAll(); return; }

    const components = exercise?.components || [];
    const activeIds = components
      .filter((c) => c.type === 'buzzer' && circuit.active[c.id])
      .map((c) => c.id);
    const activeSet = new Set(activeIds);

    // Detener osciladores que ya no deben sonar.
    buzzerNodesRef.current.forEach(({ osc, gain }, id) => {
      if (!activeSet.has(id)) {
        try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch {}
        buzzerNodesRef.current.delete(id);
      }
    });
    if (activeIds.length === 0) return;

    // Crear AudioContext bajo demanda y reanudar si está suspendido.
    if (!audioCtxRef.current) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtxRef.current = new Ctx();
      } catch { return; }
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    activeIds.forEach((id, i) => {
      if (buzzerNodesRef.current.has(id)) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 700 + i * 80; // tono distinto si hay varios
        gain.gain.value = 0.06; // volumen suave
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        buzzerNodesRef.current.set(id, { osc, gain });
      } catch {}
    });
  }, [circuit.active, exercise, soundEnabled]);

  // Limpieza al desmontar la app.
  useEffect(() => () => {
    buzzerNodesRef.current.forEach(({ osc, gain }) => {
      try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch {}
    });
    buzzerNodesRef.current.clear();
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} }
  }, []);

  // Tecla Escape cancela el cable en progreso; Suprimir/Backspace en modo
  // libre borra el componente seleccionado (lógica inlineada para evitar
  // ciclos de declaración con removeFreeComponent).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && pendingStart) {
        setPendingStart(null);
        setPendingWaypoints([]);
        setMousePos(null);
      }
      if (isLibre && (e.key === 'Delete' || e.key === 'Backspace') && selectedCompId) {
        const tag = (e.target?.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        const id = selectedCompId;
        setFreeComponents(prev => prev.filter(c => c.id !== id));
        setWires(prev => prev.filter(w => {
          const [ca] = w.a.split('.');
          const [cb] = w.b.split('.');
          return ca !== id && cb !== id;
        }));
        setSelectedCompId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pendingStart, isLibre, selectedCompId]);

  const startPractice = (difficulty) => {
    setMode(difficulty);
    setExerciseIndex(0);
    setScreen('play');
    completedRef.current = false;
  };

  const startExam = () => {
    setMode('exam');
    setExerciseIndex(0);
    setExamStep(0);
    setExamResults([]);
    setExamStartAt(Date.now());
    setElapsed(0);
    setScreen('play');
    completedRef.current = false;
  };

  const startLibre = () => {
    setMode('libre');
    setFreeComponents([]);
    setFreeName('Mi diseño');
    setFreeDesignId(null);
    setFreeCounter(0);
    setSelectedCompId(null);
    setWires([]);
    setPendingStart(null);
    setPendingWaypoints([]);
    setComponentStates({});
    setPositions({});
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setScreen('play');
  };

  // ---- Modo libre: añadir/quitar componentes ----
  const addFreeComponent = useCallback((type) => {
    setFreeCounter((n) => {
      const tpl = COMPONENT_TEMPLATES[type];
      const id = `c${n + 1}`;
      // Ubicar en el centro del viewport actual (en coords de mundo).
      const wx = ((-pan.x) + (BOARD_W / 2) - (tpl?.w || 80) / 2) / zoom;
      const wy = ((-pan.y) + (BOARD_H / 2) - (tpl?.h || 80) / 2) / zoom;
      // Añadimos un pequeño offset diagonal para que no se apilen exactamente.
      const off = (n % 6) * 18;
      setFreeComponents((prev) => [...prev, { id, type, x: wx + off, y: wy + off }]);
      return n + 1;
    });
  }, [pan, zoom]);

  const removeFreeComponent = useCallback((compId) => {
    setFreeComponents((prev) => prev.filter((c) => c.id !== compId));
    // Quitamos también los cables conectados a ese componente
    setWires((prev) => prev.filter((w) => {
      const [ca] = w.a.split('.');
      const [cb] = w.b.split('.');
      return ca !== compId && cb !== compId;
    }));
    if (selectedCompId === compId) setSelectedCompId(null);
  }, [selectedCompId]);

  const clearFree = () => {
    setFreeComponents([]);
    setWires([]);
    setComponentStates({});
    setPositions({});
    setSelectedCompId(null);
    setFreeDesignId(null);
  };

  // ---- Modo libre: persistencia ----
  const refreshDesigns = useCallback(async () => {
    const list = await listDesigns({ userId, userType });
    setSavedDesigns(list || []);
  }, [userId, userType]);

  const handleOpenDesignsList = async () => {
    await refreshDesigns();
    setShowDesignsList(true);
  };

  const handleSaveDesign = async () => {
    setSavingState('saving');
    // Mezcla las posiciones arrastradas dentro de los componentes guardados
    // para que al reabrir el diseño esté tal cual lo dejó el alumno.
    const componentsToSave = freeComponents.map((c) => {
      const p = positions[c.id];
      return p ? { ...c, x: p.x, y: p.y } : c;
    });
    try {
      const id = await saveDesign({
        id: typeof freeDesignId === 'number' || (typeof freeDesignId === 'string' && freeDesignId.startsWith('local_')) ? freeDesignId : null,
        userId, userType,
        name: freeName,
        components: componentsToSave,
        wires,
      });
      setFreeDesignId(id);
      setSavingState('saved');
      setTimeout(() => setSavingState(null), 1500);
    } catch {
      setSavingState('error');
      setTimeout(() => setSavingState(null), 2500);
    }
  };

  const handleLoadDesign = (d) => {
    const comps = Array.isArray(d.components) ? d.components : [];
    setFreeComponents(comps);
    // El contador se reinicia a partir del id máximo encontrado
    let maxN = 0;
    comps.forEach((c) => {
      const m = String(c.id).match(/^c(\d+)$/);
      if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
    });
    setFreeCounter(maxN);
    setWires(Array.isArray(d.wires) ? d.wires : []);
    setFreeName(d.name || 'Mi diseño');
    setFreeDesignId(d.id);
    setSelectedCompId(null);
    setPositions({});
    setComponentStates({});
    setShowDesignsList(false);
  };

  const handleDeleteDesign = async (d) => {
    const ok = await deleteDesign({ id: d.id, userId, userType });
    if (ok) {
      setSavedDesigns((prev) => prev.filter((x) => String(x.id) !== String(d.id)));
      if (String(freeDesignId) === String(d.id)) setFreeDesignId(null);
    }
  };

  const handlePinClick = useCallback((pinKey) => {
    setFeedback(null);
    if (!pendingStart) {
      setPendingStart(pinKey);
      setPendingWaypoints([]);
      return;
    }
    if (pendingStart === pinKey) {
      setPendingStart(null);
      setPendingWaypoints([]);
      return;
    }
    const [compA] = pendingStart.split('.');
    const [compB] = pinKey.split('.');
    if (compA === compB) {
      setFeedback({ type: 'warn', text: 'No puedes conectar dos pines del mismo componente entre sí.' });
      setPendingStart(null);
      setPendingWaypoints([]);
      return;
    }
    const pairKey = normPair(pendingStart, pinKey);
    setWires(prev => {
      if (prev.some(w => normPair(w.a, w.b) === pairKey)) return prev;
      return [...prev, {
        id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        a: pendingStart,
        b: pinKey,
        waypoints: pendingWaypoints.slice(),
      }];
    });
    setPendingStart(null);
    setPendingWaypoints([]);
  }, [pendingStart, pendingWaypoints]);

  const handleBoardMouseMove = (e) => {
    if (!pendingStart || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    // Conversión a coordenadas del "mundo" del tablero (antes de zoom/pan).
    setMousePos({ x: (sx - pan.x) / zoom, y: (sy - pan.y) / zoom });
  };

  const handleBoardClick = (e) => {
    // Si venimos de un pan real, ignorar click
    if (drag?.moved) return;
    // Si el clic NO va sobre componente/cable y hay cable en curso, añadir waypoint
    const onComponent = e.target.closest('.rob-component') || e.target.closest('.rob-wire');
    if (pendingStart && !onComponent) {
      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const wx = (sx - pan.x) / zoom;
      const wy = (sy - pan.y) / zoom;
      setPendingWaypoints(prev => [...prev, { x: wx, y: wy }]);
      return;
    }
    // En modo libre, clic en vacío sin cable en curso → deseleccionar componente
    if (isLibre && !onComponent && !pendingStart) {
      setSelectedCompId(null);
    }
  };

  // Clic derecho: quita el último waypoint del cable en curso
  const handleBoardContextMenu = (e) => {
    if (pendingStart && pendingWaypoints.length > 0) {
      e.preventDefault();
      setPendingWaypoints(prev => prev.slice(0, -1));
    } else if (pendingStart) {
      // Si no hay waypoints, el botón derecho cancela el cable
      e.preventDefault();
      setPendingStart(null);
      setMousePos(null);
    }
  };

  // --- Drag de componentes + pan + zoom ----------------------------------

  const handleComponentPointerDown = useCallback((e, compId) => {
    // Clic izquierdo solamente; con shift/alt no arrastramos
    if (e.button !== 0) return;
    e.stopPropagation();
    const comp = baseComponents.find(c => c.id === compId);
    if (!comp) return;
    setSelectedCompId(compId);
    const current = positions[compId] || { x: comp.x, y: comp.y };
    setDrag({
      kind: 'component',
      id: compId,
      startPos: current,
      startPointer: { x: e.clientX, y: e.clientY },
      moved: false,
    });
  }, [baseComponents, positions]);

  const handleBoardPointerDown = useCallback((e) => {
    // Sólo iniciamos pan si se pulsa sobre el tablero "vacío" (no componentes).
    if (e.target.closest('.rob-component') || e.target.closest('.rob-wire')) return;
    if (e.button !== 0) return;
    setDrag({
      kind: 'pan',
      startPan: { ...pan },
      startPointer: { x: e.clientX, y: e.clientY },
      moved: false,
    });
  }, [pan]);

  // Listeners globales de pointermove/up para pan y component-drag.
  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.startPointer.x;
      const dy = e.clientY - d.startPointer.y;
      if (!d.moved && Math.hypot(dx, dy) > 3) {
        dragRef.current = { ...d, moved: true };
        setDrag((prev) => (prev ? { ...prev, moved: true } : prev));
      }
      if (d.kind === 'component') {
        const wx = d.startPos.x + dx / zoom;
        const wy = d.startPos.y + dy / zoom;
        setPositions((prev) => ({ ...prev, [d.id]: { x: wx, y: wy } }));
      } else if (d.kind === 'pan') {
        setPan({ x: d.startPan.x + dx, y: d.startPan.y + dy });
      }
    };
    const onUp = () => {
      const d = dragRef.current;
      // Dejamos drag activo 1 tick para que el click del board sepa ignorarse
      if (d) setTimeout(() => setDrag(null), 0);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [zoom]);

  // Zoom con rueda del ratón centrado en el cursor. Requiere listener nativo
  // no-pasivo para poder hacer preventDefault y no mover la página.
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (!el.contains(e.target)) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 0.9;
      setZoom((z) => {
        const next = Math.min(2.5, Math.max(0.4, z * factor));
        setPan((p) => {
          const wx = (mx - p.x) / z;
          const wy = (my - p.y) / z;
          return { x: mx - wx * next, y: my - wy * next };
        });
        return next;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [screen]);

  const zoomIn = () => setZoom((z) => Math.min(2.5, z * 1.2));
  const zoomOut = () => setZoom((z) => Math.max(0.4, z / 1.2));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const resetLayout = () => { setPositions({}); resetView(); };

  const removeWire = (wireId) => {
    if (mode === 'exam') return;
    setWires(prev => prev.filter(w => w.id !== wireId));
  };

  const clearWires = () => {
    setWires([]);
    setPendingStart(null);
    setPendingWaypoints([]);
    setFeedback(null);
  };

  const useHint = () => {
    setShowHintText(true);
    setHintsUsed(h => h + 1);
  };

  const checkCircuit = () => {
    const pairs = wires.map(w => normPair(w.a, w.b));
    const correct = pairs.filter(k => targetSet.has(k));
    const missing = exercise.target.filter(t => !userSet.has(t));
    const extra = pairs.filter(k => !targetSet.has(k));
    const isPerfect = missing.length === 0 && extra.length === 0;

    if (mode === 'exam') {
      const result = {
        exerciseId: exercise.id,
        title: exercise.title,
        correct: correct.length,
        missing: missing.length,
        extra: extra.length,
        totalTargets: exercise.target.length,
        perfect: isPerfect,
      };
      const nextResults = [...examResults, result];
      setExamResults(nextResults);

      if (examStep < exercises.length - 1) {
        setExamStep(s => s + 1);
        setExerciseIndex(i => i + 1);
      } else {
        finishExam(nextResults);
      }
      return;
    }

    if (isPerfect) {
      setFeedback({ type: 'success', text: '¡Circuito correcto! Todas las conexiones son válidas.' });
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.7 } });
    } else {
      const parts = [];
      if (missing.length) parts.push(`faltan ${missing.length} conexión(es)`);
      if (extra.length) parts.push(`sobran ${extra.length} conexión(es)`);
      setFeedback({ type: 'error', text: `Aún no está bien: ${parts.join(' y ')}.` });
    }
  };

  const finishExam = (results) => {
    const totalTargets = results.reduce((s, r) => s + r.totalTargets, 0);
    const totalCorrect = results.reduce((s, r) => s + r.correct, 0);
    const totalExtra = results.reduce((s, r) => s + r.extra, 0);
    // Penalización suave por cables extra (máx 10% menos).
    const penalty = Math.min(totalExtra * 0.05, 0.3);
    const rawRatio = totalTargets === 0 ? 0 : totalCorrect / totalTargets;
    const ratio = Math.max(0, rawRatio * (1 - penalty));
    const nota = Math.round(ratio * 100) / 10;
    const totalSecs = Math.max(1, Math.floor((Date.now() - examStartAt) / 1000));
    const timeBonus = Math.max(0, 300 - totalSecs) * 2;
    const perfectBonus = results.filter(r => r.perfect).length * 100;
    const score = Math.round(totalCorrect * 100 + timeBonus + perfectBonus);

    setSummaryScore(score);
    setScreen('summary');
    if (!completedRef.current && typeof onGameComplete === 'function') {
      completedRef.current = true;
      onGameComplete({
        mode: 'test',
        score,
        maxScore: exercises.length * 400,
        correctAnswers: results.filter(r => r.perfect).length,
        totalQuestions: exercises.length,
        durationSeconds: totalSecs,
        nota,
      });
    }
  };

  const nextExercise = () => {
    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex(exerciseIndex + 1);
    } else {
      setScreen('summary');
      if (mode !== 'exam' && !completedRef.current && typeof onGameComplete === 'function') {
        completedRef.current = true;
        onGameComplete({
          mode: 'practice',
          score: 0,
          maxScore: 0,
          correctAnswers: exercises.length,
          totalQuestions: exercises.length,
          durationSeconds: 0,
        });
      }
    }
  };

  const restart = () => {
    setScreen('intro');
    setMode('easy');
    setExerciseIndex(0);
    setWires([]);
    setPendingStart(null);
    setExamResults([]);
    setExamStep(0);
    setExamStartAt(null);
    setElapsed(0);
    completedRef.current = false;
  };

  // ---- Pantallas --------------------------------------------------------

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const instructions = screen === 'play' ? (
    <InstructionsModal
      isOpen={showInstructions}
      onClose={() => setShowInstructions(false)}
      title="Cómo conectar el circuito"
    >
      <p>Haz clic en un pin para iniciar un cable y en otro pin para terminarlo. Haz clic sobre un cable para eliminarlo.</p>
      <p>Pulsa <b>Comprobar</b> cuando creas que el circuito está bien.</p>
      <div className="instr-tips">
        <strong>💡 Truco:</strong> haz clic en una zona vacía del tablero mientras tiras un cable para doblarlo en ese punto. <kbd>Esc</kbd> cancela el cable.
      </div>
    </InstructionsModal>
  ) : (
    <InstructionsModal
      isOpen={showInstructions}
      onClose={() => setShowInstructions(false)}
      title="Cómo usar el Laboratorio de Robótica"
    >
      <h3>🎯 Objetivo</h3>
      <p>Monta circuitos electrónicos conectando los cables entre los pines de los componentes, como en un verdadero laboratorio de robótica.</p>
      <h3>🔌 Cómo conectar</h3>
      <ul>
        <li>Haz clic en un <b>pin</b> de un componente para iniciar un cable.</li>
        <li>Haz clic en <b>otro pin</b> para cerrar la conexión.</li>
        <li>Haz clic sobre un cable existente para <b>borrarlo</b>.</li>
      </ul>
      <h3>🎮 Modos</h3>
      <div className="instr-modes">
        <div className="instr-mode easy"><strong>Fácil</strong>Práctica guiada con la pista siempre visible.</div>
        <div className="instr-mode medium"><strong>Medio</strong>Sin pista visible, pero puedes pedirla.</div>
        <div className="instr-mode exam"><strong>Examen</strong>Los ejercicios del curso seguidos, sin pistas y puntuados sobre 10.</div>
      </div>
    </InstructionsModal>
  );

  if (screen === 'intro') {
    const modes = [
      { id: 'easy', tone: 'easy', title: 'Fácil', desc: 'Práctica guiada con la pista siempre a la vista. Ideal para aprender.', features: ['Pista siempre visible', 'Elige cualquier ejercicio'] },
      { id: 'medium', tone: 'medium', icon: Gauge, title: 'Medio', desc: 'Sin pista visible. Puedes pedirla, pero practicas con más autonomía.', features: ['Pista bajo demanda', 'Elige cualquier ejercicio'] },
      { id: 'exam', tone: 'exam', title: 'Examen', desc: `Los ${exercises.length} ejercicios del curso seguidos, sin ayudas. Nota sobre 10 y ranking.`, features: ['Nota sobre 10', 'Puntos por rapidez'] },
      { id: 'libre', tone: 'libre', icon: Wrench, title: 'Taller libre', desc: 'Diseña tu propio circuito desde cero con todos los componentes y guárdalo.', features: ['Todos los componentes', 'Guarda tus diseños'], cta: 'Abrir taller' },
    ];
    const selectMode = (id) => {
      if (id === 'exam') startExam();
      else if (id === 'libre') startLibre();
      else startPractice(id);
    };
    return (
      <GameShell {...SHELL} wide className="rob-shell">
        <ModeSelect
          description="Aprende los circuitos básicos, los componentes electrónicos y el control con Arduino conectando cables como en un laboratorio real."
          modes={modes}
          onSelect={selectMode}
          onHelp={() => setShowInstructions(true)}
          extra={(
            <section className="rob-exlist" aria-label={`Ejercicios de ESO ${grade}º`}>
              <header className="rob-sec-head">
                <span className="rob-sec-head__ico"><CircuitBoard size={18} /></span>
                <div>
                  <h3>Ejercicios de ESO {grade}º</h3>
                  <p>De encender un LED a controlar motores y sensores con Arduino.</p>
                </div>
              </header>
              <div className="rob-exlist__grid">
                {exercises.map((ex, i) => {
                  const types = [...new Set((ex.components || []).map((c) => c.type))].slice(0, 3);
                  return (
                    <div key={ex.id} className="rob-extile" style={{ '--i': i }}>
                      <span className="rob-extile__num">{i + 1}</span>
                      <span className="rob-extile__title">{ex.title.replace(/^\d+\.\s*/, '')}</span>
                      <span className="rob-extile__parts" aria-hidden="true">
                        {types.map((t) => {
                          const tpl = COMPONENT_TEMPLATES[t];
                          return tpl ? (
                            <span key={t} className="rob-extile__part" title={tpl.label}>
                              <ComponentArt type={t} w={tpl.w} h={tpl.h} color={tpl.color} active={false} />
                            </span>
                          ) : null;
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        />
        {instructions}
      </GameShell>
    );
  }

  if (screen === 'summary') {
    const isExam = mode === 'exam';
    const perfectCount = examResults.filter(r => r.perfect).length;
    const totalTargets = examResults.reduce((s, r) => s + r.totalTargets, 0);
    const totalCorrect = examResults.reduce((s, r) => s + r.correct, 0);
    const totalExtra = examResults.reduce((s, r) => s + r.extra, 0);
    const penalty = Math.min(totalExtra * 0.05, 0.3);
    const rawRatio = totalTargets === 0 ? 0 : totalCorrect / totalTargets;
    const nota = Math.round(Math.max(0, rawRatio * (1 - penalty)) * 100) / 10;

    return (
      <GameShell {...SHELL} wide className="rob-shell">
        {isExam ? (
          <ResultsScreen
            subtitle={`Laboratorio de Robótica · ESO ${grade}º`}
            nota={nota}
            points={summaryScore}
            stats={[
              { icon: Check, tone: 'good', label: 'Perfectos', value: `${perfectCount}/${exercises.length}` },
              { icon: Plug, tone: 'progress', label: 'Conexiones', value: `${totalCorrect}/${totalTargets}` },
              { icon: AlertTriangle, tone: 'bad', label: 'Cables de más', value: totalExtra },
              { icon: Clock, tone: 'time', label: 'Tiempo', value: fmtTime(elapsed) },
            ]}
            actions={[
              { label: 'Repetir examen', onClick: startExam, icon: RotateCcw },
              { label: 'Volver al menú', onClick: restart, icon: LayoutGrid, variant: 'soft' },
            ]}
          >
            {examResults.map((r, i) => (
              <FeedbackItem key={r.exerciseId} index={i + 1} ok={r.perfect} title={r.title.replace(/^\d+\.\s*/, '')}>
                {r.correct}/{r.totalTargets} conexiones correctas{r.extra ? ` · ${r.extra} de más` : ''}
              </FeedbackItem>
            ))}
          </ResultsScreen>
        ) : (
          <motion.div
            className="rob-done"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          >
            <span className="rob-done__art" aria-hidden="true">
              <ComponentArt type="led" w={80} h={80} color="#22c55e" active />
            </span>
            <h2>Práctica terminada</h2>
            <p>Has completado los {exercises.length} ejercicios de ESO {grade}º. ¡Gran trabajo!</p>
            <GameButton size="lg" icon={LayoutGrid} onClick={restart}>Volver al menú</GameButton>
          </motion.div>
        )}
      </GameShell>
    );
  }

  // ------ Pantalla de juego ---------------------------------------------

  const isExam = mode === 'exam';
  const headerMode = isExam ? 'exam' : mode === 'easy' ? 'easy' : mode === 'medium' ? 'medium' : 'practice';
  const headerLabel = { easy: 'Fácil', medium: 'Medio', exam: 'Examen', libre: 'Taller libre' }[mode];
  const showTip = mode === 'easy' || (mode === 'medium' && showHintText);

  return (
    <GameShell {...SHELL} wide className={`rob-shell rob-shell--play ${isLibre ? 'is-libre' : ''}`}>
      <GameHeader
        mode={headerMode}
        modeLabel={headerLabel}
        onHelp={() => setShowInstructions(true)}
        right={(
          <Hud>
            {!isLibre && <HudStat icon={Zap} tone="progress" value={`${exerciseIndex + 1}/${exercises.length}`} label="Ejercicio" />}
            {isLibre && <HudStat icon={Cpu} tone="accent" value={freeComponents.length} label="Componentes" />}
            <HudStat icon={Plug} tone="score" value={wires.length} label="Cables" />
            {isExam && <HudStat icon={Clock} tone="time" value={fmtTime(elapsed)} label="Tiempo" />}
          </Hud>
        )}
      />

      <div className="rob-route">
        <GameButton variant="soft" size="sm" icon={LayoutGrid} onClick={restart} title="Salir al menú">Menú</GameButton>
        {!isExam && !isLibre && (
          <div className="rob-route__nodes" role="tablist" aria-label="Selector de ejercicio">
            {exercises.map((ex, i) => (
              <button
                key={ex.id}
                type="button"
                className={`rob-route__node ${i === exerciseIndex ? 'is-current' : ''}`}
                onClick={() => setExerciseIndex(i)}
                title={ex.title}
                role="tab"
                aria-selected={i === exerciseIndex}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
        {isExam && (
          <div className="rob-route__dots">
            <ProgressDots total={exercises.length} current={examStep} results={examResults.map((r) => r.perfect)} />
          </div>
        )}
        {isLibre && (
          <div className="rob-route__libre">
            <label className="rob-free-name">
              <Pencil size={15} aria-hidden="true" />
              <input
                type="text"
                value={freeName}
                onChange={(e) => setFreeName(e.target.value)}
                placeholder="Nombre del diseño"
                maxLength={60}
                aria-label="Nombre del diseño"
              />
            </label>
            <GameButton variant="soft" size="sm" icon={FolderOpen} onClick={handleOpenDesignsList} title="Mis diseños">Mis diseños</GameButton>
            <GameButton size="sm" icon={Save} onClick={() => { setShowSaveDialog(true); }} title="Guardar diseño">Guardar</GameButton>
          </div>
        )}
      </div>

      {!isLibre && (
        <AnimatePresence mode="wait">
          <motion.section
            key={exercise.id}
            className="rob-brief"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <span className="rob-brief__ico" aria-hidden="true"><CircuitBoard size={30} /></span>
            <div className="rob-brief__text">
              <span className="rob-brief__eyebrow">Ejercicio {exerciseIndex + 1} de {exercises.length}</span>
              <h2 className="rob-brief__title">{exercise.title.replace(/^\d+\.\s*/, '')}</h2>
              <p className="rob-brief__desc">{exercise.description}</p>
              {showTip && <div className="rob-tip"><Lightbulb size={16} /> {exercise.hint}</div>}
            </div>
          </motion.section>
        </AnimatePresence>
      )}

      {isLibre && (
        <div className="rob-parts" aria-label="Componentes">
          {PALETTE_CATEGORIES.map((cat) => (
            <div key={cat.id} className="rob-parts__cat">
              <div className="rob-parts__label">{cat.label.replace(/^\S+\s/, '')}</div>
              <div className="rob-parts__tiles">
                {cat.types.map((t) => {
                  const tpl = COMPONENT_TEMPLATES[t];
                  if (!tpl) return null;
                  return (
                    <button
                      key={t}
                      type="button"
                      className="rob-part"
                      style={{ '--c': tpl.color }}
                      onClick={() => addFreeComponent(t)}
                      title={`Añadir ${tpl.label}`}
                    >
                      <span className="rob-part__art"><ComponentArt type={t} w={tpl.w} h={tpl.h} color={tpl.color} active={false} /></span>
                      <span className="rob-part__label">{tpl.label}</span>
                      <Plus size={13} className="rob-part__plus" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rob-bench">
        <div
          className={`rob-board ${drag?.kind === 'pan' && drag?.moved ? 'panning' : ''} ${pendingStart ? 'is-wiring' : ''}`}
          ref={boardRef}
          style={{ width: BOARD_W, height: BOARD_H }}
          onMouseMove={handleBoardMouseMove}
          onClick={handleBoardClick}
          onContextMenu={handleBoardContextMenu}
          onPointerDown={handleBoardPointerDown}
        >
          <div
            className="rob-board-inner"
            style={{
              width: BOARD_W,
              height: BOARD_H,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            <WireLayer
              wires={wires}
              components={componentsPositioned}
              pendingStart={pendingStart}
              pendingWaypoints={pendingWaypoints}
              mousePos={mousePos}
              onWireClick={removeWire}
              width={BOARD_W}
              height={BOARD_H}
            />
            {componentsPositioned.map(c => (
              <ComponentNode
                key={c.id}
                component={c}
                onPinClick={handlePinClick}
                selectedPin={pendingStart}
                wiredPins={wiredPins}
                onComponentPointerDown={handleComponentPointerDown}
                isDragging={drag?.kind === 'component' && drag?.id === c.id}
                isSelected={isLibre && selectedCompId === c.id}
                active={circuit.active[c.id]}
                state={componentStates[c.id]}
                onToggleState={handleToggleState}
                onButtonDown={handleButtonDown}
              />
            ))}
          </div>

          {isLibre && freeComponents.length === 0 && (
            <div className="rob-board-empty">
              <Plus size={22} />
              <span>Añade componentes desde la barra de arriba y conéctalos con cables.</span>
            </div>
          )}

          <div className="rob-zoom-ctrls" onPointerDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="rob-zoom-btn"
              onClick={() => setSoundEnabled((s) => !s)}
              title={soundEnabled ? 'Silenciar zumbadores' : 'Activar sonido'}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <span className="rob-zoom-sep" aria-hidden="true" />
            <button type="button" className="rob-zoom-btn" onClick={zoomOut} title="Alejar"><ZoomOut size={15} /></button>
            <span className="rob-zoom-level">{Math.round(zoom * 100)}%</span>
            <button type="button" className="rob-zoom-btn" onClick={zoomIn} title="Acercar"><ZoomIn size={15} /></button>
            <button type="button" className="rob-zoom-btn" onClick={resetView} title="Ver al 100%"><Maximize2 size={15} /></button>
            <button type="button" className="rob-zoom-btn" onClick={resetLayout} title="Restaurar disposición"><RotateCcw size={15} /></button>
          </div>
          <div className="rob-board-hint">
            <Move size={13} /> {pendingStart
              ? 'Elige otro pin para terminar el cable · clic en el vacío para doblarlo · Esc cancela'
              : 'Arrastra piezas · rueda para zoom · clic en un pin para tirar un cable'}
          </div>
        </div>
      </div>

      <RoundBanner
        show={!!feedback}
        status={feedback?.type === 'success' ? 'won' : feedback?.type === 'error' ? 'lost' : 'info'}
        title={feedback?.type === 'success' ? '¡Circuito correcto!' : feedback?.type === 'error' ? 'Aún no está bien' : 'Cuidado'}
        subtitle={feedback?.type === 'success' ? 'Todas las conexiones son válidas.' : feedback?.text}
      />

      <div className="rob-toolbar">
        <GameButton variant="soft" size="sm" icon={Trash2} onClick={clearWires} disabled={wires.length === 0}>
          Borrar cables
        </GameButton>

        {isLibre && (
          <>
            <GameButton
              variant="soft"
              size="sm"
              icon={X}
              onClick={() => selectedCompId && removeFreeComponent(selectedCompId)}
              disabled={!selectedCompId}
              title={selectedCompId ? 'Borrar el componente seleccionado' : 'Selecciona un componente primero'}
            >
              Borrar componente
            </GameButton>
            <GameButton variant="soft" size="sm" icon={Trash2} onClick={clearFree} disabled={freeComponents.length === 0 && wires.length === 0}>
              Vaciar todo
            </GameButton>
          </>
        )}

        {mode === 'medium' && !showHintText && (
          <GameButton variant="warning" size="sm" icon={Lightbulb} onClick={useHint}>Pista</GameButton>
        )}

        <span className="rob-toolbar-spacer" />

        {isLibre ? (
          <span className="rob-libre-status">
            {freeComponents.length} componente{freeComponents.length === 1 ? '' : 's'} · {wires.length} cable{wires.length === 1 ? '' : 's'}
          </span>
        ) : (!isExam && feedback?.type === 'success') ? (
          <GameButton variant="success" iconRight={ArrowRight} onClick={nextExercise}>
            {exerciseIndex < exercises.length - 1 ? 'Siguiente ejercicio' : 'Terminar'}
          </GameButton>
        ) : (
          <GameButton icon={Check} onClick={checkCircuit} disabled={wires.length === 0}>
            {isExam ? (exerciseIndex < exercises.length - 1 ? 'Siguiente' : 'Terminar examen') : 'Comprobar'}
          </GameButton>
        )}
      </div>

      {instructions}

      {/* Modal: guardar diseño */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            className="rob-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              className="rob-dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Guardar diseño"
              initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="rob-dialog__icon" aria-hidden="true"><Save size={24} /></span>
              <h2 className="rob-dialog__title">Guardar diseño</h2>
              <label className="rob-dialog__label" htmlFor="rob-save-name">Nombre</label>
              <input
                id="rob-save-name"
                type="text"
                className="rob-dialog__input"
                value={freeName}
                onChange={(e) => setFreeName(e.target.value)}
                maxLength={60}
                autoFocus
              />
              {!userId && (
                <p className="rob-dialog__warn"><AlertTriangle size={15} /> No has iniciado sesión: el diseño se guardará solo en este navegador.</p>
              )}
              <div className="rob-dialog__actions">
                <GameButton variant="soft" onClick={() => setShowSaveDialog(false)}>Cancelar</GameButton>
                <GameButton
                  icon={Save}
                  disabled={!freeName.trim() || savingState === 'saving'}
                  onClick={async () => { await handleSaveDesign(); setShowSaveDialog(false); }}
                >
                  {savingState === 'saving' ? 'Guardando…' : 'Guardar'}
                </GameButton>
              </div>
              {savingState === 'saved' && <div className="rob-dialog__toast ok">Diseño guardado ✓</div>}
              {savingState === 'error' && <div className="rob-dialog__toast ko">No se ha podido guardar</div>}
            </motion.div>
          </motion.div>
        )}

        {showDesignsList && (
          <motion.div
            className="rob-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowDesignsList(false)}
          >
            <motion.div
              className="rob-dialog rob-dialog--wide"
              role="dialog"
              aria-modal="true"
              aria-label="Mis diseños"
              initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="rob-dialog__icon" aria-hidden="true"><FolderOpen size={24} /></span>
              <h2 className="rob-dialog__title">Mis diseños</h2>
              {!userId && (
                <p className="rob-dialog__warn"><AlertTriangle size={15} /> Sin sesión iniciada: solo verás los diseños guardados en este navegador.</p>
              )}
              {savedDesigns.length === 0 ? (
                <p className="rob-dialog__empty">Todavía no has guardado ningún diseño.</p>
              ) : (
                <ul className="rob-design-list">
                  {savedDesigns.map((d) => (
                    <li key={d.id} className="rob-design-row">
                      <span className="rob-design-ico" aria-hidden="true"><CircuitBoard size={20} /></span>
                      <div className="rob-design-info">
                        <div className="rob-design-name">{d.name}</div>
                        <div className="rob-design-meta">
                          {(d.components?.length || 0)} componentes · {(d.wires?.length || 0)} cables
                          {d.updated_at && ` · ${new Date(d.updated_at).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="rob-design-actions">
                        <GameButton variant="soft" size="sm" icon={FolderOpen} onClick={() => handleLoadDesign(d)}>Abrir</GameButton>
                        <button type="button" className="gk-iconbtn rob-design-del" onClick={() => handleDeleteDesign(d)} title="Borrar diseño" aria-label="Borrar diseño">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="rob-dialog__actions">
                <GameButton variant="soft" onClick={() => setShowDesignsList(false)}>Cerrar</GameButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
};

export default LaboratorioRobotica;
