/** @import { Sign as SignType } from './parse.mjs' */
import { parse, stringify } from './parse.mjs';

const style = `
canvas {
  border: 1px solid #ccc;
	width: inherit;
	height: inherit;
	min-width: inherit;
	min-height: inherit;
	max-width: inherit;
	max-height: inherit;
}
`;

import * as baseType from './base.mjs';
/**
 * @typedef {object} IProp
 * @property {number} [width=400] - 画布宽度
 * @property {number} [height=200] - 画布高度
 * @property {number} [lineWidth=4] - 线宽
 * @property {string} [strokeColor='red'] - 线段颜色
 * @property {CanvasLineCap} [lineCap='round'] - 设置线条两端圆角
 * @property {CanvasLineJoin} [lineJoin='round'] - 线条交汇处圆角
 * @property {string} [bgColor='transparent'] - 画布背景颜色
 */
/** @type {Record<string, SignType.Type<any>>} */
const types = Object.assign(Object.create(null), { base: baseType });


export default class Sign extends HTMLElement {
	/** @type {Record<string, SignType.Type<any>>} */
	static get types() { return types; }
	static get formAssociated() { return true; }
	#canvas = document.createElement('canvas');
	#ctx = /** @type {CanvasRenderingContext2D} */(this.#canvas.getContext('2d'));
	/** @readonly */
	#internals = this.attachInternals();
	constructor() {
		super();
		const shadow = this.attachShadow({mode:'closed'});
		shadow.appendChild(document.createElement('style')).textContent = style;
		const canvas = shadow.appendChild(this.#canvas);
		canvas.addEventListener('contextmenu', e => e.preventDefault());

		canvas.addEventListener('pointerup', event => {
			canvas.releasePointerCapture(event.pointerId);
		});

		canvas.addEventListener('pointerdown', event => this.#begin(event));
		canvas.addEventListener('pointermove', event => this.#move(event) );
		canvas.addEventListener('lostpointercapture', event => this.#end(event));

	}
	connectedCallback() {

	}
	#hasPointerCapture = false;
	#currentPointer = 0;
	/** @type {SignType.Editor<any>?} */
	#editor = null;
	#value;
	#draw(data, end) {
		if (!data) { return; }
		const canvas = this.#canvas;
		const ctx = this.#ctx;
		const {mode} = data;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const type = types[mode] || types.base;
		type.render(data, canvas, ctx);
		const value = stringify(data, types);
		if (value !== this.#value) {
			this.#value = value;
			this.dispatchEvent(new InputEvent('input', {
				data: value,
			}));
			this.#internals.setFormValue(value);
		}
		if (end) {
			this.dispatchEvent(new Event('change'));
		}
	}
	get value() {
		return this.#value;
	}
	set value(v) {
		const data = parse(v);
		const value = data ? stringify(data, types) : '';
		if (value === this.#value) { return; }
		this.#value = value;
		this.#internals.setFormValue(value);


		const canvas = this.#canvas;
		const ctx = this.#ctx;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (!data) { return; }
		const {mode} = data;
		const type = types[mode] || types.base;
		type.render(data, canvas, ctx);
	}
	/**
	 * @param {PointerEvent} event
	 */
	#begin(event) {
		if (this.#hasPointerCapture) { return; }
		this.#hasPointerCapture = true;
		this.#currentPointer = event.pointerId;
		const canvas = this.#canvas;
		canvas.setPointerCapture(event.pointerId);
		let editor = this.#editor;
		if (!editor) {
			// TODO: 不同类型编辑器
			editor = (types[this.mode || ''] || types.base).edit(canvas.width, canvas.height);
		}
		this.#editor = editor;
		this.#draw(editor.begin(event, canvas.getBoundingClientRect()));
	}
	/**
	 * @param {PointerEvent} event
	 */
	#move(event) {
		const canvas = this.#canvas;
		const downed = Boolean(event.buttons & 1);
		if (!downed) {
			if (!this.#hasPointerCapture) { return; }
			if (this.#currentPointer !== event.pointerId) { return; }
			canvas.releasePointerCapture(event.pointerId);
			return;
		}
		if (!this.#hasPointerCapture) { this.#begin(event); return; }
		if (this.#currentPointer !== event.pointerId) { return; }
		if (!canvas.hasPointerCapture(event.pointerId)) { return; }

		const editor = this.#editor;
		if (!editor) { return; }
		this.#draw(editor.move(event, canvas.getBoundingClientRect()));

	}
	/**
	 * @param {PointerEvent} event
	 */
	#end(event) {
		if (!this.#hasPointerCapture || this.#currentPointer !== event.pointerId) { return; }
		this.#hasPointerCapture = false;
		const editor = this.#editor;
		if (!editor) { return; }
		this.#draw(editor.end(), true);
	}
	/**
	 */
	reset() {
		const canvas = this.#canvas;
		this.#editor = null;
		this.#ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
	get mode() { return this.getAttribute('mode'); }
	set mode(newVal) {
		if (newVal === null) {
			this.#canvas.removeAttribute('mode');
		} else {
			this.#canvas.setAttribute('mode', newVal);
		}
	}
	get width() { return this.#canvas.width; }
	set width(newVal) {
		if (newVal === null) {
			this.#canvas.removeAttribute('width');
		} else {
			this.#canvas.setAttribute('width', String(newVal));
		}
	}
	get height() { return this.#canvas.height; }
	set height(newVal) {
		if (newVal === null) {
			this.#canvas.removeAttribute('height');
		} else {
			this.#canvas.setAttribute('height', String(newVal));
		}
	}
	static observedAttributes = ['width', 'height', 'mode'];
	/**
	 * @param {string} attrName
	 * @param {string | null} oldVal
	 * @param {string | null} newVal
	 * @returns {void}
	 */
	attributeChangedCallback(attrName, oldVal, newVal) {
		if (oldVal === newVal) { return; }
		switch (attrName) {
			case 'digit': {
				break;
			}
			case 'width': {
				if (newVal === null) {
					this.#canvas.removeAttribute('width');
				} else {
					this.#canvas.setAttribute('width', newVal);
				}
				this.reset();
				break;
			}
			case 'height': {
				if (newVal === null) {
					this.#canvas.removeAttribute('height');
				} else {
					this.#canvas.setAttribute('height', newVal);
				}
				this.reset();
				break;
			}
			case 'mode': {
				this.reset();
				break;
			}
		}
	}
}

customElements.define('nl-sign', Sign);
