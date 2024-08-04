import { Pagination } from './index.mjs';

export class PaginationWidget extends HTMLElement {
	/** @type {() => void} */
	#unregister = () => {};
	/** @type {Pagination?} */
	#pagination = null;
	get pagination() { return this.#pagination; }
	/**
	 * @param {import('./index.mjs').State} state
	 * @protected
	 */
	updateCallback(state) { }
	#size = 0;
	#total = 0;
	#pages = 1;
	#page = 1;
	get size() { return this.#size; }
	get total() { return this.#total; }
	get pages() { return this.#pages; }
	get page() { return this.#page; }

	/**
	 * @returns {void}
	 */
	connectedCallback() {
		let parent = this.parentNode;
		while (parent) {
			if (parent instanceof Pagination) { break; }
			parent = parent.parentNode;
		}
		if (!parent) { return; }
		this.#pagination = parent;
		this.#unregister = parent.register({
			update: ({size, total, pages, page}) => {
				this.#size = size;
				this.#total = total;
				this.#pages = pages;
				this.#page = page;
				this.updateCallback({size, total, pages, page});
			},
		});
	}
	/**
	 * @returns {void}
	 */
	disconnectedCallback() {
		this.#pagination = null;
		this.#unregister();
	}
}
