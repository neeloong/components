
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
.value:empty::before {
	content: '.'
}
.root, .sign {
	position: absolute;
	text-align: center;
	text-orientation: upright;
	transition: all 1.5s;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	overflow: hidden;
	user-select: none;
	pointer-events: none;
}
.root {
	counter-reset: nl-roll-digit -1;
	inline-size: 100%;
	block-size: 1000%;
	inset-inline-start: 0;
}
.root span {
	flex: 1;
	overflow: hidden;
	counter-increment: nl-roll-digit;
}
.root span::before {
	content: counter(nl-roll-digit)
}
.sign {
	inline-size: 100%;
	block-size: 300%;
	inset-block-start: -100%;
	inset-inline-start: -100%;
}
.sign span {
	flex: 1;
	overflow: hidden;
}
.sign span::before {
	content: ''
}
.sign span:first-child::before {
	content: '-'
}
.sign span:last-child::before {
	content: '+'
}
:host([sign]) .sign {
	inset-inline-start: 0;
}
:host([sign]) .root {
	inset-inline-start: 100%;
}
`;

/**
 * 数字滚动组件
 */
export default class RollDigit extends HTMLElement {
	static observedAttributes = ['digit', 'value', 'sign', 'plus', 'zero'];
	#main = document.createElement('span');
	#sign = document.createElement('span');
	#value = document.createElement('span');
	#update() {
		const n = this.currentDigit;
		const s = this.currentSign;
		this.#value.innerText = this.sign ? s : `${n}`;
		this.#main.style.insetBlockStart = `-${n}00%`;
		this.#sign.style.insetBlockStart = `-${s === '+' ? 2 : s === '-' ? 0 : 1}00%`;
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
		const sign = shadow.appendChild(this.#sign);
		sign.className = 'sign';
		for (let i = 0; i < 3; i++) {
			sign.appendChild(document.createElement('span'));
		}
		shadow.appendChild(this.#value).className = 'value';
	}
	/**
	 * @type {number}
	 */
	get currentDigit() {
		return Math.floor(Math.abs(this.value) / 10 ** this.digit % 10);
	}
	get currentSign() {
		const {value} = this;
		if (value < 0) { return '-'; }
		if (!value) { return this.zero; }
		return this.plus ? '+' : '';
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
	get sign() { return this.hasAttribute('sign'); }
	set sign(sign) {
		if (sign) {
			this.setAttribute('sign', '');
		} else {
			this.removeAttribute('sign');
		}
	}
	get plus() { return this.hasAttribute('plus'); }
	set plus(plus) {
		if (plus) {
			this.setAttribute('plus', '');
		} else {
			this.removeAttribute('plus');
		}
	}
	get zero() {
		const sign = this.getAttribute('zero');
		return sign === '+' || sign === '-' ? sign : '';
	}
	set zero(sign) {
		if (sign === '+' || sign === '-') {
			this.setAttribute('plus-zero', sign);
		} else {
			this.removeAttribute('zero');
		}
	}
	/**
	 * @type {number}
	 */
	get value() { return parseFloat(this.getAttribute('value') || '') || 0; }
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
			case 'digit': case 'value': case 'sign': case 'plus': case 'zero': {
				this.#update();
				break;
			}
		}
	}
}

try {
	customElements.define('nl-roll-digit', RollDigit);
} catch {}
