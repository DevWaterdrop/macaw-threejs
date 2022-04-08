import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import pluginCommonjs from "@rollup/plugin-commonjs";
import pluginNodeResolve from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import * as path from "path";
import pkg from "./package.json";
import dts from "rollup-plugin-dts";
import del from "rollup-plugin-delete";

//* CONSTANTS
const TYPES = {
	core: "core",
	effect: "effect"
};
const MODULE_NAMES = { core: "macaw-threejs" };
const INPUTS = { core: "src/index.ts" };

//* PKG
const { author, version, license } = pkg;

//* BANNER
const banner = `/**
	* @license
	* author: ${author}
	* ${MODULE_NAMES.core}.js v${version}
	* Released under the ${license} license.
	*/

//	* ██    ██ ██   ██ ██████   █████  ██ ███    ██ ███████ 
//	* ██    ██ ██  ██  ██   ██ ██   ██ ██ ████   ██ ██      
//	* ██    ██ █████   ██████  ███████ ██ ██ ██  ██ █████   
//	* ██    ██ ██  ██  ██   ██ ██   ██ ██ ██  ██ ██ ██      
//	*  ██████  ██   ██ ██   ██ ██   ██ ██ ██   ████ ███████
`;

//* CONFIG

const terserOptions = { format: { comments: false, preamble: banner } };
const plugins = [
	typescript(),
	pluginCommonjs({
		extensions: [".js", ".ts"]
	}),
	babel({
		babelHelpers: "bundled",
		configFile: path.resolve(__dirname, ".babelrc.cjs")
	}),
	pluginNodeResolve({
		browser: false
	}),
	terser(terserOptions)
];
const external = [
	...Object.keys(pkg.dependencies || {}),
	...Object.keys(pkg.devDependencies || {})
];

const createOutputFile = ({ ending, type, fileName }) => {
	let base = "build";
	if (type === TYPES.effect) base = "build/effects";

	return `${base}/${fileName}.${ending}`;
};

const createOutput = ({ type, fileName }) => ({
	es: [{ file: createOutputFile({ ending: "module.js", type, fileName }), format: "es" }],
	cjs: [{ file: createOutputFile({ ending: "cjs", type, fileName }), format: "cjs" }]
});

const createConfig = ({ input, type, fileName }) => {
	const { es: outputES, cjs: outputCJS } = createOutput({ type, fileName });

	const es = { input, output: outputES, external, plugins };
	const cjs = { input, output: outputCJS, external, plugins };

	return [es, cjs];
};

// fs/fs-extra doesn't work because of readdir is async :(
const effectNames = ["click_wave", "scroll_wave_top", "scroll_wrap_under"];

const effects = effectNames
	.map((fileName) => {
		const input = `src/effects/${fileName}.ts`;
		return createConfig({ input, type: TYPES.effect, fileName });
	})
	.flat();

const core = createConfig({ input: INPUTS.core, type: TYPES.core, fileName: MODULE_NAMES.core });

export default [
	// Delete build folder
	{
		input: "empty_input.js",
		plugins: [del({ targets: "build" })]
	},

	// Create configs
	...core,
	...effects,

	// Types
	{
		input: "build/src/index.d.ts",
		output: [{ file: "build/index.d.ts", format: "esnext" }],
		plugins: [dts()]
	},

	// Delete unused types
	{
		input: "empty_input.js",
		plugins: [del({ targets: ["build/src", "build/effects/src"] })]
	}
];
