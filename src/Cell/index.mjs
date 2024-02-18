const style = `
[hidden]{
	display: none!important;
}
:host {
	position: relative;
	border-block: 1px solid currentColor;
	display: flex;
	align-items: center;
	line-height: 1.4;
	overflow: hidden;
	padding: 8px;
	min-block-size: 32px;
	font-size: 14px;
	text-decoration: none;
}

.icon {
	display: block;
	margin-inline-end: 5px;
}

.body {
	flex: 1;
}

.label {
	line-height: 24px;
	font-size: 14px;
}
:host([bold]) .label {
	font-weight: bold;
}
.explain {
	color: var(--nl-cell-explain-color, currentColor);
}
.explain:empty {
	display: none;
}
.extra {
	display: block;
	position: relative;
	text-align: end;
}
.link {
	display: none;
	position: relative;
	inline-size: 16px;
	text-align: center;
}
.link::before {
	content: '';
	transform: rotate(45deg);
	border: 2px solid transparent;
	pointer-events: none;
	inline-size: 8px;
	block-size: 8px;
	display: inline-block;
	color: var(--nl-cell-link-color, #CCC);
	border-block-start-color: currentColor;
	border-inline-end-color: currentColor;
}

:host([link]) .link {
	display: block;
}

`;
export default class Cell extends HTMLElement {
	static observedAttributes = ['label', 'explain'];
	get label() { return this.getAttribute('label') || ''; }
	set label(label) {
		if (label) {
			this.setAttribute('label', label);
		} else {
			this.removeAttribute('label');
		}
	}
	get explain() { return this.getAttribute('explain') || ''; }
	set explain(explain) {
		if (explain) {
			this.setAttribute('explain', explain);
		} else {
			this.removeAttribute('explain');
		}
	}
	get disabled() { return this.hasAttribute('disabled'); }
	set disabled(disabled) {
		if (disabled) {
			this.setAttribute('disabled', '');
		} else {
			this.removeAttribute('disabled');
		}
	}
	#label = document.createElement('div');
	#explain = document.createElement('div');
	constructor() {
		super();
		const shadow = this.attachShadow({mode:'closed'});
		shadow.appendChild(document.createElement('style')).textContent = style;


		shadow.addEventListener('click', e => {
			if (!this.disabled) { return; }
			e.stopPropagation();
			e.preventDefault();
		});

		const iconSlot = shadow.appendChild(document.createElement('slot'));
		iconSlot.name = 'icon';
		iconSlot.className = 'icon';
		iconSlot.hidden = !iconSlot.assignedNodes().length;
		iconSlot.addEventListener('slotchange', e=> {
			iconSlot.hidden = !iconSlot.assignedNodes().length;
		});

		const body = shadow.appendChild(document.createElement('div'));
		body.className = 'body';
		const label = body.appendChild(this.#label);
		label.className = 'label';
		const explain = body.appendChild(this.#explain);
		explain.setAttribute('part', 'explain');
		explain.className = 'explain';

		const extraSlot = shadow.appendChild(document.createElement('slot'));
		extraSlot.name = 'extra';
		extraSlot.className = 'extra';
		extraSlot.hidden = !extraSlot.assignedNodes().length;
		extraSlot.addEventListener('slotchange', e=> {
			extraSlot.hidden = !extraSlot.assignedNodes().length;
		});
		const link = shadow.appendChild(document.createElement('div'));
		link.className = 'link';
		link.setAttribute('part', 'link');
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
			case 'label': {
				this.#label.innerText = newVal || '';
				break;
			}
			case 'explain': {
				this.#explain.innerText = newVal || '';
				break;
			}
		}
	}
}

customElements.define('nl-cell', Cell);
