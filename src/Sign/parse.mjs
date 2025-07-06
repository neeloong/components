/* eslint-disable jsdoc/sort-tags */

/**
 *
 * @param {string} head
 * @returns {Record<string, any>}
 */
function parseHead(head) {
	return Object.fromEntries(head.split(/;|\n/).map(it => {
		const s = it.indexOf('=');
		if (s < 0) { return [it, true]; }
		const key = it.slice(0, s);
		const val = it.slice(s + 1);
		if (/^[\t ]*\.\d+[\t ]*$/.test(val)) {
			return [key, parseFloat(`0${val.replace(/[\t ]/g, '')}`)];
		}
		if (/^[\t ]*\d+(\.\d*)?[\t ]*$/.test(val)) {
			return [key, parseFloat(val.replace(/[\t ]/g, ''))];
		}
		return [key, val];
	}));
}

/**
 *
 * @param {string[]} keys
 * @param {string} dot
 * @returns {IterableIterator<[string, any]>}
 * @yields {[string, any]}
 */
function *parseDot(keys, dot) {
	const values = dot.split(',');
	for (const [index, key] of keys.entries()) {
		const val = values[index];
		if (!val) { continue; }
		if (/^[\t ]*\.\d+[\t ]*$/.test(val)) {
			yield [key, parseFloat(`0${val.replace(/[\t ]/g, '')}`)];
			continue;
		}
		if (/^-?[\t ]*\d+(\.\d*)?[\t ]*$/.test(val)) {
			yield [key, parseFloat(val.replace(/[\t ]/g, ''))];
			continue;
		}
		yield [key, val];

	}

}
/**
 *
 * @param {string} line
 * @returns {Sign.Base.Line}
 */
function parseLine(line) {
	const [head, keys, ...dots] = line.split('\n');
	const allKey = keys.split(',');
	return {
		...parseHead(head),
		// @ts-ignore
		dots: dots.map(values => Object.fromEntries([...parseDot(allKey, values)])),
	};
}

/**
 *
 * @param {string} text
 * @returns {Sign.Base?}
 */
export function parse(text) {
	text = text.replace(/[ \t]*\n/g, '\n').replace(/#[^\n]*\n/g, '\n').replace(/^\n+/g, '');
	if (!text) { return null; }
	const [head, ...lines] = text.split(/\n\n+/g).filter(Boolean);
	// @ts-ignore
	return {
		...parseHead(head),
		lines: lines.map(parseLine),
	};
}

/**
 * @typedef {object} Sign.Base
 * @property {'base'} mode
 * @property {number} height
 * @property {number} width
 * @property {number} [lineWidth]
 * @property {Sign.Base.Line[]} lines
 */
/**
 * @typedef {object} Sign.Base.Line
 * @property {string} mode
 * @property {number} [lineWidth]
 * @property {Sign.Base.Dot[]} dots
 */
/**
 * @typedef {object} Sign.Base.Dot
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {Sign.Base} Sign
 */

/**
 * @template T
 * @typedef {object} Sign.Editor
 * @property {(event: PointerEvent, area: {x: number; y: number; width: number; height: number; }, force?: boolean) => T?} begin
 * @property {(event: PointerEvent, area: {x: number; y: number; width: number; height: number; }, force?: boolean) => T?} move
 * @property {() => T?} end
 * @property {string[]} [keys]
 * @property {string[]} [lineKeys]
 * @property {string[]} [dotKeys]
 */
/**
 * @template T
 * @typedef {object} Sign.Type
 * @property {(width: number, height: number) =>  Sign.Editor<T>} edit
 * @property {string[]} [keys]
 * @property {string[]} [lineKeys]
 * @property {string[]} [dotKeys]
 * @property {(data: T, canvas?: OffscreenCanvas | HTMLCanvasElement, ctx?: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, offset?: { offsetX?: number; offsetY?: number; }) => OffscreenCanvas | HTMLCanvasElement} render
 */


/**
 * @typedef {object} Sign.Event
 * @property {number} x
 * @property {number} y
 * @property {number} timeStamp
 * @property {number} [altitudeAngle] 表示传感器（指针或触针）轴与设备屏幕的X-Y平面之间的角度。
 * @property {number} [azimuthAngle] 表示Y-Z平面与包含传感器（指针或触针）轴和Y轴的平面之间的角度。
 * @property {number} [width] Pointer 的接触面的 CSS 像素宽度（X 轴上的大小）
 * @property {number} [height] Pointer 的接触面的 CSS 像素高度（Y 轴上的大小）
 * @property {number} [pressure] 归一化后的 pointer 压力值，范围在 [0,1] 区间。其中 0 和 1 分别代表硬件能够检测的最小和最大压力。
 * @property {number} [tangentialPressure] 归一化后的切向压力值，范围在 [-1, 1] 区间，0 表示控制设备中立状态时的值。
 * @property {number} [tiltX] 由输入设备（如手写笔）与 Y 轴构成的平面，和 Y-Z 平面之间的夹角（取值在 [-90, 90] 区间）
 * @property {number} [tiltY] 由输入设备（如手写笔）与 X 轴构成的平面，和 X-Z 平面之间的夹角（取值在 [-90, 90] 区间）
 * @property {number} [twist] 输入设备（如手写笔）围绕自身主轴顺时针旋转的角度，取值范围是 [0, 359] 度。
 */

/**
 *
 * @param {Sign.Base} sign
 * @param {Record<string, Sign.Type<any>>} [editors]
 * @returns {string}
 */
export function stringify(sign, editors) {
	if (!sign) { return ''; }
	const mode = editors && sign.mode in editors ? sign.mode : 'base';

	const editor = editors?.[mode];

	const allMainKeys = new Set(editor?.keys || ['lineWidth']);
	allMainKeys.delete('mode');
	allMainKeys.delete('width');
	allMainKeys.delete('height');

	const allDotKeys = new Set(editor?.keys || ['lineWidth']);
	allMainKeys.delete('x');
	allMainKeys.delete('y');

	const allLineKeys = new Set(editor?.lineKeys || []);


	const header = [
		mode === 'base' ? '' : `mode=${mode}`,
		`width=${sign.width}`,
		`height=${sign.height}`,
		...[...allMainKeys].map(k => {
			// @ts-ignore
			const v = sign[k];
			if (typeof v === 'number' && Number.isFinite(v)) { return `${k}=${v}`; }
			if (v === true) { return `${k}`; }
			if (typeof v === 'string') { return `${k.replace(/\n|\t|;|#/g, '')}`; }
			return '';
		})].filter(Boolean).join(';');
	const group = [header];

	for (const line of sign.lines) {
		const header = [...allLineKeys].map(k => {
			// @ts-ignore
			const v = sign[k];
			if (typeof v === 'number' && Number.isFinite(v)) { return `${k}=${v}`; }
			if (v === true) { return `${k}`; }
			if (typeof v === 'string') { return `${k.replace(/\n|;|#/g, '')}`; }
			return '';
		}).join(';') || ';';

		const dotProps = [...new Set(['x', 'y', ...allDotKeys])];
		const title = dotProps.join(',') || ',';
		group.push([
			header,
			title,
			...line.dots.map(dot => dotProps.map(k => {
				// @ts-ignore
				const v = dot[k];
				if (typeof v === 'number' && Number.isFinite(v)) { return `${v}`; }
				if (v === true) { return `1`; }
				if (typeof v === 'string') { return `${v.replace(/\n|\t|;|,|#/g, '')}`; }
				return '';
			}).join(',')),
		].join('\n'));

	}
	return group.join('\n\n');
}
