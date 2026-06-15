// Modal informativo de una simulación: qué se está viendo, las leyes que usa
// (con las fórmulas de la propia escena), cómo personalizarlo y cómo sacarle el
// máximo partido. Se abre al entrar en la simulación (salvo que el alumno marque
// "No volver a mostrar") y también desde el botón "Info" de la barra superior.
import React from 'react';
import InstructionsModal from '../../_shared/InstructionsModal';

export default function SimInfoModal({ isOpen, onClose, sim, info, dontShow, onToggleDontShow }) {
  if (!sim) return null;
  return (
    <InstructionsModal isOpen={isOpen} onClose={onClose} title={`${sim.icono} ${sim.nombre}`}>
      {info ? (
        <div className="fislab-info">
          <section className="fislab-info-sec">
            <h3>🔬 Qué estás viendo</h3>
            <p>{info.queEs}</p>
          </section>

          <section className="fislab-info-sec">
            <h3>📐 Las leyes que usa</h3>
            {info.leyes.map((l) => (
              <p key={l.nombre}><strong>{l.nombre}:</strong> {l.texto}</p>
            ))}
            {sim.formulas?.length > 0 && (
              <div className="fislab-info-formulas">
                {sim.formulas.map((f) => (
                  <div key={f.titulo} className="fislab-info-formula">
                    <code>{f.expr}</code>
                    <small>{f.titulo}{f.leyenda ? ` · ${f.leyenda}` : ''}</small>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="fislab-info-sec">
            <h3>🎛️ Cómo personalizarlo</h3>
            <ul className="fislab-info-list">
              {info.personaliza.map((p) => (
                <li key={p.control}><strong>{p.control}:</strong> {p.texto}</li>
              ))}
            </ul>
          </section>

          <section className="fislab-info-sec fislab-info-destacado">
            <h3>💡 Sácale el máximo partido</h3>
            <ul className="fislab-info-list">
              {info.tips.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </section>
        </div>
      ) : (
        <p>La información detallada de esta simulación estará disponible próximamente.</p>
      )}

      <div className="fislab-info-footer">
        <label className="fislab-info-dontshow">
          <input type="checkbox" checked={!!dontShow} onChange={onToggleDontShow} />
          No volver a mostrar esto automáticamente
        </label>
        <button type="button" className="fislab-btn-primary fislab-info-ok" onClick={onClose}>
          Entendido
        </button>
      </div>
    </InstructionsModal>
  );
}
