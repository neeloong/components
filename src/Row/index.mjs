
const style = `
:host { display: flex; flex-flow: row wrap; }
::slotted(*) { box-sizing: border-box; }
::slotted([nl-span=0]) { flex: 0 0 0%; max-inline-size: 0%; }
`;
/**
 * @param {string?} g
 * @returns {string}
 */
function parseGutter(g) {
	if (!g) { return '0'; }
	if (/^\d+$/.test(g)) { return `${g}px`; }
	return g;
}
/**
 *
 * @param {number} aliquot
 * @returns {string}
 */
function getAliquotStyle(aliquot) {
	const styles = [`::slotted(*) {
		flex-basis: calc(100% / ${aliquot});
		max-inline-size: calc(100% / ${aliquot});
	}`];
	for (let i = 1; i <= aliquot; i++) {
		const size = i * 100 / aliquot;
		styles.push(`::slotted([nl-span="${i}"]) {
			flex-basis: calc(${i}00% / ${aliquot});
			min-inline-size: calc(${i}00% / ${aliquot});
			max-inline-size: calc(${i}00% / ${aliquot});
		}`);
		styles.push(`::slotted([nl-offset="${i}"]) {
			margin-inline-start: calc(${i}00% / ${aliquot});
		}`);
	}
	return styles.join('\n');
}
/**
 *
 * @param {number} aliquot
 * @returns {number}
 */
function getNewAliquot(aliquot) {
	if (typeof aliquot !== 'number') { return 0; }
	const n = Math.floor(aliquot);
	if (!Number.isFinite(n)) { return 0; }
	return n > 1 ? n : 0;
}
export default class Row extends HTMLElement {
	static observedAttributes = ['aliquot', 'gutter-inline', 'gutter-block'];
	#style = document.createElement('style');
	#aliquotStyle = document.createElement('style');
	get gutterInline() {
		return parseGutter(this.getAttribute('gutter-inline'));
	}
	/** @param {string | number} gutter*/
	set gutterInline(gutter) {
		this.setAttribute('gutter-inline', String(gutter));
	}
	get gutterBlock() {
		return parseGutter(this.getAttribute('gutter-block'));
	}
	/** @param {string | number} gutter*/
	set gutterBlock(gutter) {
		this.setAttribute('gutter-block', String(gutter));
	}
	get aliquot() {
		const s = parseInt(this.getAttribute('aliquot') || '');
		if (!s || s < 2) { return 24; }
		return s;
	}
	set aliquot(aliquot) {
		const n = getNewAliquot(aliquot);
		if (n) {
			this.setAttribute('aliquot', String(n));
		} else {
			this.removeAttribute('aliquot');
		}
	}

	constructor() {
		super();
		const shadow = this.attachShadow({mode:'closed'});
		shadow.appendChild(document.createElement('style')).textContent = style;
		shadow.appendChild(this.#aliquotStyle);
		shadow.appendChild(this.#style);
		shadow.appendChild(document.createElement('slot'));
	}
	/**
	 * @param {string} attrName
	 * @param {string | null} oldVal
	 * @param {string | null} newVal
	 * @returns {void}
	 */
	attributeChangedCallback(attrName, oldVal, newVal) {
		if (oldVal === newVal) { return; }
		switch (attrName) {
			case 'aliquot': {
				this.#aliquotStyle.textContent = getAliquotStyle(this.aliquot);
				break;
			}
			case 'gutter-inline': case 'gutter-block': {
				this.#style.textContent = `::slotted(*) {
					padding-block: ${this.gutterBlock};
					padding-inline: ${this.gutterInline};
				}`;
				break;
			}
		}
	}


}

customElements.define('nl-row', Row);
