#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import * as fsPromises from 'node:fs/promises';
import * as pathFn from 'node:path';
import { rollup } from 'rollup';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import * as YAML from 'yaml';

const {
	name, version, description, author, license, repository, homepage, bugs,
} = JSON.parse(await fsPromises.readFile('./package.json', 'utf-8'));


const root = pathFn.resolve(fileURLToPath(import.meta.url), '../..');
process.chdir(root);
/**
 *
 * @param {string} p
 * @returns {string}
 */
function getPath(p) {
	return pathFn.resolve(root, p);
}
await fsPromises.copyFile(getPath('LICENSE'), getPath('dist/LICENSE'));


const components = await fsPromises.readdir(getPath('src'), 'utf8').then(v => v.filter(v => !v.includes('.')));

await fsPromises.mkdir(getPath('dist'), { recursive: true }).catch(() => { });

const mainExport = components.map(v => `export {default as ${v}} from './${v}.mjs';\n`);
const typeExport = components.map(v => `export type * from './${v}.mjs';\n`);
fsPromises.writeFile(getPath('dist/index.mjs'), [...mainExport].join(''));
fsPromises.writeFile(getPath('dist/index.d.mts'), [...mainExport, ...typeExport].join(''));
fsPromises.writeFile(getPath('dist/package.json'), JSON.stringify({
	name, version, description, author, license, repository, homepage, bugs,
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
 * 匿龙组件库 @neeloong/components v${version}
 * (c) ${date} ${author}
 * @license ${license}
 */`;

const indexFile = await fsPromises.open(getPath(`dist/index.html`), 'w');
const readmeFile = await fsPromises.open(getPath(`dist/README.md`), 'w');
await readmeFile.write('匿龙组件库 @neeloong/components\n==============================\n');

await indexFile.write(`<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<script type="module" src="./index.mjs"></script>
	<title>匿龙组件库</title>
</head>
<body>
<ul>
`);
for (const name of components) {
	await readmeFile.write('\n');
	const yml = YAML.parse(await fsPromises.readFile(getPath(`src/${name}/index.yml`), 'utf-8'));
	const md = await fsPromises.readFile(getPath(`src/${name}/README.md`));
	const demo = await fsPromises.readFile(getPath(`src/${name}/demo.html`), 'utf-8');
	const tags = [yml.tag, yml.tags].flat().filter(Boolean);

	const title = `${yml.label} ${tags.map(v => `&lt;${v}&gt;`).join(' ')}`;

	await readmeFile.write(md);
	await fsPromises.writeFile(getPath(`dist/${name}.md`), md);
	await fsPromises.writeFile(getPath(`dist/${name}.html`), `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<script type="module" src="./${name}.mjs"></script>
	<title>${title}</title>
</head>
<body>
${demo.split('\n').slice(2).join('\n')}
</body>
</html>
`);
	await indexFile.write(`<li>${title} <a href="./${name}.md">文档</a> <a href="./${name}.html">Demo</a></li>\n`);
}
await indexFile.write(`</ul></body>\n</html>\n`);

for (const name of components) {
	const bundle = await rollup({ input: getPath(`src/${name}/index`) });
	await bundle.write({ banner, file:  getPath(`dist/${name}.mjs`), format: 'es' });
}
for (const name of components) {
	const bundle = await rollup({ input: getPath(`types/${name}/index.d.mts`), plugins: [dts()] });
	await bundle.write({ banner, file:  getPath(`dist/${name}.d.mts`), format: 'es' });
}
const input = '\0NeeLoongComponents';
const indexBundle = await rollup({
	input,
	plugins: [{
		name: 'NeeLoongComponents',
		resolveId(source) {
			if (source !== input) { return null; }
			return { id: input, moduleSideEffects: true };
		},
		load(id) {
			if (id !== input) { return null; }
			return components.map(v => `export {default as ${v}} from ${
				JSON.stringify(getPath(`dist/${v}.mjs`))
			};\n`).join('');
		},
	}],
});
await indexBundle.write({ file: getPath('dist/index.min.mjs'), format: 'es', plugins: [terser()], sourcemap: true });
await indexBundle.write({ file: getPath('dist/index.min.js'), name: 'NeeLoongComponents', format: 'umd', plugins: [terser()], sourcemap: true });
await indexBundle.write({ file: getPath('dist/index.js'), name: 'NeeLoongComponents', format: 'umd', sourcemap: true });
