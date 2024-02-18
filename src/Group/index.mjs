const style = `
:host {
	display: inline-flex;
	flex-direction: row;
}

:host([column]) {
	flex-direction: column;
}
slot {
	border-radius: inherit;
}
::slotted(*) {
	border-radius: 0;
	flex: 1;
}
::slotted(:first-child) {
	border-start-start-radius: inherit;
	border-end-start-radius: inherit;
}

::slotted(:last-child) {
	border-start-end-radius: inherit;
	border-end-end-radius: inherit;
}

:host([column]) ::slotted(:first-child) {
	border-end-start-radius: 0;
	border-start-end-radius: inherit;
}

:host([column]) ::slotted(:last-child) {
	border-start-end-radius: 0;
	border-end-start-radius: inherit;
}

:host([nl-long]) {
	display: flex;
	inline-size: 100%;
}
::slotted([nl-long]) {
	flex: 100000;
}
`;

export default class Group extends HTMLElement {
	static observedAttributes = ['radius', 'unit'];
	get radius() {
		const radius = parseFloat(this.getAttribute('radius') || '');
		if (Number.isNaN(radius)) { return 0; }
		if (!Number.isFinite(radius)) { return 0; }
		return radius < 0 ? -1 : radius;
	}
	set radius(radius) {
		if (typeof radius !== 'number' || !Number.isFinite(radius)) {
			this.removeAttribute('radius');
		} else {
			this.setAttribute('radius', radius < 0 ? '-1' : String(radius));
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
	get long() { return this.hasAttribute('nl-long'); }
	set long(long) {
		if (long) {
			this.setAttribute('nl-long', '');
		} else {
			this.removeAttribute('nl-long');
		}
	}
	get column() { return this.hasAttribute('column'); }
	set column(column) {
		if (column) {
			this.setAttribute('column', '');
		} else {
			this.removeAttribute('column');
		}
	}


	#style = document.createElement('style');
	constructor() {
		super();
		const shadow = this.attachShadow({mode:'closed'});
		shadow.appendChild(document.createElement('style')).textContent = style;
		shadow.appendChild(this.#style);
		shadow.appendChild(document.createElement('slot'));
		this.#updateStyle();
	}
	#updateStyle() {
		const {radius} = this;
		const value = radius >= 0 ? `${radius}${this.unit}` : '50%';
		this.#style.textContent =
			`:host {border-radius: var(--nl-group-radius, ${value})}`;

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
			case 'radius': case 'unit': {
				this.#updateStyle();
				break;
			}
		}
	}
}

customElements.define('nl-group', Group);
