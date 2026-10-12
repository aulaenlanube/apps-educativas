// Insignias redibujadas (rediseño 2026). Cada set exporta { code: (idPrefix) => <>…</> }
// con el mismo formato que SVGS en src/components/ui/BadgeIcon.jsx, que las usa
// con prioridad sobre sus dibujos originales.
import set1 from './set1';
import set2 from './set2';
import set3 from './set3';
import set4 from './set4';

const BADGE_OVERRIDES = { ...set1, ...set2, ...set3, ...set4 };

export default BADGE_OVERRIDES;
