/**
 * ui/stopsSearch.js
 * Gestiona la búsqueda de paradas: estado de los paneles, carga de datos y filtrado.
 * No sabe nada de favoritos ni de detalle; se integra mediante callbacks.
 */

import { getJSON }        from '../api/http.js';
import { getSource }      from '../api/sources.js';
import { normalizeStops } from '../api/normalizer.js';
import { renderFavorites } from './favorites.js';

// ── Estado ─────────────────────────────────────────────────
let _allStops      = [];
let _isStopsLoaded = false;
let _currentView   = 'default'; // 'default' | 'search' | 'detail'

// ── Punto de entrada ───────────────────────────────────────

/**
 * Inicializa toda la lógica de búsqueda y navegación entre paneles.
 * @param {object}   opts
 * @param {function} opts.onShowDetail  Callback(nodo, nombre, lineas) al pulsar una parada
 */
export function initStopsSearch({ onShowDetail }) {
    const searchWrapper = document.getElementById('main-search-wrapper');
    const searchInput   = document.getElementById('main-search-input');
    const backBtn       = document.getElementById('search-back-btn');

    const panelDefault  = document.getElementById('panel-para-ti-default');
    const panelResults  = document.getElementById('panel-search-results');
    const panelDetail   = document.getElementById('panel-stop-detail');
    const favsContainer = document.getElementById('favorites-dynamic-container');
    const stopsContainer = document.getElementById('modal-stops-container');

    if (!searchInput || !searchWrapper) return;

    // Renderiza favoritos en el arranque
    renderFavorites(favsContainer, onShowDetail);

    // ── Navegación entre paneles ───────────────────────────
    function switchPanel(target) {
        _currentView = target;

        panelDefault.style.display = target === 'default' ? 'block' : 'none';
        panelResults.style.display = target === 'search'  ? 'block' : 'none';
        panelDetail.style.display  = target === 'detail'  ? 'block' : 'none';

        searchWrapper.classList.toggle('search-active', target === 'search');
        searchWrapper.classList.toggle('detail-active', target === 'detail');
        backBtn.style.display = target !== 'default' ? 'block' : 'none';

        if (target === 'default') {
            searchInput.value = '';
            renderFavorites(favsContainer, onShowDetail);
        }
    }

    // Expone switchPanel para que stopDetail pueda usarlo
    window._switchPanel = switchPanel;

    // ── Eventos ────────────────────────────────────────────
    searchInput.addEventListener('focus', async () => {
        if (_currentView === 'default') {
            switchPanel('search');
            await _loadStopsData(stopsContainer, onShowDetail);
        }
    });

    searchInput.addEventListener('input', (e) => {
        if (_currentView === 'detail') switchPanel('search');
        _filterAndRender(e.target.value.toLowerCase().trim(), stopsContainer, onShowDetail);
    });

    backBtn?.addEventListener('click', () => {
        if (_currentView === 'detail') {
            switchPanel('search');
        } else {
            switchPanel('default');
            _filterAndRender('', stopsContainer, onShowDetail);
        }
    });
}

// ── Carga de datos ─────────────────────────────────────────

async function _loadStopsData(container, onShowDetail) {
    if (_isStopsLoaded) return;

    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:20px;">Cargando paradas oficiales...</p>';

    try {
        const source = await getSource('tussam');
        const data   = await getJSON(source.stopsUrl);

        _allStops      = normalizeStops(data, source.type);
        _isStopsLoaded = true;

        _renderStopsList(_allStops, container, onShowDetail);

    } catch (error) {
        console.error('Error al cargar paradas:', error);
        container.innerHTML = '<p style="color:var(--tussam-red); font-size:0.9rem; text-align:center;">Error al sincronizar paradas.</p>';
    }
}

// ── Filtrado y renderizado ─────────────────────────────────

function _filterAndRender(query, container, onShowDetail) {
    const filtered = query
        ? _allStops.filter(s => s.nodo.includes(query) || s.nombre.toLowerCase().includes(query))
        : _allStops;
    _renderStopsList(filtered, container, onShowDetail);
}

function _renderStopsList(stops, container, onShowDetail) {
    if (!stops.length) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding-top:20px;">No hay paradas que coincidan.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();
    stops.slice(0, 40).forEach(stop => {
        const card = document.createElement('div');
        card.className = 'stop-item-card';
        card.innerHTML = `
            <div class="stop-info-main">
                <h4>${stop.nombre}</h4>
                <p>Líneas: ${stop.lineas || 'N/A'}</p>
            </div>
            <div class="stop-badge-nodo">Nº ${stop.nodo}</div>`;
        card.addEventListener('click', () => onShowDetail(stop.nodo, stop.nombre, stop.lineas));
        fragment.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

/** Devuelve la vista activa actual (para que stopDetail pueda consultarla) */
export function getCurrentView() { return _currentView; }
