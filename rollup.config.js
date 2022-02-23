import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import pluginCommonjs from "@rollup/plugin-commonjs";
import pluginNodeResolve from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import * as path from "path";
import pkg from "./package.json";
import dts from "rollup-plugin-dts";
import del from "rollup-plugin-delete";

//* Settings
const moduleName = "MacawThreejs";
const inputFileName = "src/index.ts";
const outputFileName = (type) => `build/macaw-threejs.${type}`;
const author = pkg.author;
const banner = `
  /**
   * @license
   * author: ${author}
   * ${moduleName}.js v${pkg.version}
   * Released under the ${pkg.license} license.
   */
`;

export default [
	// Delete build folder
	{
		input: "empty_input.js",
		plugins: [del({ targets: "build" })]
	},

	//* ES
	{
		input: inputFileName,
		output: [
			{
				file: outputFileName("module.js"),
				format: "es",
				banner
			}
		],
		external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})],
		plugins: [
			typescript(),
			pluginCommonjs({
				extensions: [".js", ".ts"]
			}),
			babel({
				babelHelpers: "bundled",
				configFile: path.resolve(__dirname, ".babelrc.js")
			}),
			pluginNodeResolve({
				browser: false
			}),
			terser({ format: { comments: false } })
		]
	},

	//* CommonJS
	{
		input: inputFileName,
		output: [
			{
				file: outputFileName("cjs"),
				format: "cjs",
				banner
			}
		],
		external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})],
		plugins: [
			typescript(),
			pluginCommonjs({
				extensions: [".js", ".ts"]
			}),
			babel({
				babelHelpers: "bundled",
				configFile: path.resolve(__dirname, ".babelrc.js")
			}),
			pluginNodeResolve({
				browser: false
			}),
			terser({ format: { comments: false } })
		]
	},

	// Types
	{
		input: "build/src/index.d.ts",
		output: [{ file: "build/index.d.ts", format: "esnext" }],
		plugins: [dts()]
	},

	// Delete unused types
	{
		input: "empty_input.js",
		plugins: [del({ targets: "build/src" })]
	}
];
