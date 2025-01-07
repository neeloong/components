const style = `
:host {
	display: block;
	border: 1px solid #666;
	writing-mode: inherit;
}
:host[hidden] {
	display: none;
}
header {
	display: flex;
	border-block-end: inherit;
	cursor: pointer;
}
.label {
	flex: 1;
	display: flex;
}
.trigger {
	width: .35em;
	height: .35em;
	border: .15em solid currentcolor;
	border-block-start: none;
	border-inline-start: none;
	margin-inline: .3em .5em;
	margin-block: auto;
	transform: rotate(-45deg);
}
section {
	overflow: hidden;
}
main {
	padding: 8px;
}

:host(:not([open])) section {
	block-size: 0!important;
}
:host(:not([open])) header {
	margin-block-end: -1px;
}

:host([open]) .trigger {
	transform: rotate(45deg);
}


:host([menu]) {
		border: none;
}
:host([menu]) main {
	padding: 0!important;
}
:host([menu]) header {
	margin-block-end: 0;
}
:host([animation]) section.animation {
	transition: block-size .3s;
}
:host([animation]) .trigger {
	transition: transform .3s;
}
:host([non-trigger]) .trigger-slot {
	display: none;
}

:host([start-trigger]) header {
	flex-direction: row-reverse;
}
`;

const verticalWritingMode = new Set([
	'vertical-lr', 'vertical-rl', 'sideways-lr', 'sideways-rl',
]);
/**
 *
 * @param {HTMLElement} el
 * @param {string} name
 * @param {boolean} value
 */
function setBoolAttribute(el, name, value) {
	if (value) {
		el.setAttribute(name, '');
	} else {
		el.removeAttribute(name);
	}
}
export default class Collapse extends HTMLElement {
	static observedAttributes = ['accordion', 'disabled', 'open', 'menu', 'animation', 'label'];
	/** @type {boolean} 无折叠图标 */
	get nonTrigger() { return this.getAttribute('non-trigger') !== null; }
	set nonTrigger(value) { setBoolAttribute(this, 'non-trigger', value); }
	/** @type {boolean} 图标在开头 */
	get startTrigger() { return this.getAttribute('start-trigger') !== null; }
	set startTrigger(value) { setBoolAttribute(this, 'start-trigger', value); }
	/** @type {boolean} 手风琴 */
	get accordion() { return this.getAttribute('accordion') !== null; }
	set accordion(value) { setBoolAttribute(this, 'accordion', value); }
	/** @type {boolean} 禁用 */
	get disabled() { return this.getAttribute('disabled') !== null; }
	set disabled(value) { setBoolAttribute(this, 'disabled', value); }
	/** @type {boolean} 打开状态 */
	get open() { return this.getAttribute('open') !== null; }
	set open(value) { setBoolAttribute(this, 'open', value); }
	/** @type {boolean} 动画 */
	get animation() { return this.getAttribute('animation') !== null; }
	set animation(value) { setBoolAttribute(this, 'animation', value); }
	/** @type {boolean} 菜单模式 */
	get menu() { return this.getAttribute('menu') !== null; }
	set menu(value) { setBoolAttribute(this, 'menu', value); }
	/** @type {string} 标签 */
	get label() { return this.getAttribute('label') || ''; }
	set label(value) {
		if (value) {
			this.setAttribute('label', value);
		} else {
			this.removeAttribute('label');
		}
	}


	#shadow = (() => {
		const shadow = this.attachShadow({mode:'closed'});
		shadow.appendChild(document.createElement('style')).textContent = style;
		return shadow;
	})();
	#header = (() => {
		const header = document.createElement('header');
		header.setAttribute('part', 'header');
		this.#shadow.appendChild(header);
		header.tabIndex = 0;
		/** @param {Event} e */
		const click = e => {
			if (this.disabled) { return; }
			if (e.defaultPrevented) { return; }
			if (this.#shadow.activeElement !== header) { return; }
			if (!this.dispatchEvent(new Event('beforechange', {cancelable: true}))) { return; }
			this.open = !this.open;
			this.dispatchEvent(new Event('change'));
		};
		header.addEventListener('click', click);
		header.addEventListener('click', e => {
			if (this.disabled) { return; }
			if (e.defaultPrevented) { return; }
			/** @type {Node?} */
			let el = header;
			for (;el;) {
				const root = el.getRootNode();
				if (!(root instanceof ShadowRoot || root instanceof Document)) {
					return;
				}
				const {activeElement} = root;
				if (!activeElement) {
					if (!(root instanceof ShadowRoot)) { return; }
					el = root.host;
					continue;
				}
				if (!el.contains(activeElement)) { header.focus(); }
				return;
			}
		}, true);
		header.addEventListener('keydown', e => {
			if (e.code === 'Enter' || e.code === 'Space') {
				click(e);
			}
		});
		return header;
	})();
	#label = (() => {
		const slot = document.createElement('slot');
		this.#header.appendChild(slot);
		slot.className = 'label';
		slot.name = 'label';
		return slot;
	})();
	#trigger = (() => {
		const slot = document.createElement('slot');
		this.#header.appendChild(slot);
		slot.name = 'trigger';
		slot.className = 'trigger-slot';
		slot.appendChild(document.createElement('span')).className = 'trigger';
		return slot;
	})();

	#body = (() => {
		const body = document.createElement('section');
		body.setAttribute('part', 'main');
		body.addEventListener('transitionend', () => {
			body.classList.remove('animation');
		});
		body.addEventListener('transitioncancel', () => {
			body.classList.remove('animation');
		});
		this.#shadow.appendChild(body);
		return body;
	})();
	#main = (() => {
		const main = document.createElement('main');
		this.#body.appendChild(main);
		main.appendChild(document.createElement('slot'));
		return main;
	})();


	#updateSize() {
		const vertical = verticalWritingMode.has(getComputedStyle(this).writingMode?.toLowerCase());
		this.#body.style.blockSize = `${vertical ? this.#main.clientWidth : this.#main.clientHeight}px`;

	}
	updateSize() { this.#updateSize(); }
	/** @type {ResizeObserver} */
	#ro = new ResizeObserver(() => this.#updateSize());
	/**
	 * @returns {void}
	 */
	connectedCallback() {
		this.#ro.observe(this.#main);
	}
	/**
	 * @returns {void}
	 */
	disconnectedCallback() {
		this.#ro.unobserve(this.#main);
	}
	/**
	 * @returns {void}
	 */
	adoptedCallback() { }
	#closeOthersWhenOpen() {
		const parent = this.parentElement;
		if (!parent) { return; }
		const style = getComputedStyle(parent).whiteSpace?.toLowerCase() || '';
		const pre = style.startsWith('pre') || style === 'break-spaces';
		/** @type {Node?} */
		let node = this;
		// eslint-disable-next-line no-cond-assign
		while (node = node.previousSibling) {
			if (node instanceof Comment) { continue; }
			if (node instanceof Text) {
				const text = node.textContent || '';
				if (pre ? text.includes('\n') : text.replace(/[\s\n ]/g, '')) { break; }
				continue;
			}
			if (!(node instanceof Collapse)) { break; }
			if (!node.accordion) { break; }
			node.open = false;
		}
		node = this;
		// eslint-disable-next-line no-cond-assign
		while (node = node.nextSibling) {
			if (node instanceof Comment) { continue; }
			if (node instanceof Text) {
				const text = node.textContent || '';
				if (pre ? text.includes('\n') : text.replace(/[\s\n ]/g, '')) { break; }
				continue;
			}
			if (!(node instanceof Collapse)) { break; }
			if (!node.accordion) { break; }
			node.open = false;
		}
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
			case 'accordion': {
				if (newVal === null) { break; }
				if (!this.open) { break; }
				this.#closeOthersWhenOpen();
				break;
			}
			case 'disabled': {
				if (newVal === null) {
					this.#header.tabIndex = 0;
				} else {
					this.#header.removeAttribute('tabindex');
				}
				break;
			}
			case 'open': {
				this.#body.classList.add('animation');
				if (!this.accordion) { break; }
				if (!this.open) { break; }
				this.#closeOthersWhenOpen();
				break;
			}
			case 'label': {
				this.#label.innerText = newVal || '';
				break;
			}
		}
	}
}

try {
	customElements.define('nl-collapse', Collapse);
} catch {}
