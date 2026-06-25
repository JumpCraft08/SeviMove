/**
 * ui/sheet.js
 * Controla el panel inferior deslizante de la pantalla de líneas.
 */

const POSITIONS = ['pos-top', 'pos-half', 'pos-bottom'];

/**
 * Activa el comportamiento cíclico del panel deslizante.
 * @param {string} sheetId   ID del elemento del panel
 * @param {string} triggerId ID del elemento que actúa como handle
 */
export function initSheet(sheetId = 'lines-sheet', triggerId = 'lines-drag') {
    const sheet   = document.getElementById(sheetId);
    const trigger = document.getElementById(triggerId);
    if (!sheet || !trigger) return;

    let posIndex = 0;

    trigger.addEventListener('click', () => {
        const next = (posIndex + 1) % POSITIONS.length;
        sheet.classList.replace(POSITIONS[posIndex], POSITIONS[next]);
        posIndex = next;
    });
}
