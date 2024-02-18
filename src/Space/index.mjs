const style = `
:host {
	display: inline-block;
}
::slotted(*) {
	display: inline-block;
}
::slotted(*:last-child) {
	margin-inline-end: 0;
	margin-block-end: 0;
}
:host([column]) ::slotted(*) {
	display: block;
}
`;
export default class Space extends HTMLElement {
	static observedAttributes = ['column', 'space', 'unit'];
	get column() {
		return this.hasAttribute('column');
	}
	set column(column) {
		if (column) {
			this.setAttribute('column', '');
		} else {
			this.removeAttribute('column');
		}
	}
	get space() {
		const space = parseFloat(this.getAttribute('space') || '');
		if (Number.isNaN(space)) { return 16; }
		if (!Number.isFinite(space)) { return 16; }
		return space <= 0 ? 0 : space;
	}
	set space(space) {
		if (typeof space !== 'number' || !Number.isFinite(space)) {
			this.removeAttribute('space');
		} else {
			this.setAttribute('space', space <= 0 ? '0' : String(space));
		}
	}
	get unit() { return this.getAttribute('unit') || 'px'; }
	set unit(unit) {
		if (unit) {
			this.setAttribute('unit', unit);
		} else {
			this.removeAttribute('unit');
		}
	}
	#style = document.createElement('style');
	constructor() {
		super();
		const shadow = this.attachShadow({mode:'closed'});
		shadow.appendChild(this.#style);
		shadow.appendChild(document.createElement('style')).textContent = style;
		shadow.appendChild(document.createElement('slot'));
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
			case 'column': case 'space': case 'unit': {
				this.#style.textContent =
				`::slotted(*) {margin-${this.column ? 'block' : 'inline'}-end: var(--nl-space, ${this.space}${this.unit})}`;
				break;
			}
		}
	}
}


customElements.define('nl-space', Space);
