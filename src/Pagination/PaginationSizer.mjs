import createStyle from './createStyle.mjs';
import { PaginationWidget } from './PaginationWidget.mjs';
const style = '';


/**
 *
 * @param {string?} t
 * @returns {Set<number>?}
 */
function parseSizes(t) {
	const l = t?.split(/[,;: ]/).map(v => parseInt(v)).filter(v => v >= 0);
	return l?.length ? new Set(l) : null;
}
/**
 *
 * @param {string | number | bigint | (string | bigint | number)[]} sizes
 * @returns {number[]}
 */
function parseSizesInput(sizes) {
	if (typeof sizes === 'string') {
		const s = parseSizes(sizes);
		return s ? [...s] : [];
	}
	if (typeof sizes === 'number') {
		const s = Math.floor(sizes);
		return s >= 0 ? [s] : [];
	}
	if (typeof sizes === 'bigint') {
		return sizes >= 0n ? [Number(sizes)] : [];
	}
	try {
		return Array(sizes).flat(Infinity).flatMap(parseSizesInput);
	} catch {
		return [];
	}

}
const defaultSizes = [10, 20, 30, 50, 100];
/**
 *
 * @param {string?} t
 * @param {number?} [d]
 * @returns {number[]}
 */
function getSizes(t, d) {
	const s = parseSizes(t) || new Set(defaultSizes);
	if (typeof d === 'number') { s.add(d); }
	return [...s].sort((a, b) => a - b);
}
// TODO: 分页器
// TODO: 可选范围，逗号隔开
export class PaginationSizer extends PaginationWidget {
	static observedAttributes = ['sizes', 'label', 'non-label', 'disabled'];
	/**
	 * 每页数量
	 * @type {boolean}
	 */
	get disabled() { return this.getAttribute('disabled') !== null; }
	set disabled(value) {
		if (!value) {
			this.removeAttribute('disabled');
		} else {
			this.setAttribute('disabled', '');
		}
	}
	#shadow = this.attachShadow({ mode: 'closed' });
	#style = this.#shadow.appendChild(createStyle(style));
	#input = (() => {
		const select = this.#shadow.appendChild(document.createElement('select'));
		select.setAttribute('part', 'input');
		select.addEventListener('change', () => {
			const {pagination} = this;
			if (!pagination) { return; }
			pagination.setSize(Number(select.value));
		});
		return select;
	})();
	/** @type {HTMLOptionElement} */
	#nonLabel = (() => {
		const nonLabel = document.createElement('option');
		nonLabel.label = '-';
		nonLabel.value = '0';
		return nonLabel;
	})();
	/** @type {HTMLOptionElement[]} */
	#labels = [];
	#update() {
		const s = parseSizes(this.getAttribute('sizes')) || new Set(defaultSizes);
		const {size} = this;
		s.add(size);
		const select = this.#input;
		select.innerHTML = '';
		if (s.delete(0)) {
			select.appendChild(this.#nonLabel);
		}
		/** @type {HTMLOptionElement[]} */
		const labels = [];
		this.#labels = labels;
		const labelText = this.label;
		for (const o of [...s].sort((a, b) => a - b)) {
			const label = document.createElement('option');
			label.label = labelText.replace(/#/g, String(o));
			label.value = String(o);
			labels.push(label);
			select.appendChild(label);
		}
		select.value = String(size);
	}
	get label() { return this.getAttribute('label') || '#'; }
	set label(label) {
		if (label) {
			this.setAttribute('label', label);
		} else {
			this.removeAttribute('label');
		}
	}
	get nonLabel() { return this.getAttribute('non-label') || '-'; }
	set nonLabel(label) {
		if (label) {
			this.setAttribute('non-label', label);
		} else {
			this.removeAttribute('non-label');
		}
	}
	get sizes() { return getSizes(this.getAttribute('sizes')); }
	set sizes(sizes) {
		const s = parseSizesInput(sizes);
		if (!s.length) {
			this.removeAttribute('sizes');
		} else {
			this.setAttribute('sizes', [...new Set(s)].sort((a, b) => a - b).join(','));
		}
	}
	#size = 0;
	/** @protected */
	updateCallback() {
		const {size} = this;
		if (this.#size === size) { return; }
		this.#size = size;
		this.#update();
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
			case 'sizes':
				this.#update();
				break;
			case 'label':{
				const labelText = this.label;
				for (const label of this.#labels) {
					label.label = labelText.replace(/#/g, label.value);
				}
				break;
			}
			case 'non-label':{
				this.#nonLabel.label = this.nonLabel;
				break;
			}
			case 'disabled':
				this.#input.disabled = this.disabled;
				break;
		}
	}
}
