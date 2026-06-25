/**
 * api/sources.js
 * Carga y cachea la configuración de redes de transporte desde source.json.
 *
 * Estructura esperada de source.json:
 * {
 *   "tussam": {
 *     "name": "TUSSAM",
 *     "type": "bus",
 *     "color": "#E30613",
 *     "linesUrl": "https://...",
 *     "stopsUrl": "https://..."
 *   },
 *   "consorcio": { ... },
 *   "metro":     { ... }
 * }
 */

import { getJSON } from './http.js';

/** @type {Record<string, NetworkSource> | null} */
let _cache = null;

/**
 * Devuelve toda la configuración de redes.
 * La primera llamada descarga source.json; las siguientes usan caché.
 * @returns {Promise<Record<string, NetworkSource>>}
 */
export async function getSources() {
    if (!_cache) _cache = await getJSON('source.json');
    return _cache;
}

/**
 * Devuelve la configuración de una red concreta.
 * @param {string} key  Clave de la red ('tussam', 'consorcio', 'metro'…)
 * @returns {Promise<NetworkSource>}
 */
export async function getSource(key) {
    const sources = await getSources();
    const source = sources[key];
    if (!source) throw new Error(`Red desconocida: "${key}". Revisa source.json`);
    return source;
}

/**
 * @typedef {Object} NetworkSource
 * @property {string}  name      Nombre para mostrar ("TUSSAM", "Metro Sevilla"…)
 * @property {string}  type      Tipo de transporte: 'bus' | 'subway' | 'tram'
 * @property {string}  color     Color hexadecimal corporativo
 * @property {string}  linesUrl  URL del endpoint de líneas
 * @property {string}  stopsUrl  URL del endpoint de paradas
 */
