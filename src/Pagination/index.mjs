import { PaginationWidget } from './PaginationWidget.mjs';
import { PaginationJumper } from './PaginationJumper.mjs';
import { PaginationNext } from './PaginationNext.mjs';
import { PaginationPage } from './PaginationPage.mjs';
import { PaginationPager } from './PaginationPager.mjs';
import { PaginationPrev } from './PaginationPrev.mjs';
import { PaginationSizer } from './PaginationSizer.mjs';
import { PaginationValue } from './PaginationValue.mjs';

/**
 * @typedef {object} State
 * @property {number} size
 * @property {number} total
 * @property {number} pages
 * @property {number} page
 */
/**
 * @typedef {object} Component
 * @property {(state: State) => void} update
 */
/**
 *
 * @param {HTMLElement} el
 * @param {string} name
 * @param {string | number | null} value
 * @returns {void}
 */
function setIntAttr(el, name, value) {
	if (typeof value === 'string') {
		value = parseInt(value);
	} else if (typeof value === 'number') {
		value = Math.floor(value);
	} else if (typeof value === 'bigint') {
		value = Number(value);
	} else {
		value = Number.NaN;
	}
	if (Number.isNaN(value) || value < 0) {
		el.removeAttribute(name);
		return;
	}
	el.setAttribute(name, String(value));
}
/**
 *
 * @param {string?} value
 * @returns {number}
 */
function parseIntAttr(value) {
	if (!value) { return 0; }
	const n = parseInt(value);
	return Number.isNaN(n) || n < 0 ? 0 : n;
}
export class Pagination extends HTMLElement {
	static get Widget() { return PaginationWidget; }
	static get Jumper() { return PaginationJumper; }
	static get Next() { return PaginationNext; }
	static get Page() { return PaginationPage; }
	static get Pager() { return PaginationPager; }
	static get Prev() { return PaginationPrev; }
	static get Sizer() { return PaginationSizer; }
	static get Value() { return PaginationValue; }
	static observedAttributes = ['size', 'total', 'pages', 'page'];
	/**
	 * 每页数量
	 * @type {number}
	 */
	get size() { return parseIntAttr(this.getAttribute('size')) || 0; }
	set size(v) { setIntAttr(this, 'size', v); }
	/**
	 * 总数
	 * @type {number}
	 */
	get total() { return parseIntAttr(this.getAttribute('total')) || 0; }
	set total(v) { setIntAttr(this, 'total', v); }
	/**
	 * 总分页数，如果未设置，则为 `Math.ceil(total / size)`
	 * @type {number}
	 */
	get pages() {
		const pages = parseIntAttr(this.getAttribute('pages'));
		if (pages) { return pages; }
		const {size} = this;
		if (!size) { return 1; }
		return Math.ceil(this.total / size) || 1;
	}
	set pages(v) { setIntAttr(this, 'pages', v); }
	/**
	 * 当前页码
	 * @type {number}
	 */
	get page() { return Math.min(parseIntAttr(this.getAttribute('page')) || 1, this.pages); }
	set page(v) { setIntAttr(this, 'page', v); }
	/**
	 *
	 * @param {number} page
	 */
	setPage(page) {
		this.page = page;
		this.dispatchEvent(new Event('change'));
	}
	/**
	 *
	 * @param {number} size
	 */
	setSize(size) {
		this.size = size;
		this.dispatchEvent(new Event('change'));
	}
	#subElements = new Set();
	/**
	 *
	 * @param {Component} o
	 * @returns {() => void}
	 */
	register(o) {
		const subElements = this.#subElements;
		subElements.add(o);
		o.update({...this.#state});
		return () => { subElements.delete(o); };
	}
	/**
	 * @returns {void}
	 */
	connectedCallback() { }
	/**
	 * @returns {void}
	 */
	disconnectedCallback() { }
	/**
	 * @returns {void}
	 */
	adoptedCallback() { }
	#state = {size: 0, total: 0, pages: 1, page: 1};
	/**
	 * @param {string} attrName
	 * @param {string | null} oldVal
	 * @param {string | null} newVal
	 * @returns {void}
	 */
	attributeChangedCallback(attrName, oldVal, newVal) {
		if (oldVal === newVal) { return; }
		const {size, total, pages, page} = this;
		const oldState = this.#state;
		if (size === oldState.size && total === oldState.total && pages === oldState.pages && page === oldState.page) {
			return;
		}
		const state = {size, total, pages, page};
		this.#state = state;
		for (const s of [...this.#subElements]) {
			s.update({...state});
		}
	}

}

try {
	customElements.define('nl-pagination', Pagination);
	customElements.define('nl-pagination-jumper', PaginationJumper);
	customElements.define('nl-pagination-next', PaginationNext);
	customElements.define('nl-pagination-page', PaginationPage);
	customElements.define('nl-pagination-pager', PaginationPager);
	customElements.define('nl-pagination-prev', PaginationPrev);
	customElements.define('nl-pagination-sizer', PaginationSizer);
	customElements.define('nl-pagination-value', PaginationValue);
} catch {}


/** @typedef {PaginationWidget} Pagination.Widget */
/** @typedef {PaginationNext} Pagination.Next */
/** @typedef {PaginationJumper} Pagination.Jumper */
/** @typedef {PaginationPage} Pagination.Page */
/** @typedef {PaginationPager} Pagination.Pager */
/** @typedef {PaginationPrev} Pagination.Prev */
/** @typedef {PaginationSizer} Pagination.Sizer */
/** @typedef {PaginationValue} Pagination.Value */
export default Pagination;
