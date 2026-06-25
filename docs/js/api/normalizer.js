/**
 * api/normalizer.js
 * Transforma la respuesta cruda de cualquier API al formato interno estándar.
 *
 * Al añadir una nueva red (Consorcio, Metro…) solo hay que tocar este archivo:
 * añade un caso al switch y mapea sus campos al formato interno.
 * El resto de la app no necesita saber de qué red vienen los datos.
 */

// ── Formatos internos ──────────────────────────────────────
//
// Line:  { id, label, name, color, badgeClass }
// Stop:  { nodo, nombre, lineas }           (lineas = string separado por comas)

// ── Líneas ─────────────────────────────────────────────────

/**
 * Devuelve un array de Line[] a partir de la respuesta cruda de la API.
 * @param {object} data     JSON crudo devuelto por la API
 * @param {string} type     'bus' | 'subway' | 'tram'
 * @returns {Line[]}
 */
export function normalizeLines(data, type) {
    switch (type) {
        case 'bus':    return _normalizeBusLines(data);
        case 'subway': return _normalizeSubwayLines(data);
        case 'tram':   return _normalizeBusLines(data); // misma estructura que bus
        default:
            console.warn(`normalizeLines: tipo desconocido "${type}". Intentando como bus.`);
            return _normalizeBusLines(data);
    }
}

/** Formato TUSSAM / Consorcio (GeoJSON features con attributes) */
function _normalizeBusLines(data) {
    const seen = new Set();
    const lines = [];

    (data.features || []).forEach(({ attributes: a }) => {
        if (!a) return;
        const id = String(a.Linea || '').trim();
        if (!id || seen.has(id)) return;
        seen.add(id);

        const label = String(a.LabelLinea || id).trim();
        lines.push({
            id,
            label,
            name:       String(a.NombreLinea || `Línea ${label}`).trim(),
            color:      a.Color || '#E30613',
            badgeClass: _busBadgeClass(label),
        });
    });

    return lines;
}

/** Formato Metro de Sevilla (puede diferir; adaptar según su API real) */
function _normalizeSubwayLines(data) {
    const seen = new Set();
    const lines = [];

    (data.features || []).forEach(({ attributes: a }) => {
        if (!a) return;
        const id = String(a.Linea || a.LineaMetro || '').trim();
        if (!id || seen.has(id)) return;
        seen.add(id);

        const label = String(a.LabelLinea || `L${id}`).trim();
        lines.push({
            id,
            label,
            name:       String(a.NombreLinea || `Metro Línea ${label}`).trim(),
            color:      a.Color || '#005A9C',
            badgeClass: 'metro',
        });
    });

    return lines;
}

/** Clase CSS del badge según la etiqueta de línea de bus */
function _busBadgeClass(label) {
    if (label.toUpperCase().startsWith('C')) return label.toLowerCase();
    if (label === 'T1' || label === '34')   return 'l34';
    return 'l06';
}

// ── Paradas ────────────────────────────────────────────────

/**
 * Devuelve un array de Stop[] a partir de la respuesta cruda de la API.
 * Agrupa entradas por nodo y fusiona sus líneas.
 * @param {object} data   JSON crudo devuelto por la API
 * @param {string} type   'bus' | 'subway' | 'tram'
 * @returns {Stop[]}
 */
export function normalizeStops(data, type) {
    switch (type) {
        case 'bus':
        case 'tram':   return _normalizeBusStops(data);
        case 'subway': return _normalizeSubwayStops(data);
        default:
            console.warn(`normalizeStops: tipo desconocido "${type}". Intentando como bus.`);
            return _normalizeBusStops(data);
    }
}

/** Formato TUSSAM / Consorcio */
function _normalizeBusStops(data) {
    const stopsMap = {};

    (data.features || []).forEach(({ attributes: a }) => {
        if (!a) return;
        const nodo = String(a.Nodo || '').trim();
        if (!nodo) return;

        if (!stopsMap[nodo]) {
            stopsMap[nodo] = {
                nodo,
                nombre:    (a.Nombre || 'Parada sin nombre').trim(),
                lineasSet: new Set(),
            };
        }
        const label = a.LabelLinea || a.Linea;
        if (label) stopsMap[nodo].lineasSet.add(String(label).trim());
    });

    return _flattenStopsMap(stopsMap);
}

/** Formato Metro de Sevilla (adaptar según su API real) */
function _normalizeSubwayStops(data) {
    const stopsMap = {};

    (data.features || []).forEach(({ attributes: a }) => {
        if (!a) return;
        const nodo = String(a.Nodo || a.CodParada || '').trim();
        if (!nodo) return;

        if (!stopsMap[nodo]) {
            stopsMap[nodo] = {
                nodo,
                nombre:    (a.Nombre || a.NombreParada || 'Estación sin nombre').trim(),
                lineasSet: new Set(),
            };
        }
        const label = a.LabelLinea || a.Linea || a.LineaMetro;
        if (label) stopsMap[nodo].lineasSet.add(String(label).trim());
    });

    return _flattenStopsMap(stopsMap);
}

/** Convierte el mapa interno a un array de Stop[], ordenando las líneas */
function _flattenStopsMap(stopsMap) {
    return Object.values(stopsMap).map(s => ({
        nodo:   s.nodo,
        nombre: s.nombre,
        lineas: [...s.lineasSet]
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            .join(', '),
    }));
}

/**
 * @typedef {Object} Line
 * @property {string} id
 * @property {string} label
 * @property {string} name
 * @property {string} color
 * @property {string} badgeClass
 *
 * @typedef {Object} Stop
 * @property {string} nodo
 * @property {string} nombre
 * @property {string} lineas
 */
