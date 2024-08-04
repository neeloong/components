/**
 *
 * @param {string} style
 * @returns {HTMLStyleElement}
 */
export default function createStyle(style) {
	const el = document.createElement('style');
	el.textContent = style;
	return el;
}
