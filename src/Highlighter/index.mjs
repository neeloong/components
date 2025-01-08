
/**
 *
 * @param {Node} node
 * @returns {IterableIterator<Text>}
 * @yields {Text}
 */
function *texts(node) {
	if (node instanceof Text) {
		return yield node;
	}
	if (!(node instanceof Element)) {
		return;
	}
	for (const c of node.childNodes) {
		yield* texts(c);
	}
}
/**
 *
 * @param {Node} node
 * @returns {IterableIterator<[number, number, string, Text]>}
 * @yields {[number, number, string, Text]}
 */
function *getText(node) {
	let n = 0;
	for (const t of texts(node)) {
		const text = t.textContent || '';
		const {length} = text;
		yield [n, n += length, text, t];
	}
}
/**
 *
 * @param {string} pattern
 * @param {string} text
 * @returns {string | RegExp}
 */
function getPattern(pattern, text) {
	try {
		if (pattern) {
			const flags = 'unicodeSets' in RegExp.prototype
				? 'gv' : 'unicode' in RegExp.prototype
					? 'gu' : 'g';
			return new RegExp(pattern, flags);
		}
	} catch (e) {
		console.error(e);
	}
	return text;
}
/**
 *
 * @param {string} str
 * @param {RegExp | string} pattern
 * @returns {IterableIterator<[start: number, end: number]>}
 * @yields {[start: number, end: number]}
 */
function *findText(str, pattern) {
	if (pattern instanceof RegExp) {
		let r;
		// eslint-disable-next-line no-cond-assign
		while (r = pattern.exec(str)) {
			const {index, 0: {length}} = r;
			yield [index, index + length];
		}
		return;
	}
	const {length} = pattern;
	for (let index = str.indexOf(pattern); index >= 0; index = str.indexOf(pattern, index + 1)) {
		yield [index, index + length];
	}

}
/**
 *
 * @param {[number, number, string, Text][]} list
 * @param {number} start
 * @param {number} end
 * @returns {Generator<Range, boolean, unknown>}
 * @yields {Range}
 */
function *findRange(list, start, end) {
	const range = new Range();
	for (;list.length; list.shift()) {
		const [f] = list;
		if (f[0] > start) { continue; }
		range.setStart(f[3], start - f[0]);
		break;
	}
	for (;list.length; list.shift()) {
		const [f] = list;
		if (f[1] < end) { continue; }
		range.setEnd(f[3], end - f[0]);
		break;
	}
	if (!list.length) { return true; }
	yield range;
	return false;
}
/**
 *
 * @param {Node} node
 * @param {RegExp | string} pattern
 * @returns {IterableIterator<Range>}
 * @yields {Range}
 */
function *getRange(node, pattern) {
	if (!pattern) { return; }
	const list = [...getText(node)];
	const str = list.map(([,, t]) => t).join('');
	for (const [start, end] of findText(str, pattern)) {
		if (yield* findRange(list, start, end)) { return; }
	}
}
/**
 *
 * @param {RegExp | string} a
 * @param {RegExp | string} b
 * @returns {boolean}
 */
function isEq(a, b) {
	if (a === b) { return true; }
	if (!(a instanceof RegExp)) { return false; }
	if (!(b instanceof RegExp)) { return false; }
	if (a.source !== b.source) { return false; }
	return true;

}
const findHighlight = new Highlight();
CSS.highlights.set('nl-highlighter', findHighlight);
export default class Highlighter extends HTMLElement {
	static get highlight() { return findHighlight; }
	static observedAttributes = ['text', 'pattern'];
	/** @type {string} */
	get text() { return this.getAttribute('text') || ''; }
	set text(text) {
		if (text && typeof text === 'string') {
			this.setAttribute('text', text);
		} else {
			this.removeAttribute('text');
		}
	}
	/** @type {string} */
	get pattern() { return this.getAttribute('pattern') || ''; }
	set pattern(pattern) {
		if (pattern && typeof pattern === 'string') {
			this.setAttribute('pattern', pattern);
		} else {
			this.removeAttribute('pattern');
		}
	}
	/** @type {Range[]} */
	#ranges = [];
	/** @type {RegExp | string} */
	#pattern = '';
	#update() {
		const pattern = getPattern(this.pattern, this.text);
		if (isEq(pattern, this.#pattern)) { return; }
		this.#pattern = pattern;
		this.#renderer();
	}
	#renderer() {
		if (!this.#mutationObserver) { return; }
		for (const range of this.#ranges) {
			findHighlight.delete(range);
		}
		const ranges = [...getRange(this, this.#pattern)];
		this.#ranges = ranges;
		for (const r of ranges) {
			findHighlight.add(r);
		}
	}
	/** @type {MutationObserver?} */
	#mutationObserver = null;
	/**
	 *
	 * @protected
	 */
	connectedCallback() {
		const mo = new MutationObserver(() => { this.#renderer(); });
		mo.observe(this, {
			subtree: true,
			childList: true,
			attributes: false,
			characterData: true,
		});
		this.#mutationObserver = mo;
		this.#renderer();
	}
	/**
	 * @protected
	 */
	disconnectedCallback() {
		this.#mutationObserver?.disconnect();
		this.#mutationObserver = null;
	}
	/**
	 *
	 * @param {string} attrName
	 * @param {string | null} oldVal
	 * @param {string | null} newVal
	 * @returns {void}
	 * @protected
	 */
	attributeChangedCallback(attrName, oldVal, newVal) {
		if ((oldVal || '') === (newVal || '')) { return; }
		this.#update();
	}
}


customElements.define('nl-highlighter', Highlighter);
