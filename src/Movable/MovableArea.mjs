const style = `:host {
	display: block;
	overflow: hidden;
	position: relative;
}
:host([hidden]) { display: none; }`;

/**
 *
 * @param {MovableArea} el
 * @param {Set<import('./index.mjs').Interface>} children
 * @returns {[() => void, () => void]}
 */
export function init(el, children) {
	const shadow = el.attachShadow({ mode: 'closed' });
	shadow.appendChild(document.createElement('style')).textContent = style;
	shadow.appendChild(document.createElement('slot'));
	const observer = new ResizeObserver(e => {
		const last = e.pop();
		if (!last) { return; }
		const { contentRect: { width, height } } = last;

		for (const t of children) {
			t.resize(width, height);
		}
	});
	/**
	 *
	 * @param {Event} event
	 * @returns {import('./index.mjs').Interface | null}
	 */
	function getTarget(event) {
		const list = event.composedPath();

		const k = list.findIndex(t => t === el);
		const e = k < 0 ? [] : list.slice(0, k).reverse();
		for (const child of [...children]) {
			const r = child.match(e);
			if (r) { return child; }
			if (r === null) { return null; }
		}
		return null;
	}
	/** @type {import('./index.mjs').Interface | undefined} */
	let mouseTarget;
	let mouseButton = -1;
	/** @type {Record<number, import('./index.mjs').Interface>} */
	const touchTargets = {};

	/**
	 *
	 * @param {PointerEvent} event
	 * @returns {void}
	 */
	function pointerdown(event) {
		const target = getTarget(event);
		if (!target) { return; }
		const { pageX, pageY, pointerId } = event;
		const { x: OffX, y: OffY } = el.getBoundingClientRect();
		const x = pageX - OffX;
		const y = pageY - OffY;
		/** @type {boolean?} */
		let state = null;
		if (event.pointerType === 'mouse') {
			state = target.mouseBegin(x, y, event.buttons);
		} else if (event.pointerType === 'touch') {
			state = target.touchBegin(pointerId, x, y);
		}
		if (typeof state !== 'boolean') { return; }
		if (state) { el.setPointerCapture(pointerId); }
		touchTargets[pointerId] = target;
	}
	/**
	 *
	 * @param {PointerEvent} event
	 * @returns {void}
	 */
	function pointermove(event) {
		const { pointerId } = event;
		const target = touchTargets[pointerId];
		if (!target) { return; }
		const { pageX, pageY } = event;
		const { x: OffX, y: OffY } = el.getBoundingClientRect();
		const x = pageX - OffX;
		const y = pageY - OffY;
		if (event.pointerType === 'mouse') {
			target?.mouseMove(x, y, event.buttons);
			return;
		}
		if (event.pointerType === 'touch') {
			target.touchMove(pointerId, x, y);
		}
	}
	/**
	 *
	 * @param {PointerEvent} event
	 * @returns {void}
	 */
	function pointerup(event) {
		const { pointerId } = event;
		if (el.hasPointerCapture(pointerId)) {
			el.releasePointerCapture(pointerId);
		}
		const target = touchTargets[pointerId];
		if (!target) { return; }
		if (event.pointerType === 'mouse') {
			target.mouseEnd();
		}
		if (event.pointerType === 'touch') {
			delete touchTargets[pointerId];
			target.touchEnd(pointerId);
		}
	}
	/**
	 *
	 * @param {WheelEvent} event
	 * @returns {void}
	 */
	function wheel(event) {
		const target = getTarget(event);
		if (!target) { return; }
		const { deltaMode, deltaX, deltaY, pageX, pageY } = event;
		const { x: OffX, y: OffY } = el.getBoundingClientRect();
		const x = pageX - OffX;
		const y = pageY - OffY;
		target.wheel(deltaMode, deltaX, deltaY, x, y);
	}

	el.addEventListener('wheel', wheel, true);

	el.addEventListener('pointermove', pointermove);
	el.addEventListener('pointerdown', pointerdown);
	el.addEventListener('pointerup', pointerup);
	el.addEventListener('pointercancel', pointerup);
	el.addEventListener('lostpointercapture', pointerup);
	el.addEventListener('touchmove', e => e.preventDefault());
	return [() => {
		observer.observe(el);
	}, () => {
		observer.unobserve(el);
	}];

}

class MovableArea extends HTMLElement {
	/** @type {Set<import('./index.mjs').Interface>} */
	#children = new Set();
	/** @type {() => void} */
	#connect;
	/** @type {() => void} */
	#disconnect;
	constructor() {
		super();
		[this.#connect, this.#disconnect] = init(this, this.#children);
	}
	/**
	 *
	 * @param {import('./index.mjs').Interface} o
	 * @returns {() => void}
	 */
	register(o) {
		const children = this.#children;
		children.add(o);
		const { width, height } = this.getBoundingClientRect();
		o.resize(width, height);
		return () => {
			children.delete(o);
		};

	}
	/**
	 * @returns {void}
	 */
	connectedCallback() { this.#connect(); }
	/**
	 * @returns {void}
	 */
	disconnectedCallback() { this.#disconnect(); }
	/**
	 * @returns {void}
	 */
	adoptedCallback() { }
}

export default MovableArea;
