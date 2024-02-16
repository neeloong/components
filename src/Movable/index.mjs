
import MovableArea from './MovableArea.mjs';
import getInertiaFn from './getInertiaFn.mjs';
import MovableTarget from './MovableTarget.mjs';
/**
 * @typedef {object} Interface
 * @property {(e: EventTarget[]) => boolean | null} match
 * @property {(width: number, height: number) => void} resize
 * @property {(id: number, x: number, y: number) => boolean?} touchBegin
 * @property {(id: number, x: number, y: number) => void} touchMove
 * @property {(id: number) => void} touchEnd
 * @property {(x: number, y: number, keys: number) => boolean?} mouseBegin
 * @property {(x: number, y: number, keys: number) => void} mouseMove
 * @property {() => void} mouseEnd
 * @property {(deltaMode: number, deltaX: number, deltaY: number, pageX: number, pageY: number) => void} wheel
 */

/**
 *
 * @param {number} x1
 * @param {number} x2
 * @param {number} y1
 * @param {number} y2
 * @returns {number}
 */
function getLength(x1, x2, y1, y2) {
	return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
}


/**
 *
 * @param {number} v
 * @param {number} area
 * @param {number} target
 * @returns {number}
 */
function calc(v, area, target) {
	const differential = area - target;
	const min = Math.min(differential, 0);
	const max = Math.max(differential, 0);
	return Math.min(Math.max(min, v), max);
}

const style = `
:host{display: block; position: absolute; transform-origin: 0 0; }
:host([hidden]) { display: none; }
`;

/**
 *
 * @param {Movable} el
 * @param {Set<EventTarget>} targets
 * @returns {[() => void, () => void, () => void]}
 */
function init(el, targets) {
	const shadow = el.attachShadow({ mode: 'closed' });
	shadow.appendChild(document.createElement('style')).textContent = style;
	shadow.appendChild(document.createElement('slot'));

	let needAdaptively = false;

	/**
	 *
	 * @returns {void}
	 */
	function adaptively() {
		needAdaptively = true;
		const [aWidth, aHeight] = areaSize;
		if (!aWidth || !aHeight) { return; }
		needAdaptively = false;
		zoom = Math.min(aWidth / el.clientWidth, aHeight / el.clientHeight);
		x = (aWidth - el.clientWidth * zoom) / 2;
		y = (aHeight - el.clientHeight * zoom) / 2;
		el.style.transform = `translate(${x}px,${y}px)scale(${zoom})`;
	}

	/** @type {Record<number, [number, number]>} */
	const touches = {};
	/** @type {[number, number]} */
	let areaSize = [0, 0];
	let x = 0;
	let y = 0;
	let zoom = 1;
	/**
	 *
	 * @param {number} newZoom
	 * @returns {number}
	 */
	function getZoom(newZoom) {
		const elWidth = el.clientWidth;
		const elHeight = el.clientHeight;
		const [areaWidth, areaHeight] = areaSize;
		if (!areaWidth || !areaHeight) { return newZoom; }
		const w = areaWidth / elWidth;
		const h = areaHeight / elHeight;
		const max = Math.max(w, h, 5);
		const min = Math.min(w, h, 0.5);
		return Math.max(min, Math.min(newZoom, max));
	}

	/** @type {'touch' | ''} */
	let scaleType = '';
	/** @type {undefined | { x: number; y: number; s: number; }} */
	let scaleInfo;

	/**
	 *
	 * @param {number} x1
	 * @param {number} y1
	 * @param {number} x2
	 * @param {number} y2
	 * @returns {void}
	 */
	function scaleBegin(x1, y1, x2, y2) {
		const l = getLength(x1, x2, y1, y2);
		const z = zoom;
		if (!l || !z) {
			scaleInfo = undefined;
			return;
		}
		scaleInfo = {
			x: (x - (x1 + x2) / 2) / z,
			y: (y - (y1 + y2) / 2) / z,
			s: z / l,
		};
	}
	/**
	 *
	 * @param {number} x1
	 * @param {number} y1
	 * @param {number} x2
	 * @param {number} y2
	 * @returns {void}
	 */
	function scaleMove(x1, y1, x2, y2) {
		if (!scaleInfo) { return; }
		const l = getLength(x1, x2, y1, y2);
		if (!l) { return; }
		const { s, x: ox, y: oy } = scaleInfo;
		const newZoom = getZoom(l * s);
		zoom = newZoom;
		x = ox * newZoom + (x1 + x2) / 2;
		y = oy * newZoom + (y1 + y2) / 2;
		update();
	}
	/**
	 *
	 * @returns {void}
	 */
	function scaleStop() {
		scaleType = '';
		scaleInfo = undefined;
	}


	/** @type {'touch' | 'roller'| 'leftMouse' | ''} */
	let moveType = '';
	/**
	 * @typedef {object} MoveInfo
	 * @property {number} x
	 * @property {number} y
	 * @property {number} bx
	 * @property {number} by
	 * @property {[x: number, y: number, t: number][]} frame
	 */
	/**
	 * @type {MoveInfo | undefined}
	 */
	let moveInfo;
	let moveAnimation = 0;
	/**
	 *
	 * @param {number} pageX
	 * @param {number} pageY
	 * @returns {void}
	 */
	function moveBegin(pageX, pageY) {
		cancelAnimationFrame(moveAnimation);
		moveInfo = undefined;
		moveInfo = {
			x,
			y,
			frame: [[x, y, performance.now() / 1000]],
			bx: pageX,
			by: pageY,
		};

	}
	/**
	 *
	 * @param {number} pageX
	 * @param {number} pageY
	 * @returns {void}
	 */
	function moveMove(pageX, pageY) {
		if (!moveInfo) { return; }
		const { x: ox, y: oy, bx, by } = moveInfo;
		x = ox + pageX - bx;
		y = oy + pageY - by;
		/** @type {[x: number, y: number, t: number]} */
		const current = [x, y, performance.now() / 1000];
		moveInfo.frame = [current, ...moveInfo.frame].slice(0, 20);
		update();
	}
	/**
	 *
	 * @returns {void}
	 */
	function moveEnd() {
		if (!moveInfo) { return; }
		moveType = '';
		const { frame } = moveInfo;
		moveInfo = undefined;
		if (!el.inertia) { return; }
		const calc = getInertiaFn(frame);
		if (!calc) { return; }
		/**
		 *
		 * @returns {void}
		 */
		const run = () => {
			/** @type {boolean} */
			let stop;
			[x, y, stop] = calc();
			update();
			if (!el.inertia) { return; }
			if (stop) { return; }
			moveAnimation = requestAnimationFrame(run);
		};
		run();
	}
	/**
	 *
	 * @returns {void}
	 */
	function moveStop() {
		cancelAnimationFrame(moveAnimation);
		moveType = '';
		moveInfo = undefined;
	}

	/** @type {Interface} */
	const movableAreaMember = {
		resize(width, height) {
			areaSize = [width, height];
			if (el.autoAdaptively || needAdaptively) { adaptively(); }
		},
		match(e) {
			if (!e.length) { return el.global || false; }
			if (e[0] !== el) { return false; }
			if (!targets.size) { return true; }
			const list = new Set(e);
			for (const t of targets) { if (list.has(t)) { return true; } }
			return null;
		},

		touchMove(id, x, y) {
			touches[id] = [x, y];
			const touchList = Object.values(touches);
			if (moveType === 'touch') {
				if (touchList.length !== 1) { return moveStop(); }
				const [t1] = touchList;
				moveMove(t1[0], t1[1]);
			}
			if (scaleType !== 'touch') { return; }
			if (!el.touchScalable || touchList.length !== 2) {
				return scaleStop();
			}
			const [t1, t2] = touchList;
			scaleMove(t1[0], t1[1], t2[0], t2[1]);
		},
		touchBegin(id, x, y) {
			touches[id] = [x, y];
			const touchList = Object.values(touches);
			if (touchList.length === 1) {
				if (!moveType && el.touchMovable) {
					scaleStop();
					moveType = 'touch';
					moveBegin(x, y);
					return el.touchCapture;
				}
			} else if (touchList.length === 2) {
				if (!scaleType && el.touchScalable) {
					moveStop();
					scaleType = 'touch';
					const [t1, t2] = touchList;
					scaleBegin(t1[0], t1[1], t2[0], t2[1]);
					return el.touchCapture;
				}

			}
			return null;
		},
		touchEnd(id) {
			delete touches[id];
			if (scaleType === 'touch') { scaleStop(); }
			if (moveType === 'touch') { moveEnd(); }
		},
		mouseMove(x, y, keys) {
			if (moveType === 'leftMouse' && !(keys & 1) || moveType === 'roller' && !(keys & 4)) {
				moveEnd();
				return;
			}
			if (!moveType) { return; }
			moveMove(x, y);
		},
		mouseBegin(x, y, keys) {
			if (moveType) { return null; }
			/** @type {'leftMouse' | 'roller' | ''} */
			let type = '';
			/** @type {boolean?} */
			let res = null;
			if (keys & 1) {
				if (!el.leftMouseMovable) { return null; }
				type = 'leftMouse';
				res = el.leftMouseMovableCapture;
			} else if (keys & 4) {
				if (!el.rollerMovable) { return null; }
				type = 'roller';
				res = el.rollerMovableCapture;
			}
			scaleStop();
			moveType = type;
			moveBegin(x, y);
			return res;
		},
		mouseEnd() {
			if (!moveType) { return; }
			moveEnd();
		},
		wheel(mode, dx, dy, px, py) {
			if (!el.rollerScalable) { return; }
			const v = Math.abs(dx) > Math.abs(dy) ? dx : dy;
			if (v === 0) { return; }
			scaleStop();
			const abs = Math.abs(v);
			let base = 0;
			if (v > 0) {
				switch (mode) {
					case 0: base = 1.01; break;
					case 1: base = 1.25; break;
					case 2: base = 1.6; break;
				}
			} else {
				switch (mode) {
					case 0: base = 1 / 1.01; break;
					case 1: base = 1 / 1.25; break;
					case 2: base = 1 / 1.6; break;
				}
			}

			const oldZoom = zoom;
			const newZoom = getZoom(base ** abs * oldZoom);
			zoom = newZoom;
			x = (x - px) / oldZoom * newZoom + px;
			y = (y - py) / oldZoom * newZoom + py;
			update();
		},
	};

	/** @type {() => void} */
	let unregister = () => { };

	/**
	 *
	 * @returns {void}
	 */
	function update() {
		const [areaWidth, areaHeight] = areaSize;
		if (!areaWidth || !areaHeight) {
			el.style.transform = `translate(${x}px,${y}px)scale(${zoom})`;
		}
		x = calc(x, areaWidth, el.clientWidth * zoom);
		y = calc(y, areaHeight, el.clientHeight * zoom);
		el.style.transform = `translate(${x}px,${y}px)scale(${zoom})`;
	}
	return [() => {
		if (el.autoAdaptively) { requestAnimationFrame(adaptively); }

		let parent = el.parentNode;
		while (parent) {
			if (parent instanceof MovableArea) { break; }
			parent = parent.parentNode;
		}
		if (parent) {
			unregister = parent.register(movableAreaMember);
		}
		// TODO: 绑定到页面中
	}, () => {
		unregister();
	}, adaptively];
}
/**
 *
 * @param {HTMLElement} el
 * @param {string} name
 * @param {string | boolean} value
 * @returns {void}
 */
function setBoolAttr(el, name, value) {
	if (!value && value !== '') {
		el.removeAttribute(name);
		return;
	}
	el.setAttribute(name, value === true ? '' : value);
}

class Movable extends HTMLElement {
	static get Area() { return MovableArea; }
	static get Target() { return MovableTarget; }
	/**
	 * 是否拥有惯性
	 * @type {boolean}
	 */
	get inertia() { return this.getAttribute('inertia') !== null; }
	set inertia(v) { setBoolAttr(this, 'inertia', v); }
	/**
	 * 触屏是否捕获
	 * @type {boolean}
	 */
	get touchCapture() { return this.getAttribute('touch-capture') !== null; }
	set touchCapture(v) { setBoolAttr(this, 'touch-capture', v); }
	/**
	 * 是否支持触屏移动
	 * @type {boolean}
	 */
	get touchMovable() { return this.getAttribute('touch-movable') !== null; }
	set touchMovable(v) { setBoolAttr(this, 'touch-movable', v); }
	/**
	 * 是否支持触屏缩放
	 * @type {boolean}
	 */
	get touchScalable() { return this.getAttribute('touch-scalable') !== null; }
	set touchScalable(v) { setBoolAttr(this, 'touch-scalable', v); }
	/**
	 * 是否支持鼠标滚论移动
	 * @type {boolean}
	 */
	get rollerMovable() { return this.getAttribute('roller-movable') !== null; }
	set rollerMovable(v) { setBoolAttr(this, 'roller-movable', v); }
	/**
	 * 鼠标滚论移动是否捕获
	 * @type {boolean}
	 */
	get rollerMovableCapture() { return this.getAttribute('roller-movable-capture') !== null; }
	set rollerMovableCapture(v) { setBoolAttr(this, 'roller-movable-capture', v); }
	/**
	 * 是否支持鼠标滚论缩放
	 * @type {boolean}
	 */
	get rollerScalable() { return this.getAttribute('roller-scalable') !== null; }
	set rollerScalable(v) { setBoolAttr(this, 'roller-scalable', v); }
	/**
	 * 是否支持鼠标左键移动
	 * @type {boolean}
	 */
	get leftMouseMovable() { return this.getAttribute('left-mouse-movable') !== null; }
	set leftMouseMovable(v) { setBoolAttr(this, 'left-mouse-movable', v); }
	/**
	 * 鼠标左键移动是否捕获
	 * @type {boolean}
	 */
	get leftMouseMovableCapture() { return this.getAttribute('left-mouse-movable-capture') !== null; }
	set leftMouseMovableCapture(v) { setBoolAttr(this, 'left-mouse-movable-capture', v); }
	/**
	 * 是否自动自适应
	 * @type {boolean}
	 */
	get autoAdaptively() { return this.getAttribute('adaptively') !== null; }
	set autoAdaptively(v) { setBoolAttr(this, 'adaptively', v); }
	/**
	 * 是否在整个 `<nl-movable-area>` 区域内操作都有效
	 * @type {boolean}
	 */
	get global() { return this.getAttribute('global') !== null; }
	set global(v) { setBoolAttr(this, 'global', v); }
	/** @type {Set<EventTarget>} */
	#targets = new Set();
	/** @type {() => void} */
	#connect;
	/** @type {() => void} */
	#disconnect;
	/** @type {() => void} */
	#adaptively;
	constructor() {
		super();
		[
			this.#connect,
			this.#disconnect,
			this.#adaptively,
		] = init(this, this.#targets);
	}
	/**
	 *
	 * @param {EventTarget} o
	 * @returns {() => void}
	 */
	register(o) {
		const targets = this.#targets;
		targets.add(o);
		return () => { targets.delete(o); };
	}
	/**
	 * 自适应
	 * @returns {void}
	 */
	adaptively() { this.#adaptively(); }
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

customElements.define('nl-movable-area', MovableArea);
customElements.define('nl-movable', Movable);
customElements.define('nl-movable-target', MovableTarget);

/** @typedef {MovableArea} Movable.Area */
/** @typedef {MovableTarget} Movable.Target */
export default Movable;
