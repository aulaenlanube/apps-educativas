// src/apps/mesa-crafteo/TutorialModal.jsx
// Cómo se juega (modal propio, nunca window.alert).
import React from 'react';
import { motion } from 'framer-motion';
import { Atom, MousePointerClick, Link2, Shapes, Check, X, Hand } from 'lucide-react';
import { GameButton } from '../_shared/kit';
import { FlaskArt } from './CrafteoArt';

const STEPS = [
    { Icon: Atom, title: 'Elige un elemento', text: 'Toca una ficha de abajo y el átomo aparece en la mesa. Los puntitos de la ficha son los enlaces que puede formar (su valencia).' },
    { Icon: MousePointerClick, title: 'Une átomos', text: 'Cada átomo muestra huecos brillantes: sus enlaces libres. Al tocar otra ficha se une al átomo marcado en ámbar. Toca un átomo para elegir dónde irá el siguiente, o arrastra la ficha hasta el hueco que quieras.' },
    { Icon: Link2, title: 'Dobles y triples', text: 'Toca un enlace para hacerlo doble o triple (los dos átomos necesitan huecos libres). Con «Enlazar» unes dos átomos para cerrar un anillo.' },
    { Icon: Shapes, title: 'Geometría real', text: 'Los átomos se colocan solos según la teoría VSEPR: los pares solitarios (puntos lilas) empujan a los enlaces y por eso el agua es angular.' },
    { Icon: Hand, title: 'Mira y comprueba', text: 'Arrastra para girar la vista y usa la rueda o dos dedos para el zoom. Cuando no quedan huecos, la molécula se comprueba sola.' },
];

const TutorialModal = ({ onClose }) => (
    <motion.div className="mc-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
            className="mc-sheet mc-tutorial"
            role="dialog"
            aria-modal="true"
            aria-label="Cómo se juega"
            initial={{ y: 26, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
        >
            <button type="button" className="gk-iconbtn mc-sheet__close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
            <div className="mc-tutorial__hero">
                <FlaskArt status="ok" className="mc-tutorial__art" />
                <div>
                    <span className="mc-kicker">Laboratorio de química</span>
                    <h2>Cómo se juega</h2>
                    <p>Construye moléculas reales átomo a átomo y descubre su forma en 3D.</p>
                </div>
            </div>
            <ol className="mc-tutorial__steps">
                {STEPS.map(({ Icon, title, text }, i) => (
                    <li key={title} className="mc-tutorial__step">
                        <span className="mc-tutorial__num"><Icon size={18} /><b>{i + 1}</b></span>
                        <div><strong>{title}</strong><p>{text}</p></div>
                    </li>
                ))}
            </ol>
            <div className="mc-tutorial__foot">
                <GameButton variant="success" size="lg" icon={Check} onClick={onClose}>¡Entendido, vamos allá!</GameButton>
            </div>
        </motion.div>
    </motion.div>
);

export default TutorialModal;
