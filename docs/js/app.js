/**
 * app.js — Orquestador principal
 *
 * Su único trabajo es conectar módulos entre sí.
 * No contiene lógica de negocio ni manipulación de DOM.
 */

import { getSource }        from './api/sources.js';
import { getJSON }          from './api/http.js';
import { normalizeLines }   from './api/normalizer.js';
import { initMap }          from './map.js';
import { initSheet }        from './ui/sheet.js';
import { renderLines }      from './ui/cardRender.js';
import { initStopsSearch }  from './ui/stopsSearch.js';
import { initStopDetail }   from './ui/stopDetail.js';
import { renderFavorites }  from './ui/favorites.js';

// ── Estado ─────────────────────────────────────────────────
let hasLoadedLines = false;

// ── Inicialización de UI ───────────────────────────────────
initSheet();

initStopsSearch({
    onShowDetail: (nodo, nombre, lineas) => window._showStopDetail(nodo, nombre, lineas),
});

initStopDetail({
    onSaved:     () => renderFavorites(
        document.getElementById('favorites-dynamic-container'),
        (nodo, nombre, lineas) => window._showStopDetail(nodo, nombre, lineas)
    ),
    switchPanel: (target) => window._switchPanel(target),
});

// ── Cambio de pestaña ──────────────────────────────────────
document.querySelectorAll('.nav-radio').forEach(radio => {
    radio.addEventListener('change', async (e) => {
        if (e.target.id === 'radio-lineas') {
            initMap();
            await loadAndRenderLines();
        }
    });
});

// ── Carga de líneas ────────────────────────────────────────
async function loadAndRenderLines() {
    if (hasLoadedLines) return;

    const container = document.getElementById('lines-container');
    if (!container) return;

    try {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">Cargando líneas...</p>';

        const source = await getSource('tussam');
        container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">Cargando líneas desde ${source.name}...</p>`;

        const data  = await getJSON(source.linesUrl);
        const lines = normalizeLines(data, source.type);

        renderLines(lines, container);
        hasLoadedLines = true;

    } catch (error) {
        console.error('Error al cargar líneas:', error);
        container.innerHTML = '<p style="color:var(--tussam-red); font-size:0.9rem;">Error al conectar con el servidor de datos.</p>';
    }
}
