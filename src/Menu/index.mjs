const style = `
:host {
	display: contents;
}
div {
	display: flex;
	flex-wrap: nowrap;
	flex-direction: row;
	align-items: stretch;
}
div[hidden] {
	display: none;
}
div slot {
	display: inline;
	flex: 1;
}
div::after {
	content: '';
	width: 0;
	height: 0;
	box-sizing: content-box;
	border: transparent solid 0.3em;
	border-inline-start-color: currentColor;
	margin: auto;
	margin-inline-start: 0.3em;
}
dialog {
	position: fixed;
	margin: 0;
	box-sizing: border-box;
	max-width: calc(100% - 36px);
	max-height: calc(100% - 36px);
	user-select: none;
	padding: .2em;
	border: 1px solid;
	outline: none;
}
div, dialog ::slotted(*) {
	color: var(--nyloong-menu-fg, #000);
	background: var(--nyloong-menu-bg, #FFF);
}
div.open, div:hover, div:focus, dialog ::slotted(:hover), dialog ::slotted(:focus) {
	color: var(--nyloong-menu-fg-highlight, #000);
	background: var(--nyloong-menu-bg-highlight, #6666);
}
:host([disabled]) div, dialog ::slotted([disabled]) {
	color: var(--nyloong-menu-fg-disabled, #AAA);
	background: var(--nyloong-menu-bg-disabled, #FFF);
}

dialog::backdrop {
	background: transparent;
}
`;

const openMenus = new Set();
document.addEventListener('pointerdown', e => {
	if (!e.isPrimary) { return; }
	const els = new Set(e.composedPath());
	for (const menu of [...openMenus]) {
		if (els.has(menu)) { continue; }
		menu.close();
	}
});
const verticalWritingMode = new Set([
	'vertical-lr', 'vertical-rl', 'sideways-lr', 'sideways-rl',
]);

const hasPopover = typeof HTMLElement.prototype.showPopover === 'function';
/**
 *
 * @param {object} option
 * @param {number} option.left
 * @param {number} option.top
 * @param {number} option.width
 * @param {number} option.height
 * @param {boolean} rowVertical
 * @param {boolean} rowReverse
 * @param {boolean} colReverse
 * @returns {[[number, number, number], [number, number, number]]}
 */
function getSize({left, top, width, height}, rowVertical, rowReverse, colReverse) {
	const right = window.innerWidth - left - width;
	const bottom = window.innerHeight - top - height;
	/** @type {[[number, number, number], [number, number, number]]} */
	const size = [
		[left, width, right],
		[top, height, bottom],
	];
	if (rowVertical) { size.reverse(); }
	if (rowReverse) { size[1].reverse(); }
	if (colReverse) { size[0].reverse(); }

	return size;

}
const directionDefault = ['blockEnd', 'blockStart', 'inlineEnd', 'inlineStart'];
const alignDefault = ['start', 'end', 'center'];

const subMenuDirection = ['inlineEnd', 'inlineStart'];
const subMenuAlign = ['start', 'end'];

/**
 *
 * @param {string?} [val]
 * @returns {string[]}
 */
function getDirections(val) {
	/** @type {string[]} */
	const direction = [];
	/**
	 *
	 * @param {string} v
	 */
	function add(v) {
		if (direction.includes(v)) { return; }
		direction.push(v);
	}
	for (const v of (val || '').replace(/\n|\s|-/g, '').toLowerCase().split(/,/)) {
		if (v === 'inlineend' || v === 'inline') { add('inlineEnd'); }
		if (v === 'inlinestart' || v === 'inline') { add('inlineStart'); }
		if (v === 'blockend' || v === 'block') { add('blockEnd'); }
		if (v === 'blockstart' || v === 'block') { add('blockStart'); }
	}
	return direction.length ? direction : directionDefault;
}
/**
 *
 * @param {string?} [val]
 * @returns {string[]}
 */
function getAligns(val) {
	/** @type {string[]} */
	const align = [];
	for (const v of (val || '').replace(/\n|\s|-/g, '').toLowerCase().split(/,/)) {
		if (!['start', 'end', 'center'].includes(v)) { continue; }
		if (align.includes(v)) { continue; }
		align.push(v);
	}
	return align.length ? align : alignDefault;
}
/**
 *
 * @param {Element} root
 * @returns {[boolean, boolean, boolean]}
 */
function getLayout(root) {
	const style = getComputedStyle(root);
	const writingMode = style.writingMode?.toLowerCase();
	const vertical = verticalWritingMode.has(writingMode);
	const rowReverse = ['vertical-rl', 'sideways-rl'].includes(writingMode);
	const colReverse = style.direction.toLowerCase() === 'rtl' !== (writingMode === 'sideways-lr');
	return [vertical, rowReverse, colReverse];
}

export default class Menu extends HTMLElement {
	static observedAttributes = ['open', 'hidden', 'target', 'x', 'y', 'direction', 'align', 'mask', 'disabled'];
	close() { this.removeAttribute('open'); }
	show() { this.setAttribute('open', ''); }
	get open() { return this.hasAttribute('open'); }
	set open(open) { if (open) { this.show(); } else { this.close(); } }
	get disabled() { return this.hasAttribute('disabled'); }
	set disabled(disabled) {
		if (disabled) {
			this.setAttribute('disabled', '');
		} else {
			this.removeAttribute('disabled');
		}
	}
	get mask() { return this.hasAttribute('mask'); }
	set mask(mask) {
		if (mask) {
			this.setAttribute('mask', '');
		} else {
			this.removeAttribute('mask');
		}
	}
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
	get target() { return this.getAttribute('target'); }
	set target(target) {
		if (typeof target !== 'string') {
			this.removeAttribute('target');
		} else {
			this.setAttribute('target', target);
		}
	}
	#direction = directionDefault;
	#align = alignDefault;
	get direction() { return [...this.#direction]; }
	set direction(v) {
		const direction = Array.isArray(v) ? v.filter(Boolean).join(',') : v;
		if (direction !== null && typeof direction !== 'string') { return; }
		if (!direction) {
			this.removeAttribute('direction');
		} else {
			this.setAttribute('direction', direction);
		}
	}
	get align() { return [...this.#align]; }
	set align(v) {
		const align = Array.isArray(v) ? v.filter(Boolean).join(',') : v;
		if (align !== null && typeof align !== 'string') { return; }
		if (!align) {
			this.removeAttribute('direction');
		} else {
			this.setAttribute('direction', align);
		}
	}

	#label = document.createElement('div');
	#dialog = document.createElement('dialog');
	#internals = this.attachInternals();
	/** @type {Menu} */
	#root = this;
	constructor() {
		super();
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.appendChild(document.createElement('style')).textContent = style;

		const label = shadow.appendChild(this.#label);
		label.appendChild(document.createElement('slot')).name = 'label';

		label.addEventListener('pointerenter', e=> {
			if (!this.#parentMenu) { return; }
			if (!e.isPrimary) { return; }
			this.#show();
		});
		label.addEventListener('click', e=> { e.stopPropagation(); });

		const dialog = shadow.appendChild(this.#dialog);
		dialog.setAttribute('part', 'menu');
		const dialogSlot = dialog.appendChild(document.createElement('slot'));
		dialog.addEventListener('click', e => {
			if (this.#parentMenu) { return; }
			const list = e.composedPath();
			const index = list.indexOf(dialog);
			if (index >= 0 && list.slice(0, index).find(v => v instanceof Element && v.getAttribute('disabled') !== null || v instanceof HTMLHRElement)) {
				return;
			}
			this.close();
		});
		dialog.addEventListener('close', e=> { this.close(); });
		dialogSlot.addEventListener('pointermove', e => {
			if (!e.isPrimary) { return; }
			const currentSubMenu = this.#currentSubMenu;
			if (!currentSubMenu) { return; }
			if (e.composedPath().includes(currentSubMenu)) { return; }
			currentSubMenu.#close();
		});
		dialog.addEventListener('scroll', e=> {
			if (!this.#mounted) { return; }
			const currentSubMenu = this.#currentSubMenu;
			if (currentSubMenu) {
				currentSubMenu.#update();
			}
		});
		this.addEventListener('contextmenu', e=> {
			e.stopPropagation();
			e.preventDefault();
		}, {capture: true});
	}

	/** @type {Element?} */
	#target = null;
	get targetElement() { return this.#target; }
	set targetElement(el) { this.#target = el instanceof Element ? el : null; }
	#open = false;
	#mounted = false;
	/** @type {Menu?} */
	#currentSubMenu = null;
	/** @type {Menu?} */
	#parentMenu = null;
	get parentMenu() { return this.#parentMenu; }
	#close() {
		if (!this.#open) { return; }
		const subMenu = this.#currentSubMenu;
		if (subMenu) { subMenu.#close(); }
		const parent = this.#parentMenu;
		if (parent && parent.#currentSubMenu === this) {
			parent.#currentSubMenu = null;
		} else {
			openMenus.delete(this);
		}
		const dialog = this.#dialog;
		dialog.close();

		// @ts-ignore
		this.#internals.states?.remove('--open');
		this.#label.classList.remove('open');
		dialog.removeAttribute('popover');
		this.#open = false;
	}
	#show() {
		if (this.#open || !this.#mounted) { return; }
		const parent = this.#parentMenu;
		const dialog = this.#dialog;
		if (parent) {
			if (!parent.#open || this.disabled) { return; }
			const currentSubMenu = parent.#currentSubMenu;
			if (currentSubMenu) {
				currentSubMenu.#close();
			}
			parent.#currentSubMenu = this;
			if (hasPopover) {
				dialog.popover = 'manual';
				dialog.showPopover();
			} else {
				dialog.show();
			}
		} else {
			this.#updateLayout();
			const subMenu = this.#currentSubMenu;
			if (subMenu) { subMenu.#close(); }
			if (hasPopover && !this.hasAttribute('mask')) {
				dialog.popover = 'manual';
				dialog.showPopover();
				openMenus.add(this);
			} else {
				dialog.showModal();
			}
		}
		this.#label.classList.add('open');
		// @ts-ignore
		this.#internals.states?.add('--open');
		requestAnimationFrame(() => { if (this.#mounted) { this.#update(); } });
		this.#open = true;
	}
	#rowVertical = false;
	#rowReverse = false;
	#colReverse = false;
	#getTarget() {
		if (this.#parentMenu) { return this.#label; }
		const targetElement = this.#target;
		if (targetElement) { return targetElement; }
		const {target} = this;
		if (target === '') { return this.parentElement; }
		if (!target) { return null; }
		try { return document.querySelector(target); } catch {}
		return null;
	}
	#update() {
		if (!this.#mounted) { return; }
		const dialog = this.#dialog;
		const target = this.#getTarget();
		const root = this.#root;
		const rowVertical = root.#rowVertical;
		const size = getSize(
			target?.getBoundingClientRect() || {top: this.y, left: this.x, width: 0, height: 0},
			root.#rowVertical,
			root.#rowReverse,
			root.#colReverse,
		);
		const [[inlineStart, inlineSize, inlineEnd], [blockStart, blockSize, blockEnd]] = size;
		const [d, s] = this.#parentMenu ? [subMenuDirection, subMenuAlign] : [this.#direction, this.#align];
		const rect = dialog.getBoundingClientRect();
		const inline = rowVertical ? rect.height : rect.width;
		const block = rowVertical ? rect.width : rect.height;
		/** @type {[string, number, number][]} */
		const dirs = d.map(d => {
			switch (d) {
				case 'blockStart': return [d, blockStart / block, 1];
				case 'blockEnd': return [d, blockEnd / block, 1];
				case 'inlineStart': return [d, 1, inlineStart / inline];
				default: return ['inlineEnd', 1, inlineEnd / inline];
			}
		});

		const [dir] = dirs.reduce((r, d) => {
			if (r[1] < 1 && d[1] < 1) { return r[1] >= d[1] ? r : d; }
			if (r[1] >= 1 && d[1] < 1) { return r; }
			if (d[1] >= 1 && r[1] < 1) { return d; }
			if (r[2] >= 1 || r[2] >= d[2]) { return r; }
			return d;
		});
		const blockDir = dir === 'blockEnd' || dir === 'blockStart';
		if (blockDir) { size.reverse(); }
		const [[inlineStartX, inlineSizeX, inlineEndX], [blockStartX, blockSizeX, blockEndX]] = size;
		const [rowSize, colSize] = blockDir ? [inline, block] : [block, inline];
		const align = s.find(a => a === 'start' ? blockSizeX + blockEndX > rowSize : a === 'start' ? blockSizeX + blockStartX > rowSize : true) || '';

		let insetInlineStart = dir === 'inlineStart' || dir === 'blockStart' ? inlineStartX - colSize : inlineStartX + inlineSizeX;
		let insetBlockStart = 0;
		switch (align) {
			case 'start':
				insetBlockStart = blockStartX;
				break;
			case 'end':
				insetBlockStart = blockStartX + blockSizeX - rowSize;
				break;
			default:
				insetBlockStart = Math.max(18, Math.min(blockStartX + blockSizeX / 2 - rowSize / 2, blockStartX + blockSizeX + blockEndX - 18 - rowSize));
				break;
		}

		if (blockDir) {
			[insetInlineStart, insetBlockStart] = [insetBlockStart, insetInlineStart];
		}
		dialog.style.insetBlockStart = `${insetBlockStart}px`;
		dialog.style.insetInlineStart = `${insetInlineStart}px`;

		const currentSubMenu = this.#currentSubMenu;
		if (!currentSubMenu) { return; }
		currentSubMenu.#update();
	}
	update() {
		if (!this.#mounted) { return; }
		return this.#update();

	}
	#updateLayout() {
		const [rowVertical, rowReverse, colReverse] = getLayout(this);
		this.#rowVertical = rowVertical;
		this.#rowReverse = rowReverse;
		this.#colReverse = colReverse;
	}
	connectedCallback() {
		this.#mounted = true;
		const parent = this.parentNode;
		const parentMenu = parent instanceof Menu ? parent : null;
		this.#parentMenu = parentMenu;
		this.#root = parentMenu ? parentMenu.#root : this;

		this.#label.hidden = !parentMenu;
		const open = !this.hidden && (parentMenu ? parentMenu.#open : false);
		if (open) {
			this.#show();
		}
	}
	disconnectedCallback() {
		this.close();
		this.#root = this;
		this.#mounted = false;
		this.#parentMenu = null;
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
			case 'disabled': {
				if (this.#mounted && this.open && newVal !== null) {
					this.close();
				}
				break;
			}
			case 'open': {
				if (!this.#parentMenu && !this.hidden) {
					if (newVal === null) {
						this.#close();
					} else {
						this.#show();
					}
				}
				break;
			}
			case 'mask': {
				if (newVal !== null) {
					const dialog = this.#dialog;
					if (dialog.getAttribute('popover') !== null) {
						dialog.removeAttribute('popover');
						this.close();
					}
				}
				break;
			}
			case 'hidden': {
				if (newVal !== null) {
					this.#close();
				} else if (this.open && !this.#parentMenu) {
					this.#show();
				}
				break;
			}
			case 'direction': {
				this.#direction = getDirections(newVal);
				if (this.#mounted && !this.#parentMenu) { this.#update(); }
				break;
			}
			case 'align': {
				this.#align = getAligns(newVal);
				if (this.#mounted && !this.#parentMenu) { this.#update(); }
				break;
			}
			case 'target': case 'x': case 'y': {
				if (this.#mounted && !this.#parentMenu) { this.#update(); }
				break;
			}
		}
	}
}

try {
	customElements.define('nl-menu', Menu);
} catch {}
