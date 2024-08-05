import createStyle from './createStyle.mjs';
import { PaginationWidget } from './PaginationWidget.mjs';
const style = '';

// TODO: 当不满足跳转时的处理：自动调整、隐藏、禁用
// TODO: 当无法跳转时的处理：隐藏、禁用
export class PaginationPage extends PaginationWidget {
	static observedAttributes = ['value', 'disabled'];
	/**
	 * 每页数量
	 * @type {number}
	 */
	get value() { return Math.max(1, parseInt(this.getAttribute('value') || '') || 1); }
	set value(value) {
		if (!value) {
			this.removeAttribute('value');
		} else {
			this.setAttribute('value', String(value));
		}
	}
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
	get target() { return Math.min(this.value, this.pages); }
	get isCurrent() { return this.target === this.page; }

	#shadow = this.attachShadow({ mode: 'closed' });
	#style = this.#shadow.appendChild(createStyle(style));
	#button = (() => {
		const button = document.createElement('button');
		button.type = 'button';
		button.setAttribute('part', 'button');
		this.#shadow.appendChild(button);
		return button;
	})();
	#slot = (() => {
		const slot = document.createElement('slot');
		this.#button.appendChild(slot);
		slot.innerText = '1';
		return slot;
	})();
	#updateDisabled() { this.#button.disabled = this.disabled || this.isCurrent; }
	constructor() {
		super();
		this.addEventListener('click', e => {
			const {defaultPrevented} = e;
			e.preventDefault();
			if (this.#button.disabled) {
				e.stopPropagation();
			} else if (!defaultPrevented) {
				this.pagination?.setPage(this.value);
			}
		});
	}
	/** @protected */
	updateCallback() {
		this.#updateDisabled();
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
			case 'value':
				this.#slot.innerText = String(this.value);
				this.#updateDisabled();
				break;
			case 'disabled':
				this.#updateDisabled();
				break;
		}
	}

}
