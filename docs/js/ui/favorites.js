/**
 * ui/favorites.js
 * Gestiona los favoritos: lectura/escritura en localStorage y renderizado.
 * No conoce la lógica de búsqueda ni de detalle de parada.
 */

const STORAGE_KEY = 'fav_stops';

// ── Lectura / escritura ────────────────────────────────────

/** @returns {Favorite[]} */
export function getFavorites() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

/**
 * Guarda un favorito (sobreescribe si ya existe el mismo nodo).
 * @param {Favorite} fav
 */
export function saveFavorite(fav) {
    const favs = getFavorites().filter(f => f.nodo !== fav.nodo);
    favs.push(fav);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

// ── Renderizado ────────────────────────────────────────────

/**
 * Pinta las tarjetas de favoritos en el contenedor de inicio.
 * @param {HTMLElement} container
 * @param {function(string, string, string): void} onCardClick  Callback al pulsar una tarjeta
 */
export function renderFavorites(container, onCardClick) {
    if (!container) return;

    const favs = getFavorites();

    if (!favs.length) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
                <p style="font-size:1.2rem; margin:0;">No tienes paradas guardadas</p>
                <p style="font-size:0.85rem; margin-top:4px;">Usa el buscador superior para añadir tus paradas diarias.</p>
            </div>`;
        return;
    }

    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    favs.forEach(fav => {
        const card = document.createElement('div');
        card.className = 'info-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="card-header-info">
                <h3>${fav.emoji} ${fav.alias}</h3>
                <p>Poste Nº ${fav.nodo} • ${fav.nombreOriginal}</p>
            </div>
            <div class="times-row">
                <div class="time-badge">
                    <span class="badge-line l06" style="background:#000;">Líneas</span>
                    ${fav.lineas || 'N/A'}
                </div>
            </div>`;
        card.addEventListener('click', () => onCardClick(fav.nodo, fav.nombreOriginal, fav.lineas));
        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

/**
 * @typedef {Object} Favorite
 * @property {string} nodo
 * @property {string} nombreOriginal
 * @property {string} alias
 * @property {string} emoji
 * @property {string} lineas
 */
