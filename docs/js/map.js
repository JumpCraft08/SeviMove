/**
 * map.js
 * Encapsula la inicialización y configuración del mapa Leaflet.
 * El resto de la app solo ve initMap(); nunca toca L directamente.
 */

let _map = null;

/**
 * Inicializa el mapa Leaflet bajo demanda (idempotente).
 * @returns {L.Map}
 */
export function initMap() {
    if (_map) return _map;

    _map = L.map('map-container', { zoomControl: false })
             .setView([37.3890, -6.0018], 15);

    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom:    20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google',
    }).addTo(_map);

    return _map;
}

/**
 * Devuelve la instancia actual del mapa (o null si aún no se ha inicializado).
 * @returns {L.Map | null}
 */
export function getMap() {
    return _map;
}
