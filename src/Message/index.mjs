const style = `
:host {
	transition-property: none;
	transition-duration: .5s;
	display: contents;
	inline-size: fit-content;
	block-size: fit-content;
	color: canvastext;
	background-color: canvas;
	border: solid;
	padding: 0.25em;
	writing-mode: inherit;
}
section {
	inline-size: inherit;
	block-size: inherit;
	background: inherit;
	border: inherit;
	border-radius: inherit;
	color: inherit;
	padding: inherit;
	position: fixed;
	inset: auto;
	inset-inline: 0;
	margin-block: 0;
	margin-inline: auto;
	overflow: auto;
	transition-property: opacity;
	transition-duration: inherit;
	opacity: 0;
	display: none;
	z-index: 9999999999999999999999;
}
section.open {
	opacity: 1;
}
.shown {
	display: flex;
	transition-property: opacity, inset-block-start;
	align-items: center;
	flex-wrap: nowrap;
	flex-direction: row;
}

slot {
	display: block;
	flex: 1;
}

.close {
	block-size: 1em;
	inline-size: 1em;
	display: none;
	cursor: pointer;
	transition: color .5s;
	position: relative;
	line-height: 1em;
	border-radius: 100%;
	overflow: hidden;
}
:host([closable]) .close {
	display: block;
}
.close::before,
.close::after {
	content: '';
	position: absolute;
	display: inline-block;
	inline-size: 80%;
	block-size: 5%;
	background: currentColor;
	inset: 0;
	margin: auto;
}
.close::before {
	transform: rotate(45deg);
}
.close::after {
	transform: rotate(-45deg);
}

`;
/**
 * @typedef {object} Handler
 * @property {HTMLElement} element
 */

/** @type {Handler[]} */
const messages = [];

/**
 *
 * @param {Element} root
 * @returns {number} 上 左 右 下
 */
function getPos(root) {
	const writingMode = getComputedStyle(root).writingMode?.toLowerCase();
	if (['vertical-lr', 'sideways-lr'].includes(writingMode)) { return 1; }
	if (['vertical-rl', 'sideways-rl'].includes(writingMode)) { return 2; }
	return 0;
}
/**
 *
 */
function update() {
	const offset = [0, 0, 0, 0];
	for (const {element} of messages) {
		const pos = getPos(element);
		const openState = element.classList.contains('open');
		if (openState) { offset[pos] += 20; }
		element.style.insetBlockStart = `${offset[pos]}px`;
		if (!openState) { continue; }
		offset[pos] += pos % 3 ? element.clientWidth : element.clientHeight;
	}
}
const resizeObserver = new ResizeObserver(function() { update(); });

export default class Message extends HTMLElement {
	static observedAttributes = ['open', 'hidden', 'duration'];

	get open() { return this.hasAttribute('open'); }
	set open(open) {
		if (open) {
			this.setAttribute('open', '');
		} else {
			this.removeAttribute('open');
		}
	}

	get closable() { return this.hasAttribute('closable'); }
	set closable(closable) {
		if (closable) {
			this.setAttribute('closable', '');
		} else {
			this.removeAttribute('closable');
		}
	}
	get duration() {
		const duration = parseFloat(this.getAttribute('duration') || '');
		if (Number.isNaN(duration)) { return 1.5; }
		if (duration <= 0) { return Infinity; }
		if (!Number.isFinite(duration)) { return 1.5; }
		return duration;
	}
	set duration(duration) {
		if (typeof duration !== 'number' || !Number.isFinite(duration)) {
			this.removeAttribute('duration');
		} else if (duration <= 0 || !Number.isFinite(duration)) {
			this.setAttribute('duration', `0`);
		} else {
			this.setAttribute('duration', String(duration));
		}
	}


	#style = document.createElement('style');
	#main = document.createElement('section');
	/** @type {Handler} */
	#handler = {element: this.#main};
	#mounted = false;
	/** @type {NodeJS.Timeout?} */
	#duration = null;
	#internals = this.attachInternals();
	constructor() {
		super();
		const shadow = this.attachShadow({mode:'closed'});
		shadow.appendChild(document.createElement('style')).textContent = style;
		shadow.appendChild(this.#style);
		const main = shadow.appendChild(this.#main);
		main.popover = 'manual';
		main.setAttribute('part', 'message');
		main.appendChild(document.createElement('slot')).setAttribute('part', 'slot');
		const close = main.appendChild(document.createElement('div'));
		close.className = 'close';
		close.addEventListener('click', () => { this.open = false; });
		close.setAttribute('part', 'close');
		main.addEventListener('transitionend', e => {
			if (e.propertyName !== 'opacity') { return; }
			if (main.classList.contains('open')) { return; }
			this.#hidePopover();
		});
	}
	#shown = false;
	#clearTimeout() {
		const duration = this.#duration;
		if (duration === null) { return; }
		clearTimeout(duration);
		this.#duration = null;

	}
	#setTimeout() {
		this.#clearTimeout();
		const {duration} = this;
		if (duration === Infinity) { return; }
		this.#duration = setTimeout(() => {
			this.#duration = null;
			this.open = false;
		}, duration * 1000);
	}
	#show() {
		if (this.#shown) { return; }
		this.#shown = true;
		let inset = 0;
		const pos = getPos(this.#main);
		for (const {element} of messages) {
			if (!element.classList.contains('open')) { continue; }
			if (getPos(element) !== pos) { continue; }
			inset += (pos % 3 ? element.clientWidth : element.clientHeight) + 20;
		}
		const main = this.#main;
		main.style.insetBlockStart = `${inset}px`;
		main.showPopover?.();
		main.classList.add('shown');
		// @ts-ignore
		this.#internals.states?.add('--shown');
		main.setAttribute('part', 'message shown');
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (!this.#shown) { return; }
				if (!main.classList.contains('shown')) { return; }
				main.classList.add('open');
				// @ts-ignore
				this.#internals.states?.add('--open');
				this.#setTimeout();
				resizeObserver.observe(main);
				messages.push(this.#handler);
				update();
			});
		});
	}
	#remove() {
		const index = messages.indexOf(this.#handler);
		if (index < 0) { return; }
		messages.splice(index, 1);
		if (index >= messages.length) { return; }
		update();
	}
	#hide() {
		if (!this.#shown) { return; }
		this.#shown = false;
		this.#clearTimeout();
		const main = this.#main;
		main.classList.remove('open');
		// @ts-ignore
		this.#internals.states?.delete('--open');
		resizeObserver.unobserve(main);
		update();
	}
	#hidePopover() {
		this.#remove();
		const main = this.#main;
		main.hidePopover?.();
		// @ts-ignore
		this.#internals.states?.delete('--shown');
		main.classList.remove('shown');
		main.setAttribute('part', 'message');
	}
	connectedCallback() {
		this.#mounted = true;
		if (!this.hidden && this.open) {
			this.#show();
		}
	}
	disconnectedCallback() {
		this.#mounted = false;
		this.#hide();
		this.hidePopover();
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
			case 'hidden': case 'open': {
				if (this.#mounted) {
					if (!this.hidden && this.open) {
						this.#show();
					} else {
						this.#hide();
					}
				}
				break;
			}
			case 'duration': {
				this.#setTimeout();
				break;
			}
		}
	}
}

try {
	customElements.define('nl-message', Message);
} catch {}
