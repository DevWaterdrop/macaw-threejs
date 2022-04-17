import typescript from "rollup-plugin-typescript2";
import pluginNodeResolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import del from "rollup-plugin-delete";

//* CONFIG
const terserOptions = {
	format: { comments: false }
};

const plugins = [
	typescript(),
	pluginNodeResolve({
		browser: false
	}),
	terser(terserOptions)
];

const output = {
	dir: "build",
	format: "es",
	preserveModules: true
};

const deleteBuildFolder = {
	input: "empty_input.js",
	plugins: [del({ targets: "build" })]
};

const effects = {
	input: "src/effects/index.ts",
	output,
	plugins
};

const core = {
	input: "src/index.ts",
	output,
	plugins
};

export default [deleteBuildFolder, effects, core];
