/** @import { Sign } from './parse.mjs' */
/**
 *
 * @param {Sign.Base} Sign
 * @param {OffscreenCanvas | HTMLCanvasElement} [canvas]
 * @param {CanvasRenderingContext2D  | OffscreenCanvasRenderingContext2D} [ctx]
 * @param {object} [options]
 * @param {number} [options.offsetX]
 * @param {number} [options.offsetY]
 * @returns {OffscreenCanvas | HTMLCanvasElement}
 * @throws {Error}
 */
export function render(
	{ width = 600, height = 300, lines = [], lineWidth = 2 },
	canvas = new OffscreenCanvas(width, height),
	// @ts-ignore
	ctx = canvas.getContext('2d'),
	{ offsetX = 0, offsetY = 0 } = {},
) {
	if (!ctx) { throw new Error('创建上下文失败'); }
	ctx.lineWidth = lineWidth || 2;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	for (const line of lines) {
		ctx.beginPath();
		const [{ x, y }, ...dots] = line.dots;
		ctx.moveTo(offsetX + x, offsetY + y);
		for (const { x, y } of dots) {
			ctx.lineTo(offsetX + x, offsetY + y);
		}
		ctx.stroke();
	}
	return canvas;
}

/**
 *
 * @param {number} width
 * @param {number} height
 * @param {number} [lineWidth]
 * @returns {Sign.Editor<Sign.Base>}
 */
export function edit(width, height, lineWidth = 2) {
	/** @type {Sign.Base} */
	const sign = { mode: 'base', width, height, lineWidth, lines: [] };
	/** @type {Sign.Base.Line?} */
	let line = null;
	/**
	 *
	 * @param {Sign.Event} event
	 * @param {{x: number; y: number, width: number; height: number }} area
	 * @returns {Sign.Base.Dot}
	 */
	function getDot(event, area) {
		/** @type {Sign.Base.Dot} */
		const dot = {
			x: event.x - area.x / width * area.width,
			y: event.y - area.y / height * area.height,
		};
		return dot;
	}
	return {
		/**
		 *
		 * @param {Sign.Event} event
		 * @param {{x: number; y: number, width: number; height: number }} area
		 * @param {boolean} [force]
		 * @returns {Sign.Base?}
		 */
		begin(event, area, force) {
			if (line && !force) { return null; }
			/** @type {Sign.Base.Dot[]} */
			const dots = [getDot(event, area)];

			if (line && line.dots.length <= 1) {
				line.dots = dots;
			} else {
				line = { dots, mode: 'base' };
				sign.lines.push(line);
			}
			return structuredClone(sign);
		},
		/**
		 *
		 * @param {Sign.Event} event
		 * @param {{x: number; y: number, width: number; height: number }} area
		 * @param {boolean} [force]
		 * @returns {Sign.Base?}
		 */
		move(event, area, force) {
			if (!line && !force) { return null; }
			if (!line) {
				line = { dots: [], mode: 'base' };
				sign.lines.push(line);
			}
			line.dots.push(getDot(event, area));
			return structuredClone(sign);
		},
		/**
		 *
		 * @returns {Sign.Base?}
		 */
		end() {
			if (!line) { return null; }
			line = null;
			return structuredClone(sign);
		},
	};
}
