import Movable from './index.mjs';

class MovableTarget extends HTMLElement {
	/** @type {() => void} */
	#disconnect;
	/** @type {() => void} */
	#connect;
	constructor() {
		super();
		/** @type {() => void} */
		let unregister = () => {};
		this.#connect = () => {
			let parent = this.parentNode;
			while (parent) {
				if (parent instanceof Movable) { break; }
				parent = parent.parentNode;
			}
			if (parent) { unregister = parent.register(this); }
		};
		this.#disconnect = () => { unregister(); };
	}
	/**
	 * @returns {void}
	 */
	connectedCallback() { this.#connect(); }
	/**
	 * @returns {void}
	 */
	disconnectedCallback() { this.#disconnect(); }
}
export default MovableTarget;
