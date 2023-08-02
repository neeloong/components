import { fileURLToPath } from 'node:url';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';


const {
	name, version, description, author, license,
} = JSON.parse(await fsPromises.readFile('./package.json', 'utf-8'));


import fsPromises from 'node:fs/promises';
const components = await fsPromises.readdir('src', 'utf8').then(v => v.filter(v => !v.includes('.')));

await fsPromises.mkdir('dist', { recursive: true }).catch(() => { });

const mainExport = components.map(v => `export {default as ${v}} from './${v}.mjs';\n`);
const typeExport = components.map(v => `export type * from './${v}.mjs';\n`);
fsPromises.writeFile('dist/index.mjs', [...mainExport].join(''));
fsPromises.writeFile('dist/index.d.mts', [...mainExport, ...typeExport].join(''));
fsPromises.writeFile('dist/package.json', JSON.stringify({
	name, version, description, author, license,
	main: 'index.mjs', type: 'module',
	unpkg: './index.min.js', jsdelivr: './index.min.js',
	exports: {
		'.': './index.mjs',
		...Object.fromEntries(components.map(v => [`./${v}.mjs`, `./${v}.mjs`])),
		...Object.fromEntries(components.map(v => [`./${v}`, `./${v}.mjs`])),
	},
}, null, 2));

const bYear = 2023;
const year = new Date().getFullYear();
const date = bYear === year ? bYear : `${bYear}-${year}`;
const banner = `\
/*!
 * 匿龙组件库 @nyloong/components v${version}
 * (c) ${date} ${author}
 * @license ${license}
 */`;

const input = '\0NyLoongComponents';
export default [
	...components.map(name => [{
		input: `src/${name}/index`,
		output: { banner, file: `dist/${name}.mjs`, format: 'es' },
	}, {
		input: `types/${name}/index.d.mts`,
		output: { banner, file: `dist/${name}.d.mts`, format: 'es' },
		plugins: [dts()],
	}]).flat(),
	{
		input,
		output: [
			{ file: 'dist/index.min.mjs', format: 'es', plugins: [terser()], sourcemap: true },
			{ file: 'dist/index.min.js', name: 'NyLoongComponents', format: 'umd', plugins: [terser()], sourcemap: true },
			{ file: 'dist/index.js', name: 'NyLoongComponents', format: 'umd', sourcemap: true },
		],
		plugins: [{
			resolveId(source) {
				if (source !== input) { return null; }
				return { id: input, moduleSideEffects: true };
			},
			load(id) {
				if (id !== input) { return null; }
				return components.map(v => `export {default as ${v}} from ${
					JSON.stringify(fileURLToPath(new URL(`dist/${v}.mjs`, import.meta.url)))
				};\n`).join('');
			},
		}],

	},
];
