
const style = `
:host {
	display: inline-block;
	overflow: hidden;

	position: relative;
	container-name: host;
}
:host([hidden]) { display: none; }

.value {
	color: transparent;
	text-align: center;
	text-orientation: upright;
	inline-size: 100%;
	block-size: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}
.root {
	counter-reset: nl-roll-digit -1;
	position: absolute;
	text-align: center;
	text-orientation: upright;
	inline-size: 100%;
	block-size: 1000%;
	transition: all 1.5s;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	overflow: hidden;
	user-select: none;
	pointer-events: none;
}
.root span {
	flex: 1;
	overflow: hidden;
	counter-increment: nl-roll-digit;
}
.root span::before {
	content: counter(nl-roll-digit)
}
`;

/**
 * 数字滚动组件
 */
export default class RollDigit extends HTMLElement {
	static observedAttributes = ['digit', 'value'];
	#main = document.createElement('span');
	#value = document.createElement('span');
	#update() {
		const n = this.currentDigit;
		this.#value.innerText = `${n}`;
		this.#main.style.insetBlockStart = `-${n}00%`;
	}
	constructor() {
		super();
		const shadow = this.attachShadow({mode:'closed'});
		shadow.appendChild(document.createElement('style')).textContent = style;
		const main = shadow.appendChild(this.#main);
		main.className = 'root';
		for (let i = 0; i < 10; i++) {
			main.appendChild(document.createElement('span'));
		}
		shadow.appendChild(this.#value).className = 'value';
	}
	/**
	 * @type {number}
	 */
	get currentDigit() {
		return Math.floor(Math.abs(this.value) / 10 ** this.digit % 10);
	}
	/**
	 * @type {number}
	 */
	get digit() {
		return parseInt(this.getAttribute('digit') || '') || 0;
	}
	/** @type {number | string | null | undefined} */
	set digit(digit) {
		if (digit === undefined || digit === null) {
			this.removeAttribute('digit');
		} else {
			this.setAttribute('digit', String(digit));
		}
	}
	/**
	 * @type {number}
	 */
	get value() {
		return parseFloat(this.getAttribute('value') || '') || 0;
	}
	/** @type {number | string | null | undefined} */
	set value(value) {
		if (value === undefined || value === null) {
			this.removeAttribute('value');
		} else {
			this.setAttribute('value', String(value));
		}
	}
	connectedCallback() {
		this.#update();
	}
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
			case 'digit': case 'value': {
				this.#update();
				break;
			}
		}
	}
}

customElements.define('nl-roll-digit', RollDigit);
