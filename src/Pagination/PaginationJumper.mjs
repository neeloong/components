import createStyle from './createStyle.mjs';
import { PaginationWidget } from './PaginationWidget.mjs';
const style = '';

// TODO: 自定义跳转
export class PaginationJumper extends PaginationWidget {
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
	#input = (() => {
		const input = document.createElement('input');
		input.setAttribute('part', 'input');
		input.type = 'number';
		input.min = '1';
		input.step = '1';
		this.#shadow.appendChild(input);
		const change = () => {
			const {pagination} = this;
			if (!pagination) { return; }
			const page = input.value;
			if (!page) { return; }
			pagination.setPage(Number(page));

		};
		input.addEventListener('change', change);
		input.addEventListener('keydown', e => {
			if (e.code !== 'Enter') { return; }
			e.preventDefault();
			change();
		});
		return input;
	})();
	/** @protected */
	updateCallback() {
		const input = this.#input;
		const {pages, page} = this;
		input.max = String(pages);
		input.value = String(page);
		input.placeholder = String(page);
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
				this.#input.disabled = this.disabled;
				break;
		}
	}
}
