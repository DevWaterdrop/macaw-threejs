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

const additional = {
	treeshake: true,
	external: ["tslib", "animejs", "three", /three\/.*/]
};

const output = {
	dir: "build",
	format: "es",
	preserveModules: true
};

const deleteBuildFolder = {
	input: "empty_input.js",
	plugins: [del({ targets: "build" })]
};

const core = {
	input: ["src/index.ts", "src/@effects/index.ts"],
	output,
	plugins,
	...additional
};

export default [deleteBuildFolder, core];
