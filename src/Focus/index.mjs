const style = `
:host {
	display: contents;
	color: inherit;
}
div {
	color: inherit;
	width: 100%;
	height: 100%;
	position: fixed;
	inset: 0;
	pointer-events: none;
	background: none;
	border: none;
	margin: 0;
	padding: 0;
	overflow: hidden;
}
svg {
	color: inherit;
	width: 100%;
	height: 100%;
	position: fixed;
	inset: 0;
	pointer-events: none;
}
`;

const hasPopover = typeof HTMLElement.prototype.showPopover === 'function';

let maskNextId = 0;
/**
 * @typedef {object} Rect
 * @property {(x: number, y: number, w: number, h: number) => void} setRect
 */
/**
 *
 * @param {Element} parent
 * @returns {Rect}
 */
function createRect(parent) {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
	const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
	const whiteRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	const blackRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	const rect3 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	const rect4 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

	const maskId = `nl-focus-mask:${maskNextId++}`;
	svg.appendChild(defs);
	defs.appendChild(mask);
	mask.setAttribute('id', maskId);
	mask.appendChild(whiteRect);
	whiteRect.setAttribute('x', '0');
	whiteRect.setAttribute('y', '0');
	whiteRect.setAttribute('width', '100vw');
	whiteRect.setAttribute('height', '100vh');
	whiteRect.setAttribute('fill', 'white');
	mask.appendChild(blackRect);
	blackRect.setAttribute('x', '0');
	blackRect.setAttribute('y', '0');
	blackRect.setAttribute('width', '100vw');
	blackRect.setAttribute('height', '100vh');
	blackRect.setAttribute('fill', 'black');
	svg.appendChild(bgRect);
	bgRect.setAttribute('x', '0');
	bgRect.setAttribute('y', '0');
	bgRect.setAttribute('width', '100%');
	bgRect.setAttribute('height', '100%');
	bgRect.setAttribute('fill', 'currentcolor');
	bgRect.setAttribute('mask', `url(#${maskId})`);
	svg.appendChild(g);
	g.setAttribute('pointer-events', 'auto');
	g.setAttribute('fill', 'transparent');
	g.appendChild(rect1);
	rect1.setAttribute('x', '0');
	rect1.setAttribute('y', '0');
	rect1.setAttribute('width', '100%');
	rect1.setAttribute('height', '100%');
	g.appendChild(rect2);
	rect2.setAttribute('x', '0');
	rect2.setAttribute('y', '0');
	rect2.setAttribute('width', '100%');
	rect2.setAttribute('height', '100%');
	g.appendChild(rect3);
	rect3.setAttribute('x', '0');
	rect3.setAttribute('y', '0');
	rect3.setAttribute('width', '100%');
	rect3.setAttribute('height', '100%');
	g.appendChild(rect4);
	rect4.setAttribute('x', '0');
	rect4.setAttribute('y', '0');
	rect4.setAttribute('width', '100%');
	rect4.setAttribute('height', '100%');
	parent.appendChild(svg);
	return {
		setRect(x, y, w, h) {
			blackRect.setAttribute('x', `${x}`);
			blackRect.setAttribute('y', `${y}`);
			blackRect.setAttribute('width', `${w}`);
			blackRect.setAttribute('height', `${h}`);
			rect1.setAttribute('width', `${x}`);
			rect2.setAttribute('height', `${y}`);
			rect3.setAttribute('x', `${x + w}`);
			rect4.setAttribute('y', `${y + h}`);
		},
	};
}

export default class Focus extends HTMLElement {
	static observedAttributes = ['hidden', 'target', 'x', 'y', 'width', 'height'];
	get x() { return parseFloat(this.getAttribute('x') || '') || 0; }
	set x(x) {
		if (x && typeof x === 'number' && Number.isFinite(x)) {
			this.setAttribute('x', String(x));
		} else {
			this.removeAttribute('x');
		}
	}
	get y() { return parseFloat(this.getAttribute('y') || '') || 0; }
	set y(y) {
		if (y && typeof y === 'number' && Number.isFinite(y)) {
			this.setAttribute('y', String(y));
		} else {
			this.removeAttribute('y');
		}
	}
	get width() { return parseFloat(this.getAttribute('width') || '') || 0; }
	set width(width) {
		if (width && typeof width === 'number' && Number.isFinite(width)) {
			this.setAttribute('width', String(width));
		} else {
			this.removeAttribute('width');
		}
	}
	get height() { return parseFloat(this.getAttribute('height') || '') || 0; }
	set height(height) {
		if (height && typeof height === 'number' && Number.isFinite(height)) {
			this.setAttribute('height', String(height));
		} else {
			this.removeAttribute('height');
		}
	}
	get target() { return this.getAttribute('target'); }
	set target(target) {
		if (typeof target !== 'string') {
			this.removeAttribute('target');
		} else {
			this.setAttribute('target', target);
		}
	}
	#shadow = (() => {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.appendChild(document.createElement('style')).textContent = style;
		return shadow;
	})();
	#main = this.#shadow.appendChild(document.createElement('div'));
	#svg = createRect(this.#main);
	#internals = this.attachInternals();

	/** @type {Element?} */
	#target = null;
	get targetElement() { return this.#target; }
	set targetElement(el) { this.#target = el instanceof Element ? el : null; }
	#open = false;
	#mounted = false;
	#close() {
		if (!this.#open) { return; }
		this.#main.removeAttribute('popover');
		this.#open = false;
	}
	#show() {
		if (this.#open || !this.#mounted) { return; }
		if (hasPopover) {
			const dialog = this.#main;
			dialog.popover = 'manual';
			dialog.showPopover();
		}
		this.update();
		this.#open = true;
	}
	#getTarget() {
		const targetElement = this.#target;
		if (targetElement) { return targetElement; }
		const {target} = this;
		if (target === '') { return this.parentElement; }
		if (!target) { return null; }
		try { return document.querySelector(target); } catch {}
		return null;
	}
	update() {
		if (!this.#mounted) { return; }
		const target = this.#getTarget();
		const {
			left, top, width, height,
		} = target?.getBoundingClientRect() || {
			top: this.y, left: this.x, width: this.width, height: this.height,
		};
		this.#svg.setRect(left, top, width, height);
	}
	connectedCallback() {
		this.#mounted = true;
		if (this.hidden) { return; }
		this.#show();
	}
	disconnectedCallback() {
		this.#mounted = false;
	}
	/**
	 * @param {string} attrName
	 * @param {string | null} oldVal
	 * @param {string | null} newVal
	 * @returns {void}
	 */
	attributeChangedCallback(attrName, oldVal, newVal) {
		if (!this.#mounted) { return; }
		if (oldVal === newVal) { return; }
		switch (attrName) {
			case 'hidden': {
				if (newVal !== null) {
					this.#close();
				} else {
					this.#show();
				}
				break;
			}
			case 'target': case 'x': case 'y': case 'width': case 'height': {
				this.update();
				break;
			}
		}
	}
}

try {
	customElements.define('nl-focus', Focus);
} catch {}
