/**
 * ui/stopDetail.js
 * Gestiona la vista de detalle de una parada y el modal de guardado como favorito.
 * Recibe callbacks para integrarse sin acoplarse a otros módulos.
 */

import { getFavorites, saveFavorite, renderFavorites } from './favorites.js';

/**
 * Inicializa los eventos del panel de detalle y el modal de favoritos.
 *
 * @param {object}   opts
 * @param {function} opts.onSaved       Se llama tras guardar un favorito (para refrescar la home)
 * @param {function} opts.switchPanel   Función de navegación entre paneles
 */
export function initStopDetail({ onSaved, switchPanel }) {
    const favModal   = document.getElementById('fav-custom-modal');
    const inputEmoji = document.getElementById('fav-input-emoji');
    const inputAlias = document.getElementById('fav-input-alias');
    const logoIcon   = document.getElementById('app-profile-logo');

    // ── Abrir modal de favorito ────────────────────────────
    logoIcon?.addEventListener('click', () => {
        const stop = getActiveStop();
        if (!stop) return;

        inputAlias.value = stop.nombre;
        inputEmoji.value = '📍';
        favModal.style.display = 'flex';
    });

    // ── Cancelar ───────────────────────────────────────────
    document.getElementById('fav-btn-cancel')?.addEventListener('click', () => {
        favModal.style.display = 'none';
    });

    // ── Guardar ────────────────────────────────────────────
    document.getElementById('fav-btn-save')?.addEventListener('click', () => {
        const stop = getActiveStop();
        if (!stop) return;

        saveFavorite({
            nodo:          stop.nodo,
            nombreOriginal: stop.nombre,
            alias:         inputAlias.value.trim() || stop.nombre,
            emoji:         inputEmoji.value.trim() || '📍',
            lineas:        stop.lineas,
        });

        favModal.style.display = 'none';
        onSaved?.();
        switchPanel('default');
    });

    // ── API pública global ─────────────────────────────────
    // Permite que cualquier tarjeta (líneas, favoritos…) abra el detalle
    window._showStopDetail = (nodo, nombre, lineas) => {
        _setActiveStop({ nodo, nombre, lineas });

        document.getElementById('detail-stop-name').textContent  = nombre;
        document.getElementById('detail-stop-nodo').textContent  = `Nº ${nodo}`;
        document.getElementById('detail-stop-lines').textContent = `Líneas: ${lineas || 'Ninguna'}`;
        document.getElementById('detail-stop-type').textContent  = 'Autobús (TUSSAM)';

        switchPanel('detail');
    };
}

// ── Estado interno (parada activa) ─────────────────────────
let _activeStop = null;

function _setActiveStop(stop) { _activeStop = stop; }
export function getActiveStop()  { return _activeStop; }
