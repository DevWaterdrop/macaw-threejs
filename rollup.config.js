import { terser } from "rollup-plugin-terser";
import pluginTypescript from "@rollup/plugin-typescript";
import pluginCommonjs from "@rollup/plugin-commonjs";
import pluginNodeResolve from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import * as path from "path";
import pkg from "./package.json";

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
	{
		input: inputFileName,
		output: [
			{
				name: moduleName,
				file: outputFileName("min.js"),
				format: "iife",
				banner,
				plugins: [terser()]
			}
		],
		plugins: [
			pluginTypescript(),
			pluginCommonjs({
				extensions: [".js", ".ts"]
			}),
			babel({
				babelHelpers: "bundled",
				configFile: path.resolve(__dirname, ".babelrc.js")
			}),
			pluginNodeResolve({
				browser: true
			})
		]
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
			pluginTypescript(),
			pluginCommonjs({
				extensions: [".js", ".ts"]
			}),
			babel({
				babelHelpers: "bundled",
				configFile: path.resolve(__dirname, ".babelrc.js")
			}),
			pluginNodeResolve({
				browser: false
			})
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
			pluginTypescript(),
			pluginCommonjs({
				extensions: [".js", ".ts"]
			}),
			babel({
				babelHelpers: "bundled",
				configFile: path.resolve(__dirname, ".babelrc.js")
			}),
			pluginNodeResolve({
				browser: false
			})
		]
	}
];
