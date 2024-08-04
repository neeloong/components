import createStyle from './createStyle.mjs';
import { PaginationWidget } from './PaginationWidget.mjs';
const style = `
:host { display: contents; }
.placeholder::after {
	content: var(--nl-pagination-pager-placeholder, '...');
}
`;

// TODO: 常规页面切换器
// TODO: 向前（后）最多显示多少
// TODO: 是否显示第一/最后页
export class PaginationPager extends PaginationWidget {
	static observedAttributes = ['disabled'];
	/**
	 * 每页数量
	 * @type {boolean}
	 */
	get disabled() { return this.getAttribute('disabled') !== null; }
	set disabled(value) {
		if (!value) {
			this.removeAttribute('disabled');
		} else {
			this.setAttribute('disabled', '');
		}
	}
	#shadow = this.attachShadow({ mode: 'closed' });
	#style = this.#shadow.appendChild(createStyle(style));
	/** @type {Record<number, HTMLButtonElement>} */
	#buttons = Object.create(null);
	/** @type {HTMLElement[]} */
	#children = [];
	#createButtons() {
		for (const el of this.#children) {
			el.remove();
		}
		const buttons = Object.create(null);
		const children = [];
		this.#buttons = buttons;
		this.#children = children;

		const { disabled } = this;
		const shadow = this.#shadow;
		const current = this.page;
		const max = this.pages;

		let start = Math.max(2, current - 2);
		let end = Math.min(current + 2, max - 1);
		/** @param {number} k */
		const createButton = k => {
			const button = document.createElement('button');
			button.type = 'button';
			button.innerText = String(k);
			button.setAttribute('part', k === current ? 'button current' : 'button');
			button.disabled = disabled || k === current;
			button.addEventListener('click', () => {
				this.pagination.setPage(k);
			});
			children.push(button);
			shadow.appendChild(button);
			buttons[k] = button;
		};
		const createPlaceholder = () => {
			const span = document.createElement('span');
			span.className = 'placeholder';
			span.setAttribute('part', 'placeholder');
			shadow.appendChild(span);
			children.push(span);
		};
		createButton(1);
		if (current > 4) {
			createPlaceholder();
		}
		for (let i = start; i <= end; i++) {
			createButton(i);
		}
		if (max - current > 3) {
			createPlaceholder();
		}
		if (max > 1) {
			createButton(max);
		}

	}
	#updateDisabeld() {
		const { disabled } = this;
		const current = String(this.page);
		for (const [k, v] of Object.fromEntries(this.#buttons)) {
			v.disabled = disabled || k === current;
		}
	}
	/** @protected */
	updateCallback() {
		this.#createButtons();
		// TODO:
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
			case 'disabled':
				this.#updateDisabeld();
				break;
		}
	}

}
