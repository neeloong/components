
const style = `\
:host {
	display: inline-block;
	color: #000;
	margin: auto;
	position: relative;
	border-radius: 100%;
	border: 1px solid;
	width: 1em;
	height: 1em;
}
:host([hidden]) {
	display: none;
}
div {
	height: 1px;
	width: 50%;
	position: absolute;
	background: currentColor;
	margin: auto 0 auto auto;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	pointer-events: none;
	transform-origin: left;
}
`;
export default class Angle extends HTMLElement {
	/** @readonly */
	static formAssociated = true;
	/** @readonly */
	#printer = document.createElement('div');
	/** @readonly */
	#internals = this.attachInternals();
	constructor() {
		super();
		const root = this.attachShadow({mode: 'closed'});
		root.appendChild(document.createElement('style')).textContent = style;
		root.appendChild(this.#printer);
		/**
		 *
		 * @param {PointerEvent} event
		 * @returns {void}
		 */
		const onTouch = event => {
			if (!(event.buttons & 1)) { return; }
			const { left, width, top, height } = this.getBoundingClientRect();
			const x = event.clientX - left - width / 2;
			const y = event.clientY - top - height / 2;
			const value = Math.atan2(y, x) / Math.PI * 180;
			this.value = Math.round(value);
			this.dispatchEvent(new InputEvent('input'));
			this.dispatchEvent(new InputEvent('change'));
		};
		this.addEventListener('pointerdown', onTouch);
		this.addEventListener('pointermove', onTouch);
		this.value = this.getAttribute('value');
	}
	#value = 0;
	/** @type {number} */
	get value() {
		return this.#value;
	}
	/**
	 * @param {number | string | null} [v]
	 */
	set value(v) {
		const a = parseInt(String(v));
		if (!Number.isFinite(a)) { return; }
		this.#value = a;
		this.#printer.style.transform = `rotate(${a}deg)`;
		this.#internals.setFormValue(String(a));
	}
	connectedCallback() {
		if (this.getAttribute('tabindex') === null) {
			this.setAttribute('tabindex', '0');
		}
	}
}

customElements.define('nl-angle', Angle);
