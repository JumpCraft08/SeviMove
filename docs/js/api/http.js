/**
 * api/http.js
 * Capa de red genérica. Centraliza todos los fetch de la app.
 * El resto de módulos nunca llaman a fetch() directamente.
 */

/**
 * Descarga y parsea un JSON desde cualquier URL.
 * @param {string} url
 * @returns {Promise<any>} Datos parseados
 * @throws {Error} Si la red falla o el servidor devuelve un status >= 400
 */
export async function getJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} al cargar ${url}`);
    return response.json();
}
