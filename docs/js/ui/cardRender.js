/**
 * ui/cardRender.js
 * Renderiza tarjetas de líneas de transporte a partir de datos ya normalizados.
 * No conoce el formato de ninguna API: recibe Line[] y pinta DOM.
 */

/**
 * @param {import('../api/normalizer.js').Line[]} lines     Array normalizado de líneas
 * @param {HTMLElement}                           container Elemento donde renderizar
 */
export function renderLines(lines, container) {
    container.innerHTML = '';

    if (!lines.length) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No hay líneas disponibles.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    lines.forEach(({ label, name, color, badgeClass }) => {
        const card = document.createElement('div');
        card.className = 'info-card';
        card.style.cssText = 'background:#fff; border:1px solid var(--border-light); margin-bottom:8px;';

        card.innerHTML = `
            <div class="card-header-info" style="display:flex; align-items:center; gap:12px;">
                <span class="badge-line ${badgeClass}"
                      style="background:${color}; padding:6px 10px; font-weight:700; font-size:0.85rem; min-width:40px; text-align:center;">
                    ${label}
                </span>
                <div>
                    <h3 style="font-size:1rem; font-weight:700; margin:0;">Línea ${label}</h3>
                    <p style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">${name}</p>
                </div>
            </div>`;

        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}
