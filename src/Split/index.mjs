const style = `
:host {
	display: flex;
	border: 1px solid;
	writing-mode: inherit;
}
:host([hidden]) {
	display: none;
}
:host([column]) {
	display: none;
	flex-direction: column;
}
slot {
	display: block;
	position: relative;
}
.start {
	flex: 1;
	overflow: hidden;
}
.end {
	flex: 1;
	overflow: hidden;
}
.trigger {
	cursor: move;
}
.trigger div {
	inline-size: 8px;
	block-size: 100%;
	background: currentColor;
	opacity: .2;
}
:host(:state(--moving)) div, div:hover {
	opacity: .5;
}
`;
/**
 *
 * @param {HTMLElement} el
 * @param {string} name
 * @param {boolean} value
 */
function setBoolAttribute(el, name, value) {
	if (value) {
		el.setAttribute(name, '');
	} else {
		el.removeAttribute(name);
	}
}
/**
 *
 * @param {string?} v
 * @param {number} def
 * @param {number} [min]
 * @param {number} [max]
 * @returns {number}
 */
function toFloat01(v, def, min = 0, max = 1) {
	const value = v ? parseFloat(v) : def;
	return Math.max(min, Math.min(Number.isNaN(value) ? def : value, max));
}
/**
 *
 * @param {HTMLElement} el
 * @param {string} name
 * @param {number | string | null} value
 * @param {number} [min]
 * @param {number} [max]
 */
function setFloat01Attribute(el, name, value, min = 0, max = 1) {
	let float = typeof value === 'string' ? parseFloat(value) : value === null ? NaN : value;
	if (Number.isNaN(float)) {
		el.removeAttribute(name);
		return;
	}
	el.setAttribute(name, String(Math.max(min, Math.min(float, max))));
}

const verticalWritingMode = new Set([
	'vertical-lr', 'vertical-rl', 'sideways-lr', 'sideways-rl',
]);
/**
 *
 * @param {Element} root
 * @returns {[boolean, boolean]}
 */
function getLayout(root) {
	const style = getComputedStyle(root);
	const writingMode = style.writingMode?.toLowerCase();
	const vertical = verticalWritingMode.has(writingMode);

	const flexDir = style.flexDirection.toLocaleLowerCase();
	const column = flexDir.includes('column');
	let reverse = column
		? ['vertical-rl', 'sideways-rl'].includes(writingMode)
		: style.direction.toLowerCase() === 'rtl' !== (writingMode === 'sideways-lr');
	reverse = reverse !== flexDir.includes('reverse');
	return [vertical !== column, reverse];
}

export default class Split extends HTMLElement {
	static observedAttributes = ['column', 'disabled', 'min', 'max', 'value'];
	/** @type {boolean} 纵向分割 */
	get column() { return this.getAttribute('column') !== null; }
	set column(value) { setBoolAttribute(this, 'column', value); }
	/** @type {boolean} 禁用 */
	get disabled() { return this.getAttribute('disabled') !== null; }
	set disabled(value) { setBoolAttribute(this, 'disabled', value); }
	/** @type {number} 最小阈值 */
	get min() { return toFloat01(this.getAttribute('min'), 0, 0, 1); }
	set min(value) { setFloat01Attribute(this, 'min', value, 0, toFloat01(this.getAttribute('max'), 1, 0, 1)); }
	/** @type {number} 最大阈值 */
	get max() { return toFloat01(this.getAttribute('max'), 1, this.min, 1); }
	set max(value) { setFloat01Attribute(this, 'max', value, this.min, 1); }
	/** @type {number} 当前值 */
	get value() { return toFloat01(this.getAttribute('value'), 0.5, this.min, this.max); }
	set value(value) { setFloat01Attribute(this, 'value', value, this.min, this.max); }

	/** @type {number?} */
	#pointerId = null;

	#stopMove() {
		const pointerId = this.#pointerId;
		if (pointerId === null) { return; }
		this.#internals.states.delete('--moving');
		this.#pointerId = null;
		this.#trigger.releasePointerCapture(pointerId);
	}

	#shadow = (() => {
		const shadow = this.attachShadow({mode:'closed'});
		shadow.appendChild(document.createElement('style')).textContent = style;
		return shadow;
	})();
	#startArea = (() => {
		const el = document.createElement('slot');
		el.name = 'start';
		el.className = 'start';
		this.#shadow.appendChild(el);
		return el;
	})();
	/** @readonly */
	#internals = this.attachInternals();
	#trigger = (() => {
		const trigger = document.createElement('slot');
		trigger.name = 'trigger';
		trigger.tabIndex = 0;
		trigger.className = 'trigger';
		trigger.appendChild(document.createElement('div'));
		this.#shadow.appendChild(trigger);
		let offset = 0;
		trigger.addEventListener('pointerdown', e => {
			if (this.hidden || this.disabled) { return; }
			// if (this.#shadow.activeElement !== trigger) { return; }
			const { pointerId } = e;
			const currentPointerId = this.#pointerId;
			if (![null, pointerId].includes(currentPointerId)) { return; }
			this.#internals.states.add('--moving');
			this.#pointerId = pointerId;
			trigger.setPointerCapture(pointerId);
			switch (getLayout(trigger).map((v, i) => v ? 2 ** i : 0).reduce((a, b) => a + b)) {
				case 0: offset = -e.offsetX; break;
				case 1: offset = -e.offsetY; break;
				case 2: offset = e.offsetX - trigger.offsetWidth; break;
				case 3: offset = e.offsetY - trigger.offsetHeight; break;
			}
		});
		const areaEl = this;
		/**
		 * @param {boolean} vertical
		 * @returns {number}
		 */
		const getSize = vertical => {
			const size = vertical
				? areaEl.clientHeight - trigger.offsetHeight
				: areaEl.clientWidth - trigger.offsetWidth;
			return size;
		};
		/** @param {PointerEvent} e */
		const updateMove = e => {
			const [vertical, reverse] = getLayout(trigger);
			let os = 0;
			switch ([vertical, reverse].map((v, i) => v ? 2 ** i : 0).reduce((a, b) => a + b)) {
				case 0: os = e.clientX - areaEl.getBoundingClientRect().left; break;
				case 1: os = e.clientY - areaEl.getBoundingClientRect().top; break;
				case 2: os = areaEl.getBoundingClientRect().right - e.clientX; break;
				case 3: os = areaEl.getBoundingClientRect().bottom - e.clientY; break;
			}
			const {max, min} = this;
			const value = Math.max(min, Math.min((os + offset) / getSize(vertical), max));
			this.setAttribute('value', String(value));

		};
		trigger.addEventListener('pointermove', e => {
			const { pointerId } = e;
			if (!trigger.hasPointerCapture(pointerId)) { return; }
			updateMove(e);
		});
		trigger.addEventListener('pointerup', e => {
			const { pointerId } = e;
			if (pointerId !== this.#pointerId) { return; }
			updateMove(e);
			this.#stopMove();
		});
		trigger.addEventListener('pointercancel', e => {
			const { pointerId } = e;
			if (pointerId !== this.#pointerId) { return; }
			updateMove(e);
			this.#stopMove();
		});
		trigger.addEventListener('keydown', e => {
			if (this.hidden || this.disabled || this.#pointerId !== null) { return; }
			if (this.#shadow.activeElement !== trigger) { return; }
			const {max, min} = this;
			switch (e.code) {
				case 'Home': {
					e.preventDefault();
					this.setAttribute('value', String(Math.max(min, 0)));
					return;
				}
				case 'End': {
					e.preventDefault();
					this.setAttribute('value', String(Math.min(1, max)));
					return;
				}
			}
			const [vertical, reverse] = getLayout(trigger);
			let offset = 0;
			switch (e.code) {
				case 'ArrowUp': offset = vertical ? -1 : 0; break;
				case 'ArrowDown': offset = vertical ? 1 : 0; break;
				case 'ArrowLeft': offset = vertical ? 0 : -1; break;
				case 'ArrowRight': offset = vertical ? 0 : 1; break;
			}
			if (!offset) { return; }
			e.preventDefault();
			if (reverse) { offset = -offset; }
			if (e.ctrlKey) { offset *= 100; }
			if (e.shiftKey) { offset *= 10; }

			let value = toFloat01(this.getAttribute('value'), 0.5, min, max);
			value = Math.max(min, Math.min(value + offset / getSize(vertical), max));
			this.setAttribute('value', String(value));
		});
		return trigger;
	})();
	#endArea = (() => {
		const el = document.createElement('slot');
		el.name = 'end';
		el.className = 'end';
		this.#shadow.appendChild(el);
		return el;
	})();
	/**
	 * @returns {void}
	 */
	connectedCallback() { }
	/**
	 * @returns {void}
	 */
	disconnectedCallback() { this.#stopMove(); }
	/**
	 * @returns {void}
	 */
	adoptedCallback() { this.#stopMove(); }
	/**
	 * @param {string} attrName
	 * @param {string | null} oldVal
	 * @param {string | null} newVal
	 * @returns {void}
	 * @protected
	 */
	attributeChangedCallback(attrName, oldVal, newVal) {
		if (oldVal === newVal) { return; }
		switch (attrName) {
			case 'hidden': {
				if (!this.hidden) { break; }
				this.#stopMove();
				break;
			}
			case 'disabled': {
				if (newVal === null) {
					this.#trigger.tabIndex = 0;
				} else {
					this.#trigger.removeAttribute('tabindex');
				}
				this.#stopMove();
				break;
			}
			case 'min': case 'max': case 'value': {
				const {value} = this;
				this.#startArea.style.flex = `${value}`;
				this.#endArea.style.flex = `${1 - value}`;
				break;
			}
		}
	}
}

try {
	customElements.define('nl-split', Split);
} catch {}
