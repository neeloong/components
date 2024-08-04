import createStyle from './createStyle.mjs';
import { PaginationWidget } from './PaginationWidget.mjs';
const style = '';

// TODO: 上一页的实现
// TODO: 当不满足跳转时的处理：自动调整、隐藏、禁用
// TODO: 当无法跳转时的处理：隐藏、禁用
export class PaginationPrev extends PaginationWidget {
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
	#button = (() => {
		const button = document.createElement('button');
		button.type = 'button';
		button.setAttribute('part', 'button');
		this.#shadow.appendChild(button);
		return button;
	})();
	#slot = this.#button.appendChild(document.createElement('slot'));
	#updateDisabeld() { this.#button.disabled = this.disabled || this.page === 1; }
	constructor() {
		super();
		this.addEventListener('click', e => {
			const {defaultPrevented} = e;
			e.preventDefault();
			if (this.#button.disabled) {
				e.stopPropagation();
			} else if (!defaultPrevented) {
				this.pagination.setPage(this.page - 1);
			}
		});
	}
	/** @protected */
	updateCallback() {
		this.#updateDisabeld();
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
