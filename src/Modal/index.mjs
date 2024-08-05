
const style = `
:host {
	display: none;
}
:host([open]) {
	display: contents;
}
:host([open][hidden]) {
	display: none;
}
dialog {
	position: fixed;
	max-block-size: 100%;
	max-inline-size: 100%;
	inline-size: 100%;
	border: none;
	background: none;
	outline: none;
	padding: 0;
}
dialog::backdrop {
	background: none;
}
:host([mask]) dialog::backdrop {
	background: rgba(48,48,48,0.5);
}
.ok:after {
	content: '确认';
}
.cancel {
	display: none;
}
.cancel:after {
	content: '取消';
}
:host([cancelable]) .cancel {
	display: inline-block;
}
section {
	right: 0;
	left: 0;
	padding: 1em;
	background: #FFF;
	box-sizing: content-box;
	box-shadow: 5px 5px 10px -4px rgba(0,0,0,.12),
	5px -5px 10px -4px rgba(0,0,0,.12),
	-5px 5px 10px -4px rgba(0,0,0,.12),
	-5px -5px 10px -4px rgba(0,0,0,.12)
}
.center {
	padding-block: 6px;
}
.inline-start {
	block-size: 100%;
	margin-inline-start: 0;
}
.inline-end {
	block-size: 100%;
	margin-inline-end: 0;
}
.block-start {
	margin-block-start: 0;
}
.block-end {
	margin-block-end: 0;
}
.center section, .inline-start section, .inline-end section {
	display: flex;
	flex-direction: column;
	min-block-size: calc(100% - 2em);
	inline-size: var(--nl-modal-size, 640px);
	max-inline-size: calc(100vi - 2em - 16px);
}
.block-start section, .block-end section {
	display: flex;
	flex-direction: column;
	block-size: var(--nl-modal-size, 640px);
	max-block-size: calc(100vb - 2em - 16px);
}
.center section {
	margin: auto;
}
.inline-start section {
	margin-inline-end: auto;
}
.inline-end section {
	margin-inline-start: auto;
}
.block-start section {
	margin-block-end: auto;
}
.block-end section {
	margin-block-start: auto;
}
.inline-start section slot.body, .inline-end section slot.body {
	flex: 1;
	display: block;
}
.block-start section slot.body, .block-end section slot.body {
	flex: 1;
	display: block;
	overflow: auto;
}
:host([round]) .center section {
	border-radius: 1em;
}
:host([round]) .inline-start section {
	border-start-end-radius: 1em;
	border-end-end-radius: 1em;
}
:host([round]) .inline-end section {
	border-start-start-radius: 1em;
	border-end-start-radius: 1em;
}
:host([round]) .block-start section {
	border-end-start-radius: 1em;
	border-end-end-radius: 1em;
}
:host([round]) .block-end section {
	border-start-start-radius: 1em;
	border-start-end-radius: 1em;
}


.close {
	block-size: 40px;
	inline-size: 40px;
	display: none;
	cursor: pointer;
	transition: color .5s;
	position: relative;
	line-height: 40px;
}
:host([closable]) .close {
	display: inline-block;
}
.close-icon {
	overflow: hidden;
}
.close-icon::before,
.close-icon::after {
	content: '';
	position: absolute;
	display: inline-block;
	inline-size: 60%;
	block-size: 5%;
	background: currentColor;
	inset: 0;
	margin: auto;
}
.close-icon::before {
	transform: rotate(45deg);

}
.close-icon::after {
	transform: rotate(-45deg);

}
.close-icon:hover {
	color: #88F;
}

header {
	position: sticky;
	text-align: start;
	inset-block-start: 0;
	background: inherit;
	margin-block-start: -1em;
	margin-inline: -1em;
	padding-inline: 1em;
	padding-block-start: 1em;
	padding-block-end: 1em;
	border-start-start-radius: inherit;
	border-start-end-radius: inherit;
	display: flex;
}
.empty {
	padding-block: 0;
}
[name=header] {
	display: block;
	flex: 1;
	line-height: 40px;
}
footer {
	text-align: end;
	position: sticky;
	inset-block-end: 0;
	background: inherit;
	margin-block-end: -1em;
	margin-inline: -1em;
	padding-inline: 1em;
	padding-block-start: 1em;
	padding-block-end: 1em;
	border-end-start-radius: inherit;
	border-end-end-radius: inherit;
}

`;

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
export default class Modal extends HTMLElement {
	static observedAttributes = ['hidden', 'open', 'disabled', 'size', 'position'];
	get open() { return this.hasAttribute('open'); }
	set open(open) { setBoolAttribute(this, 'open', open); }
	get cancelable() { return this.hasAttribute('cancelable'); }
	set cancelable(cancelable) { setBoolAttribute(this, 'cancelable', cancelable); }
	get closable() { return this.hasAttribute('closable'); }
	set closable(closable) { setBoolAttribute(this, 'closable', closable); }
	get mask() { return this.hasAttribute('mask'); }
	set mask(mask) { setBoolAttribute(this, 'mask', mask); }
	get maskClosable() { return this.hasAttribute('mask-closable'); }
	set maskClosable(maskClosable) { setBoolAttribute(this, 'mask-closable', maskClosable); }
	get disabled() { return this.hasAttribute('disabled'); }
	set disabled(disabled) { setBoolAttribute(this, 'disabled', disabled); }
	get size() { return this.getAttribute('size') || ''; }
	set size(size) {
		if (size) {
			this.setAttribute('size', size);
		} else {
			this.removeAttribute('size');
		}
	}
	get position() {
		const position = this.getAttribute('position') || '';
		if (['block-start', 'block-end', 'inline-start', 'inline-end'].includes(position)) { return position; }
		return 'center';
	}
	set position(position) {
		if (position) {
			this.setAttribute('position', position);
		} else {
			this.removeAttribute('position');
		}
	}

	cancel () {
		if (this.disabled) { return; }
		if (!this.open) { return; }
		if (!this.dispatchEvent(new Event('cancel', {cancelable: true}))) { return; }
		this.open = false;
		this.dispatchEvent(new Event('close'));
	}
	ok() {
		if (this.disabled) { return; }
		if (!this.open) { return; }
		if (!this.dispatchEvent(new Event('ok', {cancelable: true}))) { return; }
		this.open = false;
		this.dispatchEvent(new Event('close'));
	}
	#main = document.createElement('section');
	#dialog = document.createElement('dialog');
	#okButton = document.createElement('button');
	#cancelButton = document.createElement('button');
	constructor() {
		super();
		const cancel = () => this.cancel();
		const shadow = this.attachShadow({mode:'closed'});
		shadow.appendChild(document.createElement('style')).textContent = style;

		this.#dialog.autofocus = false;
		const dialog = shadow.appendChild(this.#dialog);
		dialog.className = 'center';

		dialog.addEventListener('keydown', e =>{
			if (e.defaultPrevented) { return; }
			if (e.code !== 'Escape') { return; }
			e.preventDefault();
			cancel();
		});
		dialog.addEventListener('click', e =>{
			if (e.target !== e.currentTarget) { return; }
			if (!this.maskClosable) { return; }
			cancel();
		});
		const main = dialog.appendChild(this.#main);
		main.style.inlineSize = this.getAttribute('size') || '';


		const header = main.appendChild(document.createElement('header'));
		const headerSlot = header.appendChild(document.createElement('slot'));
		headerSlot.name = 'header';
		headerSlot.addEventListener('slotchange', e=> {
			if (headerSlot.assignedNodes().length) {
				header.classList.remove('empty');
			} else {
				header.classList.add('empty');
			}
		});
		if (headerSlot.assignedNodes().length) {
			header.classList.remove('empty');
		} else {
			header.classList.add('empty');
		}
		const close = header.appendChild(document.createElement('slot'));
		close.className = 'close';
		close.name = 'close';
		close.addEventListener('click', cancel);
		close.addEventListener('slotchange', e=> {
			if (close.assignedNodes().length) {
				close.classList.remove('close-icon');
			} else {
				close.classList.add('close-icon');
			}
		});
		if (close.assignedNodes().length) {
			close.classList.remove('close-icon');
		} else {
			close.classList.add('close-icon');
		}

		main.appendChild(document.createElement('slot')).className = 'body';


		const footer = main.appendChild(document.createElement('footer'));
		const footerSlot = footer.appendChild(document.createElement('slot'));
		footerSlot.name = 'footer';
		const {disabled} = this;
		const okButton = footerSlot.appendChild(this.#okButton);
		okButton.addEventListener('click', () => this.ok());
		okButton.className = 'ok';
		okButton.disabled = disabled;
		const cancelButton = footerSlot.appendChild(this.#cancelButton);
		cancelButton.addEventListener('click', cancel);
		cancelButton.className = 'cancel';
		cancelButton.disabled = disabled;
	}
	#mounted = false;
	connectedCallback() {
		this.#mounted = true;
		if (!this.hidden && this.open) {
			this.#dialog.showModal();
		}
	}
	disconnectedCallback() {
		this.#mounted = false;
		this.#dialog.close();
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
						this.#dialog.showModal();
					} else {
						this.#dialog.close();
					}
				}
				break;
			}
			case 'disabled': {
				const disabled = newVal !== null;
				this.#cancelButton.disabled = disabled;
				this.#okButton.disabled = disabled;
				break;
			}
			case 'position': {
				const {size} = this;
				const main = this.#main;
				const dialog = this.#dialog;

				switch (newVal) {
					case 'block-start':
					case 'block-end':
						main.style.inlineSize = '';
						main.style.blockSize = size;
						dialog.className = newVal;
						break;
					case 'inline-start':
					case 'inline-end':
						main.style.inlineSize = size;
						main.style.blockSize = '';
						dialog.className = newVal;
						break;
					default:
						main.style.inlineSize = size;
						main.style.blockSize = '';
						dialog.className = 'center';
				}
				break;

			}
			case 'size': {
				if (this.position.startsWith('block')) {
					this.#main.style.blockSize = newVal || '';
				} else {
					this.#main.style.inlineSize = newVal || '';
				}
				break;
			}
		}
	}
}

try {
	customElements.define('nl-modal', Modal);
} catch {}
