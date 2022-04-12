import typescript from "rollup-plugin-typescript2";
import pluginNodeResolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import del from "rollup-plugin-delete";

//* CONFIG
const terserOptions = {
	format: { comments: false }
};

const deleteBuildFolder = {
	input: "empty_input.js",
	plugins: [del({ targets: "build" })]
};

const core = {
	input: "src/index.ts",
	output: {
		dir: "build",
		format: "es",
		preserveModules: true,
		preserveModulesRoot: "src"
	},
	plugins: [
		typescript(),
		pluginNodeResolve({
			browser: false
		}),
		terser(terserOptions)
	]
};

export default [deleteBuildFolder, core];
