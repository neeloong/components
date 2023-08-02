const style = `::slotted(*)::after {content: var(--nl-breadcrumb-separator, ' / ');}`;
const styleOfLast = `::slotted(:last-child)::after {content: none}`;

export default class Breadcrumb extends HTMLElement {
	static observedAttributes = ['separator'];
	#style = document.createElement('style');
	/**
	 *
	 * @param {string | null} newVal
	 * @returns {void}
	 */
	#separator(newVal) {
		if (newVal === null) {
			this.#style.textContent = '';
			return;
		}
		const content = JSON.stringify(newVal);
		const style = `::slotted(*)::after {content: ${content}; }`;
		this.#style.textContent = style;
	}
	constructor() {
		super();
		const shadow = this.attachShadow({mode:'closed'});
		shadow.appendChild(document.createElement('style'))
			.textContent = style;
		shadow.appendChild(this.#style);
		shadow.appendChild(document.createElement('style'))
			.textContent = styleOfLast;
		shadow.appendChild(document.createElement('slot'));
	}
	/**
	 * 分隔符
	 * @type {string | null}
	 */
	get separator() { return this.getAttribute('separator'); }
	set separator(separator) {
		if (separator === undefined || separator === null) {
			this.removeAttribute('separator');
		} else {
			this.setAttribute('separator', separator);
		}
	}
	connectedCallback() {
		this.#separator(this.separator);
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
			case 'separator': {
				this.#separator(newVal);
				break;
			}
		}
	}
}

customElements.define('nl-breadcrumb', Breadcrumb);
