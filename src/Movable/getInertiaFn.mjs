/**
 * 线性回归求斜率
 * @param {number[]} t
 * @param {number[]} v
 * @returns {number}
 */
function regression(t, v) {
	const tb = t.reduce((a, b) => a + b) / t.length;
	const vb = v.reduce((a, b) => a + b) / v.length;
	return t.map((_, i) => (t[i] - tb) * (v[i] - vb)).reduce((a, b) => a + b)
		/ t.map(a => (a - tb) ** 2).reduce((a, b) => a + b);
}

/**
 *
 * @param {number[][]} frame
 * @returns {(() => [number, number, boolean]) | undefined }
 */
export default function getInertiaFn(frame) {
	const time = performance.now() / 1000;
	let last = time;
	for (let i = 0; i < frame.length; i++) {
		const [,, that] = frame[i];
		if (last - that > 0.05) { frame.length = i; break; }
		last = that;
	}
	if (frame.length < 3) { return; }
	// 时间（s）
	const times = frame.map(f => f[2]);
	// 方向速度(px/s)
	const xb = regression(times, frame.map(f => f[0]));
	const yb = regression(times, frame.map(f => f[1]));
	// 方向符号
	const xs = Math.sign(xb);
	const ys = Math.sign(yb);
	// 方向速度绝对值(px/s)
	const xv = Math.abs(xb);
	const yv = Math.abs(yb);
	// 和速度(px/s)
	const v = (xv ** 2 + yv ** 2) ** 0.5;
	// 方向速度比
	const xp = xv / v;
	const yp = yv / v;
	// 加速度(px/s²)
	const a = 1000;
	// 最后帧(px, px, s)
	const [[xf, yf, b]] = frame;
	/**
	 * @returns {[number, number, boolean]}
	 */
	function calc() {
		const t = performance.now() / 1000;
		// 时间差(s)
		const tt = t - b;
		// 新的速度(px/s)
		let nv = v - tt * a;
		if (nv <= 0) {
			const x = xf + xs * xv * v / a / 2;
			const y = yf + ys * yv * v / a / 2;
			return [x, y, true];
		}
		const x = xf + xs * (xv + xv - a * xp * tt) * tt / 2;
		const y = yf + ys * (yv + yv - a * yp * tt) * tt / 2;
		return [x, y, false];

	}
	return calc;
}
