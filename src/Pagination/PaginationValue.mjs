import createStyle from './createStyle.mjs';
import { PaginationWidget } from './PaginationWidget.mjs';

const style = '';

export class PaginationValue extends PaginationWidget {
	static observedAttributes = ['name'];
	/**
	 * 每页数量
	 * @type {string}
	 */
	get name() {
		const name = this.getAttribute('name')?.toLowerCase() || '';
		if (['size', 'total', 'pages', 'page', 'start', 'end'].includes(name)) { return name; }
		return 'page';
	}
	set name(value) {
		if (!value) {
			this.removeAttribute('name');
		} else {
			this.setAttribute('name', String(value));
		}
	}
	#state = { size: 0, total: 0, pages: 1, page: 1, start: 0, end: 0 };
	#shadow = this.attachShadow({ mode: 'closed' });
	#style = this.#shadow.appendChild(createStyle(style));
	#text = this.#shadow.appendChild(document.createTextNode(''));
	#update() {
		const value = this.#state[this.name];
		this.#text.textContent = value;
	}
	/** @protected */
	updateCallback() {
		const {size, total, pages, page} = this;
		this.#state = {
			size,
			total, pages, page,
			start: Math.min((page - 1) * size + 1, total),
			end: size ? Math.min(page * size, total) : total,

		};
		this.#update();
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
			case 'name': this.#update();
		}
	}

}
