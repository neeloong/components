
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
 * 不支持 CSS `writing-mode`
 */
export default class RollDigit extends HTMLElement {
	static observedAttributes = ['digit'];
	#style = document.createElement('style');
	#value = document.createElement('span');
	#digit() {
		const n = this.digit;
		const style = `.root { translate: 0 -${n * 10}%; }`;
		this.#value.innerText = `${n}`;
		this.#style.textContent = style;
	}
	constructor() {
		super();
		const shadow = this.attachShadow({mode:'closed'});
		shadow.appendChild(this.#style);
		shadow.appendChild(document.createElement('style')).textContent = style;
		const main = shadow.appendChild(document.createElement('span'));
		main.className = 'root';
		for (let i = 0; i < 10; i++) {
			main.appendChild(document.createElement('span'));
		}
		shadow.appendChild(this.#value).className = 'value';
	}
	/**
	 * 显示的数字
	 * @type {number}
	 */
	get digit() {
		return (parseInt(this.getAttribute('digit') || '') || 0) % 10;
	}
	/** @type {number | string | null | undefined} */
	set digit(digit) {
		if (digit === undefined || digit === null) {
			this.removeAttribute('digit');
		} else {
			this.setAttribute('digit', String(digit));
		}
	}
	connectedCallback() {
		this.#digit();
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
			case 'digit': {
				this.#digit();
				break;
			}
		}
	}
}

customElements.define('nl-roll-digit', RollDigit);
